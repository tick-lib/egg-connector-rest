'use strict';

// const _ = require('lodash');
const debug = require('debug')('egg-connector-rest:mongoose');

const { updateIfCurrentPlugin } = require('mongoose-update-if-current');

module.exports = appInfo => {
  const config = {
    logger: {
      level: 'DEBUG',
      consoleLevel: 'DEBUG',
    },
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1/demo',
        options: {
          useUnifiedTopology: true,
          useNewUrlParser: true,
          debug: true,
          useFindAndModify: false,
        },
        plugins: [[ updateIfCurrentPlugin ]],
      },
      // 在 app.js 中提前启动, 正常模块需要在 beforeStart 启动
      loadModel: false,
      app: true,
      agent: true,
    },
    keys: '123456',
    // 主要配置
    connectorRest: {
      enable: true,
      jsonDir: () => `${appInfo.root}/app/rest`,
      formatModelName: ModelName => ModelName.toLowerCase(),
      modelFindByPk: (Model, id) => Model.findById(id),
      getModel: (app, modelName) => {
        return app.model[modelName];
      },
      // 权限控制
      accessControl: async (ctx, Model, methodName, acls = []) => {
        const header = ctx.request.header;
        const roleName = header.role;
        const isAdmin = roleName === 'admin';
        const isCreateUser = roleName === 'create_user';
        const isUpdateUser = roleName === 'update_user';

        function createError() {
          const err = new Error('Authorization Error');
          err.status = 401;
          throw err;
        }

        // 获取首个命中的规则

        const matchRoles = [ '*', 'everyone', 'owner' ];
        if (roleName) {
          matchRoles.push(roleName);
        }

        const filterAcls = acls.filter(acl => {
          if (acl.permission !== 'ALLOW') return false;

          const roles = Array.isArray(acl.roles) ? acl.roles : [ acl.roles ];

          return roles.some(item => {
            return matchRoles.indexOf(item) > -1;
          });
        });

        if (!filterAcls.length) {
          createError();
        }

        const firstAcl = filterAcls[0];

        const roles = typeof firstAcl.roles === 'string' ? [ firstAcl.roles ] : firstAcl.roles;

        debug('acls: %o', acls);
        debug(methodName);
        debug(firstAcl);
        debug(roles);

        // 需要验证 owner
        let needAccessOwner = false;
        let isAllow = roles.some(role => {
          switch (role) {
            case 'everyone':
              return true;
            case 'admin':
              return isAdmin;
            case 'create_user':
              return isCreateUser;
            case 'update_user':
              return isUpdateUser;
            case 'owner':
              needAccessOwner = true;
              return false;
            default:
              return false;
          }
        });

        debug('isAllow : %o', isAllow);
        debug('needAccessOwner : %o', needAccessOwner);

        if (!isAllow && needAccessOwner) {
          const id = ctx.params.id;
          const userId = header.userid;
          if (id && userId) {
            isAllow = await Model.BelongOwnerById(userId, id);
          }
        }

        if (!isAllow) {
          createError();
        }
      },
      swaggerDoc: {
        // 参考 https://swagger.io/docs/specification/2-0/basic-structure/
        swagger: '2.0', // swagger 版本
        info: {
          description: 'test',
          version: '1.0.0',
          title: 'Demo',
          termsOfService: '', // 服务条款
        },
        host: '<your.site>',
        basePath: '/api/v1',
      },
    },
  };

  return config;
};
