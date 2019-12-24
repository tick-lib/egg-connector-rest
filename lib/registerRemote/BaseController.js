'use strict';
// const _ = require('lodash');
const parameter = require('parameter');
const validateRules = require('./validateRules');
const Controller = require('egg').Controller;

validateRules(parameter);

/**
 * 支持 restful api
 */
class BaseController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.c = '123';
  }

  /**
   * 将配置转化为 parameter 的验证规则
   * @param {object} rules 目标规则信息
   * @param {object} param remote 参数配置
   */
  static transToValidate(rules = {}, param) {
    const { name, type, minimum, maximum, required, items } = param;
    switch (type) {
      case 'integer': {
        const currule = { type: 'int' };
        if (minimum) {
          currule.min = minimum;
        }
        if (maximum) {
          currule.max = maximum;
        }
        if (required) {
          currule.required = required;
        }

        rules[name] = currule;
        break;
      }
      case 'jsonString':
      case 'string': {
        const currule = { type: 'string' };
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
            currule = { type: 'enum', values: items.enum };
          } else if (items.type === 'string') {
            currule = { type: 'arrayString' };
          } else if (items.type === 'integer') {
            currule = { type: 'arrayInteger' };
          }
        }
        rules[name] = currule;
        break;
      }

      default:
        rules[name] = type;
        break;
    }

    return rules;
  }

  // 创建对应的 validate 规则
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
    const result = {
      path: ctx.params || {},
      body: ctx.request.body || {},
      query: ctx.query || {},
    };

    const rules = BaseController.parametersCreateValidate(parameters);

    rules.forEach((rule, key) => {
      ctx.validate(rule, result[key]);
    });

    return BaseController.parse2Args(parameters, result);
  }

  static parse2Args(parameters, result) {
    const args = parameters.map(parameter => {
      const { name, type } = parameter;
      const payload = result[parameter.in];

      const value = payload[name];

      return BaseController.parseAndFormat(type, value);
    });

    return args;
  }

  static parseAndFormat(type, value) {
    switch (type) {
      case 'array': {
        try {
          const result = JSON.parse(value);
          return result;
        } catch (error) {
          return {};
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
