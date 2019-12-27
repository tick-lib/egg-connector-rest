'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);
  app.registerRemote('article', app.model.Article);
  app.registerRemote('user', app.model.User);
};
