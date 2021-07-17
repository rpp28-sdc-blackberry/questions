const Promise = require('bluebird');
const mongoose = Promise.promisifyAll(require('mongoose'));

mongoose.connect('mongodb://localhost/test1', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.once('open', function() {
  console.log('MONGOOSE CONNECTED')
});

let photosSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  }
})

let answersSchema = new mongoose.Schema({
  answer_id: {
    type: Number,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  answerer_name: {
    type: String,
    required: true
  },
  answerer_email: {
    type: String,
    required: true
  },
  reported: {
    type: Number,
    default: false,
    required: true
  },
  helpfulness: {
    type: Number,
    default: 0,
    required: true
  },
  photos: [photosSchema]
});

let questionsSchema = new mongoose.Schema({
  question_id: {
    type: Number,
    required: true
  },
  product_id: {
    type: Number,
    required: true
  },
  question_body: {
    type: String,
    required: true
  },
  question_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  asker_name: {
    type: String,
    required: true
  },
  asker_email: {
    type: String,
    required: true
  },
  reported: {
    type: Boolean,
    required: true,
    default: false
  },
  question_helpfulness: {
    type: Number,
    required: true,
    default: 0
  },
  answers: [answersSchema]
});

let Question = mongoose.model('Question', questionsSchema);
let Answer = mongoose.model('Answer', answersSchema);
let Photo = mongoose.model('Photo', photosSchema);

let photoDoc = {
  id: 1,
  url: 'testurl'
}

let answerDoc = {
  answer_id: 1,
  body: 'answer1',
  answerer_name: 'answer1',
  answerer_email: 'answer1',
  photos: [photoDoc]
};

let qDoc = {
  question_id: 2,
  product_id: 2,
  question_body: 'TEST2 BODY',
  asker_name: 'TEST2 NAME',
  asker_email: 'TEST2 EMAIL',
  answers: [answerDoc]
}

let addQ = () => {
  return Question.create(qDoc)
    .then((savedQ) => {
      console.log('SAVED Q', savedQ)
    })
    .catch((err) => {
      console.log('ERROR SAVING Q', err)
    });
}

let updateQ = () => {
  return Question.updateOne({question_id: qDoc.question_id}, qDoc, {upsert: true, setDefaultsOnInsert: true})
    .then((updatedQ) => {
      console.log('UPDATED Q', updatedQ)
    })
    .catch((err) => {
      console.log('ERROR UPDATING Q', err)
    });
}

let findQ = () => {
  return Question.find()
    .then((foundQ) => {
      console.log('FOUND Qs', foundQ[0].answers[0])
    })
    .catch((err) => {
      console.log('ERROR FINDING Qs', err)
    });
}

// addQ();
updateQ();
findQ()