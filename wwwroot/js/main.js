const buttonRoom = document.getElementsByClassName("group-form");
const buttonSendMessage = document.getElementById("button-send");
let connection;
buttonSendMessage.addEventListener("click", sendMessage);
buttonRoom[0].addEventListener("submit", connectRoom);
function createRecievedMessage(user, message, id){
    let messageField = document.getElementById("chatBox");
    let textMessage = document.createElement("div");
    textMessage.className = "message guest clearfix";
    textMessage.id = id;
    let metaInfo = document.createElement("div");
    metaInfo.className = "meta";
    let spanName = document.createElement("span");
    let textName = document.createElement("strong");
    textName.textContent = user;
    spanName.appendChild(textName);
    let spanTime = document.createElement("span");
    let time = new Date();
    spanTime.textContent = `${time.getHours().toString()}:${time.getMinutes().toString()}`;
    metaInfo.appendChild(spanName);
    metaInfo.appendChild(spanTime);
    textMessage.appendChild(metaInfo);
    let Message = document.createElement("p");
    Message.textContent = message;
    textMessage.appendChild(Message);
    messageField.appendChild(textMessage);
}
function generateMessageId() {
    return 'msg-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
}
function addSystemNotification(text) {
    const messageArea = document.getElementById("chatBox");
    const notification = document.createElement("div");
    notification.className = "system-notification";
    notification.textContent = text;
    messageArea.appendChild(notification);
}
function createSentMessage(user, message, id){
    let messageField = document.getElementById("chatBox");
    let textMessage = document.createElement("div");
    textMessage.id = id;
    textMessage.className = "message user clearfix";
    let metaInfo = document.createElement("div");
    metaInfo.className = "meta";
    let spanName = document.createElement("span");
    let textName = document.createElement("strong");
    textName.textContent = user;
    spanName.appendChild(textName);
    let spanTime = document.createElement("span");
    let time = new Date();
    spanTime.textContent = `${time.getHours().toString()}:${time.getMinutes().toString()}`;
    metaInfo.appendChild(spanName);
    metaInfo.appendChild(spanTime);
    textMessage.appendChild(metaInfo);
    let Message = document.createElement("p");
    Message.textContent = message;
    textMessage.appendChild(Message);
    messageField.appendChild(textMessage);
}
function scrollToBottom() {
    const container = document.querySelector(".chat-box");
    container.scrollTop = container.scrollHeight;
}
function getSentimentColor(sentiment) {
    switch (sentiment) {
        case "Positive":
            return "#d4edda"; // light green
        case "Neutral":
            return "#f8f9fa"; // light gray
        case "Negative":
            return "#f8d7da"; // light red
        default:
            return "#ffffff"; // white (fallback)
    }
}
async function sendMessage(event){
    let message = document.getElementById("messageInput").value;
    if (String(message).length > 0){
        let room = sessionStorage.getItem("room");
        let name = sessionStorage.getItem("name");
        let id = generateMessageId();
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            createSentMessage(name, message, id);
            await connection.invoke("SendMessageToRoom", room, name, message,id);
        }
        document.getElementById("messageInput").value = '';
        scrollToBottom();
        await connection.invoke("AnalyzeMessage", room,name, message, id);
    }
}
async function startConnection(roomName, name){
    sessionStorage.setItem("room", roomName);
    sessionStorage.setItem("name", name);
    connection = new signalR.HubConnectionBuilder()
    .withUrl(`/chathub`)
    .configureLogging(signalR.LogLevel.Information)
    .build();
    connection.on("ReceiveMessage", (user, message,id) => {
        if (user !== sessionStorage.getItem("name")){
            createRecievedMessage(user, message, id);
            scrollToBottom()
        }
    });
    connection.on("ConnectUser", (message) => {
        addSystemNotification(message);
        scrollToBottom();
    });
    connection.on("ResultAnalyze", (id,result) => {
        let elementMessage = document.getElementById(id);
        console.log(result);
        elementMessage.style.backgroundColor = getSentimentColor(result);
    });
    try {
            await connection.start();
            if (connection.state === signalR.HubConnectionState.Connected){
                await connection.invoke("JoinRoom", roomName, name);
                addSystemNotification(`You joined to the ${roomName}`);
            }
    } catch (err) {
            console.log(err);
            setTimeout(()=>startConnection(roomName), 5000);
    }
    connection.onclose(async () => {
        await startConnection(roomName);
    });
} 
async function connectRoom(event){
    event.preventDefault();
    let roomName = document.getElementById("group").value;
    let name = document.getElementById("username").value;
    if (roomName !== sessionStorage.getItem("room")){
        startConnection(roomName, name);
    }
    
}
 