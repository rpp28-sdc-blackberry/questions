const supertest = require('supertest');
const app = require('../../server/server.js').app;
const request = supertest(app);
const db = require('../../pg/index.js');

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

describe('GET questions', () => {
  it('should respond with 200 status code and all questions', async () => {
    let response = await request.get('/qa/questions').query({product_id: 1, count: 4});
    let questions = response.body.results;
    // console.log('QUESTIONS', questions[0].answers['1'])

    expect(response.statusCode).toBe(200);
    expect(response.body.product_id).toEqual('1');

    expect(questions.length).toEqual(1);
    expect(questions[0].question_id).toEqual(1);

    let answer = questions[0].answers['1'];
    expect(answer.id).toEqual(1);
    expect(answer.photos.length).toEqual(3)
  });
});

describe('GET answers', () => {
  it('should respond with 200 status code and all questions', async () => {
    let response = await request.get('/qa/questions/1/answers')
    let answers = response.body.results;
    // console.log('ANSWERS', answers[0]);

    expect(response.statusCode).toBe(200);
    expect(response.body.question).toEqual('1');

    expect(answers.length).toEqual(1);
    expect(answers[0].answer_id).toEqual(1);

    let photos = answers[0].photos;
    expect(photos.length).toEqual(3);
  });
});

describe('POST question', () => {
  it('should respond with 201 status code and should add a question', async () => {
    let questionBody = {
      name: 'Q3',
      body: 'Q3',
      email: 'q3@g.com',
      product_id: 1
    }
    let postResponse = await request.post('/qa/questions').send(questionBody)
    expect(postResponse.statusCode).toEqual(201);

    let getResponse = await request.get('/qa/questions').query({product_id: 1, count: 10});
    let questions = getResponse.body.results;

    // console.log('NEW QUESTIONS', questions)
    expect(questions.length).toEqual(2);
    expect(questions[1].question_id).toEqual(3);
  });
});

describe('POST answer', () => {
  it('should respond with 201 status code and should add an answer', async () => {
    let answerBody = {
      name: 'A3',
      body: 'A3',
      email: 'a3@g.com',
      photos: ['photo5']
    }
    let postResponse = await request.post('/qa/questions/1/answers').send(answerBody)
    expect(postResponse.statusCode).toEqual(201);

    let getResponse = await request.get('/qa/questions/1/answers');
    let answers = getResponse.body.results;

    // console.log('NEW ANSWERS', answers)
    expect(answers.length).toEqual(2);
    expect(answers[1].answer_id).toEqual(3);
    expect(answers[1].body).toEqual('A3');
  });
});

describe('Increase question helpfulness', () => {
  it('should respond with 204 status code and should increase helpfulness count', async () => {
    let oldGetResponse = await request.get('/qa/questions').query({product_id: 1, count: 10});
    let oldQuestions = oldGetResponse.body.results;
    // console.log('OLD QUESTIONS', oldQuestions)

    expect(oldQuestions[0].question_id).toEqual(1);
    expect(oldQuestions[0].question_helpfulness).toEqual(0);

    let putResponse = await request.put('/qa/questions/1/helpful');
    expect(putResponse.statusCode).toEqual(204);

    let newGetResponse = await request.get('/qa/questions').query({product_id: 1, count: 10});
    let newQuestions = newGetResponse.body.results;
    // console.log('NEW QUESTIONS', newQuestions)

    expect(newQuestions[0].question_id).toEqual(1);
    expect(newQuestions[0].question_helpfulness).toEqual(1);
  });
});

describe('Report Question', () => {
  it('should respond with 204 status code and should not return the reported question', async () => {
    let questionBody = {
      name: 'Q3',
      body: 'Q3',
      email: 'q3@g.com',
      product_id: 1
    }
    let postResponse = await request.post('/qa/questions').send(questionBody)
    expect(postResponse.statusCode).toEqual(201);

    let getResponse = await request.get('/qa/questions').query({product_id: 1, count: 10});
    let questions = getResponse.body.results;
    // console.log('after adding a Q', questions)
    expect(questions.length).toEqual(2)
    expect(questions[1].question_id).toEqual(3);

    let putResponse = await request.put('/qa/questions/3/report');
    expect(putResponse.statusCode).toEqual(204);

    let newGetResponse = await request.get('/qa/questions').query({product_id: 1, count: 10});
    let newQuestions = newGetResponse.body.results;
    // console.log('AFTER REMOVING A Q', newQuestions)

    expect(newQuestions.length).toEqual(1);
    expect(newQuestions[0].question_id).toEqual(1);
  });
});

describe('Increase answer helpfulness', () => {
  it('should respond with 204 status code and should increase helpfulness count', async () => {
    let oldGetResponse = await request.get('/qa/questions/1/answers');
    let oldAnswers = oldGetResponse.body.results;
    // console.log('OLD ANSWERS', oldAnswers)

    expect(oldAnswers[0].answer_id).toEqual(1);
    expect(oldAnswers[0].helpfulness).toEqual(0);

    let putResponse = await request.put('/qa/answers/1/helpful');
    expect(putResponse.statusCode).toEqual(204);

    let newGetResponse = await request.get('/qa/questions/1/answers');
    let newAnswers = newGetResponse.body.results;
    // console.log('NEW ANSWERS', newAnswers)

    expect(newAnswers[0].answer_id).toEqual(1);
    expect(newAnswers[0].helpfulness).toEqual(1);
  });
});

describe('Report Answer', () => {
  it('should respond with 204 status code and should not return the reported answer', async () => {
    let answerBody = {
      name: 'A3',
      body: 'A3',
      email: 'a3@g.com',
      photos: ['photo5']
    };

    let postResponse = await request.post('/qa/questions/1/answers').send(answerBody)
    expect(postResponse.statusCode).toEqual(201);

    let getResponse = await request.get('/qa/questions/1/answers');
    let answers = getResponse.body.results;
    // console.log('after adding an Answer', answers)
    expect(answers.length).toEqual(2);
    expect(answers[1].answer_id).toEqual(3);

    let putResponse = await request.put('/qa/answers/3/report');
    expect(putResponse.statusCode).toEqual(204);

    let newGetResponse = await request.get('/qa/questions/1/answers');
    let newAnswers = newGetResponse.body.results;
    // console.log('AFTER REMOVING AN ANSWER', newAnswers)

    expect(newAnswers.length).toEqual(1);
    expect(newAnswers[0].answer_id).toEqual(1);
  });
});