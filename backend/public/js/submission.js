const getdata = document.getElementById("getArticleData");
let userid = localStorage.getItem('user_id');
let token = localStorage.getItem('token');
let role = localStorage.getItem('role_name');
let groupType = localStorage.getItem('group_type');
const axios = window.axios;

const baseUrl = 'http://localhost:8000';

window.onload = () => {
    if (role != "student") {
        alert("Unauthorised, You are not a Student")
        window.location.replace("login.html");
    }
    console.log("This is the group type: " + groupType);
    event.preventDefault();
    if (groupType === "final") {
        console.log("Im in FINAL");
        showContent()
        getTheDue(groupType);
    } else if (groupType === "semi_final_one" || groupType === "semi_final_two") {
        console.log("Im in SEMI FINAL");
        showContent()
        getTheDue(groupType);
    } else if (groupType === "group_one" || groupType === "group_two" || groupType === "group_three" || groupType === "group_four") {
        console.log("Im in GROUP");
        showContent()
        getTheDue(groupType);
    } else {
        console.log("IM in the ELSE");
        showContent()
        getTheDue(groupType);
        
    }
}



function showContent() {
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
            const articles = response.data;
            console.log(articles);
            if (articles != null) {
                
                getdata.innerHTML = '';
                articles.forEach((article) => {
                    console.log("ssssss"+articles[0].title);
                    
                    var postHtml = `
            <tr>
                <th style="font-size: 25px;font-weight:bold">Title</th>
                <th style="font-size: 25px;font-weight:bold">Article</th>
                <th style="font-size: 25px;font-weight:bold">Submission Date</th>
                <th style="font-size: 25px;font-weight:bold">Grade</th>
                <th style="font-size: 25px;font-weight:bold">Edit</th>
                <th style="font-size: 25px;font-weight:bold">Delete</th>
            </tr>  

            <tr>
            <td style="font-size: 25px;">${articles.title}</td>
            <td style="font-size: 25px;">${article.content}</td>
            <td style="font-size: 15px;">${article.submitted_at}</td>
            <td style="font-size: 25px;">${article.grade}</td>
                <td ><button onclick="editBtn('${articles.userid}')" class = "btn btn-info" >Edit</button></td>
                <td><button onclick="articleDel('${article.userid}')" class = "btn btn-danger" id="dis" >Delete</button></td>
            </tr>
          `;
                    getdata.innerHTML += postHtml;
                })
            } else {
                console.log("Issue in retrieving...");
            }

        })
        .catch(function (error) {
            //Handle error
            if (error.response.status == 404) {
                printText();
                btn();
            } else if (error.response.status == 403) {
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                alert("There is an unknown error")
                console.log(error)
            }
        });

}

function btn() {
    event.preventDefault();
    getdata.innerHTML = '';
    var postHtml = `
        <a onclick= 'href="postArticle.html"' class = "btn btn-danger">Submit Your Article</a>
        `;
    getdata.innerHTML += postHtml;
}

// function myFunction() {
//     var element = document.getElementById("demo");
//     element.parentNode.removeChild(element);
//   }

function getTheDue(dueDateType) {
    axios({
        method: 'GET',
        url: baseUrl + '/competition/dueDate/' + dueDateType,
        dataType: "json",
    })
        .then(function (response) {
            const dateResult = response.data;
            console.log(dateResult);
            var dueDate = dateResult[0].duedate
            console.log(dueDate);
            countDown(dueDate)
        })
        .catch(function (error) {
            //Handle error
            if (error.response.status == 404) {
            } else {
                alert("There is an unknown error")
                console.log(error)
            }
        });
}

function printText() {
    var txt = `Welcome to our Competition!!! Submit your article and win the Prizes`;
    document.getElementById('printText').innerText = txt;
}

function countDown(dueDate) {
    var countDate = new Date(dueDate).getTime();
    setInterval(function () {
        var now = new Date().getTime();
        var gap = countDate - now;

        if (gap < 0) {
            document.getElementById('day').innerText = "00";
            document.getElementById('hour').innerText = "00";
            document.getElementById('minute').innerText = "00";
            document.getElementById('second').innerText = "00";
            document.getElementById("expired").innerHTML = "Expired";
        } else {
            var d = Math.floor(gap / (1000 * 60 * 60 * 24));
            var h = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));;
            var m = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
            var s = Math.floor((gap % (1000 * 60)) / 1000);

            document.getElementById('day').innerText = d;
            document.getElementById('hour').innerText = h;
            document.getElementById('minute').innerText = m;
            document.getElementById('second').innerText = s;

        }
    }, 1000)
}

// function btn() {
//     event.preventDefault();
//     getdata.innerHTML = '';
//     var postHtml = `
//         <a onclick= 'href="postArticle.html"' class = "btn btn-danger">Submit Your Article</a>
//         `;
//     getdata.innerHTML += postHtml;
// }


function editBtn() {
    event.preventDefault();
    window.location = "edit.html";
}

function editBtnTournamentEdition() {
    window.location = "postArticleTournament.html";
}

function articleDeleteTournament(id) {
    let tournamentID = localStorage.getItem('tournamentID');
    var txt = confirm("Are you sure you want to delete your article?");
    if (txt == true) {
        console.log("Process of deleting");
        const requestBody = {
            tournamentid: tournamentID
        }
        axios({
            headers: {
                'user': userid,
                'authorization': 'Bearer ' + token
            },
            method: 'DELETE',
            url: baseUrl + '/competition/tournamentArticle/' + userid,
            data: requestBody,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        })
            .then(function (response) {
                window.alert("You have deleted the article");
                location.reload();
            })
            .catch(function (error) {
                console.log("Error: " + error);
            })
    } else {
        console.log("Cancel button detected");
    }
}

function articleDel(id) {
    event.preventDefault();
    var txt = confirm("Are you sure want to delete your article?");
    if (txt == true) {
        console.log("im sure want to delete");
        axios({
            headers: {
                'user': userid,
                'authorization': 'Bearer ' + token
            },
            method: 'DELETE',
            url: baseUrl + '/competition/articles/' + userid,
            dataType: "json",
        })
            .then(function (response) {
                // new Noty({
                //     type: 'success',
                //     timeout: '6000',
                //     layout: 'topCenter',
                //     theme: 'bootstrap-v4',
                //     text: 'You have deleted your article',
                // }).show();
                window.alert("You have deleted the article");
                location.reload();
            })
            .catch(function (error) {
                // if (error.response.status = 404) {
                //     console.log("This is the error" + error);
                //     window.alert("Error, Unable to Delete Student : " + id + " " + error)
                // } else if (error.response.status == 403) {
                //     alert(JSON.stringify(error.response.data));
                //     window.location = "login.html";
                // };
                console.log("There was an error: " + JSON.stringify(error));
            });
    } else {
        console.log("Cancel button detected");
    }
}






//End of checking for $loginFormContainer jQuery object