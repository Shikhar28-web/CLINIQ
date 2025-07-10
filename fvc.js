// State variables
let isMicOn = true;
let isVideoOn = true;
let isScreenSharing = false;
let isChatOpen = false;
let isCallActive = true;

// Video size states
let isPatientVideoEnlarged = false;
let isPatientVideoFullscreen = false;
let isDoctorViewEnlarged = false;
let isDoctorViewFullscreen = false;

// DOM Elements
const micBtn = document.getElementById('micBtn');
const videoBtn = document.getElementById('videoBtn');
const screenShareBtn = document.getElementById('screenShareBtn');
const chatBtn = document.getElementById('chatBtn');
const endCallBtn = document.getElementById('endCallBtn');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const bottomPanel = document.getElementById('bottomPanel');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const localVideo = document.getElementById('localVideo');

// Call status and screen share elements
const callStatus = document.getElementById('callStatus');
const screenPreview = document.getElementById('screenSharePreview');
const screenPreviewVideo = document.getElementById('screenPreviewVideo');
const closeScreenShare = document.getElementById('closeScreenShare');

// Placeholders
const localPlaceholder = document.getElementById('localPlaceholder');

// Size control elements
const patientSizeBtn = document.getElementById('patientSizeBtn');
const doctorSizeBtn = document.getElementById('doctorSizeBtn');
const remoteVideoWrapper = document.getElementById('remoteVideoWrapper');
const localVideoWrapper = document.querySelector('.local-video');

// Initialize media devices (only for patient's camera)
async function setupMediaDevices() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: true 
        });
        localVideo.srcObject = stream;
        
        console.log('Patient media devices initialized successfully');
    } catch (err) {
        console.error('Error accessing media devices:', err);
        showNotification('Unable to access camera and microphone', 'error');
    }
}

// Microphone toggle
micBtn.addEventListener('click', () => {
    isMicOn = !isMicOn;
    micBtn.classList.toggle('off', !isMicOn);
    micBtn.innerHTML = `<i class="fas fa-microphone${isMicOn ? '' : '-slash'}"></i>`;
    
    // Toggle audio tracks
    if (localVideo.srcObject) {
        localVideo.srcObject.getAudioTracks().forEach(track => {
            track.enabled = isMicOn;
        });
    }
    
    showNotification(`Microphone ${isMicOn ? 'enabled' : 'disabled'}`, 'info');
});

// Video toggle
videoBtn.addEventListener('click', () => {
    isVideoOn = !isVideoOn;
    videoBtn.classList.toggle('off', !isVideoOn);
    videoBtn.innerHTML = `<i class="fas fa-video${isVideoOn ? '' : '-slash'}"></i>`;
    
    // Toggle video tracks
    if (localVideo.srcObject) {
        localVideo.srcObject.getVideoTracks().forEach(track => {
            track.enabled = isVideoOn;
        });
    }
    
    localPlaceholder.style.display = isVideoOn ? 'none' : 'block';
    showNotification(`Camera ${isVideoOn ? 'enabled' : 'disabled'}`, 'info');
});

// Screen share functionality
screenShareBtn.addEventListener('click', async () => {
    if (!isScreenSharing) {
        await startScreenShare();
    } else {
        stopScreenShare();
    }
});

async function startScreenShare() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { 
                width: 1920, 
                height: 1080,
                frameRate: 30
            },
            audio: true
        });
        
        // Show preview window
        screenPreviewVideo.srcObject = screenStream;
        screenPreview.style.display = 'block';
        
        // Update button state
        isScreenSharing = true;
        screenShareBtn.classList.add('sharing');
        screenShareBtn.innerHTML = '<i class="fas fa-stop"></i>';
        
        // Handle stream end (when user stops sharing)
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            stopScreenShare();
        });
        
        showNotification('Screen sharing started', 'success');
        console.log('Screen sharing started successfully');
        
    } catch (err) {
        console.error('Error sharing screen:', err);
        showNotification('Unable to share screen', 'error');
        stopScreenShare();
    }
}

function stopScreenShare() {
    // Stop all screen share tracks
    if (screenPreviewVideo.srcObject) {
        screenPreviewVideo.srcObject.getTracks().forEach(track => track.stop());
        screenPreviewVideo.srcObject = null;
    }
    
    // Hide preview
    screenPreview.style.display = 'none';
    
    // Reset button state
    isScreenSharing = false;
    screenShareBtn.classList.remove('sharing');
    screenShareBtn.innerHTML = '<i class="fas fa-desktop"></i>';
    
    showNotification('Screen sharing stopped', 'info');
    console.log('Screen sharing stopped');
}

