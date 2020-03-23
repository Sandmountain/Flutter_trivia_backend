module.exports = {
  CREATE_ROOM: (roomName, rooms, io, socket, password) => {
    console.log(password);
    //Check if room name exist
    if (!rooms.some(e => e.name === roomName)) {
      rooms.push({ name: roomName, password: password });
      io.sockets.emit("/rooms_updated", rooms);
    }
    //Empty string for room name
    else if (roomName == "") {
      socket.emit("/room_error", "Please enter a name");
    }
    //Already Created
    else {
      socket.emit("/room_error", roomName + " already exists");
    }
  },
  DELETE_ROOM: (roomName, rooms, io, socket) => {
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
  },
  JOIN_ROOM: (roomName, io, socket, username) => {
    socket.username = username;
    socket.ready = false;

    socket.join(roomName, () => {
      io.in(roomName).clients((err, clients) => {
        let clientList = [];

        //get the socketID for the connected clients in the room
        const objKeys = Object.keys(io.sockets.adapter.rooms[roomName].sockets);
        objKeys.forEach((currentObject, index) => {
          clientList.push({
            username: io.sockets.connected[objKeys[index]].username,
            ready: io.sockets.connected[objKeys[index]].ready
          });
        });

        //send the userlist to the client
        io.in(roomName).emit("/update_users", clientList);
      });
    });
    //Not used atm
    io.to(roomName).emit("/on_join", "You joined " + roomName);
  }
};
