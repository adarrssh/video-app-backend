const { MongoClient } = require("mongodb");

const url = 'mongodb+srv://adarsh:BJtJTeNJSb7KvzmU@cluster0.hi5p8dt.mongodb.net/?retryWrites=true&w=majority/binge-club-database';
const mongoClient = new MongoClient(url);

const connectDB = async () => {
  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = {
  connectDB,
  getClient: () => mongoClient,
};

