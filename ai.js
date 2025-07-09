// Remove: const axios = require('axios');
// We'll use a CDN instead - add this to your HTML:
// <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
// import { GoogleGenAI } from "@google/genai";

document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-message');
    
    // Default welcome message
    if (chatMessages) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        const icon = document.createElement('i');
        icon.className = 'fas fa-brain';
        messageContent.appendChild(icon);
        const text = document.createElement('p');
        text.textContent = "Hello! I'm ChinIQ, your smart medical companion. Ask me anything about your health — I'm here to help.";
        messageContent.appendChild(text);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
    }

    // For browser, you'll need to set API key differently
    // You could hardcode it (not recommended for production) or use a config
    const apiKey = 'AIzaSyCfmZWE6lFtJQGMhdTaRMHEkN_zxCJMjDY'; // Replace with your actual key
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;


    if (!chatMessages || !userInput || !sendButton) {
        console.error('Required DOM elements are missing');
        return;
    }

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (!isUser) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-brain';
            messageContent.appendChild(icon);
        }
        
        const text = document.createElement('p');
        text.textContent = message;
        messageContent.appendChild(text);
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function getAIResponse(input) {
    try {
        const response = await axios.post(apiUrl, {
            system_instruction: {
                role: "system",
                parts: [
                    { text: "You are a AI Mental Health Companion and provide Support, Understanding, and Guidance for Mental Well-being." }
                ]
            },
            contents: [
                {
                    parts: [
                        { text: input }
                    ]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        return aiText || "No response .";
    } catch (error) {
        console.error('API Error:', error.message);
        return "Sorry, I encountered an error. Please try again later.";
    }
}


    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message bot loading';
            loadingDiv.textContent = 'Thinking...';
            chatMessages.appendChild(loadingDiv);

            const response = await getAIResponse(message);
            chatMessages.removeChild(loadingDiv);
            addMessage(response);
        }
    }

       
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
});
