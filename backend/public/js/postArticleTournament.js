var count = document.getElementById('count');
var titleArticle = document.getElementById('title');
var article = document.getElementById('article');
let token = localStorage.getItem('token');
let userid = localStorage.getItem('user_id');
let groupType = localStorage.getItem('group_type');
let role = localStorage.getItem('role_name');

window.onload = () => {
    if (role != "student") {
        alert("Unauthorised, You are not a Student")
        window.location.replace("login.html");
    }
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

window.onload = () => {
    const baseUrl = 'http://localhost:8000';
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/tournamentArticle/' + userid + '/' + groupType,
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

        })
        .catch(function (error) {
            // if (error.response.status == 403) {
            //     alert("You are not logged in")
            //     window.location = "login.html";
            // } else {
            //     window.alert(error);
            // }
            console.log("The is the ERROR: " + error);
        });

}

$('#submitButton').on('click', function (event) {
    event.preventDefault();
    const baseUrl = 'http://localhost:8000';
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
        url: baseUrl + '/competition/tournamentArticle/',
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    })
        .then(function (response) {
            alert("submit successfully")
            window.location = "submission.html"
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert("This is the error: " + error);
                console.log("This is the error: " + error.message);
            }
        });
});

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
        return;
    }
});