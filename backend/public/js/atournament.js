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
    // Cheng Ding your filter feature should go here
    getAllTournamentArticles();
}

function getAllTournamentArticles() {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/tournamentArticles/',
        dataType: "json",
    })
    .then(function (response) {
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
                <td>${article.group_type_display}</td>
                <td>${article.catname}</td>
                <td>${article.submitted_at}</td>
                <td>${article.marks}</td>
                <td>${article.graded_at}</td>
                <td><a onclick="articleSelect('${article.userid}', '${article.articleid}')" class = "btn btn-info">View</a></td>
                <td><a onclick="articleDel('${article.userid}')" class = "btn btn-danger" id="dis">Disqualify</a></td>
            </tr>
          `;
                getdata.innerHTML += postHtml;
            })
        } else {
            console.log("Issue in retrieving...");
        }
    })
}