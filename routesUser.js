var express = require("express");
var passport = require("passport");
const openai = require('./resources/openai_config/open-ai');
const data = require('./resources/data.json'); //read json files

var router = express.Router();

//request is info sending to server from client.
//response is info sending to client from server.

////////////////////////////////////////////////////// Global Variables

const MESSAGE_MEMORY = 3 //how many messages of user and ai is inputted to bot
const INPUT_TOKEN_LIMIT = 50.0;
const REPLY_TOKEN_LIMIT = 200.0; //100 tokens ~= 75 words

//////////////////////////////////////////////////////

router.get('/checkAuthenticated', function(req, res){
  if (req.isAuthenticated()) {
    let storedArray = req.session.history;
    res.json( { error:false, message:'user is authenticated', history: storedArray } );
  } 
  else {
    res.json( { error:true, message:'user is not authenticated' } );
  }
});

router.post("/authenticate", function(req, res, next) {
  next();

}, passport.authenticate("login", {
  successRedirect: "/successlogin",
  failureRedirect: "/faillogin",
  failureFlash: true
}));

router.get('/getHistory', function(req, res){
  if (req.isAuthenticated()) {
    let storedArray = req.session.myArray;
    res.json( { error:false, message:'history successfully recovered', history: storedArray } );
  } 
  else {
    res.json( { error:true, message:'user is not authenticated' } );
  }
});

router.get("/getGPTResponse",function(req,res){
  async function main() {
    let userInput = String(req.query.content).trim();

    if (userInput.length > 50) {
      res.json({ role: 'assistant', content: "Please make sure your character count is under 50." });
      return;
    }

    else if (userInput.toLowerCase() == 'exit' || userInput.toLowerCase() == 'bye' || userInput.toLowerCase() == 'good bye') {
      res.json({ role: 'assistant', content: "Please let me know if you have any more questions!" });
      return;
    }

    try {
      if (getInputData(getSection(userInput)).length > 0) {
        let gptInput = ("Given this question: " + userInput + ", answer about Grant Bellotti the person. use the following data if needed: " + getInputData(getSection(userInput)));
        req.session.history.push({ role: 'user', content: gptInput.replace(" his ", " Grants ") }); // add latest input to messages
      }
      else {
        req.session.history.push({ role: 'user', content: userInput });
      }
      
      let completion = await openai.chat.completions.create({
        model:'gpt-3.5-turbo-0125',
        messages: req.session.history,
        max_tokens: ((req.session.history.lenth*(3/4)) + (INPUT_TOKEN_LIMIT*(3/4)) + (REPLY_TOKEN_LIMIT*(3/4)))
      });

      let response = completion.choices[0].message.content;
      req.session.history.splice(req.session.history.length-1, 1);
      req.session.history.push({ role: 'user', content: userInput });
      req.session.history.push({ role: 'assistant', content: response }); // add latest output to messages

       //make sure message history isn't to long to avoid taking up tokens
      if (req.session.history.length > ((MESSAGE_MEMORY*2) + 1)) {
        req.session.history.splice(1,2);
      }

      res.json({ error: false, role: 'assistant', content: response });

    } catch (error) {
      console.error(error);
      res.json({ error: true, message: error });
    }
  }
  if (req.isAuthenticated()) {
    main();
  }
  else {
    res.json( { error:true, message:'user is not authenticated' } );
  }
  
});

/////////////////// Helper functions for chatgpt input

//uses sections from getSection to get data fron json file
function getInputData(sections) {
  let returnData = [];
  let json_data;

  for (let i = 0; i < sections.length; i++) {
    if (sections[i] == 'about') {
      json_data = data.about;
    }
    else if (sections[i] == 'projects') {
      json_data = data.projects;
    }
    else if (sections[i] == 'classes') {
      json_data = data.classes;
    }
    else if (sections[i] == 'job_experience') {
      json_data = data.job_experience;
    }
    else {
      json_data = data.natalie;
    }

    returnData.push(["\n" + sections[i].toUpperCase() + ": "]);
    for (let j = 0; j < json_data.length; j++) {
      returnData[i].push(json_data[j]);
    }
  }

  return returnData;
}
//uses typical words to pull out what data is needed
function getSection(userInput) {
  //words to test in each group
  let testWords = [['skill', 'skills', 'traits', 'grant', 'personality', 'trait', 'activity', 'activities'], ['project', 'projects', 'experience', 'experiences', 'javascript', 'unity', 'work', 'website', 'portfolio'], ['experience', 'experiences', 'classes', 'class', 'coursework', 'course work', 'study'], ['experience', 'experiences', 'work-experience', 'work-experiences', 'work', 'jobs', 'job', 'employment'], ['natalie, love']];
  let removePunctuation = userInput.replace(/[.,\/#!?$%\^'&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
  let returnStatement = [];
  userInput = removePunctuation.trim().split(" ");

  for (let i = 0; i < testWords.length; i++) {
    for (let j = 0; j < userInput.length; j++) {
      // if related to about
      if (testWords[i].includes(userInput[j].toLowerCase()) && i == 0) {
        returnStatement.push("about");
      }
      // if related to projects
      if (testWords[i].includes(userInput[j].toLowerCase()) && i == 1) {
        returnStatement.push("projects");
      }
      // if related to classes
      if (testWords[i].includes(userInput[j].toLowerCase()) && i == 2) {
        returnStatement.push("classes");
      }
      // if related to experience
      if (testWords[i].includes(userInput[j].toLowerCase()) && i == 3) {
        returnStatement.push("job_experience");
      }
      if (testWords[i].includes(userInput[j].toLowerCase()) && i == 4) {
        returnStatement.push("natalie");
      }
    }
  }

  return returnStatement.filter((item,index) => returnStatement.indexOf(item) === index);
}

//////////////////////////////////////////////////////

module.exports = router;