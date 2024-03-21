let messages = [ { role: "assistant", content: "Hey there! Just a heads up, I'm experimental at the moment, so you might find my responses a little unpredictable. Don't worry though, I'll do my best to chat with you!" } ];

function displayChatbox() {
    //selecting necessary DOM elements
    const args = {
        openButton: document.querySelector('.chatbox-button'),
        chatBox: document.querySelector('.chatbox-window'),
        sendButton: document.querySelector('.chatbox-footer-send-button')
    };
    const textInput = args.chatBox.querySelector('input');
    
    let state = false;

    //event listeners for elements of chatbox
    args.openButton.addEventListener('click', () => toggleState(args.chatBox));
    args.sendButton.addEventListener('click', () => onSendButton(args.chatBox));
    textInput.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            onSendButton(args.chatBox);
        }
    });

    //toggle the chatbox state open/close
    function toggleState(chatbox) {
        state = !state;
        if(state) {
            chatbox.classList.add('chatbox-active');
            updateChatText(chatbox);
        } else {
            chatbox.classList.remove('chatbox-active');
        }
    }

    //when sending message to server to get response
    function onSendButton(chatbox) {
        let textField = chatbox.querySelector('input');
        let userInput = String(textField.value);
        textField.value = ''; //empty text box

        let msg = { role: "user", content: userInput };
        messages.push(msg);

        //send user's message to the server and receive a response
        let response;
        $.ajax({
            url: "/getGPTResponse",
            type: "GET",
            async: false,
            data: { role: "user", content: userInput },
            success: function(data){
                response = data; //store response data
            },
            dataType: "json"
        });

        messages.push(response);
        updateWordcount();
        updateChatText(chatbox);
    }

    //update chatbox display with messages
    function updateChatText(chatbox) {
        let html = '';
        messages.slice().reverse().forEach(function(item, index) {
            //create HTML for messages based on role (user or assistant)
            if (item.role == "assistant") {
                html += '<div class="chatbox-messages-item chatbox-messages-item-visitor">' + item.content + '</div>';
            } 
            else if (item.role == "system") {
                
            }
            else {
                html += '<div class="chatbox-messages-item chatbox-messages-item-operator">' + item.content + '</div>';
            }
        });

        //update chatbox's messages container with generated HTML
        const chatmessage = chatbox.querySelector('.chatbox-messages');
        chatmessage.innerHTML = html;
    }
}

function updateWordcount() {
    $("#chatbox-footer-wordcount").text($("#message-input").val().length + '/50');
}

$(document).ready(function(){ 
    displayChatbox();

    $("#message-input").on("input", updateWordcount);
    updateWordcount();
    
});  