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

  const mockModels = [
    {
      model: {},
      modelName: 'Pet',
      settings: {
        definition: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
            },
            name: {
              type: 'string',
            },
          },
        },
      },
    },
  ];

  before(() => {
    app = mock.app({
      baseDir: 'apps/connector-rest-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  describe('prototype.baseStructure', () => {
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

  describe('addOperationId', () => {
    it('addOperationId throw error', () => {
      const instance = new RestSwagger({});
      instance.addOperationId();
      instance.addOperationId('unique');
      instance.addOperationId('unique');
      assert(instance.uniqueOperationIds.has('unique'));
    });
  });

  describe('prototype.createTags', () => {
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

  describe('prototype.createDefinitions 创建定义', () => {
    const mockLoadModels = [
      {
        modelName: 'foo',
        model: {},
        settings: {
          description: 'foo desc',
          definition: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
              },
              name: {
                type: 'string',
              },
            },
          },
        },
      },
      {
        modelName: 'bar',
        model: {
          createDefinition: () => ({
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
              },
              phone: {
                type: 'string',
              },
            },
          }),
        },
        settings: {
          description: 'bar desc',
        },
      },
    ];
    it('createDefinitions use define and func', () => {
      const instance = new RestSwagger(options);
      instance.createDefinitions(mockLoadModels);

      const actual = instance.swaggerRoot.definitions;

      const expected = {
        foo: {
          type: 'object',
          additionalProperties: false,
          description: '',
          required: [],
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
            },
            name: {
              type: 'string',
            },
          },
        },
        bar: {
          type: 'object',
          required: [],
          properties: {
            id: {
              type: 'integer',
              format: 'int64',
            },
            phone: {
              type: 'string',
            },
          },
          additionalProperties: false,
          description: '',
        },
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('extendDefinitions', () => {
    it('extendDefinitions', () => {
      const instance = new RestSwagger(options);
      const extendDefinitions = {
        accesstoken: {
          type: 'object',
          description: 'accessToken',
          properties: {
            id: {
              type: 'integer',
            },
            createdAt: { type: 'string', format: 'date' },
            updatedAt: { type: 'string', format: 'date' },
          },
        },
      };

      instance.extendDefinitions(extendDefinitions);
      const actual = instance.swaggerRoot.definitions;
      const expected = {
        accesstoken: {
          type: 'object',
          description: 'accessToken',
          properties: {
            id: {
              type: 'integer',
            },
            createdAt: { type: 'string', format: 'date' },
            updatedAt: { type: 'string', format: 'date' },
          },
        },
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('getDefinitionSchemaRef', () => {
    it('getDefinitionSchemaRef with error', () => {
      const instance = new RestSwagger(options);
      const actual = instance.getDefinitionSchemaRef();
      const expected = '#/definitions/';

      assert(actual === expected);
    });
  });
  describe('createModelPaths 创建多个 path 信息', () => {
    it('createModelPaths success', () => {
      const mockRemoteItems = {
        index: {
          summary: '简介',
          description: '具体描述',
          isStatic: true,
          parameters: [
            {
              name: 'status',
              in: 'query',
              description: 'desc',
              required: false,
            },
          ],
          responses: {
            200: {
              description: 'success',
              schema: {
                type: 'array',
                items: {
                  ref: 'Pet',
                },
              },
            },
            400: {
              description: 'not found',
            },
          },
          http: {
            verb: 'get',
            path: '/',
          },
        },
        show: {
          description: '从数据源中通过 {{id}} 查找 Model 的实例 .',
          accepts: [{
            arg: 'id',
            type: 'number',
            description: 'Model id',
            required: true,
            http: {
              source: 'path',
            },
          },
          {
            arg: 'filter',
            type: 'object',
            description: '定义 fields(字段) 和 include',
          },
          ],
          returns: {
            arg: 'data',
            model: 'user',
            type: 'object',
            root: true,
          },
          http: {
            verb: 'get',
            path: '/:id',
          },
        },
      };

      const modelName = 'Pet';
      const paths = {};

      const instance = new RestSwagger(options, mockModels);

      instance.createModelPaths(modelName, mockRemoteItems, 'pets', paths);

      const actual = paths;

      const expected = {
        '/pets': {
          tags: [ 'Pet' ],
          summary: '简介',
          description: '具体描述',
          operationId: 'pet__index__get__',
          produces: [ 'application/json', 'application/xml', 'text/xml', 'application/javascript', 'text/javascript' ],
          consumes: [
            'application/json',
            'application/x-www-form-urlencoded',
            'application/xml',
            'text/xml',
            'multipart/form-data',
          ],
          parameters: [],
          responses: {
            200: {
              description: 'success',
              schema: {
                type: 'array',
                items: {
                  ref: '#/definitions/Pet',
                },
              },
            },
            400: {
              description: 'not found',
            },
          },
          security: [],
          deprecated: false,
        },
        '/pets/{id}': {
          tags: [ 'Pet' ],
          summary: '',
          description: '从数据源中通过 {{id}} 查找 Model 的实例 .',
          operationId: 'pet_prototype__show__get__id',
          produces: [ 'application/json', 'application/xml', 'text/xml', 'application/javascript', 'text/javascript' ],
          consumes: [
            'application/json',
            'application/x-www-form-urlencoded',
            'application/xml',
            'text/xml',
            'multipart/form-data',
          ],
          parameters: [],
          responses: {},
          security: [],
          deprecated: false,
        },
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('createModelSinglePath 创建单个的remote信息', () => {
    it('createModelSinglePath success', () => {
      const mockRemoteItem = {
        summary: '简介',
        description: '具体描述',
        isStatic: true,
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'desc',
            required: false,
          },
        ],
        responses: {
          200: {
            description: 'success',
            schema: {
              type: 'array',
              items: {
                ref: 'Pet',
              },
            },
          },
          400: {
            description: 'not found',
          },
        },
        http: {
          verb: 'get',
          path: '/',
        },
      };

      const modelName = 'Pet';
      const methodName = 'index';

      const instance = new RestSwagger(options, mockModels);

      const actual = instance.createModelSinglePath(modelName, methodName, mockRemoteItem);

      const expected = {
        tags: [ 'Pet' ],
        summary: '简介',
        description: '具体描述',
        operationId: 'pet__index__get__',
        produces: [ 'application/json', 'application/xml', 'text/xml', 'application/javascript', 'text/javascript' ],
        consumes: [
          'application/json',
          'application/x-www-form-urlencoded',
          'application/xml',
          'text/xml',
          'multipart/form-data',
        ],
        parameters: [],
        responses: {
          200: {
            description: 'success',
            schema: {
              type: 'array',
              items: { ref: '#/definitions/Pet' },
            },
          },
          400: { description: 'not found' },
        },
        security: [],
        deprecated: false,
      };

      assert.deepEqual(actual, expected);
    });
  });

  describe('createUniqueOperationId 创建唯一的操作id', () => {
    it('createUniqueOperationId with isStatic true', () => {
      const modelName = 'Pet';
      const methodName = 'index';
      const isStatic = true;
      const verb = 'get';
      const endpoint = '/user/list';

      const actual = RestSwagger.createUniqueOperationId(modelName, methodName, isStatic, verb, endpoint);

      const expected = 'pet__index__get__user_list';

      assert(actual === expected);
    });

    it('createUniqueOperationId with isStatic true', () => {
      const modelName = 'Pet';
      const methodName = 'index';
      const isStatic = false;
      const verb = 'get';
      const endpoint = '/user/list';

      const actual = RestSwagger.createUniqueOperationId(modelName, methodName, isStatic, verb, endpoint);

      const expected = 'pet_prototype__index__get__user_list';

      assert(actual === expected);
    });

    it('createUniqueOperationId with empty arguments', () => {
      const modelName = 'Pet';
      const methodName = 'index';
      const isStatic = false;

      const actual = RestSwagger.createUniqueOperationId(modelName, methodName, isStatic);

      const expected = 'pet_prototype__index__get_';

      assert(actual === expected);
    });
  });

  describe('createParametersOptions responses', () => {
    it('parameters test', () => {
      const instance = new RestSwagger(options, mockModels);

      const parameters = [
        {
          in: 'query',
          name: 'body',
          description: 'desc',
          required: true,
          schema: {
            ref: 'Pet',
          },
          err: 'text',
        },
        {
          in: 'body',
          name: 'data',
          description: 'desc 2',
          required: true,
          schema: {
            items: {
              ref: 'Pet',
            },
          },
        },
        {
          in: 'query',
          name: 'str',
          description: 'str',
          required: true,
          type: 'string',
        },
        {
          in: 'query',
          name: 'num',
          description: 'num',
          required: true,
          type: 'integer',
          default: 100,
        },
        {
          in: 'query',
          name: 'status',
          description: 'status',
          required: true,
          type: 'array',
          items: {
            type: 'string',
            enum: [ 'enabled', 'disabled' ],
            default: 'enabled',
          },
          collectionFormat: 'multi',
        },
        {
          err: 'text',
        },
      ];

      const expected = [
        {
          in: 'query',
          name: 'body',
          description: 'desc',
          required: true,
          schema: {
            ref: '#/definitions/Pet',
          },
        },
        {
          in: 'body',
          name: 'data',
          description: 'desc 2',
          required: true,
          schema: {
            items: {
              ref: '#/definitions/Pet',
            },
          },
        },
        {
          in: 'query',
          name: 'str',
          description: 'str',
          required: true,
          type: 'string',
          default: null,
          enum: null,
          format: null,
          items: null,
        },
        {
          in: 'query',
          name: 'num',
          description: 'num',
          required: true,
          default: 100,
          type: 'integer',
          enum: null,
          minimum: null,
          maximum: null,
        },
        {
          in: 'query',
          name: 'status',
          description: 'status',
          required: true,
          type: 'array',
          items: {
            type: 'string',
            enum: [ 'enabled', 'disabled' ],
            default: 'enabled',
          },
          collectionFormat: 'multi',
          uniqueItems: false,
          minItems: null,
          maxItems: null,
          default: null,
        },
      ];

      const actual = instance.createParametersOptions(parameters);

      assert.deepEqual(actual, expected);
    });
  });

  describe('createResponsesOptions responses', () => {
    it('responses test', () => {
      const responseOptions = {
        200: {
          description: 'success',
          schema: {
            type: 'array',
            items: {
              ref: 'Pet',
            },
          },
        },
        203: {
          description: 'success',
          schema: {
            ref: 'Pet',
          },
        },
        400: {
          description: 'not found',
        },
      };

      const instance = new RestSwagger(options, mockModels);

      const actual = instance.createResponsesOptions(responseOptions);

      const expected = {
        200: {
          description: 'success',
          schema: {
            type: 'array',
            items: {
              ref: '#/definitions/Pet',
            },
          },
        },
        203: {
          description: 'success',
          schema: {
            ref: '#/definitions/Pet',
          },
        },
        400: {
          description: 'not found',
        },
      };

      assert.deepEqual(actual, expected);
    });
  });

  // describe('prototype.createRestPath 创建路径', () => {
  //   const singleModelSetting = {
  //     settings: {

  //     },
  //     remotes: {
  //       index: {
  //         summary: '简介',
  //         description: '具体描述',
  //         isStatic: true,
  //         parameters: [
  //           {
  //             name: 'status',
  //             in: 'query',
  //             description: 'desc',
  //             required: false,
  //           },
  //         ],
  //         responses: {
  //           200: {
  //             description: 'success',
  //             schema: {
  //               type: 'array',
  //               items: {
  //                 ref: 'Pet',
  //               },
  //             },
  //           },
  //           400: {
  //             description: 'not found',
  //           },
  //         },
  //         http: {
  //           verb: 'get',
  //           path: '/',
  //         },
  //       },
  //     },

  //   };
  //   it('createRestPath', () => {
  //   });
  // });
});
