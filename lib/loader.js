'use strict';

const debug = require('debug')('egg-connector-rest:loader');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const RestSwagger = require('./restSwagger/createSwaggerJson');
const registerRemote = require('./registerRemote');

module.exports = app => {
  const defaultConfig = {
    // model 的路径, 参数为 app
    models: app => app.model.models,
    swaggerDoc: {},
  };

  const config = Object.assign(defaultConfig, app.config.connectorRest);

  debug('app.config: %o', app.config.connectorRest);

  if (!config.enable) {
    return false;
  }

  const ModelCollection = config.models(app);

  debug('ModelCollection: %o', ModelCollection);

  let ModelArray = [];

  if (!Array.isArray(ModelCollection)) {
    ModelArray = _.map(ModelCollection, item => item);
  } else {
    ModelArray = ModelCollection;
  }

  const jsonDirPath = path.join(config.jsonDir(app));

  // 加载文件 loaderModels
  const loaderModels = ModelArray.map(Model => {
    const modelName = config.modelName(Model);
    const restJsonPath = path.join(jsonDirPath, `${modelName}.json`);

    const fsExists = fs.existsSync(restJsonPath);

    if (!fsExists) {
      app.logger.error(`${modelName}.json not exists`);
      return false;
    }

    const map = app.loader.requireFile(restJsonPath);

    // TODO: 未找到相关文件
    return {
      model: Model,
      modelName,
      ...map,
    };
  }).filter(item => item);

  const swaggerObj = new RestSwagger(config.swaggerDoc, loaderModels);

  debug('swaggerDoc :%o', config.swaggerDoc);
  debug('loaderModels :%o', loaderModels);

  app.swagger = swaggerObj.swaggerRoot;

  // debug(swaggerObj.swaggerRoot.paths);

  app.registerRemote = registerRemote(app, loaderModels, swaggerObj, config);

};
