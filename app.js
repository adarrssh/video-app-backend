const express = require('express');
const cors = require('cors');
const socket = require('socket.io')
const port = process.env.PORT || 4000;
const url = 'mongodb+srv://adarsh:adarsh@cluster0.o0dnsga.mongodb.net/video-app';
const app = express();

app.use(cors());
const rooms = {};
let server = app.listen(4000, ()=>{
  console.log('server running');
})

let io = socket(server,{
  cors:{
    // origin: ['https://stream-your-video.netlify.app','https://stream-dev.netlify.app']
    origin :'http://localhost:3000'
  }
})

  // // WebSocket connection
  io.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);

  // Handle creating a room
  socket.on('createRoom', () => {
    const roomId = generateRoomId();
    console.log('room id ',roomId);
    socket.join(roomId);
    rooms[roomId] = {
      users: [socket.id],
    };
    socket.emit('roomCreated', roomId);
  });

   // Handle joining a room
   socket.on('joinRoom', (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].users.push(socket.id);
      io.to(roomId).emit('userJoined', socket.id);
      console.log('user join in ', roomId);
    } else {
      socket.emit('invalidRoomId');
    }
  });


    socket.on('videoForward', (data) => {
      console.log('forward video ' + data);
      // Broadcast 'videoPlayed' event to all connected clients except the sender
      socket.broadcast.emit('videoForward',data);
    });
    
    socket.on('videoTimeChanged',(data)=>{
      console.log('videoTimeChanged ' + data);

      socket.broadcast.emit('videoTimeChanged',data)
    })

    socket.on('videoPaused',(roomId)=>{
      console.log('A user paused the video');
      socket.broadcast.to(roomId).emit('pauseVideo')
    })

    socket.on('videoResumed',()=>{
      console.log('A user resumed the video');
      socket.broadcast.emit('playVideo')
    })

    socket.on('play',(roomId)=>{
      console.log('video played');
      socket.broadcast.to(roomId).emit('playBroadcast')
    })

    socket.on('timeChanged',(obj)=>{
      console.log(obj);
      const {roomId,time} = obj
      console.log('video time',time);
      socket.broadcast.to(roomId).emit('broadcastTime',time)
    })



    socket.on('pause',()=>{
      console.log('video paused');
      socket.broadcast.emit('pauseBroadcast')
    })


   // Handle disconnection
   socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const index = rooms[roomId].users.indexOf(socket.id);
      if (index !== -1) {
        console.log('a user disconnected');
        rooms[roomId].users.splice(index, 1);
        io.to(roomId).emit('userLeft', socket.id);
        if (rooms[roomId].users.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });

  });

  function generateRoomId() {
    // Generate a random 6-character alphanumeric room ID
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
      roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomId;
  }

app.get('/', async (req,res)=>{
  res.status(200).send('home route')
})

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });



  

  
  