const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth')
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 4000;
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://adarsh:BJtJTeNJSb7KvzmU@cluster0.hi5p8dt.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use(cors());
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON bodies

app.use('/auth',authRoutes)

app.get('/', async (req, res) => {
  res.status(200).send('home route');
});

module.exports = app;
