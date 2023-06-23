const express = require('express');
const cors = require('cors');
const multer = require('multer');
const http = require('http')
const { MongoClient, ObjectId } = require('mongodb');
const { GridFSBucket } = require('mongodb');
const PORT = process.env.PORT || 4000;
const url = 'mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/video-app';
const app = express();
const socket = require('socket.io')

let server = app.listen(4000, ()=>{
  console.log('server running');
})

let io = socket(server,{
  cors:{
    origin: 'https://master--stream-your-video.netlify.app'
  }
})

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`A user connected ${socket.id}`);
  socket.on('sync', (data) => {
    console.log('Sync event', data);
    socket.broadcast.emit('sync', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


// Create a new MongoClient
const client = new MongoClient(url);

// Set up multer for handling multipart/form-data (file upload)
const upload = multer();

app.use(cors());

// Connect to MongoDB Atlas
async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas cluster');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas cluster:', error);
    process.exit(1);
  }
}

// Upload video endpoint
app.post('/upload', upload.single('video'), async (req, res) => {
  await connectToDatabase();

  try {
    const db = client.db();
    const bucket = new GridFSBucket(db);

    const videoStream = req.file.buffer;

    const uploadStream = bucket.openUploadStream('panchayat.mp4', {
      metadata: {
        fileSize: req.file.buffer.length,
        contentType: req.file.mimetype,
      },
    });

    uploadStream.end(videoStream);

    uploadStream.on('finish', () => {
      console.log('Video stored in GridFS');
      res.send('Video uploaded successfully');
    });

    uploadStream.on('error', (error) => {
      console.error('Error storing video in GridFS:', error);
      res.status(500).send('Error storing video');
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).send('Error uploading video');
  }
});

// Stream video endpoint
app.get('/video/:videoId', async (req, res) => {
  await connectToDatabase();

  try {
    const videoId = req.params.videoId;

    const db = client.db();
    const bucket = new GridFSBucket(db);

    const videoFile = await bucket.find({ _id: new ObjectId(videoId) }).toArray();

    if (!videoFile || videoFile.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const file = videoFile[0];

    res.setHeader('Content-Type', file.metadata.contentType);
    res.setHeader('Content-Length', file.metadata.fileSize);
    res.setHeader('Accept-Ranges', 'bytes');

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

      const videoStream = bucket.openDownloadStream(new ObjectId(videoId), { start, end });
      videoStream.pipe(res);
    } else {
      res.statusCode = 200;
      const videoStream = bucket.openDownloadStream(new ObjectId(videoId));
      videoStream.pipe(res);
    }
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).send('Internal Server Error');
  }
});

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
