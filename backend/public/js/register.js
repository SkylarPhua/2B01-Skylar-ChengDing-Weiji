let $registerFormContainer = $('#registerFormContainer');

var allowSubmit = false;
document.getElementById("g-recaptcha").addEventListener("mousedown", check_if_capcha_is_filled);

function capcha_filled() {
    allowSubmit = true;
    check_if_capcha_is_filled();
}
function capcha_expired() {
    allowSubmit = false;
}
function check_if_capcha_is_filled() {
    $("#four").hide();

    console.log(allowSubmit);
    if (allowSubmit) return true;
    $("#four").show();

}

if ($registerFormContainer.length != 0) {
    $('#submitButton').on('click', function (event) {
        check_if_capcha_is_filled();
        let name = $('#fullNameInput').val();
        let email = $('#emailInput').val();
        let password = $('#passwordInput').val();

        if (name.trim() == "" || email.trim() == "" || password.trim() == "") {
            validateFE();
        }else if (allowSubmit != true){
            console.log("ssssssss"+allowSubmit);
            event.preventDefault();
            new Noty({
                timeout: '6000',
                type: 'error',
                layout: 'topCenter',
                theme: 'sunset',
                text: 'captcha not completed',
                killer: true, // New Not tested
            }).show();
        } else {
            console.log("not empty");
            event.preventDefault();
            const baseUrl = 'http://localhost:8000';
            let usertype = $('#userType').val();
            let edu = $('#edulvl').val();
            const requestBody = {
                name: name,
                email: email,
                usertype: usertype,
                password: password,
                edu: edu
            };
            axios({
                method: 'post',
                url: baseUrl + '/competition/student',
                data: requestBody,
                dataType: "json",
            })
                .then(function (response) {
                    //Handle success
                    console.dir(response);
                    new Noty({
                        type: 'success',
                        timeout: '6000',
                        layout: 'topCenter',
                        theme: 'bootstrap-v4',
                        text: 'You have registered. Please <a href="login.html" class=" class="btn btn-default btn-sm" >Login</a>',
                    }).show();
                })
                .catch(function (response) {
                    //Handle error
                    console.dir(response);
                    new Noty({
                        timeout: '6000',
                        type: 'error',
                        layout: 'topCenter',
                        theme: 'sunset',
                        text: 'Unable to register.',
                        killer: true, // New Not tested
                    }).show();
                });
        }
    });

}

// function recaptcha_callback() {
//     var submitButton = document.querySelector('#submitButton')
//     // submitButton.removeAttribute('disabled')
//     submitButton.style.cursoe = 'pointer';
// }

function validateFE() {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
}

window.addEventListener('keyup', chkinput)

function chkinput() {
    var email = document.getElementById("emailInput").value.trim();
    var password = document.getElementById("passwordInput").value.trim();
    var name = document.getElementById("fullNameInput").value.trim();

    if (name === "" || email === "" || password === "") {
        $("#one").show();
        $("#two").show();
        $("#three").show();
        document.getElementById('submitButton').disabled = true;
        if (name != "") {
            $("#one").hide();
        } else if (email != "") {
            $("#two").hide();
        } else if (password != "") {
            $("#three").hide();
        }
    } else if (name != "" && email != "" && password != "") {
        $("#one").hide();
        $("#two").hide();
        $("#three").hide();
        document.getElementById('submitButton').disabled = false;
    }
}