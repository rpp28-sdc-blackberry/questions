require('newrelic');
const app = require('./server.js').app;

const port = 3000;
app.listen(port, () => {
  console.log('ENV', process.env.NODE_ENV);
  console.log(`Listening on port http://localhost:${port}`);
});