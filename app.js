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
      metadata: {    
        fileSize: req.file.buffer.length,
        contentType: req.file.mimetype, },
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


app.get('/video/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;

    // Connect to MongoDB Atlas
    await client.connect();

    // Access the database and GridFS bucket
    const database = client.db();
    const bucket = new GridFSBucket(database);

    // Find the video file in GridFS
    const videoFile = await bucket.find({ _id: new ObjectId(videoId) }).toArray();
    if (!videoFile || videoFile.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const file = videoFile[0];
    console.log(file);

    // Set the response headers for video streaming
    res.setHeader('Content-Type', file?.metadata?.contentType);
    res.setHeader('Content-Length', file?.metadata?.fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
    console.log('headers');
    // Check if range headers are present
    const range = req.headers.range;
    console.log(range);
    if (range) {
      const positions = range.replace(/bytes=/, '').split('-');
      const start = parseInt(positions[0], 10);
      const end = positions[1] ? parseInt(positions[1], 10) : file.length - 1;
      const chunkSize = end - start + 1;

      res.setHeader('Content-Range', `bytes ${start}-${end}/${file.length}`);
      res.setHeader('Content-Length', chunkSize);
      res.statusCode = 206;

      // Create a read stream with the range of bytes
      const videoStream = bucket.openDownloadStream(new ObjectId(videoId), { start, end });

      // Pipe the video stream in chunks
      videoStream.pipe(res);
    } else {
      // If range headers are not present, stream the entire video
      res.statusCode = 200;

      // Create a read stream for the entire video file
      const videoStream = bucket.openDownloadStream(new ObjectId(videoId));

      // Pipe the video stream
      videoStream.pipe(res);
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(4000, () => {
    console.log('Listening on port 4000!')
});