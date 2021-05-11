const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:8080',
  },
});


const users = {}

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

io.on('connection', (socket) => {
  socket.on('new-user', name => {
    socket.join('room-' + name)
    users[socket.id] = name
    io.sockets.in('room-' + name).emit('user-connected', name)
    //socket.broadcast.emit('user-connected', name)

  });

  socket.on('chat message', msg => {
    console.log('message: ', msg);
    socket.broadcast.emit('chat message', { msg: msg, name: users[socket.id] });
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
