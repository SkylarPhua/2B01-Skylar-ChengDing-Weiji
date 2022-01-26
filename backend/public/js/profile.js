const getdata = document.getElementById("back");
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
}

function getProfile() {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/article/' + userid,
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

}