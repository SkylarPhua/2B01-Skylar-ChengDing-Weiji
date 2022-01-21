//----------------------------------------------------
// verifyToken.js
//----------------------------------------------------

//----------------------------------------------------
// imports
//----------------------------------------------------
var jwt = require('jsonwebtoken');
var config = require('../config');

//----------------------------------------------------
// functions
//----------------------------------------------------
function verifyToken(req, res, next) {
    console.log("This is the req.header: " + JSON.stringify(req.headers));
    
    var token = req.headers['authorization'];
    console.log("This is the token: " + token);

    if (!token || !token.includes('Bearer')) { //process the token
        res.status(403);
        console.log("Error is here 1");
        return res.send({ auth: 'false', message: 'Not authorized!' });
    } else {
        token = token.split('Bearer ')[1]; //obtain the token’s value
        console.log("This is the token 2: " + token);
        jwt.verify(token, config.key, function (err, decoded) {//verify token
            if (err) {
                res.status(403);
                console.log("Error is here 2");
                return res.end({ auth: false, message: 'Not authorized!' });
            } else {
                console.log("This is working")
                req.userid = decoded.userid;
                req.usertype = decoded.usertype;
                next();
            }
        });
    }
}

//----------------------------------------------------
// exports
//----------------------------------------------------
module.exports = verifyToken;
