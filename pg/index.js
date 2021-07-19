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
      // console.log('RESPONSE', res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log('ERROR GETTING RESPONSE', err);
    })
}

  module.exports.getQuestions = getQuestions;
