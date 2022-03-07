var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
    console.log("successfully logged in")
    res.send("success")
});

router.post("/", function(req, res, next) {
    console.log("Logged in '" + req.body.email + "' with password '" + req.body.password + "'");
    res.send("success")
});

module.exports = router;