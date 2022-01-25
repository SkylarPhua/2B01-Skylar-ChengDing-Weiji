const getdata = document.getElementById("getData");
let token = localStorage.getItem('token');
let role = localStorage.getItem('role_name');
let userid = localStorage.getItem('user_id');
const baseUrl = 'http://localhost:8000';
const axios = window.axios;

window.onload = () => {
    if (role != "admin") {
        alert("Unauthorised, You are not an admin")
        window.location.replace("login.html");
    }
    searchparameters();
}

function searchparameters() {
    let searchInput = $('#searchInput').val();
    let latestInput = $('#latestInput').val();
    let eduInput = $('#eduInput').val();
    let catInput = $('#catInput').val();
    if (searchInput == "" && latestInput == "1" && eduInput == null && catInput == null) {
        getAllArticle();
    }
};

function getAllArticle() {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/articles',
        dataType: "json",
    })
        .then(function (response) {
            const articles = response.data;
            if (articles != null) {
                getdata.innerHTML = '';
                articles.forEach((article) => {
                    var postHtml = `
                <tr>
                    <td>${article.name}</td>
                    <td>${article.email}</td>
                    <td>${article.edu_lvl}</td>
                    <td>${article.title}</td>
                     <td>${article.catname}</td>
                    <td>${article.submitted_at}</td>
                    <td>${article.grade}</td>
                    <td>${article.marked_at}</td>
                    <td><a onclick="articleSelect('${article.userid}', '${article.articleid}')" class = "btn btn-info">View</a></td>
                    <td><a onclick="articleDel('${article.userid}')" class = "btn btn-danger" id="dis">Disqualify</a></td>
                </tr>
              `;
                    getdata.innerHTML += postHtml;
                })
            } else {
                console.log("Issue in retrieving...");
            }
        }).catch(function (error) {
            if (error.response.status == 403) {
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert(error);
            }

        });
}

$('#resetButton').on('click', function () {
    getAllArticle();
})


function articleSelect(id, ID) {
    localStorage.setItem("userid", id);
    localStorage.setItem("articleid", ID);
    window.location = "A_mark.html";
}

function articleDel(id) {
    var txt = confirm("Are you sure?");
    if (txt == true) {
        console.log("here");
        axios({
            headers: {
                'user': userid,
                'authorization': 'Bearer ' + token
            },
            method: 'DELETE',
            url: baseUrl + '/competition/articles/' + id,
            dataType: "json",
        })
            .then(function (response) {
                window.alert("You have Disaqualified Student : " + id)
                getAllArticle();
            })
            .catch(function (error) {
                if (error.response.status == 403) {
                    alert(JSON.stringify(error.response.data));
                    window.location = "login.html";
                } else {
                    console.log("This is the error" + error);
                    window.alert("Error, Unable to Delete Student : " + id + " " + error)
                }

            });
    } else {
        console.log("her");
    }
}

$('#submitButton').on('click', function () {
    event.preventDefault();
    let searchInput = $('#searchInput').val();
    let latestInput = $('#latestInput').val();
    let eduInput = $('#eduInput').val();
    let catInput = $('#catInput').val();
    var URL;
    if (catInput == null) {
        catInput = "";
    }
    if (eduInput != null) {
        URL = '/competition/articles4?title=' + encodeURIComponent(searchInput) + '&recent=' + encodeURIComponent(latestInput) + '&edu_lvl=' + encodeURIComponent(eduInput) + '&category=' + encodeURIComponent(catInput);
    } else {

        URL = '/competition/articles3?title=' + encodeURIComponent(searchInput) + '&recent=' + encodeURIComponent(latestInput) + '&category=' + encodeURIComponent(catInput);
    }
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + URL,
        dataType: "application/json",
    }).then(function (response) {
        console.log(response)
        const articles = response.data;
        if (articles != null) {
            getdata.innerHTML = '';
            articles.forEach((article) => {
                var postHtml = `
            <tr>
                <td>${article.username}</td>
                <td>${article.email}</td>
                <td>${article.edu_lvl}</td>
                <td>${article.title}</td>
                <td>${article.name}</td>
                <td>${article.submitted_at}</td>
                <td>${article.grade}</td>
                <td>${article.marked_at}</td>
                <td><a onclick="articleSelect('${article.userid}')" class = "btn btn-info">View</a></td>
                <td><a onclick="articleDel('${article.userid}')" class = "btn btn-danger" id="dis">Disqualify</a></td>
            </tr>
          `;
                getdata.innerHTML += postHtml;
            })
        } else {
            console.log("Issue in retrieving...");
        }
    }).catch(function (error) {
        if (error.response.status == 403) {
            alert(JSON.stringify(error.response.data));
            window.location = "login.html"
        } else {
            window.alert(error);
        }

    });
})