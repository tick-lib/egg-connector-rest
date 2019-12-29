'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const BaseController = require('../../../lib/registerRemote/BaseController');

describe('test/lib/registerRemote/BaseController.test.js', () => {
  let app;

  before(() => {
    app = mock.app({
      baseDir: 'apps/connector-rest-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  describe('static transToValidate', () => {
    it('should extend rules', () => {
      const paramArray = [
        {
          name: 'num',
          type: 'integer',
          minimum: 1,
          maximum: 10,
          required: true,
        },
        {
          name: 'num2',
          type: 'integer',
        },
        {
          name: 'josnStr',
          type: 'jsonString',
        },
        {
          name: 'str',
          type: 'string',
          required: true,
        },
        {
          name: 'str2',
          type: 'string',
        },
        {
          name: 'any',
          type: 'array',
        },
        {
          name: 'enum',
          type: 'array',
          items: {
            enum: [ 1, 2, 3 ],
          },
        },
        {
          name: 'arrStr',
          type: 'array',
          items: {
            type: 'string',
          },
        },
        {
          name: 'arrInt',
          type: 'array',
          items: {
            type: 'integer',
          },
        },
        {
          name: 'arrErr',
          type: 'array',
          items: {
            type: 'integer-err',
          },
        },
        {
          name: 'obj',
          type: 'object',
        },
      ];

      const rules = {};

      paramArray.forEach(item => BaseController.transToValidate(rules, item));

      const expected = {
        num: { type: 'int', max: 10, min: 1, required: true },
        num2: { type: 'int', required: false },
        josnStr: { type: 'jsonString', required: false },
        str: { type: 'string', required: true },
        str2: { type: 'string', required: false },
        any: { type: 'any' },
        enum: { type: 'enum', values: [ 1, 2, 3 ], required: false },
        arrStr: { type: 'arrayString', required: false },
        arrInt: { type: 'arrayInteger', required: false },
        arrErr: { type: 'any' },
        obj: { type: 'object', required: false },
      };

      assert.deepEqual(rules, expected);

    });
  });

  describe('static parametersCreateValidate', () => {
    it('should create path, body, query validate rules', () => {
      const parameters = [
        {
          in: 'body',
          name: 'num2',
          type: 'integer',
        },
        {
          in: 'query',
          name: 'josnStr',
          type: 'jsonString',
        },
        {
          in: 'path',
          name: 'str',
          type: 'string',
          required: true,
        },
        {},
      ];

      const actual = BaseController.parametersCreateValidate(parameters);

      const expected = {
        path: {
          str: { type: 'string', required: true },
        },
        query: {
          josnStr: { type: 'jsonString', required: false },
        },
        body: {
          num2: { type: 'int', required: false },
        },
      };

      assert.deepEqual(actual, expected);
    });
  });


  describe('static parseAndValidateParametersToArgs', () => {
    it('should parseAndValidateParametersToArgs validate failed with payload', () => {
      const parameters = [
        {
          name: 'id',
          type: 'integer',
          description: 'Model id',
          required: true,
          in: 'path2',
        },
      ];

      const mockCtx = {
        query: {
          where: '{"name":"cc"}',
          limit: 'test',
        },
      };

      const actual = BaseController.parseAndValidateParametersToArgs(parameters, mockCtx);

      const expected = [ undefined ];

      assert.deepEqual(actual, expected);
    });
    it('should parseAndValidateParametersToArgs validate failed', () => {
      const parameters = [
        {
          in: 'query',
          name: 'where',
          type: 'jsonString',
          description: 'where',
        },
        {
          name: 'id',
          type: 'integer',
          description: 'Model id',
          required: true,
          in: 'path',
        },
        {
          in: 'query',
          name: 'limit',
          type: 'integer',
          description: 'limit',
        },
      ];

      const mockCtx = {
        params: {},
        query: {
          where: '{"name":"cc"',
          limit: 'test',
        },
      };

      let err;

      try {
        BaseController.parseAndValidateParametersToArgs(parameters, mockCtx);
      } catch (error) {
        err = error;
      }

      assert(err.message === 'Validation Failed');
    });
    it('should parseAndValidateParametersToArgs validate success', () => {
      const parameters = [
        {
          in: 'query',
          name: 'where',
          type: 'jsonString',
          description: 'where',
        },
        {
          in: 'query',
          name: 'limit',
          type: 'integer',
          description: 'limit',
        },
        {
          name: 'id',
          type: 'integer',
          description: 'Model id',
          required: true,
          in: 'path',
        },
        {
          in: 'body',
          name: 'body',
          type: 'object',
          required: true,
          schema: {
            $ref: 'article',
          },
        },
      ];

      const mockCtx = {
        params: {
          id: 100,
        },
        query: {
          where: '{"name":"cc"}',
          limit: 10,
        },
        request: {
          body: {
            name: 'test1',
            desc: 'desc',
          },
        },
      };

      const actual = BaseController.parseAndValidateParametersToArgs(parameters, mockCtx);

      const expected = [
        { name: 'cc' },
        10,
        100,
        {
          name: 'test1',
          desc: 'desc',
        },
      ];

      assert.deepEqual(actual, expected);
    });

  });
  describe('static parse2Args', () => {
    it('should parse2Args to Array', () => {
      const parameters = [
        { type: 'jsonString', name: 'foo', in: 'query' },
        { type: 'integer', name: 'bar', in: 'query' },
        {},
        { type: 'object', name: 'body', in: 'body' },
      ];

      const payload = {
        query: {
          foo: '{"foo":1}',
          bar: 3,
        },
        body: {
          body: {
            name: 'test',
          },
        },
      };

      const actual = BaseController.parse2Args(parameters, payload);

      const expected = [
        { foo: 1 },
        3,
        undefined,
        { name: 'test' },
      ];

      assert.deepEqual(actual, expected);

    });

  });

  describe('static parseAndFormat', () => {
    it('should parse some value with format', () => {
      const arr = [
        { type: 'jsonString', value: '{"foo":1}' },
        { type: 'jsonString', value: '{"foo":1' },
        { type: 'arrayString', value: '["a","b","c"]' },
        { type: 'arrayInteger', value: '[1,2,3]' },
        { type: 'arrayInteger', value: '[1,2,3' },
        { type: 'arrayInteger', value: '{"foo":1}' },
        { type: 'obj', value: [ 123 ] },
        { type: 'string', value: 'str' },
      ];

      const actual = arr.map(item => BaseController.parseAndFormat(item.type, item.value));

      const expected = [
        { foo: 1 },
        {},
        [ 'a', 'b', 'c' ],
        [ 1, 2, 3 ],
        [],
        {},
        [ 123 ],
        'str',
      ];

      assert.deepEqual(actual, expected);
    });

  });

});
