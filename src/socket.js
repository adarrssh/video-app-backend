const socket = require('socket.io');
const { generateRoomId } = require('./utils');
const {domain} = require('../config/var')
const configureSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: domain
    }
  });

  const rooms = {};
  io.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);

    socket.on('createRoom', (userData) => {
      console.log(userData);
      const roomId = generateRoomId();
      console.log('room id ', roomId);
      socket.join(roomId);
      rooms[roomId] = {
        users: [userData]
      };
      console.log('insde createroom ....... ',rooms);
      console.log('userData ....... ',userData);

      socket.emit('roomCreated', {roomId,users:rooms[roomId].users});
    });

    socket.on('joinRoom', (data) => {
      const {roomId,userData} = data
      if (rooms[roomId]) {
        socket.join(roomId);
        rooms[roomId].users.push(userData);
        io.to(roomId).emit('userJoined', {users:rooms[roomId].users});
        console.log('user joined in ', roomId);
      } else {
        socket.emit('invalidRoomId');
      }
      console.log('insde joinroom ....... ',rooms[roomId].users);
      console.log('userData ....... ',userData);

    });

    // socket.on('videoForward', (data) => {
    //   console.log('forward video ' + data);
    //   socket.broadcast.emit('videoForward', data);
    // });

    socket.on('videoTimeChanged', (data) => {
      console.log('videoTimeChanged ' + data);
      socket.broadcast.emit('videoTimeChanged', data);
    });

    socket.on('videoPaused', (roomId) => {
      console.log('A user paused the video');
      socket.broadcast.to(roomId).emit('pauseVideo');
    });

    socket.on('videoResumed', () => {
      console.log('A user resumed the video');
      socket.broadcast.emit('playVideo');
    });

    socket.on('play', (roomId) => {
      console.log('video played');
      socket.broadcast.to(roomId).emit('playBroadcast');
    });

    socket.on('pause', () => {
      console.log('video paused');
      socket.broadcast.emit('pauseBroadcast');
    });
    
    socket.on('timeChanged', (obj) => {
      console.log(obj);
      const { roomId, time } = obj;
      console.log('video time', time);
      socket.broadcast.to(roomId).emit('broadcastTime', time);
    });


    socket.on('send-message', (obj)=>{
      const {roomId,message} = obj
      console.log('message ',message);
      socket.broadcast.to(roomId).emit('messageBroadcast',message)
    })

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
};

module.exports = configureSocket;
