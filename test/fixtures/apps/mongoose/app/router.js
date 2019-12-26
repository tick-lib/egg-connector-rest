'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);

  app.ready(() => {
    /**
     * mongoose 需要在 ready 之后才能注册
     */
    app.registerRemote(app.model.Article);
    app.registerRemote(app.model.User);
  });
};
