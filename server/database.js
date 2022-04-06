//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb+srv://CrazyArtOrange:city-oaf-handshake@cluster0.son2o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var UserSchema = new mongoose.Schema({
    email: String,
    teacher: Boolean,
    password: String,
    messageIds: [String]
})

var MessageSchema = new mongoose.Schema({
    sender: String,
    recipients: [String],
    contents: String
})

var User = mongoose.model('User', UserSchema );
var Message = mongoose.model('Message', MessageSchema );
//var test_Teacher = new User({ email: 'teacher@mail.com', teacher: true, password: 'password' });
//var test_Student = new User({ email: 'student@mail.com', teacher: false, password: 'password' });

createUserIfMissing = (userIn) => {
    const query  = User.where(userIn);
    query.findOne(function (err, user) {
        if (err) return handleError(err);
        if (!user) {
            (new User(userIn)).save(function (err) {
                if (err) return handleError(err);
            });
        }
    });
}

createUserIfMissing({ email: 'teacher@mail.com', teacher: true, password: 'password' });
createUserIfMissing({ email: 'student@mail.com', teacher: false, password: 'password' });

module.exports = { mongoose, db, User, Message}
