const { json } = require("express");
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

router.get("/active", function(req, res, next) {
    User.find({active: true}, (err, users)=>{
        if (err){
            res.status(500).json(err);
        }
        else if (users){
            res.status(200).json(users)
        }
        else {
            res.status(404).json("no users found")
        }
    })
});

router.get("/:id", function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        res.json(user);
    });
});



router.post("/login", function(req, res, next) {
    const filter  = { email: req.body.email, password: req.body.password }
    User.findOneAndUpdate( filter, { $set: {active: true}}, {"new": true}, (err, user)=>{
        if (err) {
            console.log(err)
            res.status(500).json({"error": JSON.stringify(err)})
        }
        else if (user){
            res.status(202).json({text: "success"})
        }
        else {
            res.status(404).json({text: "failure"})
        }
    });
});

router.put("/:id", function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        //console.log(user);
        Object.assign(user, req.params.body);
        user.save();
    })
})

module.exports = router;
