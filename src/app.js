const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const authRoutes = require('./routes/auth');
const streamRoutes = require('./routes/profile');
const decodeJwt = require('./middleware/decodeJwt')

app.use(cors());
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON bodies


app.use('/auth', authRoutes);
app.use('/user', decodeJwt ,streamRoutes);


module.exports = app;
