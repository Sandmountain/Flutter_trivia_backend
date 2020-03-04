var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);

let rooms = [];

io.on("connection", socket => {
  console.log(socket.id, "joined");
  //socket.send("connected", socket.id);
  //socket.emit("room_error", "Connected to the game server");
  io.sockets.emit("/rooms_updated", rooms);

  socket.on("/test", msg => {
    console.log(msg);
    //socket.broadcast.emit("receive_message", "hello");
  });
  socket.on("/message", msg => {
    console.log(msg);
    socket.broadcast.emit("send_message", msg);
  });

  socket.on("/create_room", roomName => {
    //Check if room exist
    if (!rooms.some(e => e.name === roomName)) {
      rooms.push({ name: roomName });
      io.sockets.emit("/rooms_updated", rooms);
    } else if (roomName == "") {
      socket.emit("/room_error", "Please enter a name");
    } else {
      socket.emit("/room_error", roomName + " already exists");
    }
  });

  socket.on("/delete_room", roomName => {
    //TODO: Check if someone is in the room, then don't delete
    //Check if room exist

    if (rooms.some(e => e.name === roomName)) {
      rooms = rooms.filter(function(obj) {
        return obj.name !== roomName;
      });
      socket.emit("/room_error", roomName + " deleted");
      io.sockets.emit("/rooms_updated", rooms);
    } else {
      socket.emit("/room_error", roomName + " doens't exists");
    }
  });

  socket.on("/join_room", roomName => {
    socket.join(roomName, () => {
      io.in(roomName).clients((err, clients) => {
        io.in(roomName).emit("/joined_users", clients);
        //io.to(`${socket.id}`).emit("/joined_users", clients);
      });
    });

    io.to(roomName).emit("/on_join", "You joined " + roomName);
  });

  socket.on("/leave_room", roomName => {
    console.log(socket.id + " left " + roomName);
    socket.leave(roomName);
    io.in(roomName).clients((err, client) => {
      console.log(client);
    });
    io.to(roomName).emit("/on_leave", socket.id + " has left");
  });
});

//https://socket.io/docs/emit-cheatsheet/

var port = 8080;
console.log(port);
server.listen(port);
