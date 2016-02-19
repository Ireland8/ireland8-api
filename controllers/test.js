var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/test', function (req, res) {
    request('http://www.google.com', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
            res.json(body)
        }
    })
})
module.exports = router;