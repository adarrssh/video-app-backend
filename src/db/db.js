// const { MongoClient } = require("mongodb");

// const url = 'mongodb+srv://adarsh:BJtJTeNJSb7KvzmU@cluster0.hi5p8dt.mongodb.net/?retryWrites=true&w=majority/binge-club-database';
// const mongoClient = new MongoClient(url);

// const connectDB = async () => {
//   try {
//     await mongoClient.connect();
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//   }
// };

// module.exports = {
//   connectDB,
//   getClient: () => mongoClient,
// };

const mongoose = require('mongoose')

const connectDB = () => {
  mongoose.connect('mongodb+srv://adarsh:BJtJTeNJSb7KvzmU@cluster0.hi5p8dt.mongodb.net/binge-club?retryWrites=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
}

module.exports = {connectDB}