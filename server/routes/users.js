const { v4: uuidv4 } = require('uuid');
var express = require("express");
var router = express.Router();

var {mongoose, db, User: UserModel} = require('../database');

router.get('/', function(req, res, next) {
    UserModel.find(function(err, users){
        if(err) {
            console.log(err);
        } else {
            res.json(users);
        }
    })
})

router.post('/teacher/', function(req, res, next) {
    var user = new User({
        name: req.body.displayName,
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.displayName,
        isTeacher: true,
    })
    user.save()
    .catch(err => {
        res.status(400).send("Teacher Creation Error")
    })
})

router.get("/:id", function(req, res, next) {
    UserModel.findById(req.params.id, function(err, user) {
        res.json(user);
    });
});

router.post("/login", function(req, res, next) {
    const query  = UserModel.where({ email: req.body.email, password: req.body.password });
    query.findOne(function (err, user) {
        if (err) {
            res.status(500).json(err)
        };
        if (user) {
            user.auth = {token: uuidv4()};
            user.save().then(res.status(200).json(user))
            console.log("Found user '" + req.body.email + "' with password '" + req.body.password + "'");
        }
        else {
            res.status(404).json({text: "failure"});
            console.log("User " + req.body.email + " with password " + req.body.password + " does not exist")
        }
    });
});

router.put("/:id", function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        var oldDisplayName = {oldDisplayName: user["displayName"]};
        var validKeys = Object.keys(user["_doc"]).filter(value=>Object.keys(req.body).includes(value));
        validKeys.forEach((key)=>{user[key] = req.body[key]});
        user.save();
        res.json(Object.assign({}, user._doc, oldDisplayName));
    })
})

module.exports = router;
