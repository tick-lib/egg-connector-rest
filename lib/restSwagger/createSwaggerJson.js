'use strict';

const _ = require('lodash');
// const swaggerTemplate = require('./swaggerDefault');

// swagger 文档包括以下几个部分
const swaggerRoot = {
  swagger: '2.0', // swagger 版本
  info: {}, // 详情信息
  host: '',
  basePath: '',

  tags: [], // 动态生成
  paths: {},
  definitions: {},
  securityDefinitions: {},
};

class RestSwagger {
  /**
   * 初始化
   * @param {object} swaggerDocOptions 设置
   * @param {object[]} loaderModels 模型集合
   */
  constructor(swaggerDocOptions, loaderModels = {}) {
    this.swaggerRoot = swaggerRoot;
    this.baseStructure(swaggerDocOptions);
    this.createTags(loaderModels);
  }

  /**
   * 生成基础文档
   * @param {object} swaggerDocOptions 设置
   */
  baseStructure(swaggerDocOptions) {
    // 指定内容
    const pickKeys = [
      'swagger', 'info', 'host', 'basePath',
    ];
    const pickObject = _.pick(swaggerDocOptions, pickKeys);

    this.swaggerRoot = _.assign(this.swaggerRoot, pickObject);
  }

  /**
   * 创建 tag 内容
   * @param {Object[]} loaderModels           - 加载Model信息集合数组
   * @param {string} loaderModels[].modelName    - modelName
   * @param {string} loaderModels[].settings     - model 的 setting 集合
   * @param {string} loaderModels[].settings.description  - model 的描述
   */
  createTags(loaderModels) {
    const tags = _.map(loaderModels, model => ({
      name: model.modelName,
      description: _.result(model, 'settings.description'),
    }));

    this.swaggerRoot.tags = this.swaggerRoot.tags.concat(tags);
  }

}

module.exports = RestSwagger;
