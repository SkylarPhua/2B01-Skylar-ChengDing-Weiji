const validator = require('validator');
const validationFn = {

    validateEmail: function (req, res, next) {
        console.log("validateEmail middleware called");
        const emailInput = req.body.email;

        if (validator.isEmail(emailInput)) {
            next();
        } else {
            console.log("Error while submitting, registration incomplete");
            res.status(500);
            res.send(`{"message":"Error!!"}`);
        }
    },

    validateRegistration: function (req, res, next) {
        console.log("validateRegistration middleware called");
        const nameInput = req.body.name;
        const emailInput = req.body.email;

        reNameInput = new RegExp(`^[a-zA-Z ]*$`);   

        if (reNameInput.test(nameInput) && validator.isEmail(emailInput)) {

            next();
        } else {
            console.log("Error while submitting, registration incomplete");
            res.status(500);
            res.send(`{"message":"Error!!"}`);
        }
    },
}
//end validationFn 
module.exports = validationFn;