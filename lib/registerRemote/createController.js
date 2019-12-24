'use strict';

const _ = require('lodash');
const BaseController = require('./BaseController');
const debug = require('debug')('egg-connector-rest:registerRemote:createController');

module.exports = (app, Model, modelName, remotes) => {
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

    // add validate

    CurClass.prototype[key] = async function() {
      const result = {
        demo: 123,
      };

      // TODO: access 校验
      debug('remote: %o', remote);

      // TODO: 优化，使用缓存与缓存校验.
      // 校验字段
      debug('reomte in %s method %s', ctrlName, key);

      return result;
      // this.success(ctx, result);
    };
  });

  return CurClass;
};
