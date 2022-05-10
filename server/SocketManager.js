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

      const sendServerMessage = (message) => {
        socket.emit('message', {text: message, date: new Date(), type: "info"});
      }

      const sendServerBroadcast = (message) => {
        socket.broadcast.emit('message', {user: 'server', text: message, date: new Date(), type: "info"});
      }

      db.getUserByAuthToken(socket.handshake.auth.token)
        .then((user)=>{
          if (user) {
            console.log("Retrieved user", user._id.valueOf(), "associated with socket", socket.id)
            //save user ID
            this.socketIDToUserID[socket.id] = user._id
            // set user's online status

            db.updateUser(user._id, {active: true})
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
        .catch((err)=>{console.log(err)})

      // On disconnect tell everyone disconnectee left
      socket.on('disconnect', () => {
        db.getUserByID(this.socketIDToUserID[socket.id])
          .then((user)=>{
            if (user){
              sendServerMessage(user.displayName + " has left the chat");

              db.updateUser(user._id, {active: false})

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
          .catch(err=>console.log(err))

      });

      // Edit a message, add a reaction, etc
      socket.on('updateMessage', (message)=>{
        this.io.emit("updateMessage", message);
      })

      // Change a username
      socket.on('updateUser', (oldName, newName)=>{
        db.updateUser(this.socketIDToUserID[socket.id], {displayName: newName})
        .then((user)=>{
          if (user) {
            sendServerBroadcast(oldName + " has changed their name to " + newName)
            this.updateActiveUsers()
          }
          else {

          }
        })

      })

      //Update updateActiveUsers
      socket.on('updateActiveUsers', ()=>{
        this.updateActiveUsers()
      })

      // Listen for chatMessage
      socket.on("message", (msg, type) => {
        db.getUserByID(this.socketIDToUserID[socket.id])
          .then((user)=>{
            if (user){
              this.io.emit('message', {user: user.displayName, text: msg, type: type})
            }
            else {
              console.log("Error: received message but no user found")
            }
          })
      })

    });
  }

  updateActiveUsers(){
    db.getUsersByID(Object.values(this.socketIDToUserID))
    .then((activeUsers)=>{
      console.log("broadcasting updated user list");
      this.io.emit('activeUsers', activeUsers)
    })
  }

}

module.exports = SocketManger
