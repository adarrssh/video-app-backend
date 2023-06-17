const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors')
const multer = require('multer')
const Grid = require('gridfs-stream');
const mongoose = require('mongoose')
const { MongoClient,ObjectId } = require('mongodb')
const { GridFSBucket } = require('mongodb')
// mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/video-app

const url = 'mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/video-app';

// Create a new MongoClient
const client = new MongoClient(url);

// Set up multer for handling multipart/form-data (file upload)
const upload = multer();

const app = express();

app.use(cors())

mongoose.connect('mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/video-app', { useNewUrlParser: true });

// Define a route for video upload
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('Connected to MongoDB Atlas cluster');

    // Access the database
    const db = client.db();

    // Create a new GridFSBucket instance
    const bucket = new GridFSBucket(db);

    // Open the uploaded video file from the request
    const videoStream = req.file.buffer;

    // Store the video in GridFS with metadata
    const uploadStream = bucket.openUploadStream('panchayat.mp4', {
      metadata: { fileSize: req.file.buffer.length },
    });
    uploadStream.end(videoStream);

    uploadStream.on('finish', () => {
      console.log('Video stored in GridFS');
      client.close();
      res.send('Video uploaded successfully');
    });

    uploadStream.on('error', (error) => {
      console.error('Error storing video in GridFS:', error);
      client.close();
      res.status(500).send('Error storing video');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas cluster:', error);
    res.status(500).send('Error connecting to MongoDB Atlas');
  }
});




// add after app.get('/video/:id/data', ...) route
// app.get('/videos', (req, res) => res.json(videos));


app.get('/video/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;

    // Connect to MongoDB Atlas
    await client.connect();

    // Access the database and GridFS bucket
    const database = client.db();
    const bucket = new GridFSBucket(database);

    // Find the video file in GridFS
    const videoStream = bucket.openDownloadStream(new ObjectId(videoId));
    // Set the response headers for video streaming
    const {contentType,length} = await getVideoMetadata(videoStream);
    console.log(response);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', length);
    res.setHeader('Accept-Ranges', 'bytes');

    // Check if range headers are present
    const range = req.headers.Range;
    if (range) {
      const positions = range.replace(/bytes=/, '').split('-');
      const start = parseInt(positions[0], 10);
      const end = positions[1] ? parseInt(positions[1], 10) : length - 1;
      const chunkSize = end - start + 1;

      res.setHeader('Content-Range', `bytes ${start}-${end}/${length}`);
      res.setHeader('Content-Length', chunkSize);
      res.statusCode = 206;

      // Set the stream positions and pipe the video stream in chunks
      videoStream.start = start;
      videoStream.end = end;
      videoStream.pipe(res);
    } else {
      // If range headers are not present, stream the entire video
      res.statusCode = 200;
      videoStream.pipe(res);
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).send('Internal Server Error');
  }
});


const getVideoMetadata = async (stream) => {
  return new Promise((resolve, reject) => {
    stream.on('metadata', (metadata) => {
      const { contentType, length } = metadata;
      resolve({ contentType, length });
    });

    stream.on('error', (err) => {
      reject(err);
    });

    // If the 'end' event is not triggered within a certain time,
    // reject the promise with a timeout error
    const timeout = setTimeout(() => {
      reject(new Error('Timeout while fetching video metadata'));
    }, 5000); // Adjust the timeout value as needed

    // Remove the timeout listener once the 'metadata' or 'error' event is triggered
    stream.on('metadata', () => {
      clearTimeout(timeout);
    });
    stream.on('error', () => {
      clearTimeout(timeout);
    });
  });
};

app.listen(4000, () => {
    console.log('Listening on port 4000!')
});