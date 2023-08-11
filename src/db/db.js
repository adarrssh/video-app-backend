const { MongoClient } = require("mongodb");

const url = 'mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/binge-club';
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

