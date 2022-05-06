var { Server } = require("socket.io");
// var { User, Message } = require('./database');
var db = require('./DatabaseAccesser')

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

      const sendServerMessage = (message) => {
        socket.emit('messageFromServer', {user: 'server', text: message});
      }

      const sendServerBroadcast = (message) => {
        socket.broadcast.emit('messageFromServer', {user: 'server', text: message});
      }

      db.getUserByAuthToken(socket.handshake.auth.token)
        .then((user)=>{
          if (user) {
            //save user ID
            this.socketIDToUserID[socket.id] = user._id
            // set user's online status

            user.active = true;
            db.updateUser(user)
            // Welcome connectee
            sendServerMessage('Welcome to Chatr, ' + user.displayName);
            // Broadcast to all users except connectee
            sendServerBroadcast(user.displayName + " has joined the chat");
            // inform all users of updated active users list
            db.getUsersByID(Object.values(this.socketIDToUserID))
              .then((activeUsers)=>{
                this.io.emit('activeUsers', activeUsers)
              })
          }
          else {
            socket.disconnect()
          }
        })

      // On disconnect tell everyone disconnectee left
      socket.on('disconnect', () => {
        db.getUserById(this.socketIDToUserID[socket.id])
          .then((user)=>{
            if (user){
              sendServerMessage(user.displayName + " has left the chat");
              user.active = false
              db.updateUser(user)
              delete this.socketIDToUserID[socket.id]
              db.getUsersByID(Object.values(this.socketIDToUserID))
                .then((activeUsers)=>{
                  console.log("broadcasting updated user list");
                  this.io.emit('activeUsers', activeUsers)
                })
            }
            else {
              console.log("Error: received disconnect signal but no user found")
            }
          })
        
      });

      //Update updateActiveUsers
      socket.on('updateActiveUsers', ()=>{
        db.getUsersByID(Object.values(this.socketIDToUserID))
          .then((activeUsers)=>{
            console.log("broadcasting updated user list");
            this.io.emit('activeUsers', activeUsers)
          })
      })

      socket.on("sendServerMessage", (msg) => {
          sendServerMessage(msg);
      })

      // Listen for chatMessage
      socket.on("messageToServer", (msg, type) => {
        db.getUserByID(this.socketIDToUserID[socket.id])
          .then((user)=>{
            if (user){
              this.io.emit('messageFromServer', {user: user.displayName, text: msg, type: type})
            }
            else {
              console.log("Error: received message but no user found")
            }
          })
      })
      
    });
  }

}

module.exports = SocketManger
