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
        alert("Unauthorised, You are not an admin")
        window.location.replace("login.html");
    }

    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/tournamentArticle/' + tournamentID,
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
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else if (error.response.status == 404) {
                new Noty({
                    type: 'error',
                    theme: 'sunset',
                    timeout: '6000',
                    text: 'Student has not submitted their article, Unable to View. <a href="A_tournament.html" class="btn btn-danger btn-sm">Back</a>',
                    killer: true
                }).show();
            } else {
                window.alert(error);
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
        url: baseUrl + '/competition/tournamentMarks/',
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    })
        .then(function (response) {

            event.preventDefault();
            window.location("A_tournamentView.html");
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert("Error: " + error);
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
        url: baseUrl + '/competition/tournamentArticleSummary/' + tournamentID,
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
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert(error);
            }
        });
})
