'use strict';
const _ = require('lodash');
const debug = require('debug')('egg-connector-rest:registerRemote:BaseController');
const Parameter = require('parameter');
const validateRules = require('./validateRules');
const Controller = require('egg').Controller;

const parameterObj = new Parameter();
validateRules(parameterObj);

/**
 * 支持 restful api
 */
class BaseController extends Controller {
  /**
   * 将配置转化为 parameter 的验证规则
   * @param {object} rules 目标规则信息
   * @param {object} param remote 参数配置
   */
  static transToValidate(rules = {}, param) {
    const { name, type, minimum, maximum, required, items } = param;
    switch (type) {
      case 'integer': {
        const currule = { type: 'int', required: !!required };
        if (minimum) {
          currule.min = minimum;
        }
        if (maximum) {
          currule.max = maximum;
        }

        rules[name] = currule;
        break;
      }
      case 'string': {
        const currule = { type: 'string', required: !!required };
        if (required) {
          currule.required = required;
        }

        rules[name] = currule;
        break;
      }
      case 'array': {
        // enum
        let currule = { type: 'any' };
        if (items) {
          if (items.enum) {
            currule = { type: 'enum', values: items.enum, required: !!required };
          } else if (items.type === 'string') {
            currule = { type: 'arrayString', required: !!required };
          } else if (items.type === 'integer') {
            currule = { type: 'arrayInteger', required: !!required };
          }
        }
        rules[name] = currule;
        break;
      }

      default: {
        const currule = { type, required: !!required };
        rules[name] = currule;
      }
        break;
    }

    return rules;
  }

  /**
   * 通过 parameters 集合 生成对应 path body query
   * 的 parameter 规则
   * @param {object[]} parameters parameters
   * @return {object} {path, body, query} 对应规则
   */
  static parametersCreateValidate(parameters = []) {
    const path = {};
    const body = {};
    const query = {};

    parameters.forEach(parameter => {
      switch (parameter.in) {
        case 'query':
          BaseController.transToValidate(query, parameter);
          break;
        case 'body':
          BaseController.transToValidate(body, parameter);
          break;
        case 'path':
          BaseController.transToValidate(path, parameter);
          break;
        default:
          break;
      }
    });

    return {
      path,
      body,
      query,
    };
  }

  static parseAndValidateParametersToArgs(parameters = [], ctx) {
    const payload = {
      path: ctx.params || {},
      query: ctx.query || {},
      // hack 兼容以下逻辑
      body: {
        body: (ctx.request && ctx.request.body) || {},
      },
    };

    const rules = BaseController.parametersCreateValidate(parameters);

    debug('rules: %o', rules);

    _.forEach(rules, (rule, key) => {
      if (payload.hasOwnProperty(key)) {
        const info = parameterObj.validate(rule, payload[key]);

        if (info) {
          const error = new Error('Validation Failed');
          error.info = info;
          debug(info);
          debug(rule);
          debug(payload[key]);
          throw error;
        }
      }
    });

    return BaseController.parse2Args(parameters, payload);
  }

  /**
   * 解析成 arguments
   * @param {object[]} parameters remote 的 parameters 信息
   * @param {object} responcePayload 请求载体
   * @return {any[]} 对应的数组
   */
  static parse2Args(parameters, responcePayload) {
    const args = parameters.map((parameter = {}) => {
      const { name, type } = parameter;
      const payload = responcePayload[parameter.in] || {};

      const value = payload[name];

      return BaseController.parseAndFormat(type, value);
    });

    return args;
  }

  /**
   * 根据 type 解析 value
   * @param {string} type 类型
   * @param {any} value any
   */
  static parseAndFormat(type, value) {
    switch (type) {
      case 'jsonString': {
        try {
          const result = JSON.parse(value);
          return result;
        } catch (error) {
          return {};
        }
      }
      case 'arrayString':
      case 'arrayInteger': {
        try {
          const result = JSON.parse(value);
          return Array.isArray(result) ? result : [];
        } catch (error) {
          return [];
        }
      }
      default:
        return value;
    }
  }

  success(ctx, data) {
    ctx.body = data;
  }
}

module.exports = BaseController;
