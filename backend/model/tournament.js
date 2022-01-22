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
        const InsertQuery = `INSERT INTO tournament (fk_userID, fk_tournament_type) VALUES ($1, $2)`
        const SelectQuery = `SELECT group_type FROM tournament_type WHERE tournament_typeid = $1`
        const UpdateQuery = `UPDATE usertb SET grouptype = $1 WHERE userID = $2`

        database.query(`BEGIN`)
        database.query(InsertQuery, [studentID, tournamentType])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("The studentID already exist in the group");
                    database.query(`ROLLBACK`)
                    return callback({ code: "studentExists" }, null);
                } else {
                    database.query(SelectQuery, [tournamentType])
                        .then(function (result) {
                            if (result.rows.length == 0) {
                                database.query(`ROLLBACK`)
                                return callback({ code: "noGroupType" }, null);
                            } else {
                                groupType = result.rows[0].group_type;
                                console.log("groupType: " + groupType);
                                database.query(UpdateQuery, [groupType, studentID])
                                    .then(function (result) {
                                        if (result.rowCount == 0) {
                                            database.query(`ROLLBACK`)
                                            return callback({ code: "noUpdate" }, null);
                                        } else {
                                            database.query(`COMMIT`)
                                            return callback(null, result)
                                        }
                                    })
                            }
                        })
                }
            })
            .catch(function (error) {
                console.log("This is the error for addStudentToGroup in tournament.js " + error);
                // database.query(`ROLLBACK`)
                return callback(error, null);
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
        async function deleteStudentFromGroup(tournamentID) {
            let result;
            try {
                result = await database.query(`DELETE FROM tournament WHERE tournamentID = $1`, [tournamentID])
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noSuchEntry" };
            }
        }

        const DEFAULT_GROUP_TYPE = 'qualifying_round';
        async function getLastestGroupTypeOrDefault(studentID, client) {
            let result;
            try {
                const SelectLatestQuery = `SELECT tt.group_type FROM tournament AS t FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid WHERE t.fk_userid = $1 ORDER BY tournamentid DESC LIMIT 1`;
                result = await client.query(SelectLatestQuery, [studentID])
            } catch (error) {
                throw {code: "database_error: " + error };
            }

            if (result.rows.length == 0) {
                return DEFAULT_GROUP_TYPE;
            }
            return result.rows[0].group_type
        }

        async function updateGroup(studentID, groupType) {
            let result;
            try {
                result = await database.query(`UPDATE usertb SET grouptype = $1 WHERE userid = $2`, [groupType, studentID])
            } catch (error) {
                throw { code: 'database_error:' + error };
            }
        
            if (result.rowCount == 0) {
                throw { code: 'noUpdate' };
            }
            return result;
        }

        database.transaction(async (client) => {
            await deleteStudentFromGroup(tournamentID);
            const groupType = await getLastestGroupTypeOrDefault(studentID, client);
            let result = await updateGroup(studentID, groupType);
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
    }
}