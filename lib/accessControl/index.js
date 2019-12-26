'use strict';

const _ = require('lodash');
module.exports = (app, config) => {

  /**
   * 过滤权限列表
   * @param {*} acls 权限列表
   * @param {*} methodName 方法名
   */
  function filterAcls(acls = [], methodName = '') {
    // 查找匹配的 acl list
    const filterAcls = acls.filter(acl => {
      return acl.methods === '*' || (
        Array.isArray(acl.methods) ?
          acl.methods.some(method => method === methodName) :
          false);
    });

    // 倒序
    return _.sortBy(filterAcls, item => {
      return -1 * item.weight || 0;
    });
  }


  async function _allowAccess(ctx, Model, methodName, acls) {
    try {
      const result = await config.accessControl(ctx, Model, methodName, acls);
      return result;
    } catch (error) {
      throw error;
    }
  }

  return {
    filterAcls,
    _allowAccess,
  };

};
