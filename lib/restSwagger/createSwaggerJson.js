'use strict';

const _ = require('lodash');
const swaggerTemplate = require('./swaggerDefault');

class RestSwagger {
  /**
   * 初始化
   * @param {object} swaggerDocOptions 设置
   * @param {object[]} loaderModels 模型集合
   */
  constructor(swaggerDocOptions, loaderModels = []) {
    this.uniqueOperationIds = new Set();
    this.swaggerRoot = _.cloneDeep(swaggerTemplate.defaultRoot);
    this.baseStructure(swaggerDocOptions);
    this.createTags(loaderModels);

    this.createDefinitions(loaderModels);
    this.createPaths(loaderModels);
  }

  /**
   * 替换路径
   * /path/:id =>  /path/{id}
   * @param {string} path path
   */
  static convertPathFragments(path) {
    return path.split('/').map(fragment => {
      if (fragment.charAt(0) === ':') {
        return '{' + fragment.slice(1) + '}';
      }
      return fragment;
    }).join('/');
  }


  /**
   * ========================================
   * validate part start
   * ========================================
   */

  /**
   * 添加唯一操作id
   * @param {string} operationId operationId
   */
  addOperationId(operationId = '') {
    const set = this.uniqueOperationIds;
    if (set.has(operationId)) {
      console.warn(`${operationId} is Repeat.`);
    } else {
      set.add(operationId);
    }
  }
  /**
   * ========================================
   * validate part end
   * ========================================
   */

