let socket = io();
socket.on('welcome', function(message) {
    $.ajax({
        url: "/checkAuthenticated",
        type: "GET",
        async: true,
        data: { },
        success: function(data1){
            if (data1.error == false) {
                console.log(data1.message);
                messages = messages.concat(data1.history);
            } 
            else {
                console.log(data1.error);
                $.post("/authenticate",{ username:'bob', password:'bob' },function(data2) {
                    location.reload();
                });
            }
        },
        dataType: "json"
    });
});