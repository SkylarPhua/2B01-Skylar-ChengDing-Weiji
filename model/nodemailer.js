const nodemailer = require('nodemailer');
var config = require('../config');

const transporter = nodemailer.createTransport({
    pool: true,
    service: "gmail",
    auth: {
        user: config.email,
        pass: config.password
    },
    maxMessages: 30,
    maxConnections: 5, 
})

module.exports = {

    sendMail: function (userSentTo, subject, text, callback) {
        let details = {
            from: config.email,
            to: userSentTo,
            subject: subject,
            text: text
        }

        transporter.sendMail(details, (error, result) => {
            if (result) {
                console.log("This is the result: " + result);
                return callback(null, result);
            } else {
                console.log("This is the error type: " + error);
                const errorMail = {
                    from: config.email,
                    to: config.email,
                    subject: "There was an error in sending emails to user",
                    text: "User did not receive an email notifications \nThis is the error: " + error
                }

                transporter.sendMail(errorMail, (error, result) => {
                    if (result) {
                        console.log("It works this is the result: " + result);
                    } else {
                        console.log("This is the error: " + error);
                    }
                })
                return callback(error, null);
            }
        })
    },

    // Endpoint 2: Sending email to mulitple users
    sendBulkMail: function (usersToSent, subject, text, callback) {
        let details = {
            from: config.email,
            to: config.email,
            bcc: usersToSent,
            subject: subject,
            text: text
        }

        transporter.sendMail(details, (error, result) => {
            if (result) {
                console.log("This is the result: " + result);
                return callback(null, result);
            } else {
                console.log("This is the error type: " + error);
                const errorMail = {
                    from: config.email,
                    to: config.email,
                    subject: "There was an error in sending emails to user",
                    text: "Users did not receive an email notifications \nThis is the error: " + error
                }

                transporter.sendMail(errorMail, (error, result) => {
                    if (result) {
                        console.log("It works this is the result: " + result);
                    } else {
                        console.log("This is the error: " + error);
                    }
                })
                return callback(error, null);
            }
        })
    },

}