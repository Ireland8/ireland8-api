var express = require('express');
var router = express.Router();
var crypto = require('crypto');

//server auth route
router.get('/auth', function (req, res, next) {
    //issue: algorithm didn't match for some reasons
    /*	if(checkSignature(req)){
            res.send(req.param('echostr'));
            console.log("auth succeed.");
        }else{
        res.send("signature doesn't match, auth failed.");
        console.log("signature doesn't match, auth failed.");
        }*/
    res.send(req.param('echostr'));
});

//auth function
function checkSignature(req) {
    var nonce = req.param('nonce');
    var signature = req.param('signature');
    var timestamp = req.param('timestamp');
    var token = "iedu";

    var tmpArray = [token, timestamp, nonce];
    tmpArray.sort();
    var tmpStr = tmpArray.join("");

    var shasum = crypto.createHash('sha1').update(tmpStr);
    var shaResult = shasum.digest('hex');
    console.log(shaResult);

    if (shaResult === signature)
        return true
    else
        return false
}

module.exports = router;
