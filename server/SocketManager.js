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

  ioEmitActiveUsers(){
      User.find({
        '_id': { $in: Object.keys(this.socketIDToUserID).map(key=>this.socketIDToUserID[key])}
      }, (err, activeUsers) => {
          console.log("broadcasting updated user list");
          this.io.emit("activeUsers", activeUsers);
      });
  }

  setupConnections(){

    this.io.on("connection", (socket) => {

      const sendServerMessageToUser = (message) => {
        socket.emit('messageFromServer', {user: 'server', text: message, date: new Date()});
      }

      const sendServerBroadcast = (message) => {
        socket.broadcast.emit('messageFromServer', {user: 'server', text: message, date: new Date()});
      }

      const query  = User.where({ auth: {token: socket.handshake.auth.token} });

      query.findOne((err, user) => {
        if (user) {
          //save user ID
          this.socketIDToUserID[socket.id] = user._id
          // set user's online status

          user.active = true;
          // Welcome connectee
          sendServerMessageToUser('Welcome to Chatr, ' + user.displayName);
          // Broadcast to all users except connectee
          sendServerBroadcast(user.displayName + " has joined the chat");
          // inform all users of updated active users list
          this.ioEmitActiveUsers();
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
            this.io.emit(user.displayName + " has left the chat");
            user.active = false
            user.save()
            delete this.socketIDToUserID[socket.id]
            // inform all users of updated active users list
            this.ioEmitActiveUsers();
          }
          else {
            console.log("Error: received disconnect signal but no user found")
          }
        })
      });

      socket.on('messageUpdateToServer', (message)=>{
          this.io.emit("messageUpdateFromServer", message);
      })

      socket.on("updatedUserToServer", (oldDisplayName, newDisplayName)=>{
          this.ioEmitActiveUsers();
          this.io.emit("updatedUserFromServer",
            oldDisplayName,
            newDisplayName);
      })

      // Listen for chatMessage
      socket.on("messageToServer", (msg, type) => {
        User.findById(this.socketIDToUserID[socket.id], (err, user)=>{
          if (err){
            console.log(err)
          }
          if (user){
            this.io.emit('messageFromServer', {user: user.displayName, text: msg, reactions: [], type: type, date: new Date()})
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
