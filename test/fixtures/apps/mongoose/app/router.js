'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);

  app.registerRemote('article', app.model.Article);
  app.registerRemote('user', app.model.User);
  // app.ready(() => {
  //   /**
  //    * mongoose 需要在 ready 之后才能注册
  //    */
  //   console.log('app.model ======= ');
  //   console.log(app.model);
  // });
};
