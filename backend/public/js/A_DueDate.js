const axios = window.axios;
const baseUrl = 'http://localhost:8000';
let userid = localStorage.getItem('user_id');
let token = localStorage.getItem('token');

window.onload = () => {
    event.preventDefault();
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/dueDate',
        dataType: "json",
    })
        .then(function (response) {
            const dateResult = response.data;
            console.log(dateResult);
            var dueDate = dateResult.duedate
            printDueDate(dueDate)
        })
        .catch(function (error) {
            //Handle error
            if (error.response.status == 404) {
                alert("")
            } else {
                alert("There is an unknown error")
                console.log(error)
            }
        });

        $('#submitView').on('click', function (event) {
            event.preventDefault();
            let duedatetype = $('#groupInput').val();
            console.log("forntttt"+duedatetype);
            viewDueDate(duedatetype)
            

        });
}

function viewDueDate(duedatetype) {
    axios({
        headers: {
            'user': userid,
            'authorization': 'Bearer ' + token
        },
        method: 'GET',
        url: baseUrl + '/competition/dueDate/'+duedatetype,
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
            if (error.response.status == 404) {
                alert("")
            } else {
                alert("There is an unknown error")
                console.log(error)
            }
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
        url: baseUrl + '/competition/dueDate',
        data: requestBody,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    }).then(function (response) {
        console.log(response.data)

        printText(groupEditInput)
    }).catch(function (error) {
        if (error.response.status == 403) {
            alert(JSON.stringify(error.response.data));
            window.location = "login.html";
        } else {
            window.alert(error);
        }
    });

})

function printText(groupEditInput){
    var txt= $('#groupEditInput').val() + " Updated successfully";
    document.getElementById('printText').innerText = txt;
}

function printDueDate (dueDate) {
  var timestamp = dueDate;
   var date = new Date(timestamp);
   const months = ['January','February','March','April','May','June','July','August','September','October','November','December' ]

   var day = date.getDate()
   var month = months[date.getMonth()]
   var year = date.getFullYear()
   var hour = ("0" + date.getHours()).slice(-2);
   var minute = ("0" + date.getMinutes()).slice(-2);
   var second = ("0" + date.getSeconds()).slice(-2);

   console.log(year+"--"+month+"--"+day+"--"+hour+"--"+minute+"--"+second);

   document.getElementById('year').innerText = year;
   document.getElementById('month').innerText = month;
   document.getElementById('day').innerText = day;
   document.getElementById('hour').innerText = hour; 
   document.getElementById("minute").innerHTML = minute;
   document.getElementById("second").innerHTML = second;
  }

      