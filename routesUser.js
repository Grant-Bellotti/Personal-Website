var express = require("express");
var passport = require("passport");
const openai = require('./resources/openai_config/open-ai');
const data = require('./resources/data.json'); //read json files

var router = express.Router();

//request is info sending to server from client.
//response is info sending to client from server.

////////////////////////////////////////////////////// Global Variables

const MESSAGE_MEMORY = 3 //how many messages of user and ai is inputted to bot
const INPUT_TOKEN_LIMIT = 50;
const REPLY_TOKEN_LIMIT = 100; //100 tokens ~= 75 words

//////////////////////////////////////////////////////

router.get('/checkAuthenticated', function(req, res){
  if (req.isAuthenticated()) {
    let storedArray = req.session.history;
    res.json( { error:false, message:'user is authenticated', history: storedArray } );
  } 
  else {
    console.log('user is not authenticated');
    res.json( { error:true, message:'user is not authenticated' } );
  }
});

router.post("/authenticate", function(req, res, next) {
  console.log('user is authenticating...');
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
  function getSection(userInput) {
    //words to test in each group
    let testWords = [['skill', 'skills', 'traits', 'grant', 'grants'], ['project', 'projects', 'experience', 'experiences', 'javascript', 'unity', 'work', 'website'], ['experience', 'experiences', 'work-experience', 'work-experiences', 'work', 'jobs', 'job', 'employment']];
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
        // if related to experience
        if (testWords[i].includes(userInput[j].toLowerCase()) && i == 2) {
          returnStatement.push("job_experience");
        }
      }
    }

    return returnStatement.filter((item,index) => returnStatement.indexOf(item) === index);
  }

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
        else {
          json_data = data.job_experience;
        }

        returnData.push(["\n" + sections[i].toUpperCase() + ": "]);
        for (let j = 0; j < json_data.length; j++) {
          returnData[i].push(json_data[j]);
        }
      }

      return returnData;
  }

  async function main() {
    let userInput = String(req.query.message).trim();

    if (userInput.toLowerCase() == 'exit' || userInput.toLowerCase() == 'bye' || userInput.toLowerCase() == 'good bye') {
      res.json({ role: 'assistant', content: "Please let me know if you have any more questions!" });
      return;
    }

    try {
      if (getInputData(getSection(userInput)).length > 0) {
        let gptInput = ("Given this question: " + userInput + ", answer about Grant Bellotti the person. Do not use the following data about Grant Bellotti if it does not apply to the question: " + getInputData(getSection(userInput)));
        req.session.history.push({ role: 'user', content: gptInput.replace(" his ", " Grants ") }); // add latest input to messages
      }
      else {
        req.session.history.push({ role: 'user', content: userInput });
      }
      
      let completion = await openai.chat.completions.create({
        model:'gpt-3.5-turbo',
        messages: req.session.history,
        max_tokens: ((req.session.history.lenth/4) + (INPUT_TOKEN_LIMIT/4) + (REPLY_TOKEN_LIMIT/4))
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

//////////////////////////////////////////////////////

module.exports = router;