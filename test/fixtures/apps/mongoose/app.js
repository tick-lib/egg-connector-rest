'use strict';

module.exports = app => {
  console.log('app.config.env =', app.config.env);
  app.mongoose.loadModel();
  app.mongoose.set('debug', true);
};
