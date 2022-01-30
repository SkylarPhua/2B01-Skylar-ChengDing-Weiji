//------------------------------------
// app.js
//------------------------------------

//------------------------------------
// Imports and Declarations
//------------------------------------
var login = require('../model/login');
var student = require('../model/student');
var article = require('../model/article');
var category = require('../model/category');
var grading = require('../model/grade');
var tournament = require('../model/tournament')
var history = require('../model/history')

const bcrypt = require('bcrypt');
var async = require('async');
var config = require('../config');
var jwt = require('jsonwebtoken');
const { summarize } = require('lexrank');

//------------------------------------
// Endpoints (login)
//------------------------------------

// Endpoint 1: logUser
// GET users for login
exports.logUser = function (req, res) {
    var email = req.body.email;
    var passwordGL = req.body.password;

    login.loginUser(email, function (error, result) {
        console.log("&&APP.JS&" + JSON.stringify(result))
        if (!error && result !== "") {

            var passsword = result[0].password;

            console.log("userid: " + result[0].userid);
            console.log("usertype: " + result[0].usertype);
            console.log("grouptype: " + result[0].grouptype);

            if (bcrypt.compareSync(passwordGL, passsword) == true) {
                console.log(passwordGL);
                var token = "";
                token = jwt.sign({
                    userid: result[0].userid,
                    usertype: result[0].usertype,
                    groupType: result[0].grouptype
                },
                    config.key, {
                    expiresIn: 6000
                });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, data: result[0].userid, UserData: result[0].usertype, groupType: result[0].grouptype, token: token, status: 'You are successfully login' });
                console.log("Token is: " + token);
                res.send();
            } else {
                console.log("You have the wrong password");
                res.status(401).send("Incorrect email or password");
            }
        } else {
            res.status(500).send("Unknown Error")
        }
    })
};

//------------------------------------
// Endpoints (Tournament) (New for CA2)
//------------------------------------

