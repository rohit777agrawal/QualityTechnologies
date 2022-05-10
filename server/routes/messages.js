var express = require("express");
var router = express.Router();

var db = require('../DatabaseAccesser');

router.get('/', function(req, res, next){
    db.getAllMessages()
    .then((messages)=>{
        res.status(200).json(messages)
    })
})

router.get("/:id", function(req, res, next) {
    db.getMessageByID(req.params.id)
    .then((message)=>{
        if (message){
            res.status(200).json(message)
        }
        else {
            res.status(404).send("No message found with id " + req.params.id)
        }
    })
});

//Send a message
router.post("/", function(req, res, next) {
    db.createMessage(req.body.contents, req.body.senderID, req.body.groupID)
        .then((message)=>{
            if (message){
                res.status(200).json(message)
            }
            else {
                res.status(300)
            }
        })
});

router.put('/:id', function(req, res, next){
    db.updateMessage(req.params.id, req.body.contents)
    .then((message)=>{
        if (message) {
            res.status(200).json(message)
        }
        else {
            res.status(404).send("No message found with id " + req.params.id)
        }
    })
})

//Delete a message
router.delete("/:id", function(req, res, next) {

    db.deleteMessage(req.params.id)
        .then((count)=>{
            if (count) {
                res.status(200).json('Deleted ' + count + ' message(s)')
            }
            else {
                res.status(404).send("No message found with id " + req.params.id)
            }
        })
});

module.exports = router;
