'use strict';

const debug = require('debug')('egg-connector-rest:loader');
// const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const RestSwagger = require('./restSwagger/createSwaggerJson');
const registerRemote = require('./registerRemote');

module.exports = app => {
  const defaultConfig = {
    // model 的路径, 参数为 app
    swaggerDoc: {},
  };

  const config = Object.assign(defaultConfig, app.config.connectorRest);

  debug('app.config: %o', app.config.connectorRest);

  if (!config.enable) {
    return false;
  }


  // 加载 json 文件目录
  const modelConfigPath = path.join(config.jsonDir(app));
  const loadFiles = fs.readdirSync(modelConfigPath);

  const modelConfigFiles = loadFiles.filter(fileName => {
    return fileName.substr(-5) === '.json';
  });

  const loaderModels = modelConfigFiles.map(filePath => {
    const restJsonPath = path.join(modelConfigPath, filePath);
    const modelConfig = app.loader.requireFile(restJsonPath);
    // hack 自定义 modelName
    const fileName = filePath.slice(0, -5);
    const modelName = config.formatModelName(fileName);

    const modelDef = {
      modelName,
      getModel: config.getModel,
      ...modelConfig,
    };

    return modelDef;
  });

  const swaggerObj = new RestSwagger(config.swaggerDoc, loaderModels);

  debug('swaggerDoc :%o', config.swaggerDoc);
  debug('loaderModels :%o', loaderModels);

  app.swagger = swaggerObj.swaggerRoot;

  // debug(swaggerObj.swaggerRoot.paths);

  app.registerRemote = registerRemote(app, loaderModels, swaggerObj, config);

};
