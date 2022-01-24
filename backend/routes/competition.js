//------------------------------------
// competition.js
//------------------------------------

//------------------------------------
// imports
//------------------------------------
var express = require('express');
var router = express.Router();

var verifyToken = require('../auth/verifyToken.js');
var validateFN = require('../auth/validateFn.js');
var verifyFn = require('../auth/verifyFn.js');
var app = require('../controller/app');

//------------------------------------
// Tournament Routes (New for CA2)
//------------------------------------

// Get tournament participant by group number
router.get('/tournament/:groupNum/', app.getGroupByNumber);

// Post participant into the tournament by the studentID
router.post('/tournament/', app.postStudentToGroup);

// Post student's article into the article table for tournament
router.put('/tournamentArticle/', app.postStudentArticleToGroup);

// Edit student's article marks in tournament
router.put('/tournamentMarks/', app.editTournamentArticleMark);

// Delete student from tournament group and set his group type in usertb back to last group
router.delete('/tournament/', app.deleteStudentFromGroup);

// Get student's article from tournament group and userid (Can be used by admin and student)
router.get('/tournamentArticle/:id/:groupType', app.getStudentArticleFromTournament);

//------------------------------------
// Login Routes
//------------------------------------

// Login user [used by Both]
router.post('/login/', validateFN.validateEmail, app.logUser);

//------------------------------------
// Student Routes
//------------------------------------

// GET students
router.get('/students/', app.getStudents);

// POST student [used by Student to register]
router.post('/student/', app.postStudent);

// PUT student
router.put('/student/:id/', app.putStudent);

// DELETE student
router.delete('/students/:id/', app.deleteStudent);

//------------------------------------
// Article Routes
//------------------------------------

// GET main list for viewing [used by Admin] Done[1]
router.get('/articles/', verifyToken, verifyFn.verifyUserRole, app.getAllArticle);

// Get article by userid [used by Both] Done[1]
router.get('/article/:id', verifyToken, verifyFn.verifyUserLoggedIn, app.getContentByID);

// GET summarise article by userid [used by Admin]
// external api  Done
router.get('/article/summarise/:id', verifyToken, verifyFn.verifyUserRole, app.getSummariseArticleWithStudentID);

// POST article by student [used by Student] DOne[1]  
router.post('/studentArticles/', verifyToken, verifyFn.verifyUserRole, app.postArticle);

// PUT article by student [used by Student] Done[1]
router.put('/studentArticle/:id', verifyToken, verifyFn.verifyUserRole, app.putArticle);

// DELETE article by userid [used by Both] DOne[1]
router.delete('/articles/:id', verifyToken, verifyFn.verifyUserLoggedIn, app.deleteArticleByID);

// GET article by edu
router.get('/articles/:edu', app.getArticleByEdu);

// GET article by title
router.get('/articleTitle/:title', app.getArticleByTitle);

// GET article With 3 filters [used by Admin] Done[1]
router.get('/articles3', verifyToken, verifyFn.verifyUserRole, app.getArticleBythreeFilters);

// GET article With 4 filters [used by Admin] Done[1]
router.get('/articles4', verifyToken, verifyFn.verifyUserRole, app.getArticleByfourFilters);

//Get article by id
router.get('/articles/:id/', app.getArticleWithStudentID)

//------------------------------------
// Category Routes
//------------------------------------

// GET article by category name
router.get('/categories/:name', app.getArticleByName);

//------------------------------------
// Grade Routes
//------------------------------------

// POST article grade [used by Admin] DOne[1]
router.post('/grade/:id', verifyToken, verifyFn.verifyUserRole, app.postGrade);
 
// PUT article grade [used by Admin] DOne[1]
router.put('/grades/:id', verifyToken, verifyFn.verifyUserRole, app.putGrade);


//------------------------------------
// DueDate Routes
//------------------------------------

// GET the due date
router.get('/dueDate', app.DueDate);

router.get('/dueDate/:dueDateType',verifyToken, verifyFn.verifyUserRole, app.viewDueDateByGroup)

router.put('/dueDate', verifyToken, verifyFn.verifyUserRole,app.editDueDateByGroup)


//------------------------------------
// exports
//------------------------------------
module.exports = router