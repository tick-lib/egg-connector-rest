'use strict';

const _ = require('lodash');

module.exports = appInfo => {
  const config = {
    logger: {
      level: 'DEBUG',
      consoleLevel: 'DEBUG',
    },
    sequelize: {
      port: '3306',
      host: '127.0.0.1',
      username: 'root',
      password: '',
      database: 'test',
      dialect: 'mysql',
    },
    keys: '123456',
    // 主要配置
    connectorRest: {
      enable: true,
      models: app => _.map(app.model.models, item => item),
      jsonDir: () => `${appInfo.root}/app/model`,
      modelName: Model => Model.name,
    },
  };

  return config;
};
