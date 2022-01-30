const getdata = document.getElementById("back");
const getData = document.getElementById("collapse");
let token = localStorage.getItem('token');
let userid = localStorage.getItem('user_id');
let role = localStorage.getItem('role_name');
const baseUrl = 'http://localhost:8000';

window.onload = () => {
    if (role != "student") {
        alert("Unauthorised, You are not a Student")
        window.location.replace("login.html");
    }
    getProfile();
    getArticles();
}

function getProfile() {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url:  '/competition/article/' + userid,
        dataType: "json",
    }).then(function (response) {
        const articles = response.data[0];
        if (articles != null) {
            getdata.innerHTML = '';
            var postHtml = `
                <p>${articles.username}</p>
                <p>${articles.email}</p>
                <p>Education lvl : ${articles.edu_lvl}</p>
                    
              `;
            getdata.innerHTML += postHtml;

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

function getArticles() {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url:  '/competition/history/' + userid,
        dataType: "json",
    }).then(function (response) {
        const articles = response.data;
        if (articles != null || response.status == "200") {
            var postHtml = `<p id="p1">Click to view more Information:</p>`
            getData.innerHTML = '';
            articles.forEach((article) => {
                postHtml += `
                <button class="collapsible" id="collapsible">Submission For : ${article.tournament_type}</button>
                    <div class="content">
                        <div class="card"">
                            <div class="card-head">
                                <h1 class="card-title">Title : ${article.title}</h1>
                                <h2 class="card-title">Marks : ${article.marks}</h2>
                                <h3 class="card-title">Date of Submission : ${article.submitted_at}</h3>
                            </div>
                            <div class="card-footer">
                                <p class="card-text">${article.content}</p>
                            </div>
                        </div>
                    </div>
              `;
            })
            getData.innerHTML += postHtml;
            collapsetest();
        } else {
            console.log("Issue in retrieving...");
        }
    }).catch(function (error) {
        console.log("it ran the error");
        if (error.status == 403) {
            alert(JSON.stringify(error.response.data));
            window.location = "login.html";
        } else {
            window.alert(error);
        }

    });
}

function collapsetest() {
    var coll = document.getElementsByClassName("collapsible");
    for (var i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}