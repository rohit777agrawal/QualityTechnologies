var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    link: {
        type: String,
        unique: true
    },
    name: String,
    isTeacher: Boolean,
    sentMessageIDs: [String],
    recievedMessageIDs: [String],
    groupIDs: [String],
    active: Boolean,
    auth: {
        token: String
    }
})

var MessageSchema = new mongoose.Schema({
    senderID: String,
    groupID: String,
    contents: String,
    type: String,
    sentTime: Date
})

var GroupSchema = new mongoose.Schema({
    name: String,
    active: Boolean,
    teacherID: String,
    userIDs: [String],
    parentGroupID: String,
    childGroupIDs: [String],
})

var UserModel = mongoose.model('User', UserSchema );
var MessageModel = mongoose.model('Message', MessageSchema );
var GroupModel = mongoose.model('Group', GroupSchema);

class DatabaseAccessor {
    constructor(){
        var url = 'mongodb+srv://CrazyArtOrange:city-oaf-handshake@cluster0.son2o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
        mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
        //Get the default connection
        var db = mongoose.connection;
        //Bind connection to error event (to get notification of connection errors)
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    }

    handleError(err){
        console.log(err)
    }

    getAllUsers(){
        return UserModel.find({});
    }

    getUserByID(userID){
        return UserModel.findById(userID);
    }

    getUsersByID(userIDs){
        return UserModel.find({_id: {$in: userIDs}})
    }

    getUserByEmail(email){
        return UserModel.findOne({email: email})
    }

    getUserByAuthToken(authToken) {
        return UserModel.findOne({ auth: {token: authToken} })
    }

    createTeacher(name, email, password){
        return this.getUserByEmail(email)
        .then((user)=>{
            if (user){
                return null
            }
            else {
                var user = {
                    name: name,
                    email: email,
                    password: password,
                    link: null,
                    isTeacher: true,
                    sentMessageIDs: [],
                    recievedMessageIDs: [],
                    groupIDs: [],
                    active: true,
                    auth: {
                        token: ''
                    }
                }
                console.log(user)
                return new UserModel(user).save()
                .then((user)=>{
                    return this.createGroup("Classroom", user._id, [user._id], null)
                    .then((group)=>{
                        return this.updateUser(user._id, {groupIDs: [group._id]})
                    })
                })
            }
        })

    }

    createStudent(name, groupID){
        var user = {
            name: name,
            email: null,
            password: null,
            link: null,
            isTeacher: false,
            sentMessageIDs: [],
            recievedMessageIDs: [],
            groupIDs: [groupID],
            active: false,
            auth: {
                token: null
            }
        }
        return new UserModel(user).save()
            .then((student)=>{
                student.link = student._id
                return student.save()
            })

    }

    updateUser(userID, updatedProps){
        console.log("updating user", userID, updatedProps)
        return this.getUserByID(userID)
            .then((user)=>{
                if (user){
                    for(var prop in updatedProps){
                        user[prop] = updatedProps[prop]
                    }
                    return user.save()
                }
                else {
                    console.log("User does not exist")
                    return null
                }
            })
    }

    async resetUserAuthentication(userID){
        return await this.getUserByID(userID)
            .then((user)=>{
                if (user) {
                    user.auth.token = ''
                    user.active = false
                    return user.save()
                }
                else {
                    console.log("User does not exist")
                    return null
                }
            })
    }

    async deleteUser(userID){
        return await UserModel.deleteOne({_id: userID}).then(
            (res)=>{return res.deletedCount}
        )
    }

    getAllGroups(){
        return GroupModel.find()
    }

    getGroupByID(groupID){
        return GroupModel.findById(groupID)
    }

    getGroupsByUser(userID){
        return GroupModel.find({userIDs: userID})
    }

    createGroup(name, teacherID, userIDs, parentGroupID){
        var newGroup = {
            name: name,
            teacherID: teacherID,
            userIDs: userIDs ? userIDs : [],
            parentGroupID: parentGroupID ? parentGroupID : null,
            childGroupIDs: [],
            active: false
        }
        return new GroupModel(newGroup).save()
    }

    updateMembersInGroup(groupID, updatedMemberIDs){
        return this.getGroupByID(groupID)
            .then((group)=>{
                var exMemberIDs = group.userIDs.filter(id=>!updatedMemberIDs.includes(id))
                var newMemberIDs = updatedMemberIDs.filter(id=>!group.userIDs.includes(id))
                if (exMemberIDs.includes(group.teacherID)) {
                    console.log("Removing teacher from group is not allowed")
                }
                else {
                    this.getUsersByID(exMemberIDs)
                        .then((users)=>{
                            for (var user of users) {
                                var userGroupIDs = user.groupIDs
                                userGroupIDs.remove(groupID)
                                user.groupIDs = userGroupIDs
                                this.updateUser(user)
                            }
                        })
                    this.getUsersByID(newMemberIDs)
                        .then((users)=>{
                            for (var user of users) {
                                var userGroupIDs = user.groupIDs
                                userGroupIDs.push(groupID)
                                user.groupIDs = userGroupIDs
                                this.updateUser(user)
                            }
                        })
                    group.userIDs = updatedMemberIDs
                    return this.updateGroup(group)
                }
            })
    }

    updateGroup(groupID, updatedProps){
        return this.getGroupByID(groupID)
            .then((group)=>{
                if (group){
                    for(var prop in updatedProps){
                        group[prop] = updatedProps[prop]
                    }
                    return group.save()
                }
                else {
                    console.log("Group does not exist")
                    return null
                }
            })
    }

    deleteGroup(groupID){
        return GroupModel.deleteOne({_id: groupID})
            .then((res)=>{return res.deletedCount})
    }

    getAllMessages(){
        return MessageModel.find()
    }

    getMessageByID(messageID){
        return MessageModel.findById(messageID)
    }

    getMessagesBySender(senderID){
        return MessageModel.find({senderID: senderID})
    }

    getMessagesByGroup(groupID){
        return MessageModel.find({groupID: groupID})
    }

    getMessagesByReceiver(userID){
        return this.getGroupsByUser(userID)
                    .then((groups)=>{
                        if (groups){
                            var groupIDs = groups.map(group=>group._id)
                            return MessageModel.find({groupID: {$in: groupIDs}, senderID: {$ne: userID}})
                        }
                        else {
                            return []
                        }
                    })
    }

    createMessage(contents, userID, groupID){
        var newMessage = {
            senderID: userID,
            groupID: groupID,
            contents: contents,
            sentTime: Date.now()
        }
        return new MessageModel(newMessage).save()
    }

    updateMessage(messageID, contents) {
        return this.getMessageByID(messageID)
            .then((message)=>{
                message.contents = contents
                return message.save()
            })
    }

    deleteMessage(messageID) {
        return MessageModel.deleteOne({_id: messageID})
            .then((res)=>{return res.deletedCount})
    }

}

const db = new DatabaseAccessor()
module.exports = db

// var db = new Database('mongodb+srv://CrazyArtOrange:city-oaf-handshake@cluster0.son2o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
// db.getMessagesByReceiver('62731692380255ca69968162')
//     .then((res)=>{
//         console.log(res)
//     })
