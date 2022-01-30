//------------------------------------
// index.js
//------------------------------------

//------------------------------------
// Imports
//------------------------------------
const express = require('express');
const path = require('path');
const createHttpErrors = require('http-errors');
const app = express();
const database = require('./database/database');
var cors = require('cors');
app.options('*', cors());
app.use(cors());


var competitionRouter = require('./routes/competition');
//------------------------------------
// Middleware
//------------------------------------
// To connect to database
database.connect();

// The web server

// To handle body
app.use(express.json());

// For postman testing (To accept x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false })); 

// Web Server
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to see req url and req method
// This must be put below express
app.use(function (req, res, next) {
    console.log('Request URL:', req.originalUrl);
    console.log('Request Type:', req.method);
    next();
  });

app.use('/competition', competitionRouter);

// 404 Handler (when website cannot be found)
app.use((req, res, next) => {
    next(createHttpErrors(404, `Unknown Resource ${req.method} ${req.originalUrl}`));
});

// Error Handler (if there is an error status then return it, if not returns 500)
app.use((error, req, res, next) => {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || `Unknown Error!`,
    });
  });


// Listen to port (8000 if local)
//app.listen(process.env.PORT, function () {
app.listen(process.env.PORT||8000, function () {
    console.log('App listening on port 8000');
});