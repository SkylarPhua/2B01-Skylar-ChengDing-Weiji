const first = document.getElementById("1st");
const second = document.getElementById("2nd");
const third = document.getElementById("3rd");
const fourth = document.getElementById("4th");
const fifth = document.getElementById("5th");
const sixth = document.getElementById("6th");
const seventh = document.getElementById("7th");
const eighth = document.getElementById("8th");
const head = document.getElementById("head");
const contents = document.getElementById("contents");
const baseUrl = 'http://localhost:8000';

window.onload = () => {
    getLast4();
    getNext2();
    getTop2();
}

var datas4 = [];
var datas3 = [];
var datas2 = [];
function getLast4() {
    axios({
        method: 'GET',
        url: baseUrl + '/competition/tournamentLeaderboardFour/',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    }).then(function (response) {
        const data = response.data;
        fifth.innerHTML = `${data[3].username}`;
        sixth.innerHTML = `${data[2].username}`;
        seventh.innerHTML = `${data[1].username}`;
        eighth.innerHTML = `${data[0].username}`;
        datas4.push(data);
    }).catch(function (error) {
        window.alert("This is the error: " + error);
        console.log("This is the error: " + error.message);
    });
}
function getNext2() {
    axios({
        method: 'GET',
        url: baseUrl + '/competition/tournamentLeaderboardNextTwo/',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    })
        .then(function (response) {
            const data = response.data;
            third.innerHTML = `${data[1].username}`;
            fourth.innerHTML = `${data[0].username}`;
            datas3.push(data);
        })
        .catch(function (error) {
            window.alert("This is the error: " + error);
            console.log("This is the error: " + error.message);
        });
}
function getTop2() {
    axios({
        method: 'GET',
        url: baseUrl + '/competition/tournamentLeaderboardTopTwo/',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    })
        .then(function (response) {
            const data = response.data;
            if (response.data[0].marks != null) {
                first.innerHTML = `${data[0].username}`;
                second.innerHTML = `${data[1].username}`;
            }
            datas2.push(data);
        })
        .catch(function (error) {
            window.alert("This is the error: " + error);
            console.log("This is the error: " + error.message);
        });
}

function display(target) {
    var dataarray4 = datas4[0];
    var dataarray3 = datas4[0];
    var dataarray2 = datas4[0];
    if (target == '2') {
        head.innerHTML = `Title : ${dataarray2[1].title} <br><br>Category : ${dataarray2[1].name}`;
        contents.innerHTML = `${dataarray2[1].articlecontent}`;

    } else if (target == '1') {
        head.innerHTML = `Title : ${dataarray2[0].title} <br><br>Category : ${dataarray2[0].name}`;
        contents.innerHTML = `${dataarray2[0].articlecontent}`;

    } else if (target == '3') {
        head.innerHTML = `Title : ${dataarray3[1].title} <br><br>Category : ${dataarray3[1].name}`;
        contents.innerHTML = `${dataarray3[1].articlecontent}`;

    } else if (target == '4') {
        head.innerHTML = `Title : ${dataarray3[0].title} <br><br>Category : ${dataarray3[0].name}`;
        contents.innerHTML = `${dataarray3[0].articlecontent}`;

    } else if (target == '5') {
        head.innerHTML = `Title : ${dataarray4[3].title} <br><br>Category : ${dataarray4[3].name}`;
        contents.innerHTML = `${dataarray4[3].articlecontent}`;

    } else if (target == '6') {
        head.innerHTML = `Title : ${dataarray4[2].title} <br><br>Category : ${dataarray4[2].name}`;
        contents.innerHTML = `${dataarray4[2].articlecontent}`;

    } else if (target == '7') {
        head.innerHTML = `Title : ${dataarray4[1].title} <br><br>Category : ${dataarray4[1].name}`;
        contents.innerHTML = `${dataarray4[1].articlecontent}`;

    } else if (target == '8') {
        head.innerHTML = `Title : ${dataarray4[0].title} <br><br>Category : ${dataarray4[0].name}`;
        contents.innerHTML = `${dataarray4[0].articlecontent}`;
    }
}


//modal stuff
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var btn = document.querySelectorAll('#myBtn')
btn.forEach(function (button) {
    button.addEventListener('click', function (e) {
        var target = e.target.parentNode.id;
        display(target);
        modal.style.display = "block";
    })
})

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}