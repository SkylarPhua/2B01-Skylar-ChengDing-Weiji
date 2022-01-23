//------------------------------------
// student.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
const { query } = require('express');
const { json } = require('express/lib/response');
const { mutateExecOptions } = require('nodemon/lib/config/load');
const database = require('../database/database')

//------------------------------------
// functions/exports
//------------------------------------
module.exports = {

    // Endpoint 1: 
    getGroupByNum: function (tournamentType, callback) {
        const query = `SELECT u.name, u.email, u.edu_lvl, c.name, t.title, t.articlecontent, t.marks, tt.group_type FROM (((tournament AS t FULL OUTER JOIN usertb AS u ON t.fk_userID = u.userID) RIGHT OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) RIGHT OUTER JOIN category AS c ON tt.fk_categoryid = c.catid) WHERE fk_tournament_type = $1`

        return database
            .query(query, [tournamentType])
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "emptyGroup" }, null);
                } else if (result.rows.length == 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error for getGroupByNum in tournament.js " + error);
                return callback(error, null);
            })
    },

    // Endpoint 2:
    addStudentToGroup: function (studentID, tournamentType, callback) {
        async function addStudentToTournament(studentID, tournamentType, dbClient) {
            let result;
            try {
                result = await dbClient.query(`INSERT INTO tournament (fk_userID, fk_tournament_type) VALUES ($1, $2)`, [studentID, tournamentType])
            } catch (error) {
                throw { code: "database_error: " + error };
            }
    
            if (result.rowCount == 0) {
                throw { code: "studentExists" };
            }
        }
    
        async function getGroupTypeInTournamentType(tournamentType, dbClient) {
            let result;
            try {
                result = await dbClient.query(`SELECT group_type FROM tournament_type WHERE tournament_typeid = $1`, [tournamentType])
                console.log("This is group Type: " + JSON.stringify(result));
            } catch (error) {
                throw { code: "database_error: " + error };
            }
    
            if (result.rows.length == 0) {
                throw { code: "noGroupType" };
            }
            return result.rows[0].group_type;
        }
    
        async function updateUsersGroupType(groupType, studentID, dbClient) {
            let result;
            try {
                result = await dbClient.query(`UPDATE usertb SET grouptype = $1 WHERE userID = $2`, [groupType, studentID])
            } catch (error) {
                throw { code: "database_error: " + error };
            }
    
            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
            return result;
        }
    
        database.transaction(async (dbClient) => {
            await addStudentToTournament(studentID, tournamentType, dbClient);
            const groupType = await getGroupTypeInTournamentType(tournamentType, dbClient);
            console.log("Group Type: " + groupType);
            let result = await updateUsersGroupType(groupType, studentID, dbClient);
            console.log("This is the result in tournament.js: " + JSON.stringify(result));
            console.log("--------> " + result);
            return result;
        })
        .then(function (result) {
            return callback(null, result);
        })
        .catch(function (err) {
            return callback({ code: err.code }, null);
        })
    },

    // Endpoint 3: (This is to post the article initially and also to edit the article)
    editArticleToTournament: function (tournamentID, title, content, callback) {
        const query = `UPDATE tournament SET title = $1, articleContent = $2 WHERE tournamentID = $3`;

        return database
            .query(query, [title, content, tournamentID])
            .then(function (result) {
                if (result.rowCount == 0) {
                    return callback({ code: "noUpdate" }, null);
                } else if (result.rowCount == 1) {
                    return callback(null, result);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    // Endpoint 4: Admin to mark the article (its post and edit)
    editArticleMarks: function (marks, tournamentID, callback) {
        const query = `UPDATE tournament SET marks = $1 WHERE tournamentID = $2`

        return database
            .query(query, [marks, tournamentID])
            .then(function (result) {
                if (result.rowCount == 0) {
                    return callback({ code: "noUpdate" }, null);
                } else if (result.rowCount == 1) {
                    return callback(null, result);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error: " + error);
                return callback(error, null);
            })
    },

    // Endpoint 5: for admin to delete user from tournament and edit the usertb grouptype column to empty 
    deleteStudentEntry: function (studentID, tournamentID, callback) {
        async function deleteStudentFromGroup(tournamentID, dbClient) {
            let result;
            try {
                result = await dbClient.query(`DELETE FROM tournament WHERE tournamentID = $1`, [tournamentID])
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noSuchEntry" };
            }
        }

        const DEFAULT_GROUP_TYPE = 'qualifying_round';
        async function getLastestGroupTypeOrDefault(studentID, dbClient) {
            let result;
            try {
                const SelectLatestQuery = `SELECT tt.group_type FROM tournament AS t FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid WHERE t.fk_userid = $1 ORDER BY tournamentid DESC LIMIT 1`;
                result = await dbClient.query(SelectLatestQuery, [studentID])
            } catch (error) {
                throw {code: "database_error: " + error };
            }

            if (result.rows.length == 0) {
                return DEFAULT_GROUP_TYPE;
            }
            return result.rows[0].group_type
        }

        async function updateGroup(studentID, groupType, dbClient) {
            let result;
            try {
                result = await dbClient.query(`UPDATE usertb SET grouptype = $1 WHERE userid = $2`, [groupType, studentID])
            } catch (error) {
                throw { code: 'database_error:' + error };
            }
        
            if (result.rowCount == 0) {
                throw { code: 'noUpdate' };
            }
            return result;
        }

        database.transaction(async (dbClient) => {
            await deleteStudentFromGroup(tournamentID, dbClient);
            const groupType = await getLastestGroupTypeOrDefault(studentID, dbClient);
            let result = await updateGroup(studentID, groupType, dbClient);
            console.log("This is the result in tournament.js: " + JSON.stringify(result));
            console.log("--------> " + result);
            return result;
        })
        .then(function (result) {
            return callback(null, result);
        })
        .catch(function (err) {
            return callback({ code: err.code }, null);
        })
    },

    // Endpoint 6: for student to get their article by their id and group type
    getStudentArticle: function (studentID, groupType, callback) {
        const query = `WITH count AS 
        (SELECT tournamentID, UNNEST(STRING_TO_ARRAY(REGEXP_REPLACE(articlecontent,  '[^\\w\\s]', '', 'g'), ' ')) AS word, articlecontent FROM tournament AS t FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid WHERE fk_userid = $1 AND tt.group_type = $2)
        SELECT u.name AS username, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, COUNT(count.word)
        FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userid) FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryid = c.catid), count 
        WHERE u.userid = $3 AND tt.group_type = $4
        GROUP BY u.name, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks
        `;

        return database
            .query(query, [studentID, groupType, studentID, groupType])
            .then(function(result) {
                if (result.rows.length == 0) {
                    return callback({ code: "noSuchArticle"}, null);
                } else if (result.rows.length == 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null)
            })
    },

    // Endpoint 7: This is the article deletion for student (Just an PUT function)
    
}