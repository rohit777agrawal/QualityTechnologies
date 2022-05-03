var express = require("express");
var router = express.Router();

var {mongoose, db, Message, User} = require('../database');

router.get("/:id", function(req, res, next) {
    Message.findById(req.params.id, function(err, message){
        res.json(message);
    });
});

//Send a message
router.post("/", function(req, res, next) {
    var message = new Message({
        sender: req.body.sender,
        recipients: req.body.recipients,
        contents: req.body.contents,
        sentTime: new Date()
    })
    message.save()
        .then(message => {
            message.recipients.forEach((recipient) =>{
                console.log(recipient);
                var query = User.findById(recipient, function(err, user){
                    user.messageIds.push(message._id);
                    user.save();
                });
            });
            res.status(201).json(message);
        })
        .catch(err => {
            res.status(400).send("Message send failed");
        })
});
//Delete a message
router.delete("/:id", function(req, res, next) {
    Message.findByIdAndDelete(req.params.id, function(err, message){
        message.recipients.forEach((recipient) => {
            User.findById(recipient, function(err, user){
                var index = user.messageIds.indexOf(req.params.id);
                if(index > -1){
                    user.messageIds.splice(index, 1);
                }
                user.save();
            });
        });
        res.status(204);
    });
});

module.exports = router;
