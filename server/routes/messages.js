var express = require("express");
var router = express.Router();

var db = require('../DatabaseAccesser');

router.get("/:id", function(req, res, next) {
    db.getMessageByID(req.params.id)
    .then((message)=>{
        if (message){
            res.status(200).json(message)
        }
        else {
            res.status(404)
        }
    })
});

//Send a message
router.post("/", function(req, res, next) {
    db.createMessage(req.body.contents, req.body.senderID, req.body.groupID)
        .then((message)=>{
            if (message){
                res.status.json(200).json(message)
            }
            else {
                res.status(300)
            }
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
    db.deleteMessage(req.params.id)
        .then((count)=>{
            if (count) {
                res.status(200).json('Deleted ' + count + ' message(s)')
            }
            else {
                res.status(404)
            }
        })
});

module.exports = router;