  /**
   * 生成基础文档
   * @param {object} swaggerDocOptions 设置
   */
  baseStructure(swaggerDocOptions = {}) {
    // 指定内容
    const pickKeys = [
      'swagger', 'info', 'host', 'basePath', 'schemes', 'externalDocs', 'securityDefinitions',
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

    return this.swaggerRoot.tags;
  }

  /**
   * Definition
   * key 为 Model 名, 优先执行 createDefinition 函数
   * @param {Object[]} loaderModels           - 加载Model信息集合数组
   * @param {string} loaderModels[].modelName    - modelName
   * @param {string} loaderModels[].settings     - model 的 setting 集合
   * @param {string} loaderModels[].model     - model 的实例
   */
  createDefinitions(loaderModels = []) {
    const definitions = {};

    const pickKeys = Object.keys(swaggerTemplate.defaultDefinitionItem);

    loaderModels.forEach(loadModel => {
      const model = loadModel.model;
      const modelName = loadModel.modelName;
      const isFunction = typeof model.createDefinition === 'function';

      const defInfo = isFunction ? model.createDefinition() : (_.result(loadModel, 'settings.definition') || {});


      const validateDef = _.pick(_.assign(_.cloneDeep(swaggerTemplate.defaultDefinitionItem), defInfo), pickKeys);

      definitions[modelName] = validateDef;
    });

    this.swaggerRoot.definitions = _.assign(this.swaggerRoot.definitions, definitions);

    return definitions;
  }
  /**
   * 扩展 Definition
   * @param {Object} extendDefinitions 扩展定义
   */
  extendDefinitions(extendDefinitions) {
    _.assign(this.swaggerRoot.definitions, extendDefinitions);
  }

  /**
   * 获取定义的ref
   * @param {string} name 获取定义的应用
   * @return {string} #/definitions/xxx
   */
  getDefinitionSchemaRef(name = '') {
    const def = this.swaggerRoot.definitions;
    if (!def[name]) {
      console.error(`not found ref about ${name}`);
    }

    return `#/definitions/${name}`;
  }

  /**
   * 创建 paths 数据
   * @param {Object[]} loaderModels           - 加载Model信息集合数组
   * @param {string} loaderModels[].modelName    - modelName
   * @param {string} loaderModels[].remotes     - model 的 remotes 集合
   * @param {string} loaderModels[].settings.plural     - model 的 plural 信息
   * @param {string} loaderModels[].model     - model 的实例
   */
  createPaths(loaderModels = []) {
    const paths = {};

    loaderModels.forEach(loadModel => {
      const modelName = loadModel.modelName;
      const remotes = loadModel.remotes;
      // 基础路径
      const modelPlural = _.result(loadModel, 'settings.plural') || `${modelName}s`; // 这里不做复杂的复数转换

      this.createModelPaths(modelName, remotes, modelPlural, paths);
    });


    this.swaggerRoot.paths = _.assign(this.swaggerRoot.paths, paths);
  }

  createModelPaths(modelName, remotes, modelPlural = '', paths = {}) {
    _.map(remotes, (remoteItem, method) => {
      const path = _.result(remoteItem, 'http.path');
      const fullPath = _.trimEnd(RestSwagger.convertPathFragments(`/${modelPlural}${path}`), '/');
      paths[fullPath] = this.createModelSinglePath(modelName, method, remoteItem);
    });

  }


  /**
   * 根据 modelName、methodName、remoteItem 创建指定 path 对象
   * @param {string} modelName    - modelName
   * @param {string} methodName   - 方法名
   * @param {object} remoteItem   - remote 信息
   */
  createModelSinglePath(modelName, methodName, remoteItem) {
    const item = _.cloneDeep(swaggerTemplate.defaultPathVerbItem);

    item.tags.push(modelName);

    // inject summary, description, security, produces, consumes, deprecated
    const pickKeys = [ 'summary', 'description', 'security', 'produces', 'consumes', 'deprecated' ];
    const pickJson = _.pick(remoteItem, pickKeys);

    _.assign(item, pickJson);

    // operationId
    const operationId = RestSwagger.createUniqueOperationId(
      modelName,
      methodName,
      remoteItem.isStatic,
      _.result(remoteItem, 'http.verb'),
      _.result(remoteItem, 'http.path')
    );
    this.addOperationId(operationId);
    item.operationId = operationId;

    const parameters = this.createParametersOptions(remoteItem.parameters);

    const responses = this.createResponsesOptions(remoteItem.responses);

    item.parameters = parameters;
    item.responses = responses;

    return item;
  }

  /**
   * 创建唯一的操作id
   * @param {string} modelName model 名称
   * @param {string} methodName method 方法名称
   * @param {boolean} isStatic 是否为静态方法
   * @param {string} verb 请求方式 get/option/put/post/delete
   * @param {string} endpoint 端点路径
   * @return {string} 唯一操作id
   */
  static createUniqueOperationId(modelName, methodName, isStatic, verb = 'get', endpoint = '') {
    const validateRndpoint = endpoint.replace(/[\/:]+/g, '_');
    const prototypeStr = isStatic ? '' : '_prototype';

    return `${modelName.toLowerCase()}${prototypeStr}__${methodName}__${verb}_${validateRndpoint}`;
  }


  /**
   * 格式化 parameters
   * @param {object[]} parameters parameters 项
   */
  createParametersOptions(parameters) {
    const items = _.cloneDeep(parameters);
    const validateItems = items.map(item => {

      let template = {};

      if (item.type === 'array') {
        template = _.cloneDeep(swaggerTemplate.defaultParameterWithTypeMultiValue);
      } else if (item.type === 'string') {
        template = _.cloneDeep(swaggerTemplate.defaultParameterWithTypeString);
      } else if (item.type === 'integer') {
        template = _.cloneDeep(swaggerTemplate.defaultParameterWithTypeInteger);
      } else if (item.schema) {
        template = _.cloneDeep(swaggerTemplate.defaultParameterWithSchema);
      } else {
        return false;
      }

      const keys = Object.keys(template);
      const validateItem = {
        ...template,
        ..._.pick(item, keys),
      };

      // 处理 ref
      if (_.result(validateItem, 'schema.ref')) {
        validateItem.schema.ref = this.getDefinitionSchemaRef(validateItem.schema.ref);
      }

      if (_.result(validateItem, 'schema.items.ref')) {
        validateItem.schema.items.ref = this.getDefinitionSchemaRef(validateItem.schema.items.ref);
      }

      return validateItem;

    });

    return validateItems.filter(item => item);
  }

  /**
   * 创建对应的 responses
   * @param {object} responses 响应结果可能性
   */
  createResponsesOptions(responses) {
    const items = _.cloneDeep(responses);
    _.map(items, item => {
      if (_.result(item, 'schema.ref')) {
        item.schema.ref = this.getDefinitionSchemaRef(item.schema.ref);
      }
      if (_.result(item, 'schema.items.ref')) {
        item.schema.items.ref = this.getDefinitionSchemaRef(item.schema.items.ref);
      }
    });

    return items;
  }


}

module.exports = RestSwagger;