// Close screen share preview
closeScreenShare.addEventListener('click', stopScreenShare);

// Chat functionality
chatBtn.addEventListener('click', () => {
    toggleChat();
});

chatToggleBtn.addEventListener('click', () => {
    toggleChat();
});

function toggleChat() {
    isChatOpen = !isChatOpen;
    bottomPanel.classList.toggle('minimized', !isChatOpen);
    chatBtn.classList.toggle('off', !isChatOpen);
    
    const icon = chatToggleBtn.querySelector('i');
    icon.className = isChatOpen ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    
    showNotification(`Chat ${isChatOpen ? 'opened' : 'closed'}`, 'info');
}

// Enhanced Chat form submission with medical responses
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        addChatMessage('You', message, true);
        messageInput.value = '';
        
        // Generate medical response based on keywords
        setTimeout(() => {
            const response = generateMedicalResponse(message);
            addChatMessage('Dr. Smith', response, false);
        }, 1500 + Math.random() * 1000); // Random delay to simulate thinking
    }
});

// Enhanced medical response generator
function generateMedicalResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Symptom-based responses
    if (message.includes('headache') || message.includes('head pain')) {
        return "I understand you're experiencing headaches. Can you describe the intensity on a scale of 1-10? When did they start, and are they accompanied by nausea, sensitivity to light, or visual disturbances?";
    }
    
    if (message.includes('fever') || message.includes('temperature')) {
        return "Fever can indicate an infection. Have you measured your temperature? Any accompanying symptoms like chills, body aches, or sore throat? It's important to stay hydrated and monitor your temperature regularly.";
    }
    
    if (message.includes('cough') || message.includes('cold')) {
        return "A persistent cough needs evaluation. Is it dry or producing phlegm? Any chest pain or shortness of breath? If it's been ongoing for more than a week, we should consider further investigation.";
    }
    
    if (message.includes('chest pain') || message.includes('heart')) {
        return "Chest pain requires immediate attention. Can you describe the nature - sharp, dull, crushing? Does it radiate to your arm, neck, or jaw? Any shortness of breath or sweating? This could be serious and may need urgent evaluation.";
    }
    
    if (message.includes('stomach') || message.includes('abdominal') || message.includes('belly')) {
        return "Abdominal discomfort can have various causes. Where exactly is the pain located? Is it cramping, sharp, or dull? Any nausea, vomiting, or changes in bowel movements? When did you last eat?";
    }
    
    if (message.includes('dizzy') || message.includes('lightheaded')) {
        return "Dizziness can be concerning. Does it occur when you stand up quickly, or is it constant? Any hearing changes, nausea, or balance issues? Have you been eating and drinking regularly today?";
    }
    
    if (message.includes('back pain') || message.includes('spine')) {
        return "Back pain is quite common. Is it lower back or upper back? Does it radiate down your leg? Any numbness or tingling? What activities seem to worsen or improve it?";
    }
    
    if (message.includes('anxiety') || message.includes('stress') || message.includes('worried')) {
        return "Mental health is just as important as physical health. Can you tell me what's been causing you stress lately? Are you experiencing any physical symptoms like rapid heartbeat, sweating, or difficulty sleeping?";
    }
    
    if (message.includes('sleep') || message.includes('insomnia') || message.includes('tired')) {
        return "Sleep disturbances affect overall health significantly. How many hours are you getting per night? Any difficulty falling asleep or staying asleep? What's your bedtime routine like?";
    }
    
    if (message.includes('medication') || message.includes('medicine') || message.includes('drug')) {
        return "It's important to review all medications. Are you currently taking any prescription or over-the-counter medications? Any new medications recently started? Always inform me of any supplements or herbal remedies you're using.";
    }
    
    // Positive/wellness responses
    if (message.includes('better') || message.includes('good') || message.includes('fine')) {
        return "I'm glad to hear you're feeling better. It's important to continue monitoring your symptoms. Are there any specific concerns you'd like to discuss during our consultation today?";
    }
    
    // General medical responses
    const generalResponses = [
        "Thank you for sharing that information. Can you provide more details about when these symptoms started and their severity?",
        "I appreciate you being thorough with your symptoms. Let's discuss your medical history - any chronic conditions or previous similar episodes?",
        "That's valuable information for your diagnosis. Are you currently taking any medications or have any known allergies I should be aware of?",
        "Based on what you're describing, we should explore this further. Have you noticed any patterns or triggers that worsen your symptoms?",
        "I want to ensure we address all your concerns properly. How has this been affecting your daily activities and quality of life?",
        "Your symptoms warrant careful evaluation. Have you tried any treatments or remedies, and if so, what was the result?",
        "Let's take a systematic approach to understand your condition better. Can you rate your overall discomfort level from 1-10?",
        "I'm here to help you feel better. Are there any other symptoms, even seemingly unrelated ones, that you've noticed recently?"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

// Add chat message with enhanced formatting
function addChatMessage(sender, text, isSent) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <span class="message-sender">${sender}</span>
        <span class="message-text">${text}</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Auto-open chat if it's closed and a new message arrives from doctor
    if (!isChatOpen && !isSent) {
        toggleChat();
    }
}

