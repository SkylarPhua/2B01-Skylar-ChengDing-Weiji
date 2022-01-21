//------------------------------------
// grade.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
const database = require('../database/database');

//------------------------------------
// functions/exports
//------------------------------------
module.exports = {

    // Endpoint 1 (This insert marks for article)
    insertMarks: function (userid, articleid, grade, callback) {
        const query = `INSERT INTO grade (fk_userid, fk_articleid, grade) VALUES ($1, $2, $3)`;
        
        return database
            .query(query, [userid, articleid, grade])
            .then(function (result) {
                console.log("This is the result" + result);
                return callback(null, result);
            })
            .catch(function (error) {
                console.log("This is the error (addArticleByID): " + error);
                return callback(error, null);
            })
    },

    // Endpoint 2 (This update the marks for article)
    updateMarks: function (grade, articleid, callback) {
        const query = `UPDATE grade SET grade = $1 where fk_articleid = $2`

        return database
            .query(query, [grade, articleid])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("No update made");
                    return callback({code:"no_update"}, null);
                } else if (result.rowCount == 1) {
                    console.log("This is the result: " + result.rowCount);
                    return callback(null, result);
                } else {
                    console.log("This is the error(updateMarks)");
                    return callback({code:"unknown_error"}, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error: " + error);
                return callback(error, null);
            })
    },
    
}