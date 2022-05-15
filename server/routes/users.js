const { v4: uuidv4 } = require('uuid');
var express = require("express");
var router = express.Router();

// var {mongoose, db, User: UserModel} = require('../database/database');
var db = require('../DatabaseAccesser');

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

router.get('/:id/groups', function(req, res, next){
    db.getGroupsByUser(req.params.id)
    .then((groups)=>{
        res.status(200).json(groups)
    })
    .catch((err)=>{
        res.status(500).send(err)
    })
})

router.post("/login", function(req, res, next) {
    db.getUserByEmail(req.body.email)
        .then((user)=>{
            if (user) {
                if (user.password === req.body.password) {

                    db.updateUser(user._id, {auth: {token: uuidv4()}})
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

router.post('/:id/logout', function(req, res, next) {
    db.resetUserAuthentication(req.params.id)
    .then((user)=>{
            console.log(user)
            if (user) {
                res.status(200).json(user)
            }
            else {
                res.status(404)
            }
        })
})

router.post('/teacher/', function(req, res, next) {
    db.createTeacher(req.body.email, req.body.password, req.body.name)
    .then((user)=>{
        if (user) {
            res.status(200).json(user)
        }
        else {
            res.status(400).send("User with that email already exists")
        }
    })
    .catch(err => {
        res.status(400).send("Teacher Creation Error")
    })
})

router.post('/student', function(req, res, next){
    db.createStudent(req.body.name, req.body.groupID)
    .then((user)=>{
        if (user) {
            res.status(200).json(user)
        }
        else {
            res.status(500).send("Error")
        }
    })
    .catch(err => {
        console.log(err)
        res.status(400).send("Student Creation Error")
    })
})

router.put("/:id", function(req, res, next) {
    var updatedProps = req.body
    console.log("handling route", req.params.id,updatedProps )
    if (!Object.keys(updatedProps).includes('_id')){
        db.updateUser(req.params.id, updatedProps)
        .then((user) => {
            if (user) {
                res.status(200).json(user)
            }
            else {
                res.status(404).send("User does not exist")
            }
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).json(err)
        })
    }
    else {
        res.status(400).send("Changing user ID is not allowed")
    }
})

router.delete('/:id', function(req, res, next){
    console.log("here")
    db.deleteUser(req.params.id)
        .then((count)=>{
            console.log(count)
            if (count > 0) {
                res.status(200).send("deleted " + count + " user(s)")
            }
            else {
                res.status(404).send("User not found")
            }
        })
        .catch((err)=>{
            console.log(err)
            res.status(500).send(err)
        })
})

module.exports = router;
