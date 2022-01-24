var count = document.getElementById('count');
var article = document.getElementById('article');
var styles = document.getElementById('styles');
let token = localStorage.getItem('token');
let userid = localStorage.getItem('user_id');

document.getElementById('submitButton').disabled = true;
window.addEventListener('keyup', chkinput)
function chkinput() {
  if (document.getElementById("title").value.trim() === "" || document.getElementById("article").value.trim() === "") {
      document.getElementById('submitButton').disabled = true;
  } else {
      document.getElementById('submitButton').disabled = false;
  }
}


$('#submitButton').on('click', function (event) {
  event.preventDefault();
  const baseUrl = 'http://localhost:8000';
  let category = $('#cat').val();
  let title = $('#title').val();
  let article = $('#article').val();
  const requestBody = {
    userid: userid,
    catid: category,
    title: title,
    content: article
  };
  console.log("This is the reqbody: " + JSON.stringify(requestBody));
  axios({
    headers: {
      'user': userid,
      'authorization': 'Bearer ' + token
    },
    method: 'POST',
    url: baseUrl + '/competition/studentArticles/',
    data: requestBody,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  })
    .then(function (response) {
      alert("submit successfully")
      window.location = "submission.html"
    })
    .catch(function (error) {
      if (error.response.status == 403) {
        alert(JSON.stringify(error.response.data));
        window.location = "login.html";
      } else {
        window.alert("This is the error: " + error);
        console.log("This is the error: " + error.message);
      }
    });
});


article.addEventListener('keyup', function (e) {
  wordCounter(e.target.value);
});

function wordCounter(text) {
  var text = article.value;
  var wordCount = 0;
  for (var i = 0; i <= text.length; i++) {
    if (text.charAt(i) == ' ') {
      wordCount++;
    }
  }
  count.innerHTML = wordCount;
}

