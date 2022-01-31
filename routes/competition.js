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
const { verify } = require('jsonwebtoken');

//------------------------------------
// History Routes (New for CA2)
//------------------------------------

// GET all history articles by specific user
router.get('/history/:id', verifyToken, verifyFn.verifyUserRole, app.getHistoryArticle);

//------------------------------------
// Tournament Routes (New for CA2)
//------------------------------------

// Get tournament participant by group number
router.get('/tournamentByType/:groupType', verifyToken, verifyFn.verifyUserRole, app.getGroupByNumber);

// Post participant into the tournament by the studentID
router.post('/tournament/', verifyToken, verifyFn.verifyUserRole, app.postStudentToGroup);

// Post student's article into the article table for tournament
router.put('/tournamentArticle/', verifyToken, verifyFn.verifyUserRole, app.postStudentArticleToGroup);

// Edit student's article marks in tournament
router.put('/tournamentMarks/', verifyToken, verifyFn.verifyUserRole, app.editTournamentArticleMark);

// Delete student from tournament group and set his group type in usertb back to last group
router.delete('/tournament/', verifyToken, verifyFn.verifyUserRole, app.deleteStudentFromGroup);

// Get student's article from tournament group and userid (Can be used by admin and student)
router.get('/tournamentArticle/:userid/:groupType', verifyToken, verifyFn.verifyUserLoggedIn, app.getStudentArticleFromTournament);

// Delete student article done by the student
router.delete('/tournamentArticle/:userid', verifyToken, verifyFn.verifyUserRole, app.removeStudentArticle);

// Gets all the articles by everyone in every tournament group
router.get('/tournamentArticles/', verifyToken, verifyFn.verifyUserRole, app.getAllArticlesFromTournament);

// Get specific student article using tournamentID (This is for admin to view student's article in tournament)
router.get('/tournamentArticle/:tournamentid', verifyToken, verifyFn.verifyUserRole, app.getSpecificTournamentArticle);
  
// Get the summarized version of a student's article in the tournament
router.get('/tournamentArticleSummary/:tournamentid', verifyToken, verifyFn.verifyUserRole, app.getSummaryTournamentArticle);

// Get category by group type to display for student to see before writing an article
router.get('/tournamentCategory/:groupType', app.getCategoryByGroup);

// Get Last Four People for the leaderboard (Losers of group stage)
router.get('/tournamentLeaderboardFour/', app.getLastFourPeople);

// Get Third and Fourth place for leaderboard (Losers of semi-finals)
router.get('/tournamentLeaderboardNextTwo/', app.getNextTwo);

// Get First and Second place for leaderboard (Winners and loser of finals)
router.get('/tournamentLeaderboardTopTwo/', app.getTopTwo);

// Send Mail to one student
router.post('/tournamentSendMail/', app.sendingMail);

// Send Mail to multiple students (Did not implement);
router.post('/tournamentSendBulkMail/', app.sendingBulkMail);
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

// GET student by id [use by student maybe?]
router.get('/students/:id/', verifyToken,verifyFn.verifyUserRole, app.getStudentByID);

// POST student [used by Student to register]
router.post('/student/',validateFN.validateRegistration, app.postStudent);

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
// router.delete('/articles/:id', verifyToken, verifyFn.verifyUserLoggedIn, app.deleteArticleByID);
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

router.get('/dueDate/:dueDateType', app.viewDueDateByGroup)

router.put('/dueDate', verifyToken, verifyFn.verifyUserRole,app.editDueDateByGroup)

router.get('/checkPlagiarism/:id', app.checkPlagiarism);


//------------------------------------
// exports
//------------------------------------
module.exports = router