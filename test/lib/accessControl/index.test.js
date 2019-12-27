'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const createAccessControl = require('../../../lib/accessControl');

describe('test/lib/accessControl/index.test.js', () => {
  let app;
  const mockConfig = {
    accessControl: async ctx => {
      if (!ctx.isAdmin) {
        throw new Error('is not admin');
      }
      return true;
    },
  };

  before(() => {
    app = mock.app({
      baseDir: 'apps/connector-rest-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  describe('filterAcls()', () => {
    it('should return empty with empty arguments', () => {
      const accessControl = createAccessControl(app, mockConfig);

      const actual = accessControl.filterAcls();
      const expected = [];

      assert.deepEqual(actual, expected);

    });
    it('should return filter and sort array with methodName', () => {
      const acls = [
        {
          roles: '*',
          permission: 'DENY',
          methods: '*',
          weight: -10,
        },
        {
          roles: 'everyone',
          permission: 'ALLOW',
          methods: 'index',
          weight: -1,
        },
        {
          roles: 'admin',
          permission: 'ALLOW',
          methods: 'create',
        },
        {
          roles: [ 'owner', 'admin' ],
          permission: 'ALLOW',
          methods: 'show',
        },
        {
          roles: [ 'create_user', 'update_user', 'admin' ],
          permission: 'ALLOW',
          methods: 'countAll',
        },
        {
          roles: 'create_user',
          permission: 'ALLOW',
          methods: [ 'destroyById', 'create' ],
        },
        {
          roles: 'create_user',
          permission: 'DENY',
          methods: [ 'updateAttributes', 'create' ],
          weight: 10,
        },
        {
          roles: 'update_user',
          permission: 'ALLOW',
          methods: [ 'updateAttributes', 'destroyById' ],
        },
      ];

      const accessControl = createAccessControl(app, mockConfig);

      const actual = accessControl.filterAcls(acls, 'create');

      const expected = [
        {
          roles: 'create_user',
          permission: 'DENY',
          methods: [ 'updateAttributes', 'create' ],
          weight: 10,
        },
        {
          roles: 'admin',
          permission: 'ALLOW',
          methods: 'create',
        },
        {
          roles: 'create_user',
          permission: 'ALLOW',
          methods: [ 'destroyById', 'create' ],
        },
        {
          roles: '*',
          permission: 'DENY',
          methods: '*',
          weight: -10,
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });

  describe('_allowAccess()', () => {
    it('should throw error', async () => {
      const acls = [
        {
          roles: '*',
          permission: 'DENY',
          methods: '*',
          weight: -10,
        },
        {
          roles: 'admin',
          permission: 'DENY',
          methods: '*',
          weight: -10,
        },
      ];

      const mockCtx = {
        isAdmin: false,
      };


      const accessControl = createAccessControl(app, mockConfig);

      let err;
      try {
        await accessControl._allowAccess(mockCtx, {}, 'test', acls);
      } catch (error) {
        err = error;
      }

      assert(err.message, 'is not admin');
    });

    it('should return true', async () => {
      const acls = [
        {
          roles: '*',
          permission: 'DENY',
          methods: '*',
          weight: -10,
        },
        {
          roles: 'admin',
          permission: 'DENY',
          methods: '*',
          weight: -10,
        },
      ];

      const mockCtx = {
        isAdmin: true,
      };

      const accessControl = createAccessControl(app, mockConfig);

      const actual = await accessControl._allowAccess(mockCtx, {}, 'test', acls);

      assert(actual);
    });
  });
});
