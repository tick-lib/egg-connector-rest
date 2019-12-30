'use strict';

const mock = require('egg-mock');

describe('test/connector-rest.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/connector-rest-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, connectorRest')
      .expect(200);
  });

});
