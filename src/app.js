const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const authRoutes = require('./routes/auth');
const streamRoutes = require('./routes/profile');
const decodeJwt = require('./middleware/decodeJwt')
const {connectDB} = require('./db/db')
connectDB()
// const mongoose = require('mongoose')
// mongoose.connect('mongodb+srv://adarsh:BJtJTeNJSb7KvzmU@cluster0.hi5p8dt.mongodb.net/binge-club?retryWrites=true', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//     console.log('Connected to MongoDB');
// });

app.use(cors());
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON bodies


app.use('/auth', authRoutes);
app.use('/user', decodeJwt ,streamRoutes);


module.exports = app;
