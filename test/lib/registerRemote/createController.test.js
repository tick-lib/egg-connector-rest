'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const createController = require('../../../lib/registerRemote/createController');

describe('test/lib/registerRemote/createController.test.js', () => {
  let app;
  let ctx;

  before(async () => {
    app = mock.app({
      baseDir: 'apps/connector-rest-test',
    });

    await app.ready();

    ctx = app.mockContext();
  });

  after(() => app.close());
  afterEach(mock.restore);

  describe('BaseController getClassName', () => {
    it('should return class Name', () => {
      const TestController = createController(
        app,
        {},
        'Test',
        {}
      );

      const ctrl = new TestController(ctx);

      const actual = ctrl.getClassName();
      const expected = 'TestController';

      assert(actual === expected);
    });

    it('should create controller instance and method', async () => {
      class MockModel {
        static index() {
          return [{ id: 1, instance: 'foo' }];
        }
        show2(_ctx, id) {
          return { id };
        }
      }

      const mockRemotes = {
        index: {
          isStatic: true,
          http: {
            verb: 'get',
            path: '/',
          },
        },
        show2: {
          parameters: [
            {
              name: 'id',
              type: 'integer',
              in: 'path',
            },
          ],
          http: {
            verb: 'get',
            path: '/:id',
          },
        },
      };

      ctx.params = {
        id: 2,
      };

      const mockConfig = {
        modelFindByPk: () => {
          return new MockModel();
        },
      };

      const Test2Controller = createController(app, MockModel, 'Test2', mockRemotes, mockConfig);

      const ctrl = new Test2Controller(ctx);

      console.log(ctrl.show);

      // const actual = await ctrl.index();
      const actual2 = await ctrl.show2();
      // const expected = [{ id: 1, instance: 'foo' }];
      const expected2 = { id: 2 };

      // assert.deepEqual(actual, expected);
      assert.deepEqual(actual2, expected2);
    });

    it('should create controller throw Error with error Model function', () => {
      const mockModel = {
        findById(id) {
          return { id };
        },
      };

      const mockRemotes = {
        index: {
          isStatic: true,
          http: {
            verb: 'get',
            path: '/',
          },
        },
      };

      let err;

      try {
        createController(app, mockModel, 'Test3', mockRemotes);
      } catch (error) {
        err = error;
      }

      const actual = err.message;
      const expected = 'Test3 not found function index';

      assert(actual === expected);
    });

    it('should create controller with error Model prototype function', () => {
      class MockModel {

      }
      const mockRemotes = {
        info: {
          http: {
            verb: 'get',
            path: '/',
          },
        },
      };

      let err;

      try {
        createController(app, MockModel, 'Test5', mockRemotes);
      } catch (error) {
        err = error;
      }

      const actual = err.message;
      const expected = 'Test5.prototype not found function info';

      assert(actual === expected);
    });
  });

});
