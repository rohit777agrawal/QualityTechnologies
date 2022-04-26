var { Server } = require("socket.io");
var { User, Message } = require('./database');

class SocketManger {

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
    var user;

    this.io.on("connection", (socket) => {
      const query  = User.where({ auth: {token: socket.handshake.auth.token} });
      query.findOne((err, foundUser) => {
        if (foundUser) {
          // Welcome connectee
          user = foundUser
          user.active = true
          user.save()
          this.io.emit('messageFromServer', 'Welcome to Chatr, ' + user.displayName);
        }
        else {
          socket.disconnect
        }
      });
        
      
      // Broadcast to all users except connectee
      //socket.broadcast.emit("message", "A user has joined the chat");
    
      // On disconnect tell everyone disconnectee left
      socket.on('disconnect', () => {
        user.active = false
        user.save()
        this.io.emit("messageFromServer", user.displayName + " has left the chat");
      });
    
      // Listen for chatMessage
      socket.on("messageToServer", (msg) => {
        this.io.emit('messageFromServer', msg)
      })
    });
  }

}

module.exports = SocketManger