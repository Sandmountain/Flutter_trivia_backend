module.exports = {
  CLIENT_READY: (roomName, io, socket) => {
    socket.ready = !socket.ready;
    const clientList = getUserList(roomName, io);

    io.in(roomName).emit("/update_users", clientList);

    //check if everyone is ready
    //This can probably be written better
    let pplReady = 0;
    let runGame = false;

    clientList.forEach((client, index) => {
      if (client.ready) {
        pplReady++;
      } else {
        io.in(roomName).emit("/start_game", false);
        return 0;
      }
      if (pplReady === clientList.length) {
        io.in(roomName).emit("/start_game", true);
      }
    });
  },
  LEAVE_ROOM: (roomName, io, socket) => {
    socket.leave(roomName);
    io.in(roomName).clients((err, clients) => {
      socket.ready = false;

      //checks so that the client isn't updated if there are no one left in the room. (TODO: DELETE ROOM IF LAST)
      if (io.sockets.adapter.rooms[roomName]) {
        const clientList = getUserList(roomName, io);
        io.in(roomName).emit("/update_users", clientList);
      }
    });
  },
  GET_CLIENTS: (roomName, io) => {
    io.in(roomName).clients((err, clients) => {
      const clientList = getUserList(roomName, io);
      //Sending back the connected clients to the sockets in the room
      io.in(roomName).emit("/update_users", clientList);
    });
  }
};

const getUserList = (roomName, io) => {
  let clientList = [];
  //get the socketID for the connected clients in the room
  const objKeys = Object.keys(io.sockets.adapter.rooms[roomName].sockets);

  //Loop through all connected ids and add them to a clientlist
  objKeys.forEach((currentObject, index) => {
    clientList.push({
      username: io.sockets.connected[objKeys[index]].username,
      ready: io.sockets.connected[objKeys[index]].ready
    });
  });

  return clientList;
};
