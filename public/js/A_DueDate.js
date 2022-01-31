const axios = window.axios;
const baseUrl = 'http://localhost:8000';
let userid = localStorage.getItem('user_id');
let token = localStorage.getItem('token');
let role = localStorage.getItem('role_name');


window.addEventListener('DOMContentLoaded', function () {
    const overlayLoading = document.getElementById('loading');
    if (role != "admin") {
        new Noty({
            type: 'error',
            text: "Unauthorised, You are not an Admin",
            timeout: '6000',
        }).on('onClose', () => {
            window.location = "login.html"
        }).show();
    }

    event.preventDefault();
    overlayLoading.style.display = "";
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/dueDate',
        dataType: "json",
    })
        .then(function (response) {
            const dateResult = response.data;
            console.log(dateResult);
            var dueDate = dateResult.duedate
            printDueDate(dueDate)
            overlayLoading.style.display = "none"
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data),
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();

            } else if (error.response.status == 404) {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data),
                    timeout: '6000',
                    killer: true
                }).show();

            } else {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data) + 'Please try again later',
                    timeout: '6000',
                    killer: true
                }).show();
            }
            n.close();
        });

    $('#submitView').on('click', function (event) {
        event.preventDefault();
        let duedatetype = $('#groupInput').val();
        console.log("forntttt" + duedatetype);
        viewDueDate(duedatetype)
    });

})
function viewDueDate(duedatetype) {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: '/competition/dueDate/' + duedatetype,
        dataType: "json",
    })
        .then(function (response) {
            const dateResult = response.data;
            console.log(dateResult);
            var dueDate = dateResult[0].duedate
            console.log(dueDate);
            printDueDate(dueDate)
        })
        .catch(function (error) {
            if (error.response.status == 403) {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data),
                    timeout: '6000',
                }).on('onClose', () => {
                    window.location = "login.html"
                }).show();

            } else if (error.response.status == 404) {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data),
                    timeout: '6000',
                    killer: true
                }).show();

            } else {
                new Noty({
                    type: 'error',
                    text: JSON.stringify(error.response.data) + 'Please try again later',
                    timeout: '6000',
                    killer: true
                }).show();
            }
            n.close();
        });
}

$('#editButton').on('click', function () {
    event.preventDefault();
    let groupEdit = $('#groupEditInput').val();
    let dateEdit = $('#dateEditInput').val();
    const requestBody = {
        groupEdit: groupEdit,
        dateEdit: dateEdit,
    };
    console.log(JSON.stringify(requestBody))
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'PUT',
        url: '/competition/dueDate',
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    }).then(function (response) {
        console.log(response.data)

        printText(groupEditInput)
    }).catch(function (error) {
        if (error.response.status == 403) {
            new Noty({
                type: 'error',
                text: JSON.stringify(error.response.data),
                timeout: '6000',
            }).on('onClose', () => {
                window.location = "login.html"
            }).show();

        } else if (error.response.status == 404) {
            new Noty({
                type: 'error',
                text: JSON.stringify(error.response.data),
                timeout: '6000',
                killer: true
            }).show();

        } else {
            new Noty({
                type: 'error',
                text: JSON.stringify(error.response.data) + 'Please try again later',
                timeout: '6000',
                killer: true
            }).show();
        }
        n.close();
    });

})

function printText(groupEditInput) {
    var txt = $('#groupEditInput').val() + " Updated successfully";
    document.getElementById('printText').innerText = txt;
}

function printDueDate(dueDate) {
    var timestamp = dueDate;
    var date = new Date(timestamp);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    var day = date.getDate()
    var month = months[date.getMonth()]
    var year = date.getFullYear()
    var hour = ("0" + date.getHours()).slice(-2);
    var minute = ("0" + date.getMinutes()).slice(-2);
    var second = ("0" + date.getSeconds()).slice(-2);

    console.log(year + "--" + month + "--" + day + "--" + hour + "--" + minute + "--" + second);

    document.getElementById('year').innerText = year;
    document.getElementById('month').innerText = month;
    document.getElementById('day').innerText = day;
    document.getElementById('hour').innerText = hour;
    document.getElementById("minute").innerHTML = minute;
    document.getElementById("second").innerHTML = second;
}

