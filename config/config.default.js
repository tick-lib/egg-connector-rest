'use strict';
// eslint-disable

/**
 * egg-connector-rest default config
 * @member Config#connectorRest
 * @property {String} SOME_KEY - some description
 */
exports.connectorRest = {
  /**
   * @param {any} app 应用app
   * 可以再次过滤不需要的 model
   */
  models: app => app.model.models,
  jsonDir: app => app, // json 文件的路径
  modelName: Model => Model.name.toLowerCase(),
  validateErrors: error => {
    console.log(error);
  },
  // model 查找 id 的方法
  modelFindByPk: (Model, id) => Model.findByPk(id),
  swaggerDoc: {
    // 参考 https://swagger.io/docs/specification/2-0/basic-structure/
    swagger: '2.0', // swagger 版本
    info: {
      description: 'test',
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
  },
};


exports.validate = {
  enable: true,
};
