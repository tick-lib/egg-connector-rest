'use strict';

module.exports = app => {
  console.log('app.config.env =', app.config.env);
  require('./lib/loader')(app);
};
