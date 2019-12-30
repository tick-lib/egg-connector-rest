'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const Parameter = require('parameter');
const validateRules = require('../../../lib/registerRemote/validateRules');

describe('test/lib/registerRemote/validateRules.test.js', () => {
  const parameterObj = new Parameter();

  validateRules(parameterObj);

  describe('Rule jsonString', () => {
    it('should return error with jsonString', () => {
      const rules = {
        success: { type: 'jsonString' },
        jsonTrue: { type: 'jsonString', required: true },
        jsonEmpty: { type: 'jsonString', required: true },
        jsonError: { type: 'jsonString', required: true },
      };
      const data = {
        success: '{"foo": 1}',
        jsonTrue: true,
        jsonEmpty: '{}',
        jsonError: '{',
      };

      const actual = parameterObj.validate(rules, data);
      const expected = [
        {
          code: 'invalid',
          field: 'jsonTrue',
          message: 'must be json string',
        },
        {
          code: 'invalid',
          field: 'jsonEmpty',
          message: 'not to be empty',
        },
        {
          code: 'invalid',
          field: 'jsonError',
          message: 'must be json string',
        },
      ];

      assert.deepEqual(actual, expected);
    });

  });

  describe('Rule arrayString', () => {
    it('should return error with arrayString', () => {
      const rules = {
        success: { type: 'arrayString' },
        jsonTrue: { type: 'arrayString', required: true },
        jsonEmpty: { type: 'arrayString', required: true },
        jsonAllString: { type: 'arrayString', required: true },
        jsonError: { type: 'arrayString', required: true },
      };
      const data = {
        success: '["foo"]',
        jsonTrue: true,
        jsonAllString: '["foo", 1]',
        jsonEmpty: '[]',
        jsonError: '{',
      };

      const actual = parameterObj.validate(rules, data);
      const expected = [
        {
          code: 'invalid',
          field: 'jsonTrue',
          message: 'must be array string',
        },
        {
          code: 'invalid',
          field: 'jsonEmpty',
          message: 'not to be empty',
        },
        {
          code: 'invalid',
          field: 'jsonAllString',
          message: 'must be all string',
        },
        {
          code: 'invalid',
          field: 'jsonError',
          message: 'must be array string',
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });

  describe('Rule arrayInteger', () => {
    it('should return error with arrayInteger', () => {
      const rules = {
        success: { type: 'arrayInteger' },
        jsonTrue: { type: 'arrayInteger', required: true },
        jsonEmpty: { type: 'arrayInteger', required: true },
        jsonAllInteger: { type: 'arrayInteger', required: true },
        jsonError: { type: 'arrayInteger', required: true },
      };
      const data = {
        success: '[1]',
        jsonTrue: true,
        jsonAllInteger: '["foo", 1]',
        jsonEmpty: '[]',
        jsonError: '{',
      };

      const actual = parameterObj.validate(rules, data);
      const expected = [
        {
          code: 'invalid',
          field: 'jsonTrue',
          message: 'must be array integer',
        },
        {
          code: 'invalid',
          field: 'jsonEmpty',
          message: 'not to be empty',
        },
        {
          code: 'invalid',
          field: 'jsonAllInteger',
          message: 'must be all integer',
        },
        {
          code: 'invalid',
          field: 'jsonError',
          message: 'must be array integer',
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });


  describe('Rule any', () => {
    it('should return undefined with any', () => {
      const rules = {
        success: { type: 'any' },
        success2: { type: 'any' },
      };
      const data = {
        success: '1',
        success2: {},
      };

      const actual = parameterObj.validate(rules, data);

      assert(!actual);
    });
  });

  describe('Rule object', () => {
    it('should return error array with object', () => {
      const rules = {
        success: { type: 'object' },
        empty: { type: 'object', required: true },
        empty2: { type: 'object' },
        errArr: { type: 'object' },
      };
      const data = {
        success: { foo: 'bar' },
        empty: {},
        empty2: {},
        errArr: [ 1 ],
      };

      const actual = parameterObj.validate(rules, data);
      const expected = [
        {
          code: 'invalid',
          field: 'empty',
          message: 'not to be empty',
        },
        {
          code: 'invalid',
          field: 'errArr',
          message: 'must be object',
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });

  describe('Rule file', () => {
    it('should return error array with file', () => {
      const rules = {
        error: { type: 'file' },
        file: { type: 'file' },
      };


      const demoFilePath = path.join(__dirname, '../../', 'mock/file/demo.md');
      const rs = fs.createReadStream(demoFilePath);

      const data = {
        error: {},
        file: rs,
      };

      const actual = parameterObj.validate(rules, data);
      const expected = [
        {
          code: 'invalid',
          field: 'error',
          message: 'must be file stream',
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });


});
