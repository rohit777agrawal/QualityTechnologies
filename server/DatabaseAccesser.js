const { json } = require('express');
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
    displayName: String,
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

    async getAllUsers(){
        return await UserModel.find({});
    }

    async getAllStudents(){
        return await UserModel.find({isTeacher: false});
    }

    async getUserByID(userID){
        return await UserModel.findById(userID);
    }

    async getUsersByID(userIDs){
        return await UserModel.find({_id: {$in: userIDs}})
    }

    async getUsersByGroupID(groupID){
        return await UserModel.find({groupIDs: {$in: groupID}})
    }

    getUserByEmail(email){
        return UserModel.findOne({email: email})
    }

    getUserByAuthToken(authToken) {
        return UserModel.findOne({ auth: {token: authToken} })
    }

    async createTeacher(name, email, password){
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
                        displayName: displayName,
                        name: displayName,
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
                    return new UserModel(user).save();
                }
            })

    }

    createStudent(displayName, groupID){
        var user = {
            name: displayName,
            email: null,
            password: null,
            link: null,
            displayName: displayName,
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
                student.link = student._id;
                this.addUserIDtoGroup(groupID, student._id);
                return student.save()
            })

    }

    async updateUser(updatedUser){
        console.log("updating user", userID, updatedProps)
        if(updatedUser._doc){
            updatedUser = updatedUser._doc;
        }
        let changedValues = {};
        const {_id, ...changes} = updatedUser;
        return await this.getUserByID(_id)
            .then((user)=>{
                if (user){
                    Object.keys(user._doc).filter(key => key in changes).forEach(key=>{
                        if(user[key] !== changes[key]){
                            changedValues[key] = user[key];
                            user[key] = changes[key];
                        }
                    })
                    return user.save()
                    .then(()=>{
                        return [user._doc, changedValues];
                    })
                }
                else {
                    console.log("User does not exist")
                    return [null, null];
                }
            })
    }

    async resetUserAuthentication(userID){
        return this.getUserByID(userID)
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
        return UserModel.deleteOne({_id: userID}).then(
            (res)=>{return res.deletedCount}
        )
    }

    getAllGroups(){
        return GroupModel.find()
    }

    getGroupByID(groupID){
        return GroupModel.findById(groupID)
    }

    async getGroupsByUser(userID){
        return GroupModel.find({userIDs: userID})
    }

    async getGroupsByTeacher(teacherID){
        return GroupModel.find({teacherID: teacherID});
    }

    async addUserIDtoGroup(groupID, userID){
        this.getGroupByID(groupID)
            .then((group)=>{
                group.userIDs.push(userID);
                group.save();
            })
    }

    async createGroup(name, teacherID, userIDs, parentGroupID){
        var newGroup = {
            name: name,
            active: false,
            teacherID: teacherID,
            userIDs: userIDs ? userIDs : [],
            parentGroupID: parentGroupID ? parentGroupID : null,
            childGroupIDs: [],
        }
        return await new GroupModel(newGroup).save();
    }

    async updateMembersInGroup(groupID, updatedMemberIDs){
        return this.getGroupByID(groupID)
            .then((group)=>{
                var exMemberIDs = group.userIDs.filter(id=>!updatedMemberIDs.includes(id))
                var newMemberIDs = updatedMemberIDs.filter(id=>!group.userIDs.includes(id))
                this.getUsersByID(exMemberIDs)
                    .then((users)=>{
                        users.forEach((user)=>{
                            var userGroupIDs = user.groupIDs
                            userGroupIDs.splice(userGroupIDs.indexOf(groupID), 1)
                            this.updateUser({_id: user._id, groupIDs: userGroupIDs})
                        })
                    })
                this.getUsersByID(newMemberIDs)
                    .then((users)=>{
                        users.forEach((user)=>{
                            var userGroupIDs = user.groupIDs
                            userGroupIDs.push(groupID)
                            this.updateUser({_id: user._id, groupIDs: userGroupIDs})
                        })
                    })
                group.userIDs = updatedMemberIDs
                return this.updateGroup(group)
            })
    }

    async updateGroup(updatedGroup){
        if(updatedGroup._doc){
            updatedGroup = updatedGroup._doc;
        }
        const {_id, ...changes} = updatedGroup
        return this.getGroupByID(_id)
            .then((group)=>{
                if (group){
                    Object.keys(group._doc).filter(key => key in changes).forEach(key=>{
                        group[key] = changes[key]
                    })
                    return group.save()
                }
                else {
                    console.log("Group does not exist")
                    return null
                }
            })
    }

    async deleteGroup(groupID){
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

    async getMessagesByReceiver(userID){
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

    async updateMessage(messageID, contents) {
        return this.getMessageByID(messageID)
            .then((message)=>{
                message.contents = contents
                return message.save()
            })
    }

    async deleteMessage(messageID) {
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
