const express = require('express');
const cors = require('cors');
const socket = require('socket.io')
const port = process.env.PORT || 4000;
const url = 'mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/video-app';
const app = express();

app.use(cors());

let server = app.listen(4000, ()=>{
  console.log('server running');
})

let io = socket(server,{
  cors:{
    // origin: 'https://stream-your-video.netlify.app'
    origin :'http://localhost:3000'
  }
})

  // // WebSocket connection
  io.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);

    socket.on('videoForward', (data) => {
      console.log('forward video ' + data);
      // Broadcast 'videoPlayed' event to all connected clients except the sender
      socket.broadcast.emit('videoForward',data);
    });
    
    socket.on('disconnect', (socket) => {
      console.log('A user disconnected');
    });
  });

app.get('/', async (req,res)=>{
  res.status(200).send('home route')
})

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });



  

  
  