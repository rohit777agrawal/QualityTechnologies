const { v4: uuidv4 } = require('uuid');
var express = require("express");
var router = express.Router();

// var {mongoose, db, User: UserModel} = require('../database/database');
var db = require('../DatabaseAccesser')

router.get('/', function(req, res, next) {

    db.getAllUsers()
        .then((users)=>{
            if (users) {
                res.status(200).json(users)
            }
            else {
                res.status(500)
            }
        })
})

router.post('/teacher/', function(req, res, next) {
    db.createTeacher(req.body.name, req.body.email, req.body.password)
    .then((user)=>{
        res.status(200).json(user)
    })
    .catch(err => {
        res.status(400).send("Teacher Creation Error")
    })
})

router.get("/:id", function(req, res, next) {
        db.getUserByID(req.params.id)
            .then((user)=>{
                if (user) {
                    res.status(200).json(user)
                }
                else {
                    res.status(404)
                }
            })
            .catch((err)=>{
                console.log(err)
                res.status(500)
            })
});

router.post("/login", function(req, res, next) {
    db.getUserByEmail(req.body.email)
        .then((user)=>{
            if (user) {
                if (user.password === req.body.password) {
                    user.auth = {token: uuidv4()};

                    db.updateUser(user)
                        .then((user)=>{
                            res.status(200).json(user)
                        })
                    console.log("Found user '" + req.body.email + "' with password '" + req.body.password + "'");
                }
                else {
                    res.status(404).json({text: "failure"})
                }
            }
            else {
                res.status(404).json({text: "failure"});
                console.log("User " + req.body.email + " with password " + req.body.password + " does not exist")
            }
        })
});

router.put("/:id", function(req, res, next) {
    var updatedUser = req.body.params
    db.getUserByID(req.params.id)
        .then((user) => {
            if (user._id === updatedUser._id) {
                db.updateUser(updatedUser)
                .then((user)=>{
                    res.status(200).json(user)
                })
            }
            else {
                res.status(300).json("changing user ID is not allowed")
            }
        })
})

module.exports = router;
