'use strict';

import * as assert from 'assert';

import * as proxyquire from 'proxyquire';

describe('vscode-config-resolver', () => {

	let vcr;

	before(() => {
		const configResolver = proxyquire('./vcr.js', {
			os: {
				homedir: () => './fixtures/home'
			}
		}).default;

		vcr = new configResolver(process.cwd());
	});

	it('Should return an object from editorSettings', () => {
		const options = {
			editorSettings: { test: 1 }
		};

		return vcr.scan('./fixtures/nested', options).then((cfg) => {
			assert.deepEqual(cfg, {
				from: 'settings',
				json: { test: 1 }
			});
		});
	});

	it('Should return predefined config from editorSettings', () => {
		const options = {
			editorSettings: 'test',
			predefinedConfigs: {
				test: { test: 1 }
			}
		};

		return vcr.scan('./fixtures/nested', options).then((cfg) => {
			assert.deepEqual(cfg, {
				from: 'predefined',
				json: { test: 1 }
			});
		});
	});

	it('Should return a config from provided relative path', () => {
		const options = {
			editorSettings: './fixtures/nested/config.json'
		};

		return vcr.scan('./fixtures/nested', options).then((cfg) => {
			assert.deepEqual(cfg, {
				from: cfg.from,
				json: { test: 'json' }
			});
		});
	});

	it('Should return a config from provided path with HOME symbol', () => {
		const options = {
			editorSettings: '~/home.json'
		};

		return vcr.scan('./fixtures/nested', options).then((cfg) => {
			assert.deepEqual(cfg, {
				from: 'fixtures/home/home.json',
				json: { test: 'home' }
			});
		});
	});

	it('Should return a config from directories', () => {
		const options = {
			configFiles: ['config.js']
		};

		return vcr.scan('./fixtures/nested', options).then((cfg) => {
			assert.deepEqual(cfg, {
				from: cfg.from,
				json: { test: 'js' }
			});
		});
	});

	it('Should return a config from HOME', () => {
		const options = {
			configFiles: ['home.json']
		};

		return vcr.scan('./fixtures/nested', options).then((cfg) => {
			assert.deepEqual(cfg, {
				from: cfg.from,
				json: { test: 'home' }
			});
		});
	});

	it('Should return null if config is does not exists', () => {
		const options = {
			configFiles: ['not.json']
		};

		return vcr.scan('./fixtures/nested', options).then((cfg) => {
			assert.equal(cfg, null);
		});
	});

});
