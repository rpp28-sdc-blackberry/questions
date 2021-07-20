const { Client } = require('pg');
const client = new Client({
  database: 'qna',
});

client.connect()
  .then(() => console.log('CONNECTED TO PG'))
  .catch((err) => console.log('ERROR CONNECTING TO PG', err))

let getQuestions = (product_id, offset, limit) => {
  let questionsQuery = `SELECT * FROM questions WHERE product_id = ${product_id} ORDER BY question_id ASC OFFSET ${offset} LIMIT ${limit}`;
  return client.query(questionsQuery)
    .then((res) => {
      // console.log('DB ALL QUESTIONS', res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL QUESTIONS', err);
    })
}

let getAnswers = (question_id, offset, limit) => {
  let answersQuery = `SELECT * FROM answers WHERE question_id = ${question_id} ORDER BY answer_id ASC OFFSET ${offset} LIMIT ${limit}`;
  return client.query(answersQuery)
    .then((res) => {
      // console.log('DB ALL ANSWERS', res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL ANSWERS', err);
    })
}

module.exports.getQuestions = getQuestions;
module.exports.getAnswers = getAnswers;