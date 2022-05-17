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

            socket.on('setAllowChat', (allowChat) =>{
                this.io.emit('setAllowChat', allowChat)
            })

            socket.on('changedGroup', (groupID, groupName)=>{
                this.sendServerMessage(socket, groupID, "You have changed to the " + groupName +" group.");
            })

            //react to a message
            socket.on('messageReaction', (messageID, emoji)=>{
                db.reactToMessage(this.socketIDToUserID[socket.id], messageID, emoji)
                .then((message)=>{
                    this.updatedMessage(message);
                })
            })

            //delete a message for students
            socket.on("deleteMessage", (messageID) => {
                db.deleteMessage(messageID)
                .then((message)=>{
                    this.updatedMessage(message);
                })
            })

            // Edit a message, add a reaction, etc
            socket.on('updateMessage', (message)=>{this.io.emit("updatedMessage", message);})

            // Change a username
            socket.on('updateUserName', (oldName, newName)=>{this.updateUserName(socket, oldName, newName)})

            // Listen for chatMessage
            socket.on("message", (contents, userID, groupID, type)=>{this.relayMessage(contents, userID, groupID, type)})

        });
    }

    sendServerMessage(socket, groupID, message){
        socket.emit('message', {contents: message, groupID: groupID, deleted:false, sentTime: new Date(), type: "server"});
    }

    sendServerBroadcast(socket, groupID, message){
        socket.emit('message', {contents: message, groupID: groupID,deleted:false, sentTime: new Date(), type: "server"});
    }

    connectSocket(socket, currentGroup){
        db.getUserByAuthToken(socket.handshake.auth.token)
        .then((user)=>{
            if (user) {
                console.log("Retrieved user", user.name, "with id", user._id.valueOf(), "associated with socket", socket.id);
                //save user ID
                this.socketIDToUserID[socket.id] = user._id
                // set user's online status
                db.updateUser(user._id, {active: true})
                //Get the id of the user's first group
                db.getGroups(user._id).then((groups)=>{

                    if(groups && Object.values(groups).length > 1){
                        let groupID = Object.values(groups)[0]._id.valueOf();
                        groups.forEach((group)=>{
                            db.get30LatestMessagesByGroup(group._id).then((messages)=>{
                                Promise.all(messages.map(async (message)=>{
                                    return await this.sendMessageWithSenderNameAndReactions(message);
                                })).then((messages)=>{
                                    socket.emit("loadGroupMessages", group._id, messages);
                                })
                            })
                        })
                        // Welcome connectee
                        this.sendServerMessage(socket, groupID, 'Welcome to Chatr, ' + user.name);
                        // Broadcast to all users except connectee
                        this.sendServerBroadcast(socket, groupID, user.name + " has joined the chat");
                        // inform all users of updated active users list
                        this.broadcastActiveUsers()

                    }
                })
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

    updateUserName(socket, oldName, newName){
        db.updateUser({_id: this.socketIDToUserID[socket.id], name: newName})
        .then((user)=>{
            if (user) {
                console.log(user);
                console.log("updated user", user.name)
                this.io.emit("updatedUser", oldName, user);
                this.broadcastActiveUsers();
            }
            else {
                console.log("user not found")
            }
        })
    }

    async sendMessageWithSenderNameAndReactions(message){
        if(message._doc){
            message = message._doc
        }
        if(!message.reactions){
            db.deleteMessage(message._id);
            return;
        }
        return Promise.all(Array.from(message.reactions, async ([emoji, userIDs])=>{
            return [emoji, await Promise.all(userIDs.map(async (userID) => {
                return await db.getUserByID(userID).then((user)=>{
                    if(user){
                        return user.name;
                    }
                })
            }))]
        })).then(async (emojiUserNamePair) => {
            return await db.getUserByID(message.senderID).then((user)=>{
                if(user){
                    return ({...message, senderName: user.name, reactions: Object.fromEntries(emojiUserNamePair)})
                } else {
                    return ({...message, senderName: "unknown", reactions: Object.fromEntries(emojiUserNamePair)})
                }
            })
        })
    }

    updatedMessage(message){
        Promise.all(Array.from(message.reactions, async ([emoji, userIDs])=>{
            return [emoji, await Promise.all(userIDs.map(async (userID) => {
                return await db.getUserByID(userID).then((user)=>{
                    if(user){
                        return user.name;
                    }
                })
            }))]
        })).then((emojiUserNamePair) => {
            this.addSenderNameToMessage(message, (message) => {this.io.emit("updatedMessage", {...message,
                reactions: Object.fromEntries(emojiUserNamePair)
            })});
        })
    }

    async addSenderNameToMessage(message, fn){
        if(message._doc){
            message = message._doc
        }
        db.getUserByID(message.senderID).then((user)=>{
            fn({...message, ...{senderName: user.name}})
        })
    }

    relayMessage(contents, userID, groupID, type){
        db.createMessage(contents, userID, groupID, type)
        .then(async (message) => {
            this.addSenderNameToMessage(message, (message)=>{this.io.emit('message', message)});
        })
    }
}

module.exports = SocketManger
