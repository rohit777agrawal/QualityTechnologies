var { Server } = require("socket.io");
var { User, Message } = require('./database');

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
      const query  = User.where({ auth: {token: socket.handshake.auth.token} });
      query.findOne((err, user) => {
        if (user) {
          //save user ID
          this.socketIDToUserID[socket.id] = user._id

          // set user's online status
          user.active = true
          user.save()

          // Welcome connectee
          socket.emit('messageFromServer', 'Welcome to Chatr, ' + user.displayName);
          // Broadcast to all users except connectee
          socket.broadcast.emit("messageFromServer", user.displayName + " has joined the chat");
        }
        else {
          socket.disconnect()
        }
      });
        
      
    
      // On disconnect tell everyone disconnectee left
      socket.on('disconnect', () => {
        User.findById(this.socketIDToUserID[socket.id], (err, user)=>{
          if (err){
            console.log(err)
          }
          if (user){
            this.io.emit("messageFromServer", user.displayName + " has left the chat");
            user.active = false
            user.save()
          }
          else {
            console.log("Error: received disconnect signal but no user found")
          }
        })
      });
    
      // Listen for chatMessage
      socket.on("messageToServer", (msg) => {
        User.findById(this.socketIDToUserID[socket.id], (err, user)=>{
          if (err){
            console.log(err)
          }
          if (user){
            this.io.emit('messageFromServer', msg)
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