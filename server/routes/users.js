const { v4: uuidv4 } = require('uuid');
var express = require("express");
var router = express.Router();

var {mongoose, db, User} = require('../database');

router.get('/', function(req, res, next) {
    User.find(function(err, users){
        if(err) {
            console.log(err);
        } else {
            res.json(users);
        }
    })
})

router.get("/:id", function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        res.json(user);
    });
});

router.post("/login", function(req, res, next) {
    const query  = User.where({ email: req.body.email, password: req.body.password });
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
        Object.assign(user, req.params.body);
        user.save();
    })
})

module.exports = router;
