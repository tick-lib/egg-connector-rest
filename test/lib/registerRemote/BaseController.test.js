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
      ];

      const rules = {};

      paramArray.forEach(item => BaseController.transToValidate(rules, item));

      const expected = {
        num: { type: 'int', max: 10, min: 1, required: true },
        num2: { type: 'int' },
        josnStr: { type: 'string' },
        str: { type: 'string', required: true },
        any: { type: 'any' },
        enum: { type: 'enum', values: [ 1, 2, 3 ] },
        arrStr: { type: 'arrayString' },
        arrInt: { type: 'arrayInteger' },
      };

      assert.deepEqual(rules, expected);

    });


  });

});
