var express = require("express");
var router = express.Router();

var {mongoose, db, Teacher} = require('../database');

router.get("/", function(req, res, next) {
    console.log("successfully logged in")
    res.send("success")
});

router.post("/", function(req, res, next) {
    console.log("Logged in '" + req.body.email + "' with password '" + req.body.password + "'");
    const query  = Teacher.where({ email: req.body.email, password: req.body.password });
    query.findOne(function (err, teacher) {
        if (err) return handleError(err);
        if (teacher) {
            res.send("success")
        }
        else {
            res.send("failure");
        }
    });
    
});

module.exports = router;