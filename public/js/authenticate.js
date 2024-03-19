let socket = io();
socket.on('welcome', function(data) {
    $.ajax({
        url: "/checkAuthenticated",
        type: "GET",
        async: false,
        data: { },
        success: function(data){
            if (data.error == false) {
                console.log(data.message);
                messages = data.history;
            } 
            else {
                $.post("/authenticate",{ username:'bob', password:'bob' },function(data2) {
                    window.location = data2.redirect;
                });
            }
        },
        dataType: "json"
    });
});