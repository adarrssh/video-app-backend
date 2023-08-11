// db.js
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb+srv://adarsh:BJtJTeNJSb7KvzmU@cluster0.hi5p8dt.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB server URL

// Database Name
const dbName = 'binge-club'; // Replace with your database name

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Export a function that connects to the database and returns the database instance
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        return db;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

module.exports = { connectToDatabase };
