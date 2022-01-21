//------------------------------------
// category.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
const database = require('../database/database');

//------------------------------------
// functions/exports
//------------------------------------
module.exports = {

    // Endpoint 1 ( Search article by category)
    getArticleByCat: function (catName, callback) {

        const query = `SELECT c.name, u.name AS username, u.email, a.title, a.submitted_at, g.grade, g.marked_at 
        FROM ((usertb AS u INNER JOIN article AS a ON u.userid = a.fk_userid) FULL OUTER JOIN grade AS g ON g.fk_articleid = a.articleid), category AS c 
        WHERE c.name = $1`;
      
        return database
            .query(query, [catName])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("There is no rows" + JSON.stringify(result));
                    return callback({ code: "no_article" }, null);
                } else if (result.rows.length == 1) {
                    console.log("This is working");
                    return callback(null, result.rows);
                } else {
                    console.log("The error is unknown");
                    return callback({ code: "unknown_error" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error" + error);
                return callback(error, null);
            })
    }

}