// Endpoint 1: getGroupByNumber
exports.getGroupByNumber = function (req, res) {
    const groupType = req.params.groupType;
    console.log("groupType: " + groupType);

    tournament.getGroupByType(groupType, function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "emptyGroup") {
            res.status(404).send("Cannot find student in tournament group")
        } else {
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 2: postStudentToGroup
exports.postStudentToGroup = function (req, res) {
    const studentID = parseInt(req.body.userid);
    const tournamentType = req.body.tournamentType;

    tournament.addStudentToGroup(studentID, tournamentType, function (error, result) {
        if (!error && result !== "") {
            res.status(201).send("Student has been added into Tournament");
        } else if (error.code == "studentExists") {
            res.status(422).send("Student already exsist in the tournament");
        } else if (error.code == "noGroupType") {
            res.status(404).send("No such group type")
        } else if (error.code == "noUpdate") {
            res.status(404).send("Cannot find the requested student");
        } else {
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 3: postStudentArticleToGroup
exports.postStudentArticleToGroup = function (req, res) {
    const studentID = req.body.userid;
    const groupType = req.body.groupType;
    const title = req.body.title;
    const content = req.body.content;

    tournament.editArticleToTournament(studentID, groupType, title, content, function (error, result) {
        if (!error && result !== "") {
            res.status(201).send("Student article has been posted");
        } else if (error.code == "noSuchEntry") {
            res.status(404).send("Cannot find such an entry");
        } else if (error.code == "noUpdate") {
            res.status(404).send("Cannot find requested entry");
        } else {
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 4: 
exports.editTournamentArticleMark = function (req, res) {
    const marks = req.body.mark;
    const tournamentID = req.body.tournamentid;

    console.log("Marks: " + marks);
    tournament.editArticleMarks(marks, tournamentID, function (error, result) {
        if (!error && result !== "") {
            res.sendStatus(204);
        } else if (error.code == "noUpdate") {
            res.status(404).send("There is no such article");
        } else {
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 5: 
exports.deleteStudentFromGroup = function (req, res) {
    const studentID = req.body.userid;
    const tournamentID = req.body.tournamentid;

    tournament.deleteStudentEntry(studentID, tournamentID, function (error, result) {
        if (!error && result !== "") {
            res.status(204).send("Entry deleted");
        } else if (error.code == "noSuchEntry") {
            res.status(404).send("Student does not exist in this group");
        } else if (error.code == "noUpdate") {
            res.status(404).send("Cannot find requested user");
        } else {
            console.log(error);
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 6: For student and admin (Got word counter also)
exports.getStudentArticleFromTournament = function (req, res) {
    const studentID = req.params.userid;
    const groupType = req.params.groupType;

    tournament.getStudentArticle(studentID, groupType, function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "noSuchArticle") {
            res.status(404).send("Cannot find any article done by user");
        } else {
            console.log("This is the error (getStudentArticleFromTournament): " + error);
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 7: For student to delete and redo their article
exports.removeStudentArticle = function (req, res) {
    const studentID = req.params.userid;
    const tournamentID = req.body.tournamentid;

    tournament.deleteStudentArticle(studentID, tournamentID, function (error, result) {
        if (!error && result !== "") {
            res.status(204).send("Article has been deleted");
        } else if (error.code == "noType") {
            res.status(404).send("Cannot find tournament entry");
        } else if (error.code == "noSuchEntry") {
            res.status(404).send("Cannot find requested entry");
        } else if (error.code == "studentEntryExists") {
            res.status(422).send("Student entry already exists");
        } else {
            console.log("This is the errorrrr: " + JSON.stringify(error));
            console.log(error);
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 8: For admin to get all articles in the tournament (Acts as the home page for A_tournament)
exports.getAllArticlesFromTournament = function (req, res) {
    tournament.getAllArticlesInTournament(function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "no_articles") {
            res.status(404).send("Unable to find any students in the tournament");
        } else {
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 9: For admin to get specific articles using the tournamentID
exports.getSpecificTournamentArticle = function (req, res) {
    const tournamentID = req.params.tournamentid;

    tournament.getArticleByTournamentID(tournamentID, function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "noSuchArticle") {
            res.status(404).send("Cannot find any article done by user");
        } else {
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 10: For admin to get summarized articles using tournamentID
exports.getSummaryTournamentArticle = function (req, res) {
    const tournamentID = req.params.tournamentid;
    console.log("TournamentID: " + tournamentID);

    tournament.getSummarisedTournamentArticle(tournamentID, function (error, result) {
        if (!error && result == "") {
            res.status(404).send("Cannot find any article from this student");
        } else if (!error && result !== "") {
            res.status(200).send(result);
        } else {
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown student error");
        }
    })
}

// Endpoint 11: Get category for student to view before doing the article
exports.getCategoryByGroup = function (req ,res) {
    const groupType = req.params.groupType;
    console.log(groupType);

    tournament.getCategoryByGroupType(groupType, function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "noSuchGroup") {
            console.log("This is the result: " + result);
            console.log("This is the error: " + error);
            res.status(404).send("Cannot category by group type");
        } else {
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 12: Get last 4 of top 8 (can be used by anyone)
exports.getLastFourPeople = function (req ,res) {

    tournament.getLeaderboardLastFour(function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "noSuchGroup") {
            console.log("This is the result: " + result);
            console.log("This is the error: " + error);
            res.status(404).send("Cannot category by group type");
        } else {
            res.status(500).send("Unknown error");
        }
    })
}

//------------------------------------
// Endpoints (Student)
//------------------------------------

// Endpoint 1: getStudents
// GET students
exports.getStudents = function (req, res) {
    student.getStudentList(function (error, result) {
        if (!error && result == "") {
            console.log("This is running error")
            res.status(404).send("Cannot find any records");
        } else if (!error && result !== "") {
            console.log("This is running")
            res.status(200).send(result);
        } else {
            console.log("This is the error message " + error.status)
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown error");
        }
    })
};

//Get student by id
exports.getStudentByID = function (req, res) {
    const userid = parseInt(req.params.id);
    student.getStudentByid(userid, function (error, result) {
        if (!error && result == "") {
            console.log("This is running error")
            res.status(404).send("Cannot find any records");
        } else if (!error && result !== "") {
            console.log("This is running")
            res.status(200).send(result);
        } else {
            console.log("This is the error message " + error.status)
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown error");
        }
    })
};

// Endpoint 2: postStudent
// POST student
exports.postStudent = function (req, res, next) {
    console.log("This is the name: " + req.body.name);
    console.log("This is the body: " + JSON.stringify(req.body));

    let name = req.body.name
    let email = req.body.email
    let usertype = req.body.usertype
    let password = req.body.password
    let edu = req.body.edu

    bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
            console.log('Error on hashing password');
            return res.status(500).json({ statusMessage: 'Unable to complete registration' });
        } else {
            student.addStudent(name, email, usertype, hash, edu, function (error, result) {
                if (!error) {
                    res.status(201).send("Registered");
                } else if (error.code === '23505') {
                    res.status(422).send("The new data provided already exists.");
                } else {
                    console.log("This is the error (app.js): " + error)
                    res.status(500).send("Unknown error");
                }
            })

        }

    })
}

// Endpoint 3: putStudent
// PUT student
exports.putStudent = function (req, res) {
    const userid = parseInt(req.params.id);
    console.log("This is the id: " + userid);
    student.editStudent(userid, req.body, function (error, result) {
        if (!error && result !== "") {
            res.status(204).send("User updated");
        } else if (error.code == "user_not_found") {
            res.status(404).send("Cannot find the requested user");
        } else if (error.code === '23505') { // Duplicate error
            res.status(422).send("The data provided already exists.");
        } else {
            console.log("This is this error: " + JSON.stringify(error));
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 4: deleteStudent (Might be used for disqualification)
// Delete student
exports.deleteStudent = function (req, res) {
    const userid = parseInt(req.params.id);
    console.log("This is the id: " + userid);
    student.removeStudent(userid, function (error, result) {
        if (!error && result !== "") {
            console.log("Successfully deleted");
            res.sendStatus(204);
        } else if (error.code == "user_not_found") {
            res.status(404).send("No such user, cannot delete");
        } else {
            console.log("error is: " + JSON.stringify(error));
            res.status(500).send("Unknown error");
        }
    })
}

//------------------------------------
// Endpoints (Article)
//------------------------------------

// Endpoint 1: getAllArticle
// GET all alot of data but not the article(Have grade, graded at)
exports.getAllArticle = function (req, res) {
    if (req.usertype == "admin") {
        article.getArticleList(function (error, result) {
            if (!error && result == "") {
                console.log("There are not results")
                res.status(404).send("Cannot find any records");
            } else if (!error && result !== "") {
                res.status(200).send(result);
            } else {
                console.log("This is the error message " + error.status)
                console.log("This is the error: " + JSON.stringify(error));
                res.status(500).send("Unknown error");
            }
        })
    } else {
        res.status(403).send("Unauthorised Access, you are not registered as an Admin");
    }
};

// NOT USING THIS ONE
exports.getArticleWithStudentID = function (req, res) {
    const userid = parseInt(req.params.id);
    article.getStudentArticle(userid, function (error, result) {
        if (!error && result == "") {
            console.log("Cannot find any article from this student")
            res.status(404).send("Cannot find any article from this student");
        } else if (!error && result !== "") {
            res.status(200).send(result);
        } else {
            console.log("This is the error message " + error.status)
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown student error");
        }
    })
};

// Endpoint 2: get 
// Gets the article stuff by userid
// This is the very important one

exports.getContentByID = function (req, res) {
    const userid = req.params.id;
    console.log("This is the userid " + userid);
    article.getArticleByID(userid, function (error, result) {
        if (!error && result !== "") {
            console.log("This is the result(app.js (getContentByID)): " + result);
            res.status(200).send(result);
        } else if (error.code == "No_such_article") {
            console.log("No Article lel, post new: " + result);
            // res.status(404).send("Cannot find any article done by user");
            res.status(404).send("Cannot find any article done by user");
        } else {
            console.log("This is the error: " + error);
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 3: postArticle
// POST article by user
exports.postArticle = function (req, res) {
    var userid = req.body.userid;
    var catid = req.body.catid;
    var title = req.body.title;
    var content = req.body.content;
    if (req.usertype == "student") {
        article.addArticleByID(userid, catid, title, content, function (error, result) {
            // if (!error && result !== "") {
            //     console.log("This is the result (app.js): " + JSON.stringify(result));
            //     res.status(201).send("Article has been submitted");
            // } else if (error.code == '23505') {
            //     console.log("This is the bad result(postArticle): " + JSON.stringify(result));
            //     res.status(422).send("Article already exsist");
            // } else {
            //     console.log("This is the error: " + error);
            //     res.status(500).send("Unknown error");
            // }
            if (!error) {
                res.status(201).send("Student article has been posted");
            } else if (error.code == "noUpdate") {
                res.status(404).send("Cannot find requested entry");
            } else {
                console.log("This is the adaw: " + JSON.stringify(error));
                res.status(500).send("Unknown error");
            }
        })
    } else {
        res.status(403).send("Unauthorised Access, you are not registered as a Student");
    }
}

// Endpoint 4: putArticle
// PUT article by student 
exports.putArticle = function (req, res) {
    var userid = req.body.id;
    var title = req.body.title;
    var content = req.body.content;
    if (req.usertype == "student") {
        article.editArticleByID(userid, title, content, function (error, result) {
            // if (!error && result !== "") {
            //     console.log("ssssss" + result);
            //     res.status(200).send("Article updated")
            // } else if (error.code == "no_article") {
            //     console.log("This is the bad result: " + JSON.stringify(result));
            //     res.status(404).send("There is no such article");
            // } else {
            //     console.log("This is the error: " + error);
            //     res.status(500).send("Unknown error");
            // }
            if (!error && result !== "") {
                res.status(201).send("Student article has been posted");
            } else if (error.code == "noUpdate") {
                res.status(404).send("Cannot find requested entry");
            } else {
                res.status(500).send("Unknown error");
            }
        })
    } else {
        res.status(403).send("Unauthorised Access, you are not registered as a Student");
    }
}

// Endpoint 5: deleteArticleByID
// DELETE article by student's userid
exports.deleteArticleByID = function (req, res) {
    const userid = req.params.id;

    console.log("This is the userid: " + userid);

    article.removeArticleByID(userid, function (error, result) {

        console.log(result);
        if (userid == null) {
            res.status(403).send("Unauthorised Access, you are not Logged in / registered");
        } else if (error.code == "no_article") {
            res.status(404).send("There is no such article");
            console.log("///////////////////");
        } else if (error.code == "deleted") {
            res.sendStatus(204);
        }
        else {
            console.log("This is the error: " + error);
            res.status(500).send("Unknown error");
        }
    })
}


// Endpoint 6: getArticleByEdu
// GET article by student's edu_lvl
exports.getArticleByEdu = function (req, res) {
    const edu = req.params.edu;

    console.log("This is the edu_lvl: " + edu);
    article.selectArticleByEdu(edu, function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "no_article") {
            res.status(404).send("There is no article from that level");
        } else {
            console.log("This is the error: " + error);
            res.status(500).send("Unknown error");
        }
    })
}

// Endpoint 7: getArticleByTitle
// GET articles by title
exports.getArticleByTitle = function (req, res) {
    const title = req.params.title
    console.log("This is the title: " + title);

    article.selectArticleByTitle(title, function (error, result) {
        if (!error && result !== "") {
            res.status(200).send(result);
        } else if (error.code == "no_article") {
            res.status(404).send("There is no article with that title");
        } else {
            console.log("This is the error: " + error);
            res.status(500).send("Unknown error");
        }
    })
}
exports.getArticleBythreeFilters = function (req, res) {
    const title = req.query.title;
    const recent = req.query.recent;
    const category = req.query.category;
    if (req.usertype == "admin") {
        article.selectArticleBythreeFilters(title, recent, category, function (error, result) {
            if (!error && result !== "") {
                res.status(200).send(result);
            } else if (error.code == "no_article") {
                res.status(404).send("There is no article with these 3 filters");
            } else {
                console.log("This is the error: ", error);
                res.status(500).send("Unknown error");
            }
        })
    } else {
        res.status(403).send("Unauthorised Access, you are not registered as an Admin");
    }
}
exports.getArticleByfourFilters = function (req, res) {
    const title = req.query.title;
    const recent = req.query.recent;
    const edu_lvl = req.query.edu_lvl;
    const category = req.query.category;
    if (req.usertype == "admin") {
        article.selectArticleByfourFilters(title, recent, edu_lvl, category, function (error, result) {
            if (!error && result !== "") {
                res.status(200).send(result);
            } else if (error.code == "no_article") {
                res.status(404).send("There is no article with these 4 filters");
            } else {
                console.log("This is the error: ", error);
                res.status(500).send("Unknown error");
            }
        })
    } else {
        res.status(403).send("Unauthorised Access, you are not registered as an Admin");
    }
}
exports.getSummariseArticleWithStudentID = function (req, res) {
    const userid = parseInt(req.params.id);
    console.log(userid)
    article.getSummariseStudentArticle(userid, function (error, result) {

        if (!error && result == "") {
            console.log("Cannot find any article from this student")
            res.status(404).send("Cannot find any article from this student");
        } else if (!error && result !== "") {
            console.log(result)
            res.status(200).send(result);
        } else {
            console.log("This is the error message " + error.status)
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown student error");
        }
    })
};

//------------------------------------
// Endpoints (Category)
//------------------------------------

// Endpoint 1: getArticleByName
// GET article by catid
exports.getArticleByName = function (req, res) {
    var catName = req.params.name;

    console.log("This is the catName: " + catName);
    category.getArticleByCat(catName, function (error, result) {
        if (!error && result !== "") {
            res.sendStatus(200);
        } else if (error.code == "no_article") {
            console.log("This is the result: " + result);
            res.status(404).send("There is no article under this category");
        } else {
            console.log("This is the error: " + error);
            res.status(500).send("Unknown error");
        }
    })
}

//------------------------------------
// Endpoints (Grade)
//------------------------------------

// Endpoint 1: postGrade
// POST article grade
exports.postGrade = function (req, res) {
    var articleid = req.params.id;
    var userid = req.body.userid;
    var grade = req.body.grade;

    console.log("This is the userid: " + userid);
    console.log("This is the articleid: " + articleid);
    console.log("This is the grade: " + grade);
    if (req.usertype == "admin") {
        grading.insertMarks(userid, articleid, grade, function (error, result) {
            if (!error && result !== "") {
                res.status(201).send("You have marked this article");
            } else if (error.code == "noUpdate") {
                res.status(404).send("There is no such article");
            } else {
                res.status(500).send("Unknown error");
            }
        })
    } else {
        res.status(403).send("Unauthorised Access, you are not registered as an Admin");
    }
}

// Endpoint 2: putGrade
// PUT article grade
exports.putGrade = function (req, res) {
    var articleid = req.params.id
    var grade = req.body.grade;

    console.log("This is the grade: " + grade);
    if (req.usertype == "admin") {
        grading.updateMarks(grade, articleid, function (error, result) {
            if (!error && result !== "") {
                res.sendStatus(204)
            } else if (error.code == "noUpdate") {
                res.status(404).send("There is no such article");
            } else {
                res.status(500).send("Unknown error");
            }
        })
    } else {
        res.status(403).send("Unauthorised Access, you are not registered as an Admin");
    }
}


exports.DueDate = function (req, res) {
    article.getDueDate(function (error, result) {
        if (!error && result == "") {
            console.log("There are not results")
            res.status(404).send("Cannot find any duedate");
        } else if (!error && result !== "") {
            var current = new Date();

            console.log(result[0].duedate);

            if (current < result[0].duedate) {
                res.status(200).send(result[0]);
            } else if (current < result[1].duedate) {
                res.status(200).send(result[1]);
            } else if (current < result[2].duedate) {
                res.status(200).send(result[2]);
            } else {
                res.status(200).send(result[3]);
            }
        }
        else {
            res.status(500).send("Unknown error");
        }
    })
}

exports.viewDueDateByGroup = function (req, res) {
    var dueDateType = req.params.dueDateType;
    console.log("This is the dueDateType " + dueDateType);
    article.ViewDueDateByGroup(dueDateType, function (error, result) {
        var result = JSON.stringify(result)
        if (!error && result !== "") {
            console.log("This is the result(app.js (viewDueDateByGroup)): " + result);
            res.status(200).send(result);
        } else if (error.code == "no this duedatetype") {
            res.status(404).send("Cannot find this duedatetype");
        } else {
            console.log("This is the error: " + error);
            res.status(500).send("Unknown error");
        }
    })
}

exports.editDueDateByGroup = function (req, res) {
    var groupEdit = req.body.groupEdit
    var dateEdit = req.body.dateEdit;
    console.log(groupEdit);
    console.log(dateEdit);

    article.editDueDateByGroup(dateEdit, groupEdit, function (error, result) {
        if (!error && result !== "") {
            res.sendStatus(204)
        } else if (error.code == "no_update") {
            res.status(404).send("no update made");
        } else {
            console.log("This is the error: " + error);
            console.log("/////////////////dddddddddddddd////////////");
            res.status(500).send("Unknown error");
        }
    })
}

exports.getHistoryArticle = function (req, res) {
    const userid = parseInt(req.params.id);
    console.log(userid)
    history.getArticleByUserID(userid, function (error, result) {

        if (!error && result == "") {
            console.log("Cannot find any article from this student")
            res.status(404).send("Cannot find any article from this student");
        } else if (!error && result !== "") {
            console.log(result)
            res.status(200).send(result);
        } else {
            console.log("This is the error: " + JSON.stringify(error));
            res.status(500).send("Unknown student error");
        }
    })
};