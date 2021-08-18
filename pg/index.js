const { Client, Pool } = require('pg');

let database;
let user;
let password;
let host;

if (process.env.NODE_ENV === 'development') {
  database = 'qna';
  user = 'farhanali3193';
  password = process.env.PG_DB_PASS_DEV;
  host = 'localhost';
} else if (process.env.NODE_ENV === 'test') {
  database = 'qna-test';
  user = 'postgres';
  password = process.env.PG_DB_PASS_TEST;
  host = 'localhost';
} else if (process.env.NODE_ENV === 'production') {
  database = 'qna';
  user = 'postgres';
  password = process.env.PG_DB_PASS_PROD;
  host = '44.197.129.107';
}

const pool = new Pool({
  database: database,
  user: user,
  password: password,
  host: host,
  port: 5432,
});
console.log('DB env', process.env.NODE_ENV)

pool.connect()
  .then((client) => {
    console.log(`CONNECTED TO PG: DATABASE: ${database}`);
    client.release();
  })
  .catch((err) => console.log(`ERROR CONNECTING TO PG: DATABASE ${database}`, err))

let getQuestions = (product_id, offset, limit) => {
  let questionsQuery = `SELECT questions.question_id, questions.question_body, questions.question_date, questions.asker_name, questions.reported, questions.question_helpfulness, answers.answer_id AS id, answers.body, answers.date, answers.answerer_name, answers.reported AS answer_reported, answers.helpfulness, photos.url AS photo_url FROM questions LEFT OUTER JOIN answers ON (questions.question_id = answers.question_id) LEFT OUTER JOIN photos ON (answers.answer_id = photos.answer_id) WHERE questions.product_id = $1 ORDER BY questions.question_id`;
  let values = [product_id];

  let requiredDataQuery = `SELECT question_id from questions WHERE product_id = $1 ORDER BY question_id ASC OFFSET $2 LIMIT $3`;
  let valuesForRequiredData = [product_id, offset, limit]

  let promises = [];
  promises.push(pool.query(requiredDataQuery, valuesForRequiredData));
  promises.push(pool.query(questionsQuery, values));

  return Promise.all(promises)
    .then((resolved) => {
      let requiredIds = resolved[0].rows;
      let rawQuestions = resolved[1].rows;
      // console.log('one', requiredIds, 'two', rawQuestions);
      let requiredIdsTracker = {};
      requiredIds.forEach((questionId) => requiredIdsTracker[questionId.question_id] = questionId.question_id);
      // console.log('ID TRACKER', requiredIdsTracker);
      let filteredRawQuestions = rawQuestions.filter((question) => requiredIdsTracker[question.question_id] !== undefined);
      // console.log('filteredRawQuestions', filteredRawQuestions)
      let qTracker = {};
      for (let i = 0; i < filteredRawQuestions.length; i++) {
        let currentQuestion = filteredRawQuestions[i];
        if (currentQuestion.reported) {
          continue;
        }
        if (qTracker[currentQuestion.question_id] === undefined) {
          let answers = {};
          // console.log('REPORTED INITIAL',!currentQuestion.answer_reported, currentQuestion.question_id, currentQuestion.id )
          if (currentQuestion.id) {
            if (!currentQuestion.answer_reported) {
              let photos = [];
              if (currentQuestion.photo_url) {
                photos.push(currentQuestion.photo_url)
              }
              answers[currentQuestion.id] = {
                id: currentQuestion.id,
                body: currentQuestion.body,
                date: currentQuestion.date,
                answer_name: currentQuestion.answerer_name,
                helpfulness: currentQuestion.helpfulness,
                photos
              };
            }
          }

          let newQuestion = {
            question_id: currentQuestion.question_id,
            question_body: currentQuestion.question_body,
            question_date: currentQuestion.question_date,
            asker_name: currentQuestion.asker_name,
            question_helpfulness: currentQuestion.question_helpfulness,
            answers
          }
          qTracker[currentQuestion.question_id] = newQuestion;
        } else {
          // console.log('REPORTED',!currentQuestion.answer_reported, currentQuestion.question_id, currentQuestion.id)
          if (currentQuestion.id) {
            if (currentQuestion.answer_reported) {
              continue;
            }
            if (qTracker[currentQuestion.question_id].answers[currentQuestion.id] === undefined) {
              let photos = [];
              if (currentQuestion.photo_url) {
                photos.push(currentQuestion.photo_url)
              }
              let newAnswer = {
                id: currentQuestion.id,
                body: currentQuestion.body,
                date: currentQuestion.date,
                answer_name: currentQuestion.answerer_name,
                helpfulness: currentQuestion.helpfulness,
                photos
              };
              qTracker[currentQuestion.question_id].answers[currentQuestion.id] = newAnswer;
            } else {
              if (currentQuestion.photo_url) {
                qTracker[currentQuestion.question_id].answers[currentQuestion.id].photos.push(currentQuestion.photo_url)
              }
            }
          }
        }
      }
      // console.log('MODIF Qss', qTracker)
      return qTracker;
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL QUESTIONS', err);
      throw err;
    })
}

