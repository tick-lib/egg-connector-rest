'use strict';
// const debug = require('debug')('egg-connector-rest:registerRemote:indvalidateRules');
const stream = require('stream');
const _ = require('lodash');

module.exports = parameter => {
  parameter.addRule('jsonString', (rule, value) => {
    if (!value) {
      if (rule.required) return 'must be required';
      return;
    }
    try {
      // https://segmentfault.com/q/1010000008460413/a-1020000008461292
      if (typeof JSON.parse(value) !== 'object') {
        return 'must be json string';
      }
    } catch (err) {
      return 'must be json string';
    }
  });

  parameter.addRule('arrayString', (rule, value) => {
    if (!value) {
      if (rule.required) return 'must be required';
      return;
    }
    try {
      // https://segmentfault.com/q/1010000008460413/a-1020000008461292
      const result = JSON.parse(value);
      if (!Array.isArray(result)) {
        return 'must be array string';
      }

      const allIsString = result.every(item => typeof item === 'string');

      if (!allIsString) {
        return 'must be array string';
      }
    } catch (err) {
      return 'must be array string';
    }
  });

  parameter.addRule('arrayInteger', (rule, value) => {
    if (!value) {
      if (rule.required) return 'must be required';
      return;
    }
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
        return 'must be array integer';
      }
    } catch (err) {
      return 'must be array integer';
    }
  });

  parameter.addRule('any', () => {});

  parameter.addRule('file', (rule, value) => {
    if (!value) {
      if (rule.required) return 'must be required';
      return;
    }
    if (!(value instanceof stream.Readable)) {
      return 'must be file stream';
    }
  });
};
