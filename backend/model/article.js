//------------------------------------
// student.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
const database = require('../database/database');
var lexrank = require('lexrank');
//------------------------------------
// functions/exports
//------------------------------------
module.exports = {

    // Endpoint 1 (This is just a general name list without article but have grade and stuff)
    getArticleList: function (callback) {
        const query = `SELECT usertb.userid, usertb.name, usertb.email, category.name AS catName, usertb.edu_lvl, article.articleid, article.title, article.submitted_at, grade.grade, grade.marked_at 
        FROM (((usertb INNER JOIN article ON usertb.userid = article.fk_userid) FULL OUTER JOIN grade ON article.articleid = grade.fk_articleid) INNER JOIN category ON article.fk_categoryid = category.catid)`

        return database
            .query(query)
            .then(function (results) {
                console.log("This is the result " + JSON.stringify(results.rows));
                return callback(null, results.rows);
            })
            .catch(function (error) {
                console.log("This is the error (getArticleList): " + error);
                return callback(error, null);
            })
    },

    getStudentArticle: function (userid, callback) {
        const query = `SELECT category.name, category.description, article.title, article.content 
        FROM (article INNER JOIN category ON article.fk_categoryid = category.catid) 
        WHERE article.fk_userID = $1`;

        return database
            .query(query, [userid])
            .then(function (results) {
                console.log("The artice is : " + JSON.stringify(results));
                return callback(null, results.rows);
            })
            .catch(function (error) {
                console.log("get Student article error : " + error);
                return callback(error, null);
            })
    },


    // Endpoint 2 (This gets the category, article, title, and word count, etc. Can be shared with admin and student)
    getArticleByID: function (userid, callback) {
        console.log(userid);
        const query = `WITH count AS
        (
          SELECT articleid, UNNEST(STRING_TO_ARRAY(
                           REGEXP_REPLACE(content,  '[^\\w\\s]', '', 'g'), ' ')) 
                           AS word, content
          FROM article WHERE fk_userid = $1
        )  
        SELECT usertb.name AS username, usertb.email, usertb.edu_lvl, category.name, article.title, article.content, article.submitted_at, grade.grade, grade.marked_at, COUNT(c.word)
        FROM (((usertb INNER JOIN article ON usertb.userid = article.fk_userid) FULL OUTER JOIN grade ON article.articleid = grade.fk_articleid) INNER JOIN category ON article.fk_categoryid = category.catid), count as c
        WHERE usertb.userid = $2
        GROUP BY usertb.name, usertb.email, usertb.edu_lvl, category.name, article.title, article.content, article.submitted_at, grade.grade, grade.marked_at
`;

        return database
            .query(query, [userid, userid])
            .then(function (result) {
                if (result.rows.length == 0) {
                    console.log("This is the result(should be nothing) " + result.rows)
                    return callback({ code: "No_such_article" }, null);
                } else if (result.rows.length == 1) {
                    console.log("This is the result @@@@@@@@ " + JSON.stringify(result.rows));
                    return callback(null, result.rows);
                } else {
                    console.log("Unknown Error");
                    console.log({ code: "unknown_error" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error (getArticleByID) " + error);
                return callback(error, null);
            })
    },

    // Endpoint 3 (This is for students to post their article)
    addArticleByID: function (userid, catid, title, content, callback) {
        // const query = `INSERT INTO article (fk_userid, fk_categoryid, title, content) VALUES ($1, $2, $3, $4)`;

        async function addArticleToArticle(userid, catid, title, content, datetime, dbClient) {
            console.log("ran the 1st");
            console.log(userid);
            let result;
            try {
                result = await dbClient.query(`INSERT INTO article (fk_userid, fk_categoryid, title, content, submitted_at) VALUES ($1, $2, $3, $4, $5)`,
                    [userid, catid, title, content, datetime]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
            console.log("wat abt here?");
        }

        async function addArticleToHistory(userid, groupType, title, content, datetime, dbClient) {
            console.log("ran the 2nd?");
            let result;
            try {
                result = await dbClient.query(`INSERT INTO history (fk_userid, tournament_type, title, content, submitted_at) VALUES ($1, $2, $3, $4, $5)`,
                    [userid, groupType, title, content, datetime]);
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
            var groupType = "qualifying_round";
            console.log("before");
            await addArticleToArticle(userid, catid, title, content, datetime, dbClient);
            console.log("after");
            let result = await addArticleToHistory(userid, groupType, title, content, datetime, dbClient);
            return result;
        })
            .then(function (result) {
                return callback(null, result);
            })
            .catch(function (err) {
                return callback({ code: err.code }, null);
            })
        // return database
        //     .query(query, [userid, catid, title, content])
        //     .then(function (result) {
        //         if (result.rowCount == 0) {
        //             console.log("The result of wrong id" + JSON.stringify(result));
        //             return callback({ code: "too_many_article" }, null);
        //         } else if (result.rowCount == 1) {
        //             console.log("This is the result (addArticleByID): " + JSON.stringify(result));
        //             return callback(null, result);
        //         } else {
        //             console.log("The error is unknown (article.js)");
        //             return callback({ code: "unknown_error" }, null);
        //         }
        //     })
        //     .catch(function (error) {
        //         console.log("This is the error (addArticleByID): " + error);
        //         return callback(error, null);
        //     })
    },

    // Endpoint 4 (lets student to edit their article)
    editArticleByID: function (userid, title, content, callback) {
        // const query = `UPDATE article SET  title = $1, content = $2 WHERE fk_userid = $3`;

        async function editArticleToArticle(studentID, title, content, datetime, dbClient) {
            let result;
            try {
                result = await dbClient.query(`UPDATE article SET title = $1 , content = $2, submitted_at = $3 WHERE fk_userid = $4`,
                    [title, content, datetime, studentID]);
            } catch (error) {
                throw { code: "database_error: " + error };
            }

            if (result.rowCount == 0) {
                throw { code: "noUpdate" };
            }
        }

        async function editArticleToHistory(studentID, title, content, datetime, dbClient) {
            let result;
            try {
                result = await dbClient.query(`UPDATE history SET title = $1 , content = $2, submitted_at = $3 WHERE fk_userid = $4 AND tournament_type = 'qualifying_round'`,
                    [title, content, datetime, studentID]);
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
            await editArticleToArticle(userid, title, content, datetime, dbClient);
            let result = await editArticleToHistory(userid, title, content, datetime, dbClient);
            return result;
        })
            .then(function (result) {
                return callback(null, result);
            })
            .catch(function (err) {
                return callback({ code: err.code }, null);
            })

        // return database
        //     .query(query, [title, content, userid])
        //     .then(function (result) {
        //         if (result.rowCount == 0) {
        //             console.log("No such article");
        //             return callback({ code: "no_article" }, null);
        //         } else if (result.rowCount == 1) {
        //             //console.log("This is the result: " + JSON.stringify(result));
        //             console.log("This is here (article.js)");
        //             return callback(null, result);
        //         } else {
        //             console.log("The error is unknown");
        //             return callback({ code: "unknown_error" }, null);
        //         }
        //     })
        //     .catch(function (error) {
        //         console.log("This is the error: " + error);
        //         return callback(error, null);
        //     })
    },

    // Endpoint 5 (This deletes the article)
    removeArticleByID: function (userid, callback) {
        const query = `DELETE FROM article WHERE fk_userid = $1`;

        return database
            .query(query, [userid])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("There no such article under userid");
                    return callback({ code: "no_article" }, null);
                } else if (result.rowCount == 1) {
                    console.log("The article is deleted (removeArticleByID)");
                    // return callback(null, result);
                    return callback({ code: "deleted" }, null);
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

    // Endpoint 6 (This get student's article by edu_lvl)
    selectArticleByEdu: function (edu, callback) {
        const query = `SELECT u.name AS username, u.email, c.name AS catName, a.title, a.submitted_at, g.grade, g.marked_at
        FROM ((usertb AS u INNER JOIN article AS a ON u.userid = a.fk_userid) FULL OUTER JOIN grade AS g ON g.fk_articleid = a.articleid), category AS c
        WHERE edu_lvl = $1`;

        return database
            .query(query, [edu])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("There is no such article under that education level");
                    return callback({ code: "no_article" }, null);
                } else if (result.rowCount == 1) {
                    console.log("The articles have been collectd (selectArticleByEdu)");
                    return callback(null, result.rows);
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

    // Endpoint 7 (This is to search for title)
    selectArticleByTitle: function (title, callback) {
        const query = `SELECT u.name AS username, u.email, c.name AS catName, a.title, a.submitted_at, g.grade, g.marked_at
        FROM ((usertb AS u INNER JOIN article AS a ON u.userid = 
            a.fk_userid) FULL OUTER JOIN grade AS g ON g.fk_articleid = a.articleid), category AS c
        WHERE a.title iLIKE $1;`;

        return database
            .query(query, ["%" + title + "%"])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("This is the result: " + JSON.stringify(result));
                    return callback({ code: "no_article" }, null);
                } else if (result.rowCount == 1) {
                    console.log("This is the result: " + JSON.stringify(result));
                    return callback(null, result.rows);
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


    selectArticleBythreeFilters: function (title, recent, category, callback) {
        var query = ``;
        if (recent == 1) {
            query = `SELECT u.userid, u.name AS username, u.email, u.edu_lvl, category.name, a.title, a.submitted_at, g.grade, g.marked_at
            FROM (((usertb AS u INNER JOIN article AS a ON u.userid = a.fk_userid) INNER JOIN category ON a.fk_categoryid = category.catid) FULL OUTER JOIN grade AS g ON g.fk_articleid = a.articleid)
            WHERE a.title iLIKE $1 AND category.name ilike $2 ORDER BY a.submitted_at DESC;`;
        } else {
            query = `SELECT u.userid, u.name AS username, u.email, u.edu_lvl, category.name, a.title, a.submitted_at, g.grade, g.marked_at
            FROM (((usertb AS u INNER JOIN article AS a ON u.userid = a.fk_userid) INNER JOIN category ON a.fk_categoryid = category.catid) FULL OUTER JOIN grade AS g ON g.fk_articleid = a.articleid)
            WHERE a.title iLIKE $1 AND category.name ilike $2 ORDER BY a.submitted_at ASC;`;
        }
        return database
            .query(query, ["%" + title + "%", "%" + category + "%"])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("This is the result: " + JSON.stringify(result.rows));
                    return callback({ code: "no_article" }, null);
                } else if (result.rowCount >= 1) {
                    console.log("This is the result: " + JSON.stringify(result.rows));
                    return callback(null, result.rows);
                } else {
                    console.log("The error is unknown");
                    console.log(result.rows);
                    return callback({ code: "unknown_error" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error: " + error);
                return callback(error, null);
            })
    },

    selectArticleByfourFilters: function (title, recent, edu_lvl, category, callback) {
        var query = ``;
        if (recent == 1) {
            query = `SELECT u.userid, u.name AS username, u.email, u.edu_lvl, category.name, a.title, a.submitted_at, g.grade, g.marked_at
            FROM (((usertb AS u INNER JOIN article AS a ON u.userid = a.fk_userid) INNER JOIN category ON a.fk_categoryid = category.catid) FULL OUTER JOIN grade AS g ON g.fk_articleid = a.articleid)
            WHERE a.title iLIKE $1 AND category.name ilike $2 AND edu_lvl = $3 ORDER BY a.submitted_at DESC;`;
        } else {
            query = `SELECT u.userid, u.name AS username, u.email, u.edu_lvl, category.name, a.title, a.submitted_at, g.grade, g.marked_at
            FROM (((usertb AS u INNER JOIN article AS a ON u.userid = a.fk_userid) INNER JOIN category ON a.fk_categoryid = category.catid) FULL OUTER JOIN grade AS g ON g.fk_articleid = a.articleid)
            WHERE a.title iLIKE $1 AND category.name ilike $2 AND edu_lvl = $3 ORDER BY a.submitted_at ASC;`;
        }
        return database
            .query(query, ["%" + title + "%", "%" + category + "%", edu_lvl])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("This is the result: " + JSON.stringify(result.rows));
                    return callback({ code: "no_article" }, null);
                } else if (result.rowCount >= 1) {
                    console.log("This is the result: " + JSON.stringify(result.rows));
                    return callback(null, result.rows);
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

    getArticleId: function (userid, callback) {
        const query = `SELECT articleid FROM article WHERE fk_userid = $1`

        return database
            .query(query, [userid])
            .then(function (result) {
                if (result.rows.length == 0) {
                    console.log("This is the result(should be nothing) " + result.rows)
                    return callback({ code: "No_such_article" }, null);
                } else if (result.rows.length == 1) {
                    console.log("This is the result " + JSON.stringify(result.rows));
                    return callback(null, result.rows);
                } else {
                    console.log("Unknown Error");
                    console.log({ code: "unknown_error" }, null);
                }
            })
            .catch(function (error) {
                console.log("This is the error ___________ " + error);
                return callback(error, null);
            })
    },

    getSummariseStudentArticle: function (userid, callback) {
        var summary;
        var info = "";
        var everything;
        var length;
        const query = `SELECT category.name, category.description, article.title, article.content 
        FROM (article INNER JOIN category ON article.fk_categoryid = category.catid) 
        WHERE article.fk_userID = $1`;

        return database
            .query(query, [userid])
            .then(function (results) {
                // console.log(JSON.stringify(results.rows[0].content));

                summary = results.rows[0].content;

                var Summarised = lexrank.summarize(summary, 10, function (err, summarised, summary) {
                    if (err) {
                        console.log(err);
                    } else {
                        for (var i = 0; i < summarised.length; i++) {
                            info += summarised[i].text;
                        }
                    }
                });
                // console.log(info)
                everything = results.rows.push({ information: info });
                length = results.rows.push({ length: info.length })
                // console.log(results.rows);
                // console.log(summarised[0].text);
                // console.log("The artice is : " + JSON.stringify(results));
                // return callback(null , results.rows);
                return callback(null, results.rows);
            })
            .catch(function (error) {
                console.log("summarise Student article error : " + error);
                return callback(error, null);
            })
    },

    getDueDate: function (callback) {
        const query = `SELECT dueDate,dueDateType FROM DeadLine order by deadlineid asc`
        return database
            .query(query)
            .then(function (results) {
                console.log("This is the result " + JSON.stringify(results.rows));
                return callback(null, results.rows);
            })
            .catch(function (error) {
                console.log("This is the error (getDueDate): " + error);
                return callback(error, null);
            })
    },

    ViewDueDateByGroup: function (dueDateType, callback) {
        console.log("appppppp.js check here " + dueDateType);
        const query = `SELECT dueDate From Deadline where duedatetype ILIKE  $1 `
        return database
            .query(query, [dueDateType + "%"])
            .then(function (results) {
                if (results.rows.length == 0) {
                    return callback({ code: "no this dueDateType" }, null);
                } else if (results.rows.length == 1) {
                    return callback(null, results.rows)
                } else {
                    console.log({ code: "viewduedatebygroup unknown_error" }, null);
                }
            })
            .catch(function (error) {
                return callback(error, null);
            })
    },

    editDueDateByGroup: function (dateEdit, groupEdit, callback) {
        console.log("sssssssssssss" + dateEdit);
        console.log(groupEdit);
        const query = `UPDATE deadline SET duedate = $1 WHERE duedatetype ILIKE $2`;
        return database
            // .query(query, [dateEdit, `ILIKE '`+groupEdit+`%'`])
            // .query(query, [dateEdit, `ILIKE`+groupEdit+"%"])
            .query(query, [dateEdit, groupEdit + '%'])
            .then(function (result) {
                if (result.rowCount == 0) {
                    console.log("No update made");
                    return callback({ code: "no_update" }, null);
                } else if (result.rowCount == 1 || result.rowCount == 4) {
                    console.log("This is the result: " + result.rowCount);
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