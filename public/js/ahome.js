const getdata = document.getElementById("getData");
let token = localStorage.getItem('token');
let role = localStorage.getItem('role_name');
let userid = localStorage.getItem('user_id');
const baseUrl = 'http://localhost:8000';
const axios = window.axios;

window.onload = () => {
    if (role != "admin") {
        new Noty({
            type: 'error',
            text: "Unauthorised, You are not an admin",
            timeout: '6000',

        }).on('onClose', () => {
            window.location = "login.html"
        })
            .show();
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
        url: '/competition/articles',
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
                    <td><a onclick="addGroup('${article.userid}', '${article.email}', '${article.content}', '${article.title}', '${article.submitted_at}')" class = "btn btn-info">Add To Group</a></td>
                </tr>
              `;
                    getdata.innerHTML += postHtml;
                })
            } else {
                console.log("Issue in retrieving...");
            }
        }).catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: error.response.data,
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "login.html"
                })
                    .show();
            } else {
                new Noty({
                    type: 'error',
                    text: error,
                    timeout: '6000',
                })
                    .show();
            }

        });
}

$('#resetButton').on('click', function () {
    getAllArticle();
})

function addGroup(userid, email, title, subDate) {

    var n = new Noty({
        text: "Which Group?",
        buttons: [
            Noty.button('1', 'btn btn-success', function () {
                const requestBody = {
                    userid: userid,
                    tournamentType: 1
                }
                axios({
                    headers: {
                        'user': userid,
                        'authorization': 'Bearer ' + token
                    },
                    method: 'POST',
                    url: '/competition/tournament/',
                    data: requestBody,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                })
                    .then(function (response) {
                        new Noty({
                            type: 'success',
                            text: 'Student has been added to group: ' + 1,
                            timeout: '6000',
                            killer: true
                        }).show();
                        sendMail(1, email, title, subDate);
                        n.close();
                    })
                    .catch(function (error) {
                        if (error.response.status == 403) {
                            new Noty({
                                type: 'error',
                                text: JSON.stringify(error.response.data),
                                timeout: '6000',
                            }).on('onClose', () => {
                                window.location = "login.html"
                            })
                                .show();

                        } else if (error.response.status == 500) {
                            new Noty({
                                type: 'error',
                                text: 'Student is already in a group',
                                timeout: '6000',
                                killer: true
                            }).show();
                        }
                        n.close();
                    })
            }),
            Noty.button('2', 'btn btn-success', function () {
                const requestBody = {
                    userid: userid,
                    tournamentType: 2
                }
                axios({
                    headers: {
                        'user': userid,
                        'authorization': 'Bearer ' + token
                    },
                    method: 'POST',
                    url: '/competition/tournament/',
                    data: requestBody,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                })
                    .then(function (response) {
                        new Noty({
                            type: 'success',
                            text: 'Student has been added to group: ' + 2,
                            timeout: '6000',
                            killer: true
                        }).show();
                        sendMail(2, email, title, subDate);
                        n.close();
                    })
                    .catch(function (error) {
                        if (error.response.status == 403) {
                            new Noty({
                                type: 'error',
                                text: error.response.data,
                                timeout: '6000',
                            }).on('onClose', () => {
                                window.location = "login.html"
                            })
                                .show();

                        } else if (error.response.status == 500) {
                            new Noty({
                                type: 'error',
                                text: 'Student is already in a group',
                                timeout: '6000',
                                killer: true
                            }).show();
                        }
                        n.close();
                    })
            }),
            Noty.button('3', 'btn btn-success', function () {
                const requestBody = {
                    userid: userid,
                    tournamentType: 3
                }
                axios({
                    headers: {
                        'user': userid,
                        'authorization': 'Bearer ' + token
                    },
                    method: 'POST',
                    url: '/competition/tournament/',
                    data: requestBody,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                })
                    .then(function (response) {
                        new Noty({
                            type: 'success',
                            text: 'Student has been added to group: ' + 3,
                            timeout: '6000',
                            killer: true
                        }).show();
                        sendMail(3, email, title, subDate);
                        n.close();
                    })
                    .catch(function (error) {
                        if (error.response.status == 403) {
                            new Noty({
                                type: 'error',
                                text: error.response.data,
                                timeout: '6000',
                            }).on('onClose', () => {
                                window.location = "login.html"
                            })
                                .show();

                        } else if (error.response.status == 500) {
                            new Noty({
                                type: 'error',
                                text: 'Student is already in a group',
                                timeout: '6000',
                                killer: true
                            }).show();
                        }
                        n.close();
                    })
            }),
            Noty.button('4', 'btn btn-success', function () {
                const requestBody = {
                    userid: userid,
                    tournamentType: 4
                }
                axios({
                    headers: {
                        'user': userid,
                        'authorization': 'Bearer ' + token
                    },
                    method: 'POST',
                    url: '/competition/tournament/',
                    data: requestBody,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                })
                    .then(function (response) {
                        new Noty({
                            type: 'success',
                            text: 'Student has been added to group: ' + 4,
                            timeout: '6000',
                            killer: true
                        }).show();
                        sendMail(4, email, title, subDate);
                        n.close();
                    })
                    .catch(function (error) {
                        if (error.response.status == 403) {
                            new Noty({
                                type: 'error',
                                text: error.response.data,
                                timeout: '6000',
                            }).on('onClose', () => {
                                window.location = "login.html"
                            })
                                .show();
                        } else if (error.response.status == 500) {
                            new Noty({
                                type: 'error',
                                text: 'Student is already in a group',
                                timeout: '6000',
                                killer: true
                            }).show();
                        }
                        n.close();
                    })
            }),
            Noty.button('Cancel', 'btn btn-danger', function () {
                n.close();
            }),
        ],
        killer: true
    })
    n.show();
}

function sendMail(groupNumber, email, title, subDate) {
    const subject = "You have advanced higher into the tournament!"
    const text = "Your article was so exceptional, this was your previous details(Title and Submission Date): \nTitle: " + title + " \nSubmission Date: " + subDate + " \nWe have advanced you into group number " + groupNumber + " \nAll the best!!!"
    const requestBody = {
        email: email,
        subject: subject,
        text: text
    };
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'POST',
        url: '/competition/tournamentSendMail/',
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    })
        .then(function (response) {
            console.log("Everything is fine, it sent");
        })
        .catch(function (error) {
            console.log("The sending of email failed");
        })
};

function articleSelect(id, ID) {
    localStorage.setItem("userid", id);
    localStorage.setItem("articleid", ID);
    window.location = "A_mark.html";
}

function articleDel(id) {
    var n = new Noty({
        text: "Do you want to disqualify Student ID: " + id,
        buttons: [
            Noty.button('YES', 'btn btn-success', function () {
                axios({
                    headers: {
                        'user': userid,
                        'authorization': 'Bearer ' + token
                    },
                    method: 'DELETE',
                    url: '/competition/articles/' + id,
                    dataType: "json",
                })
                    .then(function (response) {
                        n.close();
                        getAllArticle();
                    })
                    .catch(function (error) {
                        if (error.response.status == 403) {
                            new Noty({
                                type: 'error',
                                text: error.response.data,
                                timeout: '6000',
                            }).on('onClose', () => {
                                window.location = "login.html"
                            })
                                .show();
                        } else {
                            new Noty({
                                type: 'error',
                                text: "Error, Unable to Delete Student : " + id + " " + error,
                                timeout: '6000',
                                killer: true
                            })
                                .show();
                        }

                    });
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
        url: URL,
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
            new Noty({
                type: 'error',
                text: error.response.data,
                timeout: '6000',
            }).on('onClose', () => {
                window.location = "login.html"
            })
                .show();
        } else if (error.response.status == 404) {
            new Noty({
                type: 'error',
                text: error.response.data,
                timeout: '6000',
                killer: true
            })
                .show();
        } else {
            new Noty({
                type: 'error',
                text: JSON.stringify(error.response.data) + ' Please try again later',
                timeout: '6000',
                killer: true
            })
                .show();
        }

    });
})