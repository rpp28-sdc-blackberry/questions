process.env.NODE_ENV = "test";

const supertest = require('supertest');
const app = require('../../server/server.js').app;
const request = supertest(app);
const db = require('../../pg/index.js');

beforeAll(async () => {
  db.client.connect()
    .then(() => console.log('TEST PG CONNECTED'))
    .catch((err) => console.log('TEST PG NOT CONNECTED', err))
})

afterAll(async () => {
  await db.client.end();
});

describe('GET/qa/questions', () => {
  it('responds with 200 status code', async () => {
    let response = await request.get('/qa/questions?product_id=1&count=1')
    // console.log('RESPONSE', response)
    expect(response.statusCode).toBe(200)
  }, 1000 * 30);
});