'use strict';

module.exports = agent => {
  console.log('agent.config.env =', agent.config.env);
  agent.mongoose.loadModel();
  agent.mongoose.set('debug', true);
};
