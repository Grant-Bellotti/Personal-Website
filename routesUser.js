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

// check if user is already authenticated (user is auto authenticated)
router.get('/checkAuthenticated', function(req, res){
  if (req.isAuthenticated()) {
    let storedArray = req.session.history;
    res.json( { error:false, message:'user is authenticated', history: storedArray } );
  } 
  else {
    res.json( { error:true, message:'user is not authenticated' } );
  }
});

// authenticate the user
router.post("/authenticate", function(req, res, next) {
  next();

}, passport.authenticate("login", {
  successRedirect: "/successlogin",
  failureRedirect: "/faillogin",
  failureFlash: true
}));

// get the history of conversation
router.get('/getHistory', function(req, res){
  if (req.isAuthenticated()) {
    let storedArray = req.session.myArray;
    res.json( { error:false, message:'history successfully recovered', history: storedArray } );
  } 
  else {
    res.json( { error:true, message:'user is not authenticated' } );
  }
});

// use the chatgpt api to get assistant response
router.get("/getGPTResponse",function(req,res){
  async function main() {
    let userInput = String(req.query.content).trim();

    //check if user is trying to leave
    if (userInput.toLowerCase() == 'exit' || userInput.toLowerCase() == 'bye' || userInput.toLowerCase() == 'good bye' || userInput.toLowerCase() == 'quit' || userInput.toLowerCase() == 'close') {
      res.json({ role: 'assistant', content: "Please let me know if you have any more questions!", closeChat: true });
      return;
    }
    //user is out of requests
    else if (req.session.requests <= 0) {
      res.json({ role: 'assistant', content: "You have reached the limit of requests at this time. Please try again later!", closeChat: false  });
      return;
    }
    //making sure user input isnt over 50
    else if (userInput.length > 50) {
      res.json({ role: 'assistant', content: "Please make sure your character count is under 50.", closeChat: false });
      return;
    }

    try {
      // adds question to history to give chatgpt, adds data if needed
      if (getInputData(getSection(userInput)).length > 0) {
        let gptInput = ("Given this question: " + userInput + ", answer about Grant Bellotti the person. Use the following data if needed, do not add any information not pertaining to the question: " + getInputData(getSection(userInput)));
        req.session.history.push({ role: 'user', content: gptInput.replace(" his ", " Grants ") }); // add latest input to messages
      }
      else {
        req.session.history.push({ role: 'user', content: userInput });
      }
      
      //use chatgpt api
      let completion = await openai.chat.completions.create({
        //model:'gpt-3.5-turbo-0125',
        model:'gpt-4o',
        messages: req.session.history,
        max_tokens: ((req.session.history.lenth*(3/4)) + (INPUT_TOKEN_LIMIT*(3/4)) + (REPLY_TOKEN_LIMIT*(3/4)))
      });

      //get response and remove question with data from history and put question back in
      let response = completion.choices[0].message.content;
      req.session.history.splice(req.session.history.length-1, 1);
      req.session.history.push({ role: 'user', content: userInput });
      req.session.history.push({ role: 'assistant', content: response }); // add latest output to messages

       //make sure message history isn't to long to avoid taking up tokens
      if (req.session.history.length > ((MESSAGE_MEMORY*2) + 1)) {
        req.session.history.splice(1,2);
      }

      //use a request
      req.session.requests -= 1;
      res.json({ error: false, role: 'assistant', content: response, closeChat: false });

    } catch (error) {
      console.error(error);
      res.json({ error: true, message: error, closeChat: false });
    }
  }
  if (req.isAuthenticated()) {
    main();
  }
  else {
    res.json( { error:true, message:'user is not authenticated'} );
  }
  
});

/////////////////// Helper functions for chatgpt input

//uses sections from getSection to get data fron jsom file
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
//uses typical words to pull out what data is needed
function getSection(userInput) {
  //words to test in each group
  let testWords = [['skill', 'skills', 'traits', 'grant', 'personality', 'trait', 'activity', 'activities'], ['project', 'projects', 'experience', 'experiences', 'javascript', 'unity', 'work', 'website', 'portfolio'], ['experience', 'experiences', 'classes', 'class', 'coursework', 'course work', 'study'], ['experience', 'experiences', 'work-experience', 'work-experiences', 'work', 'jobs', 'job', 'employment']];
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
    }
  }

  return returnStatement.filter((item,index) => returnStatement.indexOf(item) === index);
}

//////////////////////////////////////////////////////

module.exports = router;