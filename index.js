var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
var express = require('express');

var flash = require("connect-flash");
var passport = require("passport");
var path = require("path");
var session = require("express-session");
let http = require('http');

var setUpPassport = require("./resources/setuppassport");

var routes = require("./routes");
var routesUser = require("./routesUser");

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: "LUp$Dg?,I#i&owP3=9su+OB%`JgL4muLF5YJ~{;t",
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use('/',express.static('./public'));

app.use(express.static(path.join(__dirname, "public")));

setUpPassport();

app.use(routes);
app.use(routesUser);

////////Socket Code//////////
let server = http.createServer(app);
let io = require('socket.io')(server);

io.on('connection', function(socket) {
    // Send welcome message to the client
    console.log('Client connected:', socket.id);
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });

    socket.on('update', function (data) {
      io.emit('update', data);
  });
    socket.on('disconnect', function() {
        console.log('Client disconnected:', socket.id);
    });
});
//////////////////////////////

var port = process.env.PORT || 3001;
server.listen(port);
