# vscode-config-resolver

> Find configuration for the current file from provided path, workspace, package or HOME directory.

## Donate

If you want to thank me, or promote your Issue.

[![Gratipay User](https://img.shields.io/gratipay/user/mrmlnc.svg?style=flat-square)](https://gratipay.com/~mrmlnc)

> Sorry, but I have work and support for plugins requires some time after work. I will be glad of your support.

## Install

```shell
$ npm i -S vscode-config-resolver
```

## Why?

  * Because many plugins use similar code.
  * To simplify work with the configs in plugins.

## Usage

```js
const ConfigResolver = require('vscode-config-resolver');

const configResolver = new ConfigResolver('./path/to/workspace/');

configResolver.scan('./path/to/current/file', {}).then((config) => {
  console.log(config);
  // { from: '', json: {} }
});
```

## API

#### .scan(filepath, [options])

Find configuration for the current file.

#### options

#### packageProp

  * Type: `String`
  * Default: `null`

The property that contains the configuration. Automatically adds the `package.json` file to `options.configFiles`.

#### configFiles

  * Type: `String[]`
  * Default: `[]`

An array of files that may contain configuration.

#### editorSettings

  * Type: `Object` or `String`
  * Default: `null`

Config from editor preferences. Supports:

  * Path with `~`
  * Path with `.` or `../` or `/`
  * Object
  * Name of predefined config

#### predefinedConfigs

  * Type: `Object`
  * Default: `{}`

If `options.editorSettings` contains the name of configuration.

#### parsers

  * Type: `IParser[]`
  * Default: `js` + `json`

```js
[
  { pattern: /.*(json|rc)$/, parser: JSON.parse },
  { pattern: /.*(js|rc)$/, parser: requireString }
]
```

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/vscode-config-resolver/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
