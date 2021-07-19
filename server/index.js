require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require("aws-sdk");
const db = require('../pg/index.js');

const app = express();
app.use(bodyParser.json({limit: '100mb'}));
app.use(cors());

app.get(`/qa/questions`, (req, res) => {
  let { product_id, page, count } = req.query;
  if (page === undefined) {
    page = 0;
  }
  if (count === undefined) {
    count = 5;
  }

  let offset = (page - 1) * count;

  return db.getQuestions(product_id, offset, count)
    .then((q) => {
      console.log('Q', q);
    })
    .catch((err) => {
      console.log('ERROR IN SERVER GETTING ALL Q', err)
    });
});

const port = 3000;
app.listen(port, () => {
  console.log('ENV', process.env.NODE_ENV);
  console.log(`Listening on port http://localhost:${port}`);
});