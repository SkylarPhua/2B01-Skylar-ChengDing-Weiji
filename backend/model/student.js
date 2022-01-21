//------------------------------------
// student.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
const database = require('../database/database')

//------------------------------------
// functions/exports
//------------------------------------
module.exports = {

    // Endpoint 1
    getStudentList: function (callback) {
        const query = `SELECT userid, name, email, edu_lvl FROM usertb WHERE usertype = $1`

        return database
            .query(query, ['student'])
            .then(function (results) {
                //const result = "Hello"
                console.log("This is the result " + JSON.stringify(results))
                return callback(null, results.rows);
            })
            .catch(function (error) {
                console.log("This  is the error: " + error)
                return callback(error, null);
            })
    },

    // Endpoint 2
        addStudent: function (name, email, usertype, hash, edu_lvl, callback) {
            console.log(name, email, usertype, hash, edu_lvl)
        const query = `INSERT INTO usertb (name, email, usertype, password, edu_lvl) VALUES ($1, $2, $3, $4, $5)`;

        return database
            .query(query, [name, email, usertype, hash, edu_lvl])
            .then(function (result) {
                console.log("This is the result" + result);
                return callback(null, result);
            })
            .catch(function (error) {
                console.log("This is the error" + error)
                return callback(error, null);
            })
    },

    // Endpoint 3
    editStudent: function (userid, user, callback) {
        const query = `UPDATE usertb SET name = $1, email = $2, password = $3 WHERE userid = $4`;

        return database
            .query(query, [user.name, user.email, user.password, userid])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("The result of wrong id" + JSON.stringify(result));
                    return callback({ code: "user_not_found" }, null);
                } else if (result.rowCount == 1) {
                    console.log("This is the result: " + JSON.stringify(result));
                    return callback(null, result);
                } else {
                    console.log("The error is unknown")
                    return callback({ code: "unknown_error" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error: " + error);
                return callback(error, null);
            })
    },

    // Endpoint 4
    removeStudent: function (userid, callback) {
        const query = `DELETE FROM usertb WHERE userid = $1`

        return database
            .query(query, [userid])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("No such id");
                    return callback({ code: "user_not_found" }, null);
                } else if (result.rowCount == 1) {
                    console.log("This is the result: " + JSON.stringify(result));
                    return callback(null, result);
                } else {
                    console.log("The error is unknown");
                    return callback({ code: "unknown_error" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error: " + error);
                return callback(error, null);
            })
    },
}