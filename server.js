const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3001
const app = express();
const cors = require("cors");

require('dotenv').config({ path: '../../.env' });

const server = http.createServer(app);
const io = socketio(server);
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const router = require("./router");

app.use(bodyParser.json());


app.use(cors());
app.use(router);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require('./routes/tweets.js')(app, io);

server.listen(port, () => {
    console.log('server is up', port);
});

// app.use(express.static('public'))

io.on("connect", socket => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`
    });
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// server.listen(process.env.PORT || 3001, () =>
//   console.log(`Server has started.`)
// );  