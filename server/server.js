require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require("aws-sdk");0
const db = require('../pg/index.js');

const app = express();
app.use(bodyParser.json({limit: '100mb'}));
app.use(cors());

//ROUTES
app.get(`/${process.env.LOADER_IO_KEY}.txt`, (req, res) => {
  res.send(process.env.LOADER_IO_KEY)
});

//GET ALL QUESTIONS
app.get(`/qa/questions`, (req, res) => {
  // console.log(req.query)
  let { product_id, page, count } = req.query;
  if (Number(page) <= 0) {
    throw 'Page should be greater than 0';
  }

  page = Number(page) || 1;
  if (count === undefined) {
    count = 5
  } else {
    count = Number(count);
  }

  let offset = (page - 1) * count;

  return db.getQuestions(product_id, offset, count)
    .then((questions) => {
      // console.log('SERVER ALL QUESTIONS', questions);
      let requiredQuestions = Object.values(questions);
      let result = {
        product_id,
        results: requiredQuestions
      };
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log('SERVER ERROR GETTING ALL QUESTIONS', err)
      res.status(500).send(err);
    });
});

//------
//GET ALL ANSWERS

app.get(`/qa/questions/:question_id/answers`, (req, res) => {
  // console.log('req params', req.params);
  let question_id = req.params.question_id;
  let { page, count } = req.query;
  if (Number(page) <= 0) {
    throw 'Page should be greater than 0';
  }

  page = Number(page) || 1;
  if (count === undefined) {
    count = 5
  } else {
    count = Number(count);
  }

  let offset = (page - 1) * count;

  return db.getAnswers(question_id, offset, count)
    .then((answers) => {
      // console.log('SERVER ALL ANSWERS', answers);
      let requiredAnswers = Object.values(answers);
      let result = {
        question: question_id,
        page,
        count,
        results: requiredAnswers
      }
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log('SERVER ERROR GETTING ALL ANSWERS', err)
      res.status(500).send(err);
    });
});

//------
//ADD A QUESTION

app.post(`/qa/questions`, (req, res) => {
  // console.log('req body', req.body);

  return db.addQuestion(req.body)
    .then((savedQ) => {
      // console.log('SERVER: ADDED Q', savedQ);
      res.status(201).send('Created');
    })
    .catch((err) => {
      console.log('SERVER ERROR POSTING QUESTION', err);
      res.status(500).send(err);
    });
});

//------
//ADD AN ANSWER

app.post(`/qa/questions/:question_id/answers`, (req, res) => {
  // console.log('req params', req.params, 'req body', req.body);
  let question_id = Number(req.params.question_id);
  let { body, name, email, photos } = req.body;
  if (typeof body !== 'string' || typeof name !== 'string' || typeof email !== 'string' || !Array.isArray(photos)) {
    throw `BODY NEEDS TO BE IN THE CORRECT FORMAT`;
  }
  return db.addAnswer(question_id, body, name, email)
    .then((savedA) => {
      // console.log('SERVER: ADDED ANSWER', savedA);
      if (photos.length === 0) {
        return res.status(201).send('Created');
      }

      let promisesPhotos = photos.map((photo) => db.addPhoto(savedA.answer_id, photo));
      return Promise.all(promisesPhotos)
        .then((savedPhotos) => {
          // console.log('SERVER: ADDED PHOTOS', savedPhotos);
          res.status(201).send('Created');
        })
        .catch((err) => {
          console.log('SERVER ERROR POSTING PHOTOS', err);
          res.status(500).send(err);
        })
    })
    .catch((err) => {
      console.log('SERVER ERROR POSTING ANSWER', err);
      res.status(500).send(err);
    });
});

//------
//INCREASE QUESTION HELPFULNESS

app.put(`/qa/questions/:question_id/helpful`, (req, res) => {
  // console.log('req params', req.params);
  let question_id = Number(req.params.question_id);

  return db.updateQuestionHelpfulness(question_id)
    .then((updatedQ) => {
      console.log('SERVER UPDATED Q HELPFULNESS', updatedQ)
      res.sendStatus(204)
    })
    .catch((err) => {
      console.log('SERVER ERROR UPDATING Q HELPFULNESS', err);
      res.status(500).send(err);
    });
});

//------
//REPORT QUESTION

app.put(`/qa/questions/:question_id/report`, (req, res) => {
  let question_id = Number(req.params.question_id);

  return db.reportQuestion(question_id)
    .then((reportedQ) => {
      console.log('SERVER REPORTED Q SUCCESSFULLY', reportedQ)
      res.sendStatus(204)
    })
    .catch((err) => {
      console.log('SERVER ERROR REPORTING Q', err);
      res.status(500).send(err);
    });
})

//INCREASE ANSWER HELPFULNESS

app.put(`/qa/answers/:answer_id/helpful`, (req, res) => {
  // console.log('req params', req.params);
  let answer_id = Number(req.params.answer_id);

  return db.updateAnswerHelpfulness(answer_id)
    .then((updatedA) => {
      console.log('SERVER UPDATED ANSWER HELPFULNESS', updatedA)
      res.sendStatus(204)
    })
    .catch((err) => {
      console.log('SERVER ERROR UPDATING ANSWER HELPFULNESS', err);
      res.status(500).send(err);
    });
});

//REPORT AN ANSWER

app.put(`/qa/answers/:answer_id/report`, (req, res) => {
  let answer_id = Number(req.params.answer_id);

  return db.reportAnswer(answer_id)
    .then((reportedAnswer) => {
      console.log('SERVER REPORTED ANSWER SUCCESSFULLY', reportedAnswer)
      res.sendStatus(204)
    })
    .catch((err) => {
      console.log('SERVER ERROR REPORTING ANSWER', err);
      res.status(500).send(err);
    });
});

module.exports.app = app;