const { Client } = require('pg');

let database;
let user;

if (process.env.NODE_ENV === 'development') {
  database = 'qna';
  user = 'farhanali3193';
} else if (process.env.NODE_ENV === 'test') {
  database = 'qna-test';
  user = 'postgres';
}

const client = new Client({
  database: database,
  user: user
});
console.log('DB env', process.env.NODE_ENV)

client.connect()
  .then(() => console.log(`CONNECTED TO PG: DATABASE: ${database}`))
  .catch((err) => console.log(`ERROR CONNECTING TO PG: DATABASE ${database}`, err))

let getQuestions = (product_id, offset, limit) => {
  // console.log('OFSET', offset, 'limit', limit)
  let questionsQuery = `SELECT * FROM questions WHERE product_id = $1 ORDER BY question_id ASC OFFSET $2 LIMIT $3`;
  let values = [product_id, offset, limit];

  return client.query(questionsQuery, values)
    .then(async (res) => {
      try {
        // console.log('DB ALL QUESTIONS', res.rows);
        let questions = res.rows;

        for (let question of questions) {
          let answersQuery = `SELECT * FROM answers WHERE question_id = $1 ORDER BY answer_id`
          let answers = await getAnswers(question.question_id, null, null, answersQuery);
          question.answers = answers;
        }
        // console.log('DB QUESTIONS AFTER ADDING ALL ANSWERS', questions);
        return questions;
      } catch(err) {
        console.log('ERROR AWAITING FOR ANSWERS', err)
      }
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL QUESTIONS', err);
      throw err;
    })
};

let getAnswers = (question_id, offset, limit, answersQuery) => {
  let values;
  if (answersQuery === undefined) {
    answersQuery = `SELECT * FROM answers WHERE question_id = $1 ORDER BY answer_id ASC OFFSET $2 LIMIT $3`;
    values = [question_id, offset, limit];
  } else {
    values = [question_id];
  }

  return client.query(answersQuery, values)
    .then(async (res) => {
      try {
        // console.log('DB ALL ANSWERS', res.rows);
        let answers = res.rows;

        for (let answer of answers) {
          let photos = await getPhotos(answer.answer_id);
          answer.photos = photos;
        }

        // console.log('DB ANSWERS AFTER ADDING ALL PHOTOS', answers);
        return answers;
      } catch(err) {
        console.log('ERROR AWAITING FOR PHOTOS', err)
      }
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL ANSWERS', err);
      throw err;
    })
}

let getPhotos = (answer_id) => {
  let photosQuery = `SELECT id, url FROM photos WHERE answer_id = ${answer_id} ORDER BY id ASC`;
  return client.query(photosQuery)
    .then((res) => {
      // console.log('DB ALL PHOTOS', res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL PHOTOS', err);
      throw err;
    })
};

let addQuestion = ({ product_id, body, name, email }) => {
  if (typeof product_id !== 'number' || typeof body !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    throw 'BODY NEEDS TO BE IN CORRECT FORMAT';
  }

  let addQuestionQuery = `INSERT INTO questions (product_id, question_body, asker_name, asker_email) VALUES($1, $2, $3, $4) RETURNING *`;
  let values = [product_id, body, name, email];

  return client.query(addQuestionQuery, values)
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

  return client.query(addAnswerQuery, values)
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

  return client.query(addPhotoQuery, values)
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

  return client.query(updateQHelpfulnessQuery, values)
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

  return client.query(reportQuestionQuery, values)
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

  return client.query(updateAnswerHelpfulnessQuery, values)
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

  return client.query(reportAnswerQuery, values)
    .then((reportedA) => {
      // console.log('DB REPORTED ANSWER SUCCESSFULLY', reportedA.rows);
      return reportedA.rows[0];
    })
    .catch((err) => {
      console.log('DB ERROR REPORTING ANSWER', err);
      throw err;
    });
}

module.exports.client = client;
module.exports.getQuestions = getQuestions;
module.exports.getAnswers = getAnswers;
module.exports.addQuestion = addQuestion;
module.exports.addAnswer = addAnswer;
module.exports.addPhoto = addPhoto;
module.exports.updateQuestionHelpfulness = updateQuestionHelpfulness;
module.exports.reportQuestion = reportQuestion;
module.exports.updateAnswerHelpfulness = updateAnswerHelpfulness;
module.exports.reportAnswer = reportAnswer;

//JOIN answers and photos table using a left join.
// client.query(`SELECT answers.answer_id, answers.question_id, answers.body, answers.answerer_name, answers.answerer_email, answers.helpfulness, photos.id, photos.answer_id, photos.url FROM answers LEFT JOIN photos ON answers.answer_id = photos.answer_id OFFSET 0 LIMIT 5`)
//   .then((res) => {
//     console.log('DB ALL PHOTOS', res.rows);
//     // return res.rows;
//   })
//   .catch((err) => {
//     console.log('DB ERROR GETTING ALL PHOTOS', err);
//   })