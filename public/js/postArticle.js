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
    new Noty({
      type: 'error',
      text: "Unauthorised, You are not a Student",
      timeout: '6000',
    }).on('onClose', () => {
      window.location = "login.html"
    }).show();
  } else {
    getTheDue(dueDateType)
  }
}

function getTheDue(dueDateType) {
  axios({
    method: 'GET',
    url: '/competition/dueDate/' + dueDateType,
    dataType: "json",
  })
    .then(function (response) {
      const dateResult = response.data;
      console.log(dateResult);
      var dueDate = dateResult[0].duedate
      console.log(dueDate);
      var dueDate = new Date(dueDate)
      var today = new Date()

      if (dueDate < today) {
        window.location = "nocontent.html"
      } else if (today < dueDate) {
        getArticleData()
      } else {
        alert("bug found")
      }

    })
    .catch(function (error) {
      if (error.response.status == 404) {
        new Noty({
          type: 'error',
          text: JSON.stringify(error.response.data),
          timeout: '6000',
        }).show();

      } else if (error.response.status == 500) {
        new Noty({
          type: 'error',
          text: error.response.data + ' Please try again later',
          timeout: '6000',
          killer: true
        }).show();
      }
      n.close();
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
    url: '/competition/studentArticles/',
    data: requestBody,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
  })
    .then(function (response) {
      new Noty({
        type: 'success',
        text: JSON.stringify(response.data),
        timeout: '6000',
      }).on('onClose', () => {
        window.location = "submission.html"
      }).show();
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
        }).show();

      } else if (error.response.status == 500) {
        new Noty({
          type: 'error',
          text: error.response.data + ' Please try again later',
          timeout: '6000',
          killer: true
        }).show();
      }
      n.close();
    });
});

function countWord() {
  let text = article.value;
  text = text.trim();
  const words = text.split(" ");
  if (words[0] === "") {
    count.innerText = 0;
  } else {
    count.innerText = words.length;
  }
}