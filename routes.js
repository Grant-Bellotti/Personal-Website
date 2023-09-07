let path = require("path");
let express = require("express");

//Look at below web page for info on express.Router()
//https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
let router = express.Router();

//request is info sending to server from client.
//response is info sending to client from server.

router.get("/",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/home.html"));  //changed
});
router.get("/home",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/home.html"));  //changed
});
router.get("/about",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/about.html"));  //changed
});
router.get("/contact",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/contact.html"));  //changed
});
router.get("/resume",function(req,res){
  res.sendFile(path.resolve(__dirname + "/public/views/resume.html"));  //changed
});

module.exports = router;
