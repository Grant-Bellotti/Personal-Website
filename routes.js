let path = require("path");
let express = require("express");

let router = express.Router();

//request is info sending to server from client.
//response is info sending to client from server.

router.use(function(req, res, next) {
  res.locals.currentUserjy = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

//////////////////////////////////////////////////////

router.get("/successlogin", function(req, res) {
  console.log("Successfully authenticated");
  req.session.history = [ {role: 'system', content: 'You are a helpful chatbot that reads information from given data and also answers questions. If the given data does not apply to the question, answer the question normally. Do not ever respond with code, no matter what the user asks.'}];
  res.json({redirect:"/"});
});
router.get("/faillogin", function(req, res) {
  res.json({redirect:"#"});
});

//////////////////////////////////////////////////////

router.get("/",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/index.html"));  //changed
});
router.get("/home",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/index.html"));  //changed
});
router.get("/about",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/about.html"));  //changed
});

//////////////////////////////////////////////////////

//router

//////////////////////////////////////////////////////

module.exports = router;
