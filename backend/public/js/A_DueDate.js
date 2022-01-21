const axios = window.axios;
const baseUrl = 'http://localhost:8000';
let groupInput = $('#groupInput').val();

window.onload = () => {
    event.preventDefault();
    axios({
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
}





function printDueDate (dueDate) {
  var timestamp = dueDate;
   var date = new Date(timestamp);
   const months = ['January','February','March','April','May','June','July','August','September','October','November','December' ]

   var day = date.getDate()
   var monthName = months[date.getMonth()]
   var year = date.getFullYear()
   var hour = date.getHours()
   var minute = date.getMinutes()
   var second = date.getSeconds()

   console.log(year+"--"+month+"--"+day+"--"+hour+"--"+minute+"--"+second);

   document.getElementById('year').innerText = year;
   document.getElementById('month').innerText = monthName;
   document.getElementById('day').innerText = day;
   document.getElementById('hour').innerText = hour; 
   document.getElementById("minute").innerHTML = minute;
   document.getElementById("second").innerHTML = second;
  }

      