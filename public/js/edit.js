const baseUrl = 'http://localhost:8000';
const axios = window.axios;
let userid = localStorage.getItem('user_id');
var catInput = document.getElementById("cat");
var titleInput = document.getElementById("title");
var articleInput = document.getElementById("article");
let token = localStorage.getItem('token');
let dueDateType = localStorage.getItem('group_type');
let role = localStorage.getItem('role_name');

window.addEventListener('DOMContentLoaded', function () {
    // const overlayLoading = document.getElementById('loading');
    if (role != "student") {
        new Noty({
            type: 'error',
            text: "Unauthorised, You are not a Student",
            timeout: '6000',
        }).on('onClose', () => {
            window.location = "login.html"
        }).show();
    } else {
        getTheDue(dueDateType)

    }
})



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
                window.location = "nocontent.html"
            } else if (today < dueDate) {
                getArticleData()
            } else {
                alert("bug found")
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
            } else if (error.response.status == 500) {
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



function getArticleData() {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/article/' + userid,
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
                    text: JSON.stringify(error.response.data) + 'Please try again later',
                    timeout: '6000',
                    killer: true
                }).show();
            }
            n.close();
        });

}

$('#submitButton').on('click', function () {
    // overlayLoading.style.display = ""
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
        url: '/competition/studentArticle/' + userid,
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    }).then(function (response) {
        console.log(response.data)
        new Noty({
            type: 'success',
            text: "Successfully Edited",
            timeout: '6000',
          }).on('onClose', () => {
            window.location = "submission.html"
          }).show();

    }).catch(function (error) {
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
                text: JSON.stringify(error.response.data) + 'Please try again later',
                timeout: '6000',
                killer: true
            }).show();
        }
        n.close();
    });

})

$('#backBtn').on('click', function () {
    window.location.href("submission.html")
})


