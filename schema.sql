CREATE TABLE questions_staging (
  question_id integer PRIMARY KEY,
  product_id integer,
  question_body text,
  question_date bigint,
  asker_name text,
  asker_email text,
  reported boolean,
  question_helpfulness integer
);

CREATE TABLE questions (
  question_id integer PRIMARY KEY,
  product_id integer,
  question_body text,
  question_date timestamp DEFAULT CURRENT_TIMESTAMP(0),
  asker_name text,
  asker_email text,
  reported boolean DEFAULT false,
  question_helpfulness integer DEFAULT 0
);

CREATE TABLE answers_staging (
  answer_id integer PRIMARY KEY,
  question_id integer,
  body text,
  date bigint,
  answerer_name text,
  answerer_email text,
  reported boolean,
  helpfulness integer
);

CREATE TABLE answers (
  answer_id integer PRIMARY KEY,
  question_id integer REFERENCES questions ON DELETE CASCADE,
  body text,
  date timestamp DEFAULT CURRENT_TIMESTAMP(0),
  answerer_name text,
  answerer_email text,
  reported boolean DEFAULT false,
  helpfulness integer DEFAULT 0
);

CREATE TABLE photos (
  id integer PRIMARY KEY,
  answer_id integer REFERENCES answers ON DELETE CASCADE,
  url text
);

-- QUESTIONS: Copy questions from csv file to questions_staging table. Then copy everything to actual questions table after changing date to timestamp value.
COPY questions_staging from '/Users/farhanali3193/Downloads/questions.csv' delimiter ',' csv header;

INSERT INTO questions (question_id, product_id, question_body, question_date, asker_name, asker_email, reported, question_helpfulness)
SELECT question_id, product_id, question_body, to_timestamp(question_date/1000), asker_name, asker_email, reported, question_helpfulness
FROM questions_staging;

-- Create a sequence and set its value to be the max value of question_id. Then update the question_id column to have a default val of nextval
CREATE SEQUENCE questions_seq START 1;
SELECT setval('questions_seq', max(question_id)) FROM questions;

ALTER TABLE questions ALTER COLUMN question_id SET DEFAULT nextval('questions_seq');

-- ANSWERS: Do the same as questions
COPY answers_staging from '/Users/farhanali3193/Downloads/answers.csv' delimiter ',' csv header;

INSERT INTO answers (answer_id, question_id, body, date, answerer_name, answerer_email, reported, helpfulness)
SELECT answer_id, question_id, body, to_timestamp(date/1000), answerer_name, answerer_email, reported, helpfulness
FROM answers_staging;

CREATE SEQUENCE answers_seq START 1;
SELECT setval('answers_seq', max(answer_id)) FROM answers;

ALTER TABLE answers ALTER COLUMN answer_id SET DEFAULT nextval('answers_seq');

-- PHOTOS
COPY photos from '/Users/farhanali3193/Downloads/answers_photos.csv' delimiter ',' csv header;

CREATE SEQUENCE photos_seq START 1;
SELECT setval('photos_seq', max(id)) FROM photos;

ALTER TABLE photos ALTER COLUMN id SET DEFAULT nextval('photos_seq');

-- DROP staging tables
DROP TABLE questions_staging;
DROP TABLE answers_staging;

--CREATE INDEXES
CREATE INDEX photos_answer_id ON photos(answer_id);
CREATE INDEX answers_question_id ON answers(question_id);
CREATE INDEX questions_product_id ON questions(product_id);