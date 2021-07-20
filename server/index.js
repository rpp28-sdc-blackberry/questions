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

//ROUTES
//GET ALL QUESTIONS
app.get(`/qa/questions`, (req, res) => {
  // console.log(req.query)
  let { product_id, page, count } = req.query;
  page = Number(page) || 1;
  if (count === undefined) {
    count = 5
  } else {
    count = Number(count);
  }

  let offset = (page - 1) * count;

  return db.getQuestions(product_id, offset, count)
    .then((questions) => {
      console.log('SERVER ALL QUESTIONS', questions);
    })
    .catch((err) => {
      console.log('ERROR IN SERVER GETTING ALL QUESTIONS', err)
    });
});

//------
//GET ALL ANSWERS

app.get(`/qa/questions/:question_id/answers`, (req, res) => {
  // console.log('req params', req.params);
  let question_id = req.params.question_id;
  let { page, count } = req.query;
  page = Number(page) || 1;
  if (count === undefined) {
    count = 5
  } else {
    count = Number(count);
  }

  let offset = (page - 1) * count;

  return db.getAnswers(question_id, offset, count)
    .then((answers) => {
      console.log('SERVER ALL ANSWERS', answers);
    })
    .catch((err) => {
      console.log('ERROR IN SERVER GETTING ALL ANSWERS', err)
    });
});

const port = 3000;
app.listen(port, () => {
  console.log('ENV', process.env.NODE_ENV);
  console.log(`Listening on port http://localhost:${port}`);
});