//------------------------------------
// login.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
const database = require('../database/database');
var config = require('../config.js');
var jwt = require('jsonwebtoken');

//------------------------------------
// functions/exports
//------------------------------------

module.exports = {

    // Endpoint 1
    loginUser: function (email, callback) { 
        const query = `SELECT userid, name, email, usertype, password, grouptype FROM usertb WHERE email = $1`;

        return database
            .query(query, [email])
            .then(function (result) {
                if (result.rows.length == 0) {
                    console.log("The result of wrong email/password");
                    return callback({ code: "wrong_cred" }, null);
                } else if (result.rows.length == 1) {
                    console.log("This is the result (login.js): " + JSON.stringify(result));
                    console.log("----------------------------------------------------------");
                    console.log("See here This is the result row: " + JSON.stringify(result.rows))
                    //console.log("This is the rows.userid: " + JSON.stringify(result.rows.userid));
                    return callback(null, result.rows);

                } else {
                    console.log("Unknown error");
                    return callback({code:"unknown_error"}, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error: " + error);
                return callback(error, null);
            })
    },
}