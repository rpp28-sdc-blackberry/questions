// process.env.NODE_ENV = "test";

const supertest = require('supertest');
const app = require('../../server/server.js').app;
const request = supertest(app);
const db = require('../../pg/index.js');

// beforeAll(async () => {
//   db.client.connect()
//     .then(() => console.log('TEST PG CONNECTED'))
//     .catch((err) => console.log('TEST PG NOT CONNECTED', err))
// })

beforeEach(async () => {
  await db.client.query(`ALTER SEQUENCE questions_question_id_seq RESTART`);
  await db.client.query(`ALTER SEQUENCE answers_answer_id_seq RESTART`);
  await db.client.query(`ALTER SEQUENCE photos_id_seq RESTART`);

  await db.client.query(`INSERT INTO questions (product_id, question_body, asker_name, asker_email) VALUES(1, 'test body1', 'test1', 'test1@g.com'),(2, 'test body2', 'test2', 'test2@g.com')`);
  await db.client.query(`INSERT INTO answers (question_id, body, answerer_name, answerer_email) VALUES(1, 'answer body1', 'answer1', 'answer1@g.com'),(2, 'answer body2', 'answer2', 'answer2@g.com')`);
  await db.client.query(`INSERT INTO photos (answer_id, url) VALUES(1, 'photo1'), (1, 'photo2'), (1, 'photo3'), (2, 'photo4')`);
})

afterEach(async () => {
  await db.client.query(`TRUNCATE questions, answers, photos`);
})

afterAll(async () => {
  await db.client.end();
});


describe('GET/dummy', () => {
  it('responds with 200 status code', (done) => {
    request.get('/dummy')
      .expect(200, done);
  });
});

describe('GET/qa/questions', () => {
  it('should respond with 200 status code and all questions', async () => {
    let response = await request.get('/qa/questions?product_id=1&count=1')
    // console.log('RESPONSE', response.body.results[0])
    expect(response.statusCode).toBe(200);
    expect(response.body.product_id).toEqual('1');
    expect(response.body.results.length).toEqual(1);
  }, 1000 * 30);
});