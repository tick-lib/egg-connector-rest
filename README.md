# egg-connector-rest

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-connector-rest.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-connector-rest
[travis-image]: https://img.shields.io/travis/eggjs/egg-connector-rest.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-connector-rest
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-connector-rest.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-connector-rest?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-connector-rest.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-connector-rest
[snyk-image]: https://snyk.io/test/npm/egg-connector-rest/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-connector-rest
[download-image]: https://img.shields.io/npm/dm/egg-connector-rest.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-connector-rest

使用 json 方式配置 model 的开放接口, 支持 mongoose 、 seq

## Install

```bash
npm i egg-connector-rest --save
```

## feature

1. [X] git-flow
2. [X] restful api
3. [X] swagger ui
4. [X] validate
5. [X] access control, [参考](https://loopback.io/doc/en/lb3/Remote-methods#adding-acls-to-remote-methods)
6. [X] mysql
7. [ ] mongoose

## Usage

```js
// {app_root}/config/plugin.js
exports.connectorRest = {
  enable: true,
  package: 'egg-connector-rest',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.connectorRest = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
