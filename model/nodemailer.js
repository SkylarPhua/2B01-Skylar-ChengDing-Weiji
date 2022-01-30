const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "writingcompetition2b01@gmail.com",
        pass: "ADESca2WC"
    }
})

module.exports = {

    sendMail: function (userSentTo, subject, text, callback) {
        let details = {
            from: "writingcompetition2b01@gmail.com",
            to: userSentTo,
            subject: subject,
            text: text
        }

        transporter.sendMail(details, (error, result) => {
            if (result) {
                console.log("This is the result: " + result);
                return callback(null, result);
            } else {
                console.log("This is the error: " + error);
                return callback(error, null);
            }
        })
    },

}




