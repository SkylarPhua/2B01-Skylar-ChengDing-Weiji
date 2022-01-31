const baseUrl = 'http://localhost:8000';
const axios = window.axios;
let userid = localStorage.getItem('userid');
let articleid = localStorage.getItem('articleid');
let role = localStorage.getItem('role_name');
const catInput = document.getElementById("cat");
const titleInput = document.getElementById("title");
const articleInput = document.getElementById("article");
const count = document.getElementById("count");
const gradE = document.getElementById("Marks");
var initialgrade;
let token = localStorage.getItem('token');


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
            count.innerHTML = '';

            const details = response.data[0];

            var postcat = encodeURIComponent(details.name)
            var posttitle = details.title;
            var postarticle = details.content;
            var postcount = details.count;
            initialgrade = details.grade;
            // var postgrade = `<option disabled selected value=${initialgrade} hidden>${initialgrade}</option>`;

            catInput.innerHTML += postcat;
            titleInput.innerHTML += posttitle;
            articleInput.innerHTML += postarticle;
            count.innerHTML += postcount;

            if (initialgrade != null) {
                gradE.innerHTML += initialgrade;
            }
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: error.response.data,
                    timeout: '6000',

                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();
            } else if (error.response.status == 404) {
                new Noty({
                    type: 'error',
                    text: error.response.data,
                    timeout: '6000',
                    killer: true
                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();
            }
            else {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data) + ' Please try again later',
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();
            }
        });
}

$('#submitButton').on('click', function () {
    let grade = $('#Marks').val();
    console.log("grade : " + grade);
    console.log("initial :" + initialgrade);

    if (initialgrade == null && grade != null) {
        console.log("posting");
        postgrade(grade);
    } else if (initialgrade != null && grade != null) {
        console.log("putting");
        putgrade(grade);
    } else {
        new Noty({
            type: 'error',
            text: "Please enter a grade before proceeding",
            timeout: '6000',

        }).show();
    }
})

$('#summariseButton').on('click', function () {
    event.preventDefault();
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/article/summarise/' + userid,
        dataType: "json",
    })
        .then(function (response) {
            catInput.innerHTML = '';
            titleInput.innerHTML = '';
            articleInput.innerHTML = '';
            count.innerHTML = '';

            const details = response.data[0];


            var postcat = encodeURIComponent(details.name)
            var posttitle = details.title;
            var postarticle = response.data[1].information;
            initialgrade = details.grade;
            var postgrade = `<option disabled selected value=${initialgrade} hidden>${initialgrade}</option>`;

            catInput.innerHTML += postcat;
            titleInput.innerHTML += posttitle;
            articleInput.innerHTML += postarticle;

            if (initialgrade != null) {
                gradE.innerHTML += postgrade;
            }
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
            } else if (error.response.status == 404) {
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

                }).on('onClose', () => {
                    window.location = "login.html"
                })
                    .show();
            } else {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data) + ' Please try again later',
                    timeout: '6000',

                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();
            }
        });
})

function postgrade(grade) {
    event.preventDefault();
    const requestBody = {
        userid: userid,
        grade: grade,
    };
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'POST',
        url: '/competition/grade/' + articleid,
        data: requestBody,
        dataType: "json",
    })
        .then(function (response) {
            new Noty({
                type: 'error',
                text: "You Have Successfully graded Student : " + userid,
                timeout: '6000',

            }).on('onClose', () => {
                window.location = "A_home.html"
            })
                .show();
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: error.response.data,
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();
            } else {
                new Noty({
                    type: 'error',
                    text: "Cannot Grade this student : " + error,
                    timeout: '6000',
                    killer: true
                }).show();
                console.log("Ungradable student : " + error.message);
            }
        });
}

function putgrade(grade) {
    event.preventDefault();
    const requestBody = {
        grade: grade,
    };
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'PUT',
        url: '/competition/grades/' + articleid,
        data: requestBody,
        dataType: "json",
    })
        .then(function (response) {
            new Noty({
                type: 'error',
                text: "You Have Successfully Updated grade for student : " + userid,
                timeout: '6000',

            }).on('onClose', () => {
                window.location = "A_home.html"
            }).show();
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
                    text: "Cannot update Grade for this student : " + error,
                    timeout: '6000',
                    killer: true

                }).show();

                console.log("Ungradable student : " + error.message);
            }

        });
}

$('#plagiarismCheck').on('click', function () {
    event.preventDefault();
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/checkPlagiarism/' + userid,
        dataType: "json",
    })
        .then(function (response) {
            var plagirasimPercentage = response.data
            console.log(response.data);
            if (plagirasimPercentage > 3) {
                plagiarismInput.innerHTML = 'The plagiarism percentage of this article was higher than 40%, please disqualify this article';
                $("#plagiarismFormGroup").show();
            } else {
                plagiarismInput.innerHTML = 'This article pass the plagiarism checking system';
                $("#plagiarismFormGroup").show();
            }

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
            } else if (error.response.status == 404) {
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
                    text: JSON.stringify(error) + 'Please try again later',
                    timeout: '6000',
                })
                    .show();
            }
        });
})

$('#backBtn').on('click', function () {
    window.location.href("A_home.html")
})