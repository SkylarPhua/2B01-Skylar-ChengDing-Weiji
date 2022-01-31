const baseUrl = 'http://localhost:8000';
const axios = window.axios;
//---------------------------------------------------------
// User Validation
let userid = localStorage.getItem('userid');
let role = localStorage.getItem('role_name');
let token = localStorage.getItem('token');
//---------------------------------------------------------
let tournamentID = localStorage.getItem('tournamentid');

const studentName = document.getElementById("name");
const email = document.getElementById("email");
const tType = document.getElementById("ttype");
const category = document.getElementById("cat");
const title = document.getElementById("title");
const content = document.getElementById("article");
const count = document.getElementById("count");
const mark = document.getElementById("marks");
const submitDate = document.getElementById("subDate");

window.onload = () => {
    if (role != "admin") {
        new Noty({
            type: 'error',
            text: "Unauthorised, You are not an admin",
            timeout: '6000',
        }).on('onClose', () => {
            window.location = "login.html"
        }).show();

    }

    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/tournamentArticle/' + tournamentID,
        dataType: "json",
    })
        .then(function (response) {
            studentName.innerHTML = '';
            email.innerHTML = '';
            tType.innerHTML = '';
            category.innerHTML = '';
            title.innerHTML = '';
            submitDate.innerHTML = '';
            content.innerHTML = '';
            count.innerHTML = '';
            mark.innerHTML = '';

            const details = response.data[0];
            console.log("submitted date: " + details.submitted_at);
            studentName.innerHTML = details.username;
            email.innerHTML = details.email;
            tType.innerHTML = details.group_type_display;
            category.innerHTML = details.name;
            title.innerHTML = details.title;
            submitDate.innerHTML = details.submitted_at;
            mark.innerHTML = details.marks;
            count.innerHTML = details.count
            content.innerHTML = details.articlecontent;
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: error.response.data,
                    timeout: '6000',

                }).on('onClose', () => {
                    window.location = "login.html"
                })
                    .show();
            } else if (error.response.status == 404) {
                new Noty({
                    type: 'error',
                    theme: 'sunset',
                    timeout: '6000',
                    text: 'Student has not submitted their article, Unable to View. <a href="A_tournament.html" class="btn btn-danger btn-sm">Back</a>',
                    killer: true
                }).show();
            } else {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data) + ' Please try again later',
                    timeout: '6000',
                    killer: true
                }).show();
            }
        });
}

$('#submitButton').on('click', function () {
    let marks = $('#marks').val();
    const requestBody = {
        mark: marks,
        tournamentid: tournamentID
    };
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'PUT',
        url: '/competition/tournamentMarks/',
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    })
        .then(function (response) {

            // event.preventDefault();
            new Noty({
                type: 'success',
                text: 'Successfully graded!',
                timeout: '6000',
            }).on('onClose', () => {
                window.location("A_tournamentView.html");
            }).show();
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: error.response.data,
                    timeout: '6000',

                }).on('onClose', () => {
                    window.location = "login.html"
                })
                    .show();
            } else {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data) + ' Please try again later',
                    timeout: '6000',
                    killer: true
                }).show();
            }
        })
})

$('#summariseButton').on('click', function () {
    event.preventDefault();
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/tournamentArticleSummary/' + tournamentID,
        dataType: "json",
    })
        .then(function (response) {
            studentName.innerHTML = '';
            email.innerHTML = '';
            tType.innerHTML = '';
            category.innerHTML = '';
            title.innerHTML = '';
            submitDate.innerHTML = '';
            content.innerHTML = '';
            count.innerHTML = '';
            mark.innerHTML = '';

            const details = response.data[0];
            studentName.innerHTML = details.username;
            email.innerHTML = details.email;
            tType.innerHTML = details.group_type_display;
            category.innerHTML = details.name;
            title.innerHTML = details.title;
            submitDate.innerHTML = details.submitted_at;
            mark.innerHTML = details.marks;
            count.innerHTML = "Not Applicable";
            content.innerHTML = response.data[1].information;
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: error.response.data,
                    timeout: '6000',

                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();
            } else {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data) + ' Please try again later',
                    timeout: '6000',

                }).show();
            }
        });
})
