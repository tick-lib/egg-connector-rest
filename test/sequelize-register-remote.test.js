'use strict';

const assert = require('assert');
const mock = require('egg-mock');

const initArticles = require('./mock/mysql/article');
const initUsers = require('./mock/mysql/user');

describe('test/sequelize-register-remote.test.js', () => {
  let app;
  let ctx;
  before(async () => {
    app = mock.app({
      baseDir: 'apps/sequelize',
    });

    await app.ready();
    ctx = app.mockContext();
    await ctx.model.Article.sync({ force: true });
    await ctx.model.User.sync({ force: true });

    // 录入测试数据
    await ctx.model.Article.bulkCreate(initArticles);
    await ctx.model.User.bulkCreate(initUsers);
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('test', async () => {
    const num = await ctx.model.Article.count();
    assert.equal(num, 3);
  });

  describe('Article REST', () => {
    it('should GET /api/v1/articles', () => {
      return app
        .httpRequest()
        .get('/api/v1/articles')
        .expect(200);
    });
  });

});
