'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);
  app.registerRemote(app.model.Article);
};
