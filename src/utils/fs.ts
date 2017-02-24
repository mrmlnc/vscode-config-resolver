'use strict';

import * as fs from 'fs';

export function statPath(filepath: string): Promise<fs.Stats> {
	return new Promise((resolve, reject) => {
		fs.stat(filepath, (err, stats) => {
			if (err) {
				return reject(err);
			}
			resolve(stats);
		});
	});
}

export function existsPath(filepath: string): Promise<boolean> {
	return new Promise((resolve) => {
		fs.access(filepath, (err) => resolve(!err));
	});
}

export function readFile(filepath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(filepath, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data.toString());
		});
	});
}
