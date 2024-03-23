let socket = io();
socket.on('welcome', function(message) {
    //checks if user is authenticated, if they aren't then authenticate them
    $.ajax({
        url: "/checkAuthenticated",
        type: "GET",
        async: true,
        data: { },
        success: function(data1){
            if (data1.error == false) {
                //update conversation with history
                console.log(data1.message);
                messages = messages.concat(data1.history);
            } 
            else {
                //authenticate user and reload page to avoid any issues
                console.log(data1.error);
                $.post("/authenticate",{ username:'bob', password:'bob' },function(data2) {
                    location.reload();
                });
            }
        },
        dataType: "json"
    });
});