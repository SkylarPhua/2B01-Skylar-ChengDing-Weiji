const baseUrl = 'http://localhost:8000';
const axios = window.axios;
let userid = localStorage.getItem('user_id');
var catInput = document.getElementById("cat");
var titleInput = document.getElementById("title");
var articleInput = document.getElementById("article");
let token = localStorage.getItem('token');
let role = localStorage.getItem('role_name');

window.onload = () => {
        if (role != "student"){
            alert("Unauthorised, You are not a Student")
            window.location.replace("login.html");
        }
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/article/' + userid,
        dataType: "json",
    })
        .then(function (response) {
            catInput.innerHTML = '';
            titleInput.innerHTML = '';
            articleInput.innerHTML = '';

            const details = response.data[0];
            console.log(response.data[0].name);
            console.log(details.title);
            console.log(details.content);
            var postcat = encodeURIComponent(details.name)
            var posttitle = details.title;
            var postarticle = details.content;
            var postcount = details.count;

            catInput.innerHTML += postcat;
            titleInput.innerHTML += posttitle;
            articleInput.innerHTML += postarticle;
            count.innerHTML += postcount;

        })
        .catch(function (error) {
            if (error.response.status == 403) {
                alert("You are not logged in")
                window.location = "login.html";
            } else {
                window.alert(error);
            }
        });

}

$('#submitButton').on('click', function () {
    event.preventDefault();
    let title = $('#title').val();
    let article = $('#article').val();
    const requestBody = {
        id: userid,
        title: title,
        content: article
    };
    console.log(JSON.stringify(requestBody))
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'PUT',
        url: baseUrl + '/competition/studentArticle/' + userid,
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    }).then(function (response) {
        console.log(response.data)
        window.alert("Successfully Edited")
        window.location = "submission.html";
    }).catch(function (error) {
        if (error.response.status == 403) {
            alert(JSON.stringify(error.response.data));
            window.location = "login.html";
        } else {
            window.alert(error);
        }
    });

})

$('#backBtn').on('click', function () {
    window.location.href("submission.html")
})


