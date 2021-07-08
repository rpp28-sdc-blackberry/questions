require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require("aws-sdk");

const app = express();
app.use(bodyParser.json({limit: '100mb'}));
app.use(cors());

const port = 3000;
app.listen(port, () => {
  console.log('ENV', process.env.NODE_ENV);
  console.log(`Listening on port http://localhost:${port}`);
});