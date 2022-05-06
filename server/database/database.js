//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
//Set url here
var mongoDB = 'mongodb+srv://CrazyArtOrange:city-oaf-handshake@cluster0.son2o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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
    messageType: String,
    reactions: [Object],
    sentTime: Date
})

var GroupSchema = new mongoose.Schema({
    teacherID: String,
    userIDs: [String],
    subGroupIDs: [String],
    active: Boolean
})



var UserModel = mongoose.model('User', UserSchema );
var MessageModel = mongoose.model('Message', MessageSchema );
var GroupModel = mongoose.model('Group', GroupSchema);

function createUserIfMissing(userIn) {
    const query  = UserModel.where(userIn);
    query.findOne(function (err, user) {
        if (err) return handleError(err);
        if (!user) {
            (new UserModel(userIn)).save(function (err) {
                if (err) return handleError(err);
            });
        }
    });
}

createUserIfMissing({
    name: 'test teacher',
    email: 'teacher@mail.com',
    password: 'password',
    link: "",
    displayName: "testTeacher",
    teacher: true,
    sentMessageIDs: [],
    recievedMessageIDs: [],
    classroomIDs: [],
    active: false
});

createUserIfMissing({
    name: 'test student',
    email: 'student@mail.com',
    password: 'password',
    link: '123xyz',
    displayName: "testStudent",
    teacher: false,
    sentMessageIDs: [],
    recievedMessageIDs: [],
    classroomIDs: [],
    active: false
});

module.exports = { mongoose, db, UserModel, MessageModel, GroupModel}
