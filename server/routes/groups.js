var express = require("express");
var router = express.Router();

// var {mongoose, db, User: UserModel} = require('../database/database');
var db = require('../DatabaseAccesser')

router.get('/', function(req, res, next) {
    db.getAllGroups()
        .then((groups)=>{
            if (groups) {
                res.status(200).json(groups)
            }
            else {
                res.status(500)
            }
        })
})

router.get('/:id', function(req, res, next) {
    db.getGroupByID(req.params.id)
    .then((group)=>{
        if (group) {
            res.status(200).json(group)
        }
        else {
            res.status(404).send("No group found with id " + req.params.id)
        }
    })
    .catch((err)=>{
        res.status(500).send(err)
    })
})

router.get('/:id/teacher', function(req, res, next) {
    db.getGroupByID(req.params.id)
    .then((group)=>{
        if (group) {
            db.getUserByID(group.teacherID)
            .then((user)=>{
                res.status(200).json(user)
            })
        }
        else {
            res.status(404).send("No group found with id " + req.params.id)
        }
    })
    .catch((err)=>{
        res.status(500).send(err)
    })
})

router.get('/:id/users', function(req, res, next){
    db.getGroupByID(req.params.id)
    .then((group)=>{
        if (group) {
            db.getUsersByID(group.userIDs)
            .then((users)=>{
                res.status(200).json(users)
            })
        }
        else {
            res.status(404).send("No group found with id " + req.params.id)
        }
    })
})

router.get('/:id/messages', function(req, res, next){
    db.getMessagesByGroup(req.params.id)
    .then((messages)=>{
        res.status(200).json(messages)
    })
})

router.post('/', function(req, res, next){
    db.createGroup(req.body.name, req.body.teacherID, req.body.userIDs, req.body.parentGroupID)
    .then((group)=>{
        if (group) {
            res.status(200).json(group)
        }
        else {
            res.status(500).send("Error, group not created")
        }
    })
})

router.put('/:id', function(req, res, next){
    var updatedProps = req.body
    if (!Object.keys(updatedProps).includes('_id')){
        db.updateGroup(req.params.id, updatedProps)
        .then((group)=>{
            if (group) {
                res.status(200).json(group)
            }
            else {
                res.status(404).send("No group found with id " + req.params.id)
            }
        })
    }
    else {
        res.status(300).send("Changing group id is not allowed")
    }
})

router.delete('/:id', function(req, res, next){
    db.deleteGroup(req.params.id)
    .then((count)=>{
        if (count) {
            res.status(200).send("Deleted " + count + " group(s)")
        }
        else {
            res.status(404).send("No group found with id " + req.params.id)
        }
    })
})

module.exports = router;