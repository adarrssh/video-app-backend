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

    socket.on('createRoom', () => {
      const roomId = generateRoomId();
      console.log('room id ', roomId);
      socket.join(roomId);
      rooms[roomId] = {
        users: [socket.id],
      };
      socket.emit('roomCreated', roomId);
    });

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
      socket.broadcast.emit('videoForward', data);
    });

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

    socket.on('timeChanged', (obj) => {
      console.log(obj);
      const { roomId, time } = obj;
      console.log('video time', time);
      socket.broadcast.to(roomId).emit('broadcastTime', time);
    });

    socket.on('pause', () => {
      console.log('video paused');
      socket.broadcast.emit('pauseBroadcast');
    });

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
