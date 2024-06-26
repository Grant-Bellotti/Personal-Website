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
  req.session.history = [ {role: 'system', content: "You are a friendly and energetic chatbot that reads provided data and answers questions based on the data. All data should be read in complete sentences. If the data doesn't relate to the question, you will answer normally. You will never provide code."}];
  req.session.requests = 15;
  res.json({redirect:"/"});
});
router.get("/faillogin", function(req, res) {
  res.json({redirect:"/"});
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
router.get("/timeline",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/timeline.html"));  //changed
});

//////////////////////////////////////////////////////

//router

//////////////////////////////////////////////////////

module.exports = router;
