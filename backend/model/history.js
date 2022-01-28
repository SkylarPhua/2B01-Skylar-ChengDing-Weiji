const database = require('../database/database')

module.exports = {
    // Endpoint 1: get all articles belonging to specific user
    getArticleByUserID: function (userid, callback) {
        const query = `SELECT historyid, tournament_type, title, content, marks, submitted_at FROM history WHERE fk_userid = $1`
        return database
            .query(query, [userid])
            .then(function (result) {
                console.log(result.rows.length);
                if (result.rows.length == 0) {
                    return callback({ code: "emptyEntry" }, null);
                } else if (result.rows.length = 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error for getArticleByUserID in history.js " + error);
                return callback(error, null);
            })
    },

}