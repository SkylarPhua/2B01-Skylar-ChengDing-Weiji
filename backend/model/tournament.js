//------------------------------------
// student.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
// const { query } = require('express');
// const { json } = require('express/lib/response');
// const { mutateExecOptions } = require('nodemon/lib/config/load');
const database = require('../database/database')
var lexrank = require('lexrank');

//------------------------------------
// functions/exports
//------------------------------------
module.exports = {

    // Endpoint 1: 
    getGroupByType: function (groupType, callback) {
        const query = `SELECT u.userid, u.name AS username, u.email, u.edu_lvl, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, tt.group_type, tt.group_type_display
        FROM (((tournament AS t FULL OUTER JOIN usertb AS u ON t.fk_userID = u.userID) 
        RIGHT OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) 
        RIGHT OUTER JOIN category AS c ON tt.fk_categoryid = c.catid) 
        WHERE tt.group_type = $1 and tournamentid IS NOT NULL`

        return database
            .query(query, [groupType])
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "emptyGroup" }, null);
                } else if (result.rows.length >= 1) {
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
    editArticleToTournament: function (studentID, groupType, title, content, callback) {
        async function getTournamentID(studentID, groupType, dbClient) {
            let result;
            try {
                result = await dbClient.query(`SELECT t.tournamentid, t.fk_userid, articlecontent FROM tournament AS t FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid WHERE t.fk_userid = $1 AND tt.group_type = $2`, [studentID, groupType])
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rows.length == 0) {
                throw { code: "noSuchEntry" };
            }
            return result.rows[0];
        }

        async function editArticle(tournamentID, title, content, datetime, dbClient) {
            let result;
            try {
                console.log("tournamentID: " + tournamentID);
                result = await dbClient.query(`UPDATE tournament SET title = $1, articleContent = $2, submitted_at = $3 WHERE tournamentID = $4`, [title, content, datetime, tournamentID]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
        }

        async function addArticleToHistory(studentID, groupType, title, content, datetime, dbClient) {
            let result;
            try {
                result = await dbClient.query(`INSERT INTO history (fk_userid, tournament_type, title, content, submitted_at) VALUES ($1, $2, $3, $4, $5)`,
                    [studentID, groupType, title, content, datetime]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
            return result;
        }

        async function editArticleToHistory(studentID, title, content, datetime, groupType, dbClient) {
            let result;
            try {
                result = await dbClient.query(`UPDATE history SET title = $1 , content = $2, submitted_at = $3 WHERE fk_userid = $4 AND tournament_type = $5`,
                    [title, content, datetime, studentID, groupType]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
            return result;
        }

        database.transaction(async (dbClient) => {
            var currentdate = new Date();
            var datetime = ("0" + currentdate.getDate()).slice(-2) + "-"
                + ("0" + (currentdate.getMonth() + 1)).slice(-2) + "-"
                + currentdate.getFullYear() + " "
                + ("0" + currentdate.getHours()).slice(-2) + ":"
                + ("0" + currentdate.getMinutes()).slice(-2) + ":"
                + ("0" + currentdate.getSeconds()).slice(-2);

            console.log("This is the datetime: " + datetime);
            const info = await getTournamentID(studentID, groupType, dbClient);
            await editArticle(info.tournamentid, title, content, datetime, dbClient);
            var result;
            if (info.articlecontent == null) {
                result = await addArticleToHistory(studentID, groupType, title, content, datetime, dbClient);
            } else {
                result = await editArticleToHistory(studentID, title, content, datetime, groupType, dbClient);
            }
            return result;
        })
            .then(function (result) {
                return callback(null, result);
            })
            .catch(function (err) {
                return callback({ code: err.code }, null);
            })
    },

    // Endpoint 4: Admin to mark the article (its post and edit) 
    editArticleMarks: function (marks, tournamentID, callback) {
        async function getInfo(tournamentID, dbClient) {
            let result;
            try {
                result = await dbClient.query(`SELECT fk_userid, group_type FROM tournament INNER JOIN tournament_type ON fk_tournament_type = tournament_typeid WHERE tournamentid = $1`,
                    [tournamentID])
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rows.length == 0) {
                throw { code: "noSuchEntry" };
            }
            return result.rows[0];
        }

        async function editArticleMarks(marks, datetime, tournamentID, dbClient) {
            let result;
            try {
                result = await dbClient.query(`UPDATE tournament SET marks = $1, graded_at = $2 WHERE tournamentid = $3`,
                    [marks, datetime, tournamentID]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
        }

        async function editMarksToHistory(marks, userid, groupType, dbClient) {
            let result;
            try {
                result = await dbClient.query(`UPDATE history SET marks = $1 WHERE fk_userid = $2 AND tournament_type = $3`,
                    [marks, userid, groupType]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
            return result;
        }

        database.transaction(async (dbClient) => {
            var currentdate = new Date();
            var datetime = ("0" + currentdate.getDate()).slice(-2) + "-"
                + ("0" + (currentdate.getMonth() + 1)).slice(-2) + "-"
                + currentdate.getFullYear() + " "
                + ("0" + currentdate.getHours()).slice(-2) + ":"
                + ("0" + currentdate.getMinutes()).slice(-2) + ":"
                + ("0" + currentdate.getSeconds()).slice(-2);
            const info = await getInfo(tournamentID, dbClient);
            await editArticleMarks(marks, datetime, tournamentID, dbClient);
            let result = await editMarksToHistory(marks, info.fk_userid, info.group_type, dbClient);
            return result;
        })
            .then(function (result) {
                return callback(null, result);
            })
            .catch(function (err) {
                return callback({ code: err.code }, null);
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
                throw { code: "database_error: " + error };
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
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
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
        SELECT u.name AS username, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.graded_at, COUNT(count.word)
        FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userid) FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryid = c.catid), count 
        WHERE u.userid = $3 AND tt.group_type = $4
        GROUP BY u.name, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.graded_at
        `;

        return database
            .query(query, [studentID, groupType, studentID, groupType])
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "noSuchArticle" }, null);
                } else if (result.rows.length == 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    // Endpoint 7: This is the article deletion for student (Just an PUT function)
    deleteStudentArticle: function (studentID, tournamentID, callback) {
        async function getTournamentTypeID(tournamentID, dbClient) {
            let result;
            try {
                result = await dbClient.query(`SELECT fk_tournament_type FROM tournament WHERE tournamentid = $1`, [tournamentID]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rows.length == 0) {
                throw { code: "noType" };
            }
            return result.rows[0].fk_tournament_type;
        }

        async function deleteStudentEntry(tournamentID, dbClient) {
            let result;
            try {
                result = await dbClient.query(`DELETE FROM tournament WHERE tournamentid = $1`, [tournamentID]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noSuchEntry" };
            }
        }

        async function createNewStudentEntry(tournamentID, studentID, tournamentTypeID, dbClient) {
            let result;
            try {
                result = await dbClient.query(`INSERT INTO tournament (tournamentid, fk_userID, fk_tournament_type) VALUES ($1, $2, $3)`, [tournamentID, studentID, tournamentTypeID]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "studentEntryExists" };
            }
            return result;
        }

        database.transaction(async (dbClient) => {
            const tournamentTypeID = await getTournamentTypeID(tournamentID, dbClient);
            console.log("tournamentTypeID: " + tournamentTypeID);
            await deleteStudentEntry(tournamentID, dbClient);
            let result = await createNewStudentEntry(tournamentID, studentID, tournamentTypeID, dbClient);
            console.log("--------> " + JSON.stringify(result));
            return result;
        })
            .then(function (result) {
                return callback(null, result);
            })
            .catch(function (err) {
                console.log("THIS IS THE ERROR: " + JSON.stringify(err));
                return callback({ code: err.code }, null);
            })
    },

    // Endpoint 8: This is to get all tournament aritcles by everyone and every stage (Admin A_tournament.html)
    getAllArticlesInTournament: function (callback) {
        const query = `SELECT userid, t.tournamentID, u.name AS username, u.email, u.edu_lvl, t.title, c.name AS catName, t.marks, t.submitted_at, t.graded_at, tt.group_type_display, t.fk_tournament_type
    FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userID) FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryID = c.catid)
    WHERE t.tournamentID IS NOT NULL
    GROUP BY userid, t.tournamentID, u.name, u.email, u.edu_lvl, t.title, c.name, t.marks, t.submitted_at, t.graded_at, tt.group_type_display, t.fk_tournament_type
    ORDER BY fk_tournament_type ASC`;

        return database
            .query(query)
            .then(function (result) {
                console.log("This is the result: " + JSON.stringify(result));
                if (result.rows.length == 0) {
                    return callback({ code: "no_articles" }, null);
                } else if (result.rows.length >= 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error" + error);
                return callback(error, null);
            })
    },

    // Endpoint 9: Get specific articles using tournamentID, used by admin
    getArticleByTournamentID: function (tournamentID, callback) {
        const query = `WITH count AS 
        (SELECT tournamentID, UNNEST(STRING_TO_ARRAY(REGEXP_REPLACE(articlecontent,  '[^\\w\\s]', '', 'g'), ' ')) AS word, articlecontent FROM tournament AS t FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid WHERE t.tournamentid = $1)
        SELECT u.name AS username, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.graded_at, tt.group_type_display, COUNT(count.word)
        FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userid) FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryid = c.catid), count 
        WHERE t.tournamentid = $2
        GROUP BY u.name, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.graded_at, tt.group_type_display`;

        return database
            .query(query, [tournamentID, tournamentID])
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "noSuchArticle" }, null);
                } else if (result.rows.length == 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    // Endpoint 10: Get summarized version of an article in the tournament using tournamentID
    getSummarisedTournamentArticle: function (tournamentID, callback) {
        var summary;
        var info = "";
        var results;
        var length;
        const query = `WITH count AS 
        (SELECT tournamentID, UNNEST(STRING_TO_ARRAY(REGEXP_REPLACE(articlecontent,  '[^\\w\\s]', '', 'g'), ' ')) AS word, articlecontent FROM tournament AS t FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid WHERE t.tournamentid = $1)
        SELECT u.name AS username, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.graded_at, tt.group_type_display, COUNT(count.word)
        FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userid) FULL OUTER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryid = c.catid), count 
        WHERE t.tournamentid = $2
        GROUP BY u.name, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.graded_at, tt.group_type_display`;

        return database
            .query(query, [tournamentID, tournamentID])
            .then(function (result) {
                summary = result.rows[0].articlecontent;

                var Summarised = lexrank.summarize(summary, 5, function (err, summarised, summary) {
                    if (err) {
                        console.log(err);
                    } else {
                        for (var i = 0; i < summarised.length; i++) {
                            info += summarised[i].text;
                        }
                    }
                });
                results = result.rows.push({ information: info });
                console.log("this is the results######: " + JSON.stringify(results));
                length = result.rows.push({ length: info.length });
                return callback(null, result.rows);
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    // Endpoint: This is just to get category for the tournament by group type
    getCategoryByGroupType: function (groupType, callback) {
        const query = `SELECT c.name FROM tournament_type AS tt INNER JOIN category AS c ON tt.fk_categoryid = c.catid WHERE tt.group_type = $1`;

        console.log(groupType);
        return database
            .query(query, [groupType])
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "noSuchGroup" }, null);
                } else if (result.rows.length == 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    // Endpoint 12: This is for leaderboard, get by the last four people (loser of group stage)
    getLeaderboardLastFour: function (callback) {
        const query = `
        SELECT u.userid, u.name AS username, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.marks, tt.group_type, tt.group_type_display
        FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userid) INNER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryid = c.catid)
        WHERE tt.group_type IN ('group_one', 'group_two', 'group_three', 'group_four')
        ORDER BY marks ASC
        LIMIT 4
        `;

        return database
            .query(query)
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "noSuchGroup" }, null);
                } else if (result.rows.length >= 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    // Endpoint 13: This is for leaderboard, get the loser of semi-finals
    getLeaderboardSecondLast: function (callback) {
        const query = `
        SELECT u.userid, u.name AS username, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.marks, tt.group_type, tt.group_type_display
        FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userid) INNER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryid = c.catid)
        WHERE tt.group_type IN ('semi_final_one', 'semi_final_two')
        ORDER BY marks ASC
        LIMIT 2
        `;

        return database
            .query(query)
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "noSuchGroup" }, null);
                } else if (result.rows.length >= 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    // Endpoint 14: This is for leaderboard, get the top 2
    getLeaderboardTopTwo: function (callback) {
        const query = `
        SELECT u.userid, u.name AS username, u.email, c.name, t.tournamentid, t.title, t.articlecontent, t.marks, t.submitted_at, t.marks, tt.group_type, tt.group_type_display
        FROM (((usertb AS u INNER JOIN tournament AS t ON u.userid = t.fk_userid) INNER JOIN tournament_type AS tt ON t.fk_tournament_type = tt.tournament_typeid) INNER JOIN category AS c ON tt.fk_categoryid = c.catid)
        WHERE tt.group_type = 'final'
        ORDER BY marks DESC
        LIMIT 2
        `;

        return database
            .query(query)
            .then(function (result) {
                if (result.rows.length == 0) {
                    return callback({ code: "noSuchGroup" }, null);
                } else if (result.rows.length >= 1) {
                    return callback(null, result.rows);
                } else {
                    return callback({ code: "unknownError" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    }
}