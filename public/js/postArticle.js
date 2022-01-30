const baseUrl = 'http://localhost:8000';
var count = document.getElementById('count');
var article = document.getElementById('article');
var styles = document.getElementById('styles');
let token = localStorage.getItem('token');
let userid = localStorage.getItem('user_id');
let dueDateType = localStorage.getItem('group_type');
let role = localStorage.getItem('role_name');

window.onload = () => {
  if (role != "student") {
      alert("Unauthorised, You are not a Student")
      window.location.replace("login.html");
  } else {
    getTheDue(dueDateType)
  }
}

function getTheDue(dueDateType) {
  axios({
      method: 'GET',
      url:  '/competition/dueDate/' + dueDateType,
      dataType: "json",
  })
      .then(function (response) {
          const dateResult = response.data;
          console.log(dateResult);
          var dueDate = dateResult[0].duedate
          console.log(dueDate);
          var dueDate = new Date(dueDate)
          var today = new Date()

          if(dueDate < today) {
              alert("Competition was end. You cannot post")
              window.location = "nocontent.html"
          } else if (today < dueDate) {
              getArticleData()
          } else {
              alert("bug found")
          }

      })
      .catch(function (error) {
          //Handle error
          if (error.response.status == 404) {
          } else {
              alert("There is an unknown error")
              console.log(error)
          }
      });
}

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
    url:  '/competition/studentArticles/',
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

// article.addEventListener('keyup', function (e) {
//   wordCounter(e.target.value);
// });

// function wordCounter(text) {
//   var text = article.value;
//   var wordCount = 0;
//   for (var i = 0; i <= text.length; i++) {
//     if (text.charAt(i) == ' ') {
//       wordCount++;
//     }
//   }
//   count.innerHTML = wordCount;
// }

// var globalWordCount = 0;
// var wordLimit = 500;

function countWord() {
    let text = article.value;
    text = text.trim();
    const words = text.split(" ");
    if (words[0] === "") {
        count.innerText = 0;
    } else {
        count.innerText = words.length;
        // globalWordCount = words.length;
        // console.log("Words: " + globalWordCount);
    }
}

// article.addEventListener('keydown', function(e) {
//     if (globalWordCount > wordLimit && e.code !== "Backspace") {
//       e.preventDefault();
//       return;
//     }
//   });
