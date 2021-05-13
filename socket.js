const e = require('express');

const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:8080',
  },
});

const users = {};
const rooms = [];


// Sockets

io.on('connection', (socket) => {
  //socket.join('some room')
  console.log('a user connected');
  //socket.send(socket.id)
  console.log(socket.id);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

let num = 0
io.on('connection', (socket) => {
  let roomName;
  // Ny bruger i chat
  socket.on('new-user', (name) => {
    users[socket.id] = name;
    if (rooms.includes('room-' + name) === false) {
      roomName = 'room-' + name
      rooms.push(roomName);
      socket.join(roomName);
      console.log("you have joined room " + roomName)
    } else if (rooms.includes('room-' + name) === true) {
      roomName = 'room-' + name + '-' + num
      rooms.push(roomName)
      socket.join(roomName)
      console.log("you have joined room" + roomName)
      num++
    }
    io.sockets.in(roomName).emit('user-connected', name);
    //socket.broadcast.emit('user-connected', name)
  });




  // admin, bot, ai
  socket.emit('rooms', rooms)

  socket.on('room-chosen', (roomId) => {
    console.log(roomId)
    roomName = roomId
    socket.join(roomName);
    console.log(roomName)
  })

  // chat besked 
  socket.on('chat message', (msg) => {
    console.log('message: ', msg, ' room: ', roomName, ' active rooms: ', rooms);
    //socket.broadcast.emit('chat message', { msg: msg, name: users[socket.id] });
    io.sockets
      .in(roomName)
      .emit('chat message', { msg: msg, name: 'admin' });
  });

  socket.on('disconnect', () => {
    console.log(roomName)
    socket.leave(roomName)
    const index = rooms.indexOf(roomName)
    if (index > -1 && users[socket.id] != undefined) {
      console.log(index)
      rooms.splice(index, 1)
    }
    console.log(rooms)

  });

});


const PORT = process.env.PORT || 3000;

server.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }
  console.log('Server is running on port', Number(PORT));
});

// module.exports = {
//   server,
// };
