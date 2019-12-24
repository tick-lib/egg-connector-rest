'use strict';
// const debug = require('debug')('egg-connector-rest:registerRemote:indvalidateRules');
const stream = require('stream');
const _ = require('lodash');

module.exports = parameter => {
  parameter.addRule('jsonString', (rule, value) => {
    try {
      // https://segmentfault.com/q/1010000008460413/a-1020000008461292
      const result = JSON.parse(value);
      if (typeof result !== 'object') {
        return 'must be json string';
      }

      if (rule.required && _.isEmpty(result)) {
        return 'not to be empty';
      }
    } catch (err) {
      return 'must be json string';
    }
  });

  parameter.addRule('arrayString', (rule, value) => {
    try {
      // https://segmentfault.com/q/1010000008460413/a-1020000008461292
      const result = JSON.parse(value);
      if (!Array.isArray(result)) {
        return 'must be array string';
      }

      const allIsString = result.every(item => typeof item === 'string');

      if (!allIsString) {
        return 'must be all string';
      }
      if (rule.required && _.isEmpty(result)) {
        return 'not to be empty';
      }
    } catch (err) {
      return 'must be array string';
    }
  });

  parameter.addRule('arrayInteger', (rule, value) => {
    try {
      // https://segmentfault.com/q/1010000008460413/a-1020000008461292
      const result = JSON.parse(value);
      if (!Array.isArray(result)) {
        return 'must be array integer';
      }

      const allIsInteger = result.every(value => {
        const result = parseInt(value, 10);
        if (!_.isFinite(result) || isNaN(result)) {
          return false;
        }
        return true;
      });

      if (!allIsInteger) {
        return 'must be all integer';
      }

      if (rule.required && _.isEmpty(result)) {
        return 'not to be empty';
      }
    } catch (err) {
      return 'must be array integer';
    }
  });

  parameter.addRule('any', () => {});

  parameter.addRule('object', (rule, value) => {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      return 'must be object';
    }

    if (rule.required && _.isEmpty(value)) {
      return 'not to be empty';
    }
  });

  parameter.addRule('file', (rule, value) => {
    if (!(value instanceof stream.Readable)) {
      return 'must be file stream';
    }
  });
};
