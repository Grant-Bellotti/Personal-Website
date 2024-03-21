// create an array to store messages, starting with an initial message from the assistant
let messages = [ { role: "assistant", content: "Hey there! Just a heads up, I'm experimental at the moment, so you might find my responses a little unpredictable. Sometimes you may need to ask/reword a question again or clarify. Don't worry though, I'll do my best to chat with you!" } ];

$(document).ready(function() {
    // select necessary DOM elements
    const chatBox = $('.chatbox-window');
    const textInput = chatBox.find('input');
    let state = false;

    // update word count
    updateWordcount();

    // attach event listeners for input change, button clicks, and enter
    $("#message-input").on("input", updateWordcount);
    $('.chatbox-button').on('click', toggleChatbox);
    $('.chatbox-footer-send-button').on('click', sendMessage);
    textInput.on('keyup', function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    //toggle chatbox visibility
    function toggleChatbox() {
        state = !state;
        chatBox.toggleClass('chatbox-active', state);
        if (state) {
            updateChatText();
        }
    }

    //send message to server to get chatbot reply
    function sendMessage() {
        const userInput = textInput.val();
        textInput.val('');
        const msg = { role: "user", content: userInput };
        messages.push(msg);
        updateWordcount();

        //get chatbot response
        $.ajax({
            url: "/getGPTResponse",
            type: "GET",
            data: { role: "user", content: userInput },
            success: function(data) {
                messages.push(data);
                updateChatText();
            },
            dataType: "json"
        });
    }

    //updated messages
    function updateChatText() {
        let html = '';
        messages.slice().reverse().forEach(function(item) {
            //chatbot messages
            if (item.role === "assistant") {
                html += '<div class="chatbox-messages-item chatbox-messages-item-visitor">' + item.content + '</div>';
            } 
            //user messages
            else if (item.role === "user") {
                html += '<div class="chatbox-messages-item chatbox-messages-item-operator">' + item.content + '</div>';
            }
        });

        chatBox.find('.chatbox-messages').html(html);
    }

    //update word count limit
    function updateWordcount() {
        $("#chatbox-footer-wordcount").text($("#message-input").val().length + '/50');
    }

}); 