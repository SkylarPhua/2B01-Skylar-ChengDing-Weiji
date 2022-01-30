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
        alert("Unauthorised, You are not an admin")
        window.location.replace("login.html");
    }

    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url:  '/competition/article/' + userid,
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
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert(error);
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
        window.alert("Please enter a grade before proceeding");
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
        url:  '/competition/article/summarise/' + userid,
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
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert(error);
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
        url:  '/competition/grade/' + articleid,
        data: requestBody,
        dataType: "json",
    })
        .then(function (response) {
            alert("You Have Successfully graded Student : " + userid)
            window.location = "A_home.html"
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                alert(JSON.stringify(error.response.data));
                window.location = "login.html"
            } else {
                window.alert("Cannot Grade this student : " + error);
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
        url:  '/competition/grades/' + articleid,
        data: requestBody,
        dataType: "json",
    })
        .then(function (response) {
            alert("You Have Successfully Updated grade for student : " + userid)
            window.location = "A_home.html"
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert("Cannot update Grade for this student : " + error);
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
        url:  '/competition/checkPlagiarism/' + userid,
        dataType: "json",
    })
        .then(function (response) {
            var plagirasimPercentage = response.data
            console.log(response.data);
            if (plagirasimPercentage > 3) {
                plagiarismInput.innerHTML = 'The plagiarism percentage of this article was higher than 40%, please disqualify this article';
                $("#plagiarismFormGroup").show();
                // var y = document.getElementById("plagiarismFormGroup");
                // y.show();
            }else{
                plagiarismInput.innerHTML = 'This article pass the plagiarism checking system';
                $("#plagiarismFormGroup").show();
            }
            
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                alert(JSON.stringify(error.response.data));
                window.location = "login.html";
            } else {
                window.alert(error);
            }
        });
})

$('#backBtn').on('click', function () {
    window.location.href("A_home.html")
})