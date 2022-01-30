const config = require('../config');
const jwt = require('jsonwebtoken');
const verifynFn = {
    verifyUserRole: function (req, res, next) {
        console.log('http header - user ', req.headers['user']);
        if (typeof req.headers.authorization !== "undefined") {
            let token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, config.key, (err, data) => {
                console.log('data extracted from token \n',data);
                if (err) {
                    console.log(err);
                    return res.status(403).send({ message: 'Unauthorized access' });
                }
                else {
                    req.body.userId = data.id;
                    next();
                }
            })
  
      }else{
        res.status(403).send({ message: 'Unauthorized access' });

      }
    },

    verifyUserLoggedIn: function (req, res, next) {
        console.log('http header - user ', req.headers['user']);
        req.body.userid = req.headers['user'];
        console.log('Inspect user id which is planted inside the request header : ', req.body.userid);
        if (req.body.userid != null) {
            next()
            return;
        } else {
            res.status(403).json({ message: 'Unauthorized access' });
            return;
        }
    },
    
}
module.exports = verifynFn;