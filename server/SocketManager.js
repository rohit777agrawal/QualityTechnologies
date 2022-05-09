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
      socket.on('join',(groupID) => {
        socket.join(groupID)
      })

      console.log("Establishing socket connection with ", socket.id)
      const sendServerMessage = (message) => {
        socket.emit('messageFromServer', {user: 'server', text: message, date: new Date()});
      }

      const sendServerBroadcast = (message) => {
        socket.broadcast.emit('messageFromServer', {user: 'server', text: message, date: new Date()});
      }

      db.getUserByAuthToken(socket.handshake.auth.token)
        .then((user)=>{
          console.log("Retrieved user", user._id.valueOf(), "associated with socket", socket.id)
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
        .catch((err)=>{console.log(err)})

      // On disconnect tell everyone disconnectee left
      socket.on('disconnect', () => {
        db.getUserByID(this.socketIDToUserID[socket.id])
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
          .catch(err=>console.log(err))

      });

      socket.on('messageUpdateToServer', (message)=>{
          this.io.emit("messageUpdateFromServer", message);
      })

      //Update updateActiveUsers
      socket.on('updateActiveUsers', () => {
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
      socket.on("messageToServer", (contents, displayName, senderID, groupID, messageType) => {
        // Add message to database
        db.createMessage(contents, displayName, senderID, groupID, messageType)
          .then((message) => {
            //this.io.to(message.groupID).emit('messageFromServer', message) // TODO: migrate to group
            this.io.emit('messageFromServer', message)
          })
        
        //db.getUserByID(this.socketIDToUserID[socket.id])    // TODO: Delete
        //  .then((user)=>{
        //    if (user){
        //      db.createMessage(contents, displayName, senderID, groupID, messageType)
        //        .then((message) => {
        //          this.io.emit('messageFromServer', user.displayName, message)

        //        })
        //    }
        //    else {
        //      console.log("Error: received message but no user found")
        //    }
        //  })
      })

    });
  }

}

module.exports = SocketManger
