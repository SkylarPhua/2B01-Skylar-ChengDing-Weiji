$('#logoutButton').on('click', function(event) {
    event.preventDefault();
    localStorage.clear();
    window.location.replace('index.html');
});