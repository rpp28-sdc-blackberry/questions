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
  answer_id: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  }
})

let staging_answersSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  question_id: {
    type: Number,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  date_written: {
    type: Number,
    required: true
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
  helpful: {
    type: Number,
    default: 0,
    required: true
  }
});

let answersSchema = new mongoose.Schema({
  answer_id: {
    type: Number,
    required: true
  },
  question_id: {
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

let Staging_Answer = mongoose.model('Staging_Answer', staging_answersSchema)

// let photoDoc = {
//   id: 1,
//   url: 'testurl'
// }

// let answerDoc = {
//   answer_id: 1,
//   body: 'answer1',
//   answerer_name: 'answer1',
//   answerer_email: 'answer1',
//   photos: [photoDoc]
// };

// let qDoc = {
//   question_id: 2,
//   product_id: 2,
//   question_body: 'TEST2 BODY',
//   asker_name: 'TEST2 NAME',
//   asker_email: 'TEST2 EMAIL',
//   answers: [answerDoc]
// }

// let addQ = () => {
//   return Question.create(qDoc)
//     .then((savedQ) => {
//       console.log('SAVED Q', savedQ)
//     })
//     .catch((err) => {
//       console.log('ERROR SAVING Q', err)
//     });
// }

// let updateQ = () => {
//   return Question.updateOne({question_id: qDoc.question_id}, qDoc, {upsert: true, setDefaultsOnInsert: true})
//     .then((updatedQ) => {
//       console.log('UPDATED Q', updatedQ)
//     })
//     .catch((err) => {
//       console.log('ERROR UPDATING Q', err)
//     });
// }

let findQ = () => {
  return Answer.find({"photos.0": { "$exists": true }}).limit(100)
    .then((foundQ) => {
      console.log('FOUND Qs', foundQ[11])
    })
    .catch((err) => {
      console.log('ERROR FINDING Qs', err)
    });
}

// addQ();
// updateQ();
// findQ();
//Merge photos into answers

//ETL
//Convert date frm int to timestamp in answers_staging. This worked. I have answers collection with all the answers in the correct format without photos.
let convertDate = async () => {
  try {
    const cursor = Staging_Answer.find().cursor();

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      // console.log(doc); // Prints documents one at a time
        let answerDoc = {
          answer_id: doc.id,
          question_id: doc.question_id,
          body: doc.body,
          answerer_name: doc.answerer_name,
          answerer_email: doc.answerer_email,
          date: new Date(doc.date_written),
          helpfulness: doc.helpful,
          photos: []
        }
        let newDoc = await Answer.create(answerDoc);
        console.log('newDoc', newDoc);
    }
    console.log('convertDate done');
  } catch (error) {
    console.log('ERROR', error)
  }
}

// convertDate()

//Cursor id not found. Cursor times out. Or the process is very slow.
let addPhotos = async () => {
  // Answer.find().lean().cursor({batchSize:500}).addCursorFlag('noCursorTimeout', true)
  //   .on('data', async function (doc) {
  //     console.log('doc', doc);
  //     let photos = await Photo.aggregate([{ $match: { answer_id: doc.answer_id } }]);
  //     // console.log('photos', photos);
  //     Answer.updateOne({ answer_id: doc.answer_id }, [ { $set: { "photos": photos } } ]);
  //     // console.log('newDoc', newDoc);
  //   })
  //   .on('end', function () {
  //     console.log('DONE')
  //   })

  // for (let i = 1; i <= 6879306; i++) {
  //   let photos = await Photo.aggregate([{ $match: { answer_id: i } }]);
  //   if (photos.length === 0) {
  //     continue;
  //   }
  //   Answer.updateOne({ answer_id: i }, [ { $set: { "photos": photos } } ]);
  //   console.log('i after', i)
  // }


    // for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    //   // console.log(doc); // Prints documents one at a time
    //   let photos = await Photo.find({answer_id: doc.answer_id});
    //   // console.log('photos', photos);
    //   let newDoc = await Answer.updateOne({answer_id: doc.answer_id}, {photos});
    //   console.log('newDoc', newDoc);
    // }
    // console.log('added photos done');
    // cursor.close();

    Answer.aggregate([
      {
         $lookup:
            {
              from: "warehouses",
              let: { order_item: "$item", order_qty: "$ordered" },
              pipeline: [
                 { $match:
                    { $expr:
                       { $and:
                          [
                            { $eq: [ "$stock_item",  "$$order_item" ] },
                            { $gte: [ "$instock", "$$order_qty" ] }
                          ]
                       }
                    }
                 },
                 { $project: { stock_item: 0, _id: 0 } }
              ],
              as: "stockdata"
            }
       }
   ])
}

// addPhotos();