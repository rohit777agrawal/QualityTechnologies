var express = require("express");
var router = express.Router();

var {mongoose, db, Teacher} = require('../database');

router.get("/:id", function(req, res, next) {
    Teacher.findById(req.params.id, function(err, teacher) {
        res.json(teacher);
    });
});

router.post("/", function(req, res, next) {
    const query  = Teacher.where({ email: req.body.email, password: req.body.password });
    query.findOne(function (err, teacher) {
        if (err) return handleError(err);
        if (teacher) {
            res.json({text: "success", _id: teacher._id})
            console.log("Found user '" + req.body.email + "' with password '" + req.body.password + "'");
        }
        else {
            res.json({text:"failure"});
            console.log("User " + req.body.email + " with password " + req.body.password + " does not exist")
        }
    });

});

module.exports = router;
