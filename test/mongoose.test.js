'use strict';

const assert = require('assert');
const mock = require('egg-mock');

const initArticles = require('./mock/mongodb/article');
const initUsers = require('./mock/mongodb/user');

describe('test/mongoose.test.js', () => {
  let app;
  let ctx;
  before(async () => {
    app = mock.app({
      baseDir: 'apps/mongoose',
    });

    await app.ready();
    ctx = app.mockContext();

    await ctx.model.Article.deleteMany({});
    await ctx.model.User.deleteMany({});

    // 录入测试数据
    await ctx.model.Article.insertMany(initArticles);
    await ctx.model.User.insertMany(initUsers);
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('test', async () => {
    const num = await ctx.model.Article.countDocuments();
    assert.equal(num, 3);
  });

  describe('acl 权限控制', () => {
    describe('access control with article', () => {
      it('should GET /api/v1/articles', async () => {
        const res = await app
          .httpRequest()
          .get('/api/v1/articles')
          .set('Accept', 'application/json');

        const actual = res.body;

        assert(res.status === 200);
        assert(actual.length === 3);
      });

      it('should GET /api/v1/articles/1 throw authorization error', async () => {
        const res = await app
          .httpRequest()
          .get('/api/v1/articles/1')
          .set('Accept', 'application/json');

        const actual = res.body;

        assert(res.status === 401);
        assert(actual.message === 'Authorization Error');
      });

      it('should GET /api/v1/articles/aaaaaaaaaaaaaaaaaaaaa001 with owner', async () => {
        const res = await app
          .httpRequest()
          .get('/api/v1/articles/aaaaaaaaaaaaaaaaaaaaa001')
          .set('userid', 'aaaaaaaaaaaaaaaaaaaab001')
          .set('Accept', 'application/json');

        const actual = res.body;

        const expected = {
          __v: 0,
          _id: 'aaaaaaaaaaaaaaaaaaaaa001',
          id: 'aaaaaaaaaaaaaaaaaaaaa001',
          title: 'title1',
          desc: 'desc1',
          content: 'content1 belong user 2',
          userId: 'aaaaaaaaaaaaaaaaaaaab001',
        };

        assert(res.status === 200);
        assert.deepEqual(actual, expected);
      });

      it('should GET /api/v1/articles/aaaaaaaaaaaaaaaaaaaaa001 with admin role', async () => {
        const res = await app
          .httpRequest()
          .get('/api/v1/articles/aaaaaaaaaaaaaaaaaaaaa001')
          .set('role', 'admin')
          .set('Accept', 'application/json');

        const actual = res.body;

        const expected = {
          __v: 0,
          _id: 'aaaaaaaaaaaaaaaaaaaaa001',
          id: 'aaaaaaaaaaaaaaaaaaaaa001',
          title: 'title1',
          desc: 'desc1',
          content: 'content1 belong user 2',
          userId: 'aaaaaaaaaaaaaaaaaaaab001',
        };

        assert(res.status === 200);
        assert.deepEqual(actual, expected);
      });

      it('should GET /api/v1/articles/count with everyone', async () => {
        const res = await app
          .httpRequest()
          .get('/api/v1/articles/count')
          .set('Accept', 'application/json');

        assert(res.status === 401);
        assert(res.body.message === 'Authorization Error');
      });

      it('should GET /api/v1/articles/count with admin', async () => {
        const res = await app
          .httpRequest()
          .get('/api/v1/articles/count')
          .set('role', 'admin')
          .set('Accept', 'application/json');

        assert(res.status === 200);

        const expected = {
          count: 3,
        };

        assert.deepEqual(res.body, expected);
      });

      it('should PUT /api/v1/articles with create_user', async () => {
        app.mockCsrf();
        const res = await app
          .httpRequest()
          .post('/api/v1/articles')
          .set('role', 'create_user')
          .set('Accept', 'application/json')
          .send({
            title: 'create',
            desc: 'desc-creater',
            content: 'create content',
          });

        const expected = {
          title: 'create',
          desc: 'desc-creater',
          content: 'create content',
        };

        const actual = {
          title: res.body.title,
          desc: res.body.desc,
          content: res.body.content,
        };

        assert(res.status === 200);
        assert.deepEqual(actual, expected);
      });

      it('should UPDATE /api/v1/articles/aaaaaaaaaaaaaaaaaaaaa003 with update_user', async () => {
        app.mockCsrf();
        const res = await app
          .httpRequest()
          .put('/api/v1/articles/aaaaaaaaaaaaaaaaaaaaa003')
          .set('role', 'update_user')
          .set('Accept', 'application/json')
          .send({
            title: 'update',
          });

        const expected = {
          __v: 1,
          _id: 'aaaaaaaaaaaaaaaaaaaaa003',
          id: 'aaaaaaaaaaaaaaaaaaaaa003',
          title: 'update',
          desc: 'desc3',
          content: 'content3 belong user 1',
          userId: 'aaaaaaaaaaaaaaaaaaaab001',
        };

        assert(res.status === 200);
        assert.deepEqual(res.body, expected);
      });

      it('should DELETE /api/v1/articles/aaaaaaaaaaaaaaaaaaaaa002 with update_user', async () => {
        app.mockCsrf();
        const res = await app
          .httpRequest()
          .delete('/api/v1/articles/aaaaaaaaaaaaaaaaaaaaa002')
          .set('role', 'update_user')
          .set('Accept', 'application/json');

        const expected = {
          __v: 0,
          _id: 'aaaaaaaaaaaaaaaaaaaaa002',
          id: 'aaaaaaaaaaaaaaaaaaaaa002',
          title: 'title2',
          desc: 'desc2',
          content: 'content2 belong user 2',
          userId: 'aaaaaaaaaaaaaaaaaaaab002',
        };

        assert(res.status === 200);
        assert.deepEqual(res.body, expected);
      });
    });
  });
});
