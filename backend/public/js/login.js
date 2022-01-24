let $loginFormContainer = $('#loginFormContainer');

window.addEventListener('DOMContentLoaded', function () {
    const overlayLoading = document.getElementById('loading');

    if ($loginFormContainer.length != 0) {
        console.log('Login form detected. Binding event handling logic to form elements.');
        $('#submitButton').on('click', function (event) {
            let email = $('#emailInput').val();
            let password = $('#passwordInput').val();

            if (email.trim() == "" || password.trim() == "") {
                validateFE();

            } else {
                overlayLoading.style.display = '';
                event.preventDefault();
                const baseUrl = 'http://localhost:8000';
                console.log(email + password);
                const requestBody = {
                    email: email,
                    password: password
                };
                axios({
                    method: 'post',
                    url: baseUrl + '/competition/login/',
                    data: requestBody,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                })
                    .then(function (response) {
                        UserData = response.data.data;
                        var usertype = response.data.UserData
                        const token = response.data.token;
                        const id = response.data.data;
                        const grouptype = response.data.groupType;
                        if (usertype == 'student') {
                            console.log("heloooooo" + email)
                            localStorage.setItem('token', token);
                            localStorage.setItem('user_id', id);
                            localStorage.setItem('role_name', usertype);
                            localStorage.setItem('group_type', grouptype);
                            window.location.replace('submission.html');
                            return;
                        }
                        if (usertype == 'admin') {
                            localStorage.setItem('token', token);
                            localStorage.setItem('user_id', id);
                            localStorage.setItem('role_name', usertype);
                            window.location.replace('A_home.html');
                            return;
                        }
                    })
                    .catch(function (response) {
                        console.dir(response);
                        new Noty({
                            type: 'error',
                            layout: 'topCenter',
                            theme: 'sunset',
                            timeout: '6000',
                            text: 'Unable to login. Check your email and password',
                        }).show();
                        overlayLoading.style.display = "none";
                    });
            }
        });

    }
})

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
    if (document.getElementById("emailInput").value.trim() === "" || document.getElementById("passwordInput").value.trim() === "") {
        $("#one").show();
        $("#two").show();
        document.getElementById('submitButton').disabled = true;
        if (document.getElementById("emailInput").value.trim() != "") {
            $("#one").hide();
        } else if (document.getElementById("passwordInput").value.trim() != "") {
            $("#two").hide();
        }
    } else if (document.getElementById("emailInput").value.trim() != "" && document.getElementById("passwordInput").value.trim() != "") {
        $("#one").hide();
        $("#two").hide();
        document.getElementById('submitButton').disabled = false;
    }
}