const { v4: uuidv4 } = require('uuid');
var mongoose = require("mongoose");
var express = require("express");
var router = express.Router();

// var {mongoose, db, User: UserModel} = require('../database/database');
var db = require('../DatabaseAccesser');

router.get('/', function(req, res, next) {
    db.getAllUsers()
    .then((users) => {
        if (users) {
            res.status(200).json(users)
        } else {
            res.status(500)
        }
    })
})

router.get('/students', function(_, res, _) {
    db.getAllStudents()
    .then((users) => {
        if (users) {
            res.status(200).json(users)
        } else {
            res.status(500)
        }
    })
})

router.get("/:id", function(req, res, next) {
    db.getUserByID(req.params.id)
        .then((user) => {
            if (user) {
                res.status(200).json(user)
            } else {
                res.status(404)
            }
        })
        .catch((err) => {
            if(err instanceof mongoose.CastError){
                res.status(404);
            } else {
                console.log(500, err);
                res.status(500)
            }
        })
});

//Create a new group
router.post("/:id/groups/", function(req, res, _){
    db.createGroup(req.body.name, req.params.id)
        .then((group) => {
            res.status(200).json(group);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        })
})

//Get a Users's Groups, and all of the users in those groups
router.get('/:id/groups/', function(req, res, _){
    db.getGroups(req.params.id)
    .then(async (groups)=>{
        res.status(200).json(await Promise.all(groups.map(async (group) => {
            return {...group._doc, ...{students: await db.getUsersByID(group.userIDs)}};
        })));
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).send(err)
    })
})

router.get('/:id/studentsGroups', function(req, res, _){
    db.getGroupsByUser(req.params.id)
    .then(async (groups)=>{
        res.status(200).json(await Promise.all(groups.map(async (group) => {
            return {...group._doc, ...{students: await db.getUsersByID(group.userIDs)}};
        })));
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).send(err)
    })
})

router.post("/login", function(req, res, _) {
db.getUserByEmail(req.body.email)
    .then((user) => {
        if (user) {
            if (user.password === req.body.password) {
                user.auth = {
                    token: uuidv4()
                };

                db.updateUser(user)
                .then((user) => {
                    res.status(200).json(user)
                })
                console.log("Found user '" + req.body.email + "' with password '" + req.body.password + "'");
            } else {
                res.status(404).json({
                    text: "failure"
                })
            }
        } else {
            res.status(404).json({
                text: "failure"
            });
            console.log("User " + req.body.email + " with password " + req.body.password + " does not exist")
        }
    })
});

router.put("/:id", function(req, res, _) {
    let updatedUser = req.body;
    db.updateUser(updatedUser)
        .then((user) => {
            res.status(200).json(user)
    })
})

router.post('/:id/logout', function(req, res, _) {
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

router.post('/teacher/', function(req, res, _) {
    db.createTeacher(req.body.name, req.body.email, req.body.password)
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

router.post('/student', function(req, res, _){
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

router.put("/:id", function(req, res, _) {
    var updatedProps = req.body
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
    }
    else {
        res.status(400).send("Changing user ID is not allowed")
    }
})

router.delete('/:id', function(req, res, _){
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
