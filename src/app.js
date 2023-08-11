const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

app.get('/', async (req, res) => {
  res.status(200).send('home route');
});

module.exports = app;
