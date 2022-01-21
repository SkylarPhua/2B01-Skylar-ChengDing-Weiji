
const getdata = document.getElementById("getArticleData");
let userid = localStorage.getItem('user_id');
let token = localStorage.getItem('token');
const axios = window.axios;

const baseUrl = 'http://localhost:8000';
window.onload = () => {
    event.preventDefault();
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
            if (articles != null) {
                getdata.innerHTML = '';
                articles.forEach((article) => {
                    var postHtml = `
                    <tr>
                    <th>Title</th>
                    <th>Article</th>
                    <th>Submission Date</th>
                    <th>Grade</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>  
                    
                <tr>
                    <td>${article.title}</td>
                    <td>${article.content}</td>
                    <td>${article.submitted_at}</td>
                    <td>${article.grade}</td>
                    <td><a onclick="editBtn('${article.userid}')" class = "btn btn-info">Edit</a></td>
                    <td><a onclick="articleDel('${article.userid}')" class = "btn btn-danger" id="dis">Delete</a></td>
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
                alert("You have not submitted any article")
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


function editBtn() {
    event.preventDefault();
    window.location = "edit.html";
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
            url: baseUrl + '/competition/articles/' + userId,
            dataType: "json",
        })
            .then(function (response) {
                window.alert("You have deleted your aticle ")
                btn();
            })
            .catch(function (error) {
                if (error.response.status = 404) {
                    console.log("This is the error" + error);
                    window.alert("Error, Unable to Delete Student : " + id + " " + error)
                } else if (error.response.status == 403) {
                    alert(JSON.stringify(error.response.data));
                    window.location = "login.html";
                };
            });
    } else {
        console.log("Cancel button detected");
    }
}






//End of checking for $loginFormContainer jQuery object