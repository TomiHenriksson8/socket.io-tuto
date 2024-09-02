const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  let userRoom = '';

  socket.on('join room', (room) => {
    if (userRoom) {
      socket.leave(userRoom);
    }
    userRoom = room;
    socket.join(room);

    socket.to(room).emit('chat message', { user: 'System', message: `${socket.id} has joined room: ${room}` });
  });

  socket.on('chat message', (data) => {
    io.to(data.room).emit('chat message', { user: data.user, message: data.message });
  });


  socket.on('typing', (data) => {
    socket.to(data.room).emit('typing', { user: data.user });
  });


  socket.on('stop typing', (data) => {
    socket.to(data.room).emit('stop typing', { user: data.user });
  });

  socket.on('leave room', (room) => {
    socket.leave(room);
    socket.to(room).emit('chat message', { user: 'System', message: `${socket.id} has left the room` });
  });

  socket.on('disconnect', () => {
    if (userRoom) {
      socket.to(userRoom).emit('chat message', { user: 'System', message: `${socket.id} has left the room` });
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
