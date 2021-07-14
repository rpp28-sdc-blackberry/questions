const { Client } = require('pg');
const client = new Client({
  database: 'qna',
});

client.connect()
  .then(() => console.log('CONNECTED'))
  .catch((err) => console.log('ERROR CONNECTING TO PG', err))

let text = `SELECT * FROM questions offset 3518960`;
client.query(text)
  .then((res) => {
    console.log('RESPONSE', res.rows);
  })
  .catch((err) => {
    console.log('ERROR GETTING RESPONSE', err);
  })