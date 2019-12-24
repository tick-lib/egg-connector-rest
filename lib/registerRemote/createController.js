'use strict';

const _ = require('lodash');
const BaseController = require('./BaseController');
const debug = require('debug')('egg-connector-rest:registerRemote:createController');

module.exports = (app, Model, modelName, remotes, config) => {
  const ctrlName = `${modelName}Controller`;
  const CurClass = class extends BaseController {
    // constructor(ctx) {
    //   super(ctx);
    // }
    getClassName() {
      return ctrlName;
    }
  };
  // const ctrl = new CurClass();
  // ctrl.MainModel = Model;
  // console.log(remotes);
  _.each(remotes, (remote, key) => {
    // debug(remote);

    // validate
    if (remote.isStatic) {
      if (!(key in Model) || typeof Model[key] !== 'function') {
        throw new Error(`${modelName} not found function ${key}`);
      }
    } else {
      const modelPrototype = Model.prototype;
      if (!(key in modelPrototype) || typeof modelPrototype[key] !== 'function') {
        throw new Error(`${modelName}.prototype not found function ${key}`);
      }
    }

    CurClass.prototype[key] = async function() {
      const { ctx } = this;
      // 获取 args 相关参数
      const args = CurClass.parseAndValidateParametersToArgs(remote.parameters, ctx);

      let result;
      if (remote.isStatic) {
        result = await Model[key](ctx, ...args);
      } else {
        const id = ctx.params.id;
        const instance = await config.modelFindByPk(Model, id);


        console.log('instance');
        console.log(instance);
        result = await instance[key](ctx, ...args);
      }

      // TODO: access 校验
      debug('remote: %o', remote);
      debug('this: %o', this);

      // TODO: 优化，使用缓存与缓存校验.
      // 校验字段
      debug('reomte in %s method %s', ctrlName, key);

      return result;
    };
  });

  return CurClass;
};
