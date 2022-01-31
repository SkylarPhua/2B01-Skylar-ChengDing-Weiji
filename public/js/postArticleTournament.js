var count = document.getElementById('count');
var titleArticle = document.getElementById('title');
var article = document.getElementById('article');
let token = localStorage.getItem('token');
let userid = localStorage.getItem('user_id');
let groupType = localStorage.getItem('group_type');
let role = localStorage.getItem('role_name');
let email = localStorage.getItem('email');
const overlayLoading = document.getElementById('loading');
const baseUrl = 'http://localhost:8000';

window.addEventListener('DOMContentLoaded', function () {

    getTheDue(groupType)

    overlayLoading.style.display = "";
    if (role != "student") {
        new Noty({
            type: 'error',
            text: "Unauthorised, You are not a Student",
            timeout: '6000',
        }).on('onClose', () => {
            window.location = "login.html"
        }).show();
    }

    document.getElementById('submitButton').disabled = true;
    window.addEventListener('keyup', chkinput)
    function chkinput() {
        if (document.getElementById("title").value.trim() === "" || document.getElementById("article").value.trim() === "") {
            document.getElementById('submitButton').disabled = true;
        } else {
            document.getElementById('submitButton').disabled = false;
        }
    }

    getArticle();

    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        overlayLoading.style.display = "";
        let title = $('#title').val();
        let article = $('#article').val();
        const requestBody = {
            userid: userid,
            groupType: groupType,
            title: title,
            content: article
        };
        console.log("This is the reqbody: " + JSON.stringify(requestBody));
        axios({
            headers: {
                'user': userid,
                'authorization': 'Bearer ' + token
            },
            method: 'PUT',
            url: '/competition/tournamentArticle/',
            data: requestBody,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        })
            .then(function (response) {
                sendMail();
                overlayLoading.style.display = "none";
                new Noty({
                    type: 'success',
                    text: JSON.stringify(response.data),
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "submission.html"
                }).show();

            })
            .catch(function (error) {
                if (error.response.status == 403) {
                    new Noty({
                        type: 'error',
                        text: JSON.stringify(error.response.data),
                        timeout: '6000',
                    }).on('onClose', () => {
                        window.location = "login.html"
                    }).show();

                } else if (error.response.status == 404) {
                    new Noty({
                        type: 'error',
                        text: JSON.stringify(error.response.data),
                        timeout: '6000',
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
                n.close();
            });
    });
});

function getTheDue(dueDateType) {
    axios({
        method: 'GET',
        url: '/competition/dueDate/' + dueDateType,
        dataType: "json",
    })
        .then(function (response) {
            const dateResult = response.data;
            console.log(dateResult);
            var dueDate = dateResult[0].duedate
            console.log(dueDate);
            var dueDate = new Date(dueDate)
            var today = new Date()

            if (dueDate < today) {
                new Noty({
                    type: 'error',
                    text: 'Submission dateline has ended, You are not able to submit any article',
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "submission.html"
                }).show();
            }
        })
        .catch(function (error) {
            if (error.response.status == 404) {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data),
                    timeout: '6000',
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
            n.close();
        });
}


function getArticle() {
    const baseUrl = 'http://localhost:8000';
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/tournamentArticle/' + userid + '/' + groupType,
        dataType: "json",
    })
        .then(function (response) {
            titleArticle.innerText = '';
            article.innerText = '';

            const details = response.data[0];
            var posttitle = details.title;
            var postarticle = details.articlecontent;
            var postcount = details.count;

            titleArticle.innerText += posttitle;
            article.innerText += postarticle;
            count.innerText += postcount;

            overlayLoading.style.display = "none";
        })
        .catch(function (error) {
            if (error.response.status == 404) {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data),
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();

            } else {
                overlayLoading.style.display = "none";
                new Noty({
                    type: 'error',
                    timeout: '6000',
                    layout: 'topCenter',
                    theme: 'bootstrap-v4',
                    text: 'Please writer up your article below',
                    killer: true
                }).show();
            }
            n.close();
        });
}

function sendMail() {
    const subject = "Your work was received!";
    const text = "You have successfully submitted your article";
    const requestBody = {
        email: email,
        subject: subject,
        text: text
    };
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'POST',
        url: '/competition/tournamentSendMail/',
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    })
        .then(function (response) {
            console.log("Everything is fine, it sent");
        })
        .catch(function (error) {
            console.log("The sending of email failed");
        })
}

var globalWordCount = 0;
var wordLimit = 500;

function countWord() {
    let text = article.value;
    text = text.trim();
    const words = text.split(" ");
    if (words[0] === "") {
        count.innerText = 0;
    } else {
        count.innerText = words.length;
        globalWordCount = words.length;
        console.log("Words: " + globalWordCount);
    }
}

article.addEventListener('keydown', function (e) {
    if (globalWordCount > wordLimit && e.code !== "Backspace") {
        new Noty({
            type: 'error',
            layout: 'topCenter',
            theme: 'sunset',
            timeout: '1000',
            text: 'You exceeded the word limit, please delete some words',
            killer: true
        }).show();
        e.preventDefault();
        count();
        return;
    }
});