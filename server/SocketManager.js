var { Server } = require("socket.io");
// var { User, Message } = require('./database');
const db = require('./DatabaseAccesser')

class SocketManger {
  socketIDToUserID = {}

  constructor(server){
      this.io = new Server(server, { /* options */
          cors: {
              origin: "http://localhost:3000",
              methods: ["GET", "POST"]
          }
      })

      this.setupConnections()
  }

  setupConnections(){

    this.io.on("connection", (socket) => {
      console.log("Establishing socket connection with ", socket.id)

      this.connectSocket(socket)

      // On disconnect tell everyone disconnectee left
      socket.on('disconnect', () => {
        this.disconnectSocket(socket)

      });

      // Edit a message, add a reaction, etc
      socket.on('updateMessage', (message)=>{this.io.emit("updateMessage", message);})

      // Change a username
      socket.on('updateUser', (oldName, newName)=>{this.updateUser(socket, oldName, newName)})

      // Listen for chatMessage
      socket.on("message", (contents, userID, groupID, type)=>{this.relayMessage(contents, userID, groupID, type)})

    });
  }

  sendServerMessage(socket, message){
    socket.emit('message', {contents: message, sentTime: new Date(), type: "server"});
  }

  sendServerBroadcast(socket, message){
    socket.emit('message', {contents: message, sentTime: new Date(), type: "server"});
  }

  connectSocket(socket){
    db.getUserByAuthToken(socket.handshake.auth.token)
        .then((user)=>{
          if (user) {
            console.log("Retrieved user", user.name, "with id", user._id.valueOf(), "associated with socket", socket.id)
            //save user ID
            this.socketIDToUserID[socket.id] = user._id
            // set user's online status
            db.updateUser(user._id, {active: true})
            // Welcome connectee
            this.sendServerMessage(socket, 'Welcome to Chatr, ' + user.name);
            // Broadcast to all users except connectee
            this.sendServerBroadcast(socket, user.name + " has joined the chat");
            // inform all users of updated active users list
            this.broadcastActiveUsers()
          }
          else {
            socket.disconnect()
          }
        })
        .catch((err)=>{console.log(err)})
  }

  disconnectSocket(socket){
    db.getUserByID(this.socketIDToUserID[socket.id])
    .then((user)=>{
      if (user){
        this.sendServerMessage(socket, user.name + " has left the chat");

        db.updateUser(user._id, {active: false})

        delete this.socketIDToUserID[socket.id]

        this.broadcastActiveUsers()
      }
      else {
        console.log("Error: received disconnect signal but no user found")
      }
    })
    .catch(err=>console.log(err))
  }

  broadcastActiveUsers(){
    db.getUsersByID(Object.values(this.socketIDToUserID))
    .then((activeUsers)=>{
      console.log("broadcasting active user list");
      this.io.emit('activeUsers', activeUsers)
    })
  }

  updateUser(socket, oldName, newName){
    db.updateUser(this.socketIDToUserID[socket.id], {name: newName})
    .then((user)=>{
      if (user) {
        console.log("updated user", user.name)
        this.sendServerBroadcast(socket, oldName + " has changed their name to " + newName)
        this.broadcastActiveUsers()
      }
      else {
        console.log("user not found")
      }
    })
  }

  relayMessage(contents, userID, groupID, type){
    db.createMessage(contents, userID, groupID, type)
      .then(async (message) => {
          this.io.emit('message', {...message._doc, ...{senderName: (await db.getUserByID(userID)).name}});
        })
  }

}

module.exports = SocketManger
