var express = require("express");
var router = express.Router();

var {mongoose, db, Teacher} = require('../database');

router.get("/", function(req, res, next) {
    console.log("successfully logged in")
    res.send("success")
});

router.post("/", function(req, res, next) {
    
    const query  = Teacher.where({ email: req.body.email, password: req.body.password });
    query.findOne(function (err, teacher) {
        if (err) return handleError(err);
        if (teacher) {
            res.send("success")
            console.log("Found user '" + req.body.email + "' with password '" + req.body.password + "'");
        }
        else {
            res.send("failure");
            console.log("User " + req.body.email + " with password " + req.body.password + " does not exist")
        }
    });
    
});

module.exports = router;