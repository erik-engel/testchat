const e = require("express");
require("dotenv").config();
const WitService = require("./services/witservice");
myWitService = new WitService(process.env.WITAITOKEN);
const server = require("http").createServer();
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
  },
});

const users = {};
const rooms = [];
let botActive = true;

// Sockets

io.on("connection", (socket) => {
  //socket.join('some room')
  console.log("a user connected");
  //socket.send(socket.id)
  console.log(socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

let num = 0;
io.on("connection", (socket) => {
  let roomName;
  // Ny bruger i chat
  socket.on("new-user", (name) => {
    users[socket.id] = name;
    // if (rooms.includes('room-' + name) === false) {
    if (rooms.includes(name) === false) {
      roomName = name;
      rooms.push(roomName);
      socket.join(roomName);
      console.log("you have joined room " + roomName);
    } else if (rooms.includes(name) === true) {
      roomName = name + "-" + num;
      rooms.push(roomName);
      socket.join(roomName);
      console.log("you have joined room" + roomName);
      num++;
    }
    //io.in(roomName).emit('user-connected', name);
    io.emit("room", roomName);
    socket.broadcast.to(roomName).emit("user-connected", name);
    //socket.broadcast.emit('user-connected', name)
  });

  // admin, bot, ai
  socket.emit("rooms", rooms);

  socket.on("room-chosen", (oldId, roomId) => {
    console.log(oldId);
    socket.leave(oldId);
    console.log(roomId);
    roomName = roomId;
    socket.join(roomName);
    //console.log(roomName)
  });

  // chat besked client -> admin
  socket.on("chat message", (msg) => {
    console.log(
      "message: ",
      msg,
      " room: ",
      roomName,
      " active rooms: ",
      rooms
    );
    if (botActive) {
      console.log("bot active");
      console.log(msg);
      myWitService
        .query(msg)
        .then((res) =>
          io.sockets.emit("chat-message", { msg: res, name: "NerdBot" })
        );
    } else {
      socket.broadcast.emit("chat message", {
        msg: msg,
        name: users[socket.id],
      });
      // io.sockets
      //   .in(roomName)
      //   .emit('chat-message', { msg: msg, name: 'admin' });
    }
  });

  // chat besked admin -> client
  socket.on("chat-message", (msg) => {
    console.log(
      "message: ",
      msg,
      " room: ",
      roomName,
      " active rooms: ",
      rooms
    );
    //socket.broadcast.emit('chat message', { msg: msg, name: users[socket.id] });
    io.sockets.in(roomName).emit("chat-message", { msg: msg, name: "admin" });
  });

  socket.on("disconnect", () => {
    console.log(roomName);
    socket.leave(roomName);
    const index = rooms.indexOf(roomName);
    if (index > -1 && users[socket.id] != undefined) {
      console.log(index);
      rooms.splice(index, 1);
    }
    console.log(rooms);

    io.emit("room disconnect", roomName);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }
  console.log("Server is running on port", Number(PORT));
});

// module.exports = {
//   server,
// };