let getAnswers = (question_id, offset, limit) => {
  let answersQuery = `SELECT answers.answer_id, answers.body, answers.date, answers.answerer_name, answers.reported, answers.helpfulness, photos.id AS photo_id, photos.url AS photo_url FROM answers LEFT OUTER JOIN photos ON (answers.answer_id = photos.answer_id) WHERE answers.question_id=$1 ORDER BY answers.answer_id`;
  let values = [question_id];

  let requiredDataQuery = `SELECT answer_id from answers WHERE question_id = $1 ORDER BY answer_id ASC OFFSET $2 LIMIT $3`;
  let valuesForRequiredData = [question_id, offset, limit]

  let promises = [];
  promises.push(pool.query(requiredDataQuery, valuesForRequiredData));
  promises.push(pool.query(answersQuery, values));

  return Promise.all(promises)
    .then((resolved) => {
      let requiredIds = resolved[0].rows;
      let rawAnswers = resolved[1].rows;
      // console.log('one', requiredIds, 'two', rawAnswers);
      let requiredIdsTracker = {};
      requiredIds.forEach((answerId) => requiredIdsTracker[answerId.answer_id] = answerId.answer_id);
      // console.log('ID TRACKER', requiredIdsTracker);
      let filteredRawAnswers = rawAnswers.filter((answer) => requiredIdsTracker[answer.answer_id] !== undefined);
      // console.log('filteredRawAnswers', filteredRawAnswers)
      let tracker = {};
      for (let i = 0; i < filteredRawAnswers.length; i++) {
        let currentRawAnswer = filteredRawAnswers[i];
        if (currentRawAnswer.reported) {
          continue;
        }
        if (tracker[currentRawAnswer.answer_id] === undefined) {
          let photos = [];
          if (currentRawAnswer.photo_url) {
            photos.push({
              id: currentRawAnswer.photo_id,
              url: currentRawAnswer.photo_url
            })
          }
          let newAnswer = {
            answer_id: currentRawAnswer.answer_id,
            body: currentRawAnswer.body,
            date: currentRawAnswer.date,
            answerer_name: currentRawAnswer.answerer_name,
            helpfulness: currentRawAnswer.helpfulness,
            photos
          }
          tracker[currentRawAnswer.answer_id] = newAnswer;
        } else {
          if (currentRawAnswer.photo_url) {
            tracker[currentRawAnswer.answer_id].photos.push({
              id: currentRawAnswer.photo_id,
              url: currentRawAnswer.photo_url
            })
          }
        }
      }
      // console.log('MODIFIED ANSWERS', tracker)
      return tracker;
     })
     .catch((err) => {
      console.log('DB ERROR GETTING ALL ANSWERS', err);
      throw err;
    })
}

let addQuestion = ({ product_id, body, name, email }) => {
  if (typeof product_id !== 'number' || typeof body !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    throw 'BODY NEEDS TO BE IN CORRECT FORMAT';
  }

  let addQuestionQuery = `INSERT INTO questions (product_id, question_body, asker_name, asker_email) VALUES($1, $2, $3, $4) RETURNING *`;
  let values = [product_id, body, name, email];

  return pool.query(addQuestionQuery, values)
    .then((addedQ) => {
      // console.log('DB POSTED QUESTION', addedQ.rows)
      return addedQ.rows;
    })
    .catch((err) => {
      console.log('DB ERROR POSTING Q', err);
      throw err;
    })
};