// Patient Video Size Toggle
patientSizeBtn.addEventListener('click', () => {
    if (!isPatientVideoFullscreen) {
        if (!isPatientVideoEnlarged) {
            // Normal -> Enlarged
            localVideoWrapper.classList.add('enlarged');
            isPatientVideoEnlarged = true;
            patientSizeBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
            showNotification('Patient video enlarged', 'info');
        } else {
            // Enlarged -> Fullscreen
            localVideoWrapper.classList.remove('enlarged');
            localVideoWrapper.classList.add('fullscreen');
            isPatientVideoEnlarged = false;
            isPatientVideoFullscreen = true;
            patientSizeBtn.innerHTML = '<i class="fas fa-compress"></i>';
            showNotification('Patient video fullscreen', 'info');
        }
    } else {
        // Fullscreen -> Normal
        localVideoWrapper.classList.remove('fullscreen');
        isPatientVideoFullscreen = false;
        patientSizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
        showNotification('Patient video normal size', 'info');
    }
});

// Doctor View Size Toggle
doctorSizeBtn.addEventListener('click', () => {
    if (!isDoctorViewFullscreen) {
        if (!isDoctorViewEnlarged) {
            // Normal -> Enlarged
            remoteVideoWrapper.classList.add('enlarged');
            isDoctorViewEnlarged = true;
            doctorSizeBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
            showNotification('Doctor view enlarged', 'info');
        } else {
            // Enlarged -> Fullscreen
            remoteVideoWrapper.classList.remove('enlarged');
            remoteVideoWrapper.classList.add('fullscreen');
            isDoctorViewEnlarged = false;
            isDoctorViewFullscreen = true;
            doctorSizeBtn.innerHTML = '<i class="fas fa-compress"></i>';
            showNotification('Doctor view fullscreen', 'info');
        }
    } else {
        // Fullscreen -> Normal
        remoteVideoWrapper.classList.remove('fullscreen');
        isDoctorViewFullscreen = false;
        doctorSizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
        showNotification('Doctor view normal size', 'info');
    }
});

// Handle ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (isPatientVideoFullscreen) {
            localVideoWrapper.classList.remove('fullscreen');
            isPatientVideoFullscreen = false;
            patientSizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
            showNotification('Patient video normal size', 'info');
        }
        if (isDoctorViewFullscreen) {
            remoteVideoWrapper.classList.remove('fullscreen');
            isDoctorViewFullscreen = false;
            doctorSizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
            showNotification('Doctor view normal size', 'info');
        }
    }
});

// End call functionality
endCallBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to end the consultation?')) {
        endCall();
    }
});

function endCall() {
    // Stop all media streams
    if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
    }
    if (isScreenSharing) {
        stopScreenShare();
    }
    
    isCallActive = false;
    showNotification('Call ended', 'info');
    
    // In a real application, you would redirect to a post-call page
    setTimeout(() => {
        if (confirm('Call ended. Would you like to return to the main page?')) {
            window.location.href = '/';
        }
    }, 1000);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 30px;
        background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#45DFB1' : '#0AD1C8'};
        color: ${type === 'error' ? 'white' : '#213A57'};
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize call
async function initializeCall() {
    try {
        await setupMediaDevices();
        
        // Show connected status
        callStatus.style.display = 'block';
        setTimeout(() => {
            callStatus.style.display = 'none';
        }, 3000);
        
        showNotification('Connected to Dr. Smith', 'success');
        console.log('Video call initialized successfully');
        
    } catch (err) {
        console.error('Error initializing call:', err);
        showNotification('Failed to initialize video call', 'error');
    }
}

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isCallActive) {
        console.log('Page hidden - call continues in background');
    } else if (!document.hidden && isCallActive) {
        console.log('Page visible - call restored');
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Healthcare video call application starting...');
    initializeCall();
});

// Handle beforeunload to warn user about ending call
window.addEventListener('beforeunload', (e) => {
    if (isCallActive) {
        e.preventDefault();
        e.returnValue = 'You are currently in a video call. Are you sure you want to leave?';
        return e.returnValue;
    }
});
