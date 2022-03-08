var express = require("express");
var router = express.Router();

var mongoose = require('./database');

router.get("/", function(req, res, next) {
    console.log("successfully logged in")
    res.send("success")
});

router.post("/", function(req, res, next) {
    console.log("Logged in '" + req.body.email + "' with password '" + req.body.password + "'");
    const query  = Kitten.where({ color: 'white' });
    query.findOne(function (err, kitten) {
        if (err) return handleError(err);
        if (kitten) {
            // doc may be null if no document matched
        }
    });
    res.send("success")
});

module.exports = router;