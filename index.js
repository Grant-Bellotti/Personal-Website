var express = require('express');
var bodyParser = require('body-parser');
var routes = require("./routes");
let http = require('http');


var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/',express.static('./public'));
app.use(routes);

//app.use('/favicon.ico', express.static('public/favicon.webp'));

////////Socekt Code//////////

let server = http.createServer(app);

//////////////////////////////

var port = process.env.PORT || 3001;
server.listen(port);
