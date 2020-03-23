var express = require("express");
var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);

let rooms = [];
let users = [];

const { CREATE_ROOM, DELETE_ROOM, JOIN_ROOM } = require("./src/rooms.js");
const { GET_CLIENTS, LEAVE_ROOM, CLIENT_READY } = require("./src/clients.js");

io.on("connection", socket => {
  console.log(socket.id, "joined");

  //Refresh the clients when the server restarts (Could be removed when deployed)
  io.sockets.emit("/rooms_updated", rooms);

  socket.on("/create_room", (roomName, password) => {
    CREATE_ROOM(roomName, rooms, io, socket, password);
  });

  socket.on("/delete_room", roomName => {
    DELETE_ROOM(roomName, rooms, io, socket);
  });

  socket.on("/join_room", (roomName, username) => {
    JOIN_ROOM(roomName, io, socket, username);
  });

  socket.on("/get_clients", roomName => {
    GET_CLIENTS(roomName, io);
  });
  socket.on("/leave_room", roomName => {
    LEAVE_ROOM(roomName, io, socket);
  });
  socket.on("/client_ready", (socketID, roomName) => {
    CLIENT_READY(roomName, io, socket);
  });
});

//https://socket.io/docs/emit-cheatsheet/

var port = 8080;
console.log(port);
server.listen(port);
