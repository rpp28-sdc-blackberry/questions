const supertest = require('supertest');
const app = require('../../server/server.js').app;
const request = supertest(app);
const db = require('../../pg/index.js');

afterAll(async () => {
  await db.client.end();
});

describe('GET/dummy', () => {
  it('responds with 200 status code', (done) => {
    request.get('/dummy')
      .expect(200, done);
  });

  it('responds with 300 status code', (done) => {
    request.get('/dummy')
      .expect(200, done);
  });
});
