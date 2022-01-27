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
                <td>${article.group_type_display}</td>
                <td>${article.title}</td>
                <td>${article.catname}</td>
                <td>${article.submitted_at}</td>
                <td>${article.marks}</td>
                <td>${article.graded_at}</td>
                <td><a onclick="articleSelect('${article.userid}', '${article.tournamentid}')" class = "btn btn-info">View</a></td>
                <td><a onclick="studentDelete('${article.userid}')" class = "btn btn-danger" id="dis">Disqualify</a></td>
            </tr>
          `;
                    getdata.innerHTML += postHtml;
                })
            } else {
                console.log("Issue in retrieving...");
            }
        })
}

function articleSelect(userid, tournamentid) {
    localStorage.setItem("studentid", userid);
    localStorage.setItem("tournamentid", tournamentid);
    window.location = "A_tournamentView.html";
}

// function studentDelete(userid) {
//     var txt = confirm("Are you sure?");
//     if (txt == true) {
//         console.log("Deleting now");
//         axios({
//             headers: {
//                 'user': userid,
//                 'authorization': 'Bearer ' + token
//             },
//             method: 'DELETE',
//             url: baseUrl + '/students/' + userid + "/",
//             dataType: "json",
//         })
//             .then(function (response) {
//                 window.alert("You Have Disqualified Student : " + id);
//                 getAllTournamentArticles()
//             })
//             .catch(function (error) {
//                 if (error.response.status == 403) {
//                     alert(JSON.stringify(error.response.data));
//                     window.location = "login.html";
//                 } else {
//                     console.log("This is the error" + error);
//                     window.alert("Error, Unable to Delete Student : " + id + " " + error)
//                 }
//             })
//     } else {
//         console.log("Cancelled");
//     }
// }

function studentDelete(userid) {
    var n = new Noty({
        text: "Do you want to disqualify Student ID: " + userid,
        buttons: [
            Noty.button('YES', 'btn btn-success', function () {
                axios({
                    headers: {
                        'user': userid,
                        'authorization': 'Bearer ' + token
                    },
                    method: 'DELETE',
                    url: baseUrl + '/students/' + userid + "/",
                    dataType: "json",
                })
                    .then(function (response) {
                        window.alert("You Have Disqualified Student : " + id);
                        n.close();
                        getAllTournamentArticles()
                    })
                    .catch(function (error) {
                        if (error.response.status == 403) {
                            alert(JSON.stringify(error.response.data));
                            window.location = "login.html";
                        } else {
                            console.log("This is the error" + error);
                            window.alert("Error, Unable to Delete Student : " + id + " " + error)
                        }
                    })
            }, { id: 'button1', 'data-status': 'ok' }),
            Noty.button('NO', 'btn btn-error', function () {
                console.log('button 2 clicked');
                n.close();
            })
        ],
        killer: true,
    });
    n.show();
}