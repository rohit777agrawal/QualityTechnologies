//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/test';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var TeacherSchema = new mongoose.Schema({
    email: String,
    password: String
})

var Teacher = mongoose.model('Teacher', TeacherSchema );

var test_teacher = new Teacher({ email: 'a', password: 's' });

test_teacher.save(function (err) {
    if (err) return handleError(err);
});

module.exports = { mongoose, db, Teacher}