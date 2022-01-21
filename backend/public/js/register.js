let $registerFormContainer = $('#registerFormContainer');
if ($registerFormContainer.length != 0) {
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://localhost:8000';
        let name = $('#fullNameInput').val();
        let email = $('#emailInput').val();
        let usertype = $('#userType').val();
        let password = $('#passwordInput').val();
        let edu = $('#edulvl').val();
        const requestBody = {
            name: name,
            email: email,
            usertype: usertype,
            password: password,
            edu: edu
        };
        console.log(requestBody);
        axios({
            method: 'post',
            url: baseUrl + '/competition/student',
            data: requestBody,
            dataType: "json",
        })
            .then(function (response) {
                //Handle success
                console.dir(response);
                new Noty({
                    type: 'success',
                    timeout: '6000',
                    layout: 'topCenter',
                    theme: 'bootstrap-v4',
                    text: 'You have registered. Please <a href="login.html" class=" class="btn btn-default btn-sm" >Login</a>',
                }).show();
            })
            .catch(function (response) {
                //Handle error
                console.dir(response);
                new Noty({
                    timeout: '6000',
                    type: 'error',
                    layout: 'topCenter',
                    theme: 'sunset',
                    text: 'Unable to register.',
                }).show();
            });
    });

}