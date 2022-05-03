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

      const sendServerMessage = (message) => {
        socket.emit('messageFromServer', {user: 'server', text: message});
      }

      const sendServerBroadcast = (message) => {
        socket.broadcast.emit('messageFromServer', {user: 'server', text: message});
      }

      const query  = User.where({ auth: {token: socket.handshake.auth.token} });

      query.findOne((err, user) => {
        if (user) {
          //save user ID
          this.socketIDToUserID[socket.id] = user._id
          // set user's online status

          user.active = true;
          // Welcome connectee
          sendServerMessage('Welcome to Chatr, ' + user.displayName);
          // Broadcast to all users except connectee
          sendServerBroadcast(user.displayName + " has joined the chat");
          // inform all users of updated active users list
          User.find({
            '_id': { $in: Object.keys(this.socketIDToUserID).map(key=>this.socketIDToUserID[key])}
          }, (err, activeUsers) => {
             this.io.emit('activeUsers', activeUsers)
          });
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
            sendServerMessage(user.displayName + " has left the chat");
            user.active = false
            user.save()
            delete this.socketIDToUserID[socket.id]
            User.find({
              '_id': { $in: Object.keys(this.socketIDToUserID).map(key=>this.socketIDToUserID[key])}
            }, (err, activeUsers) => {
               console.log("broadcasting updated user list");
               this.io.emit('activeUsers', activeUsers)
            });
          }
          else {
            console.log("Error: received disconnect signal but no user found")
          }
        })
      });

      //Update updateActiveUsers
      socket.on('updateActiveUsers', ()=>{
          User.find({
            '_id': { $in: Object.keys(this.socketIDToUserID).map(key=>this.socketIDToUserID[key])}
          }, (err, activeUsers) => {
             console.log("broadcasting updated user list");
             this.io.emit('activeUsers', activeUsers)
          });
      })

      socket.on("sendServerMessage", (msg) => {
          sendServerMessage(msg);
      })

      // Listen for chatMessage
      socket.on("messageToServer", (msg, type) => {
        User.findById(this.socketIDToUserID[socket.id], (err, user)=>{
          if (err){
            console.log(err)
          }
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
