'use strict';

import * as os from 'os';
import * as path from 'path';

import * as findUp from 'find-up';
import * as locatePath from 'locate-path';
import * as requireString from 'require-from-string';

import * as fs from './utils/fs';

enum ConfigType {
	Settings,
	Predefined,
	File
}

interface ICachedConfig {
	type: ConfigType;
	filepath: string;
	ctime: number;
	json: object;
}

export interface IConfig {
	from: string;
	json: object;
}

export interface IParser {
	pattern: RegExp;
	parser: Function;
}

export interface IOptions {
	packageProp?: string;
	configFiles?: string[];
	editorSettings?: object | string;
	predefinedConfigs?: object;
	parsers?: IParser[];
}

export default class ConfigResolver {

	private options: IOptions;
	private cachedConfig: ICachedConfig = {
		type: ConfigType.Settings,
		filepath: '',
		ctime: 0,
		json: {}
	};

	constructor(private workspaceRoot: string) {
		// :)
	}

	public async scan(cwd: string, options: IOptions): Promise<IConfig> {
		this.options = Object.assign(<IOptions>{
			configFiles: [],
			packageProp: null,
			editorSettings: null,
			parsers: [],
			predefinedConfigs: {}
		}, options);

		if (this.options.packageProp && this.options.configFiles.indexOf('package.json') === -1) {
			this.options.configFiles.push('package.json');
		}

		this.options.parsers = this.options.parsers.concat([
			{ pattern: /.*(json|rc)$/, parser: JSON.parse },
			{ pattern: /.*(js|rc)$/, parser: requireString }
		]);

		const settings = this.options.editorSettings;
		if (settings && typeof settings === 'object' && Object.keys(settings).length !== 0) {
			return this.makeConfig(ConfigType.Settings, null, null, settings);
		}

		if (settings && typeof settings === 'string') {
			const predefConfig = this.options.predefinedConfigs[settings];
			if (predefConfig) {
				return this.makeConfig(ConfigType.Predefined, null, null, predefConfig);
			}

			let filepath = settings;
			if (settings[0] === '~') {
				filepath = path.join(os.homedir(), settings.substr(1));
			}

			if (settings[0] === '.') {
				filepath = path.resolve(this.workspaceRoot, settings);
			}

			const config = await this.includeConfig(filepath);
			if (config) {
				filepath = filepath.replace(/\\/g, '/');
				return this.makeConfig(ConfigType.File, filepath, config.ctime, config.config);
			}
		}

		let configFile = await findUp(this.options.configFiles, { cwd });
		if (!configFile) {
			configFile = await locatePath(this.options.configFiles.map((filepath) => path.join(os.homedir(), filepath)));
		}

		if (configFile) {
			const config = await this.includeConfig(configFile);
			if (config) {
				return this.makeConfig(ConfigType.File, configFile, config.ctime, config.config);
			}
		}

		return null;
	}

	private async includeConfig(filepath: string): Promise<{ ctime: number, config: object }> {
		const exists = await fs.existsPath(filepath);
		if (!exists) {
			throw new Error('A file that does not exist: ' + filepath);
		}

		const stats = await fs.statPath(filepath);
		if (filepath === this.cachedConfig.filepath && stats.ctime.getTime() === this.cachedConfig.ctime) {
			return {
				ctime: stats.ctime.getTime(),
				config: this.cachedConfig.json
			};
		}

		const content = await fs.readFile(filepath);
		const parsers = this.options.parsers;

		let config;
		for (let i = 0; i < parsers.length; i++) {
			const { pattern, parser } = parsers[i];

			if (!pattern.test(filepath)) {
				continue;
			}

			try {
				config = parser(content);
				break;
			} catch (err) {
				// :)
			}
		}

		if (config && this.options.packageProp && filepath.endsWith('package.json')) {
			config = config[this.options.packageProp];
		}

		if (!config) {
			throw new SyntaxError('No one parser could not parse file');
		}

		return {
			ctime: stats.ctime.getTime(),
			config
		};
	}

	private makeConfig(type: ConfigType, filepath: string, ctime: number, json: object): Promise<IConfig> {
		let from = 'settings';
		if (type === ConfigType.Predefined) {
			from = 'predefined';
		}
		if (type === ConfigType.File) {
			from = filepath;
		}

		this.cachedConfig = { type, filepath, ctime, json };

		return Promise.resolve({
			from,
			json
		});
	}

}
