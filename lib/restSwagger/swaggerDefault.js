'use strict';

const defaultInfo = {
  description: '...',
  version: '1.0.0',
  title: 'Swagger Demo',
  termsOfService: '', // 服务条款
  contact: {
    email: '297190869@qq.com',
  },
  license: {
    name: 'Apache 2.0',
    url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
  },
};

const defaultTagItem = {
  name: '',
  description: '',
  externalDocs: {
    description: '',
    url: '',
  },
};

const defaultPathVerbItem = {
  tags: [],
  summary: '',
  description: '',
  operationId: 'uid', // 唯一操作id
  produces: [
    'application/json',
    'application/xml',
    'text/xml',
    'application/javascript',
    'text/javascript',
  ], // 请求格式
  consumes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'application/xml',
    'text/xml',
    'multipart/form-data',
  ], // 响应格式
  parameters: [],
  responses: [],
  security: [],
  deprecated: false,
};

const defaultDefinitionItem = {
  type: 'object',
  description: '',
  properties: {},
  required: [],
  additionalProperties: false,
};

const baseRoot = {
  swagger: '2.0', // swagger api version
  info: {
    description: 'rest api description',
    version: '1.0',
    title: 'rest api',
    termsOfService: '',
    contact: {
      email: '',
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  host: 'petstore.swagger.io',
  basePath: '/v1',
  schemes: [ 'http' ],
  securityDefinitions: {},
};

const defaultRoot = {
  swagger: '2.0', // swagger api version
  info: {
    description: 'rest api description',
    version: '1.0',
    title: 'rest api',
    termsOfService: '',
    contact: {
      email: '',
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
  },
  host: 'petstore.swagger.io',
  basePath: '/v1',
  schemes: [ 'http' ],
  // Complex mode
  tags: [],
  paths: [],
  securityDefinitions: {},
  definitions: [],
};

module.exports = {
  defaultInfo,
  defaultTagItem,
  defaultPathVerbItem,
  defaultDefinitionItem,
  defaultRoot,
  baseRoot,
};
