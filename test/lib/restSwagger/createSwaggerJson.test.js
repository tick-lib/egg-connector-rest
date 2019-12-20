'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const RestSwagger = require('../../../lib/restSwagger/createSwaggerJson');

describe('test/lib/restSwagger/createSwaggerJson.test.js', () => {
  let app;
  const options = {
    swagger: '2.0', // swagger 版本
    info: {
      description: 'Singleton 1',
      version: '1.0.0',
      title: 'Swagger Demo',
      termsOfService: '', // 服务条款
      contact: {
        email: 'yourEmail',
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    host: '<your.site>',
    basePath: '/v1',
  };

  before(() => {
    app = mock.app({
      baseDir: 'apps/connector-rest-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  describe('RestSwagger.prototype.baseStructure', () => {
    it('should skip other attr', () => {
      const instance = new RestSwagger({});
      const docOptions = {
        swagger: '1.0',
        info: {},
        error: 'error',
      };

      instance.baseStructure(docOptions);
      const swaggerRoot = instance.swaggerRoot;

      assert(swaggerRoot.swagger === docOptions.swagger);
      assert.deepEqual(swaggerRoot.info, docOptions.info);
      assert(typeof swaggerRoot.error === 'undefined');
    });
  });

  describe('RestSwagger.prototype.createTags', () => {
    it('should create model tags', () => {
      const instance = new RestSwagger(options);

      const mockLoadModels = [
        {
          modelName: 'foo',
          settings: {
            description: 'foo desc',
          },
        },
        {
          modelName: 'bar',
          settings: {
            description: 'bar desc',
          },
        },
      ];

      instance.createTags(mockLoadModels);

      const actual = instance.swaggerRoot.tags;
      const expected = [
        {
          name: 'foo',
          description: 'foo desc',
        },
        {
          name: 'bar',
          description: 'bar desc',
        },
      ];

      assert.deepEqual(actual, expected);
    });

  });


});