let addAnswer = (question_id, body, name, email) => {
  let addAnswerQuery = `INSERT INTO answers (question_id, body, answerer_name, answerer_email) VALUES($1, $2, $3, $4) RETURNING *`;
  let values = [question_id, body, name, email];

  return pool.query(addAnswerQuery, values)
    .then((addedAnswer) => {
      // console.log('DB POSTED ANSWER', addedAnswer.rows)
      return addedAnswer.rows[0];
    })
    .catch((err) => {
      console.log('DB ERROR POSTING ANSWER', err);
      throw err;
    });
}

let addPhoto = (answer_id, url) => {
  let addPhotoQuery = `INSERT INTO photos (answer_id, url) VALUES($1, $2) RETURNING *`;
  let values = [answer_id, url];

  return pool.query(addPhotoQuery, values)
    .then((addedPhoto) => {
      // console.log('DB POSTED PHOTO', addedPhoto.rows);
      return addedPhoto.rows[0];
    })
    .catch((err) => {
      console.log('DB ERROR POSTING PHOTO', err);
      throw err;
    });
};

let updateQuestionHelpfulness = (question_id) => {
  let updateQHelpfulnessQuery = `UPDATE questions SET question_helpfulness = question_helpfulness + 1 WHERE question_id = $1 RETURNING *`;
  let values = [question_id];

  return pool.query(updateQHelpfulnessQuery, values)
    .then((updatedQ) => {
      // console.log('DB UPDATE Q HELPFULNESS', updatedQ.rows)
      return updatedQ.rows[0];
    })
    .catch((err) => {
      console.log('DB ERROR UPDATING Q HELPFULNESS', err);
      throw err;
    });
};

let reportQuestion = (question_id) => {
  let reportQuestionQuery = `UPDATE questions SET reported = $1 WHERE question_id = $2 RETURNING *`;
  let values = [true, question_id];

  return pool.query(reportQuestionQuery, values)
    .then((reportedQ) => {
      // console.log('DB REPORTED Q SUCCESSFULLY', reportedQ.rows);
      return reportedQ.rows[0];
    })
    .catch((err) => {
      console.log('DB ERROR REPORTING Q', err);
      throw err;
    });
};

let updateAnswerHelpfulness = (answer_id) => {
  let updateAnswerHelpfulnessQuery = `UPDATE answers SET helpfulness = helpfulness + 1 WHERE answer_id = $1 RETURNING *`;
  let values = [answer_id];

  return pool.query(updateAnswerHelpfulnessQuery, values)
    .then((updatedA) => {
      // console.log('DB UPDATE ANSWER HELPFULNESS', updatedA.rows)
      return updatedA.rows[0];
    })
    .catch((err) => {
      console.log('DB ERROR UPDATING ANSWER HELPFULNESS', err);
      throw err;
    });
}

let reportAnswer = (answer_id) => {
  let reportAnswerQuery = `UPDATE answers SET reported = $1 WHERE answer_id = $2 RETURNING *`;
  let values = [true, answer_id];

  return pool.query(reportAnswerQuery, values)
    .then((reportedA) => {
      // console.log('DB REPORTED ANSWER SUCCESSFULLY', reportedA.rows);
      return reportedA.rows[0];
    })
    .catch((err) => {
      console.log('DB ERROR REPORTING ANSWER', err);
      throw err;
    });
}

module.exports.pool = pool;
module.exports.getQuestions = getQuestions;
module.exports.getAnswers = getAnswers;
module.exports.addQuestion = addQuestion;
module.exports.addAnswer = addAnswer;
module.exports.addPhoto = addPhoto;
module.exports.updateQuestionHelpfulness = updateQuestionHelpfulness;
module.exports.reportQuestion = reportQuestion;
module.exports.updateAnswerHelpfulness = updateAnswerHelpfulness;
module.exports.reportAnswer = reportAnswer;