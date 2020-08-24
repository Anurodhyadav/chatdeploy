const socket = io('http://localhost:3000')//location of where we are hosting
const messageContainer = document.getElementById('message-container')
const headerContainer = document.getElementById('header-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

if (messageForm != null) {
  const name = prompt('What is your name?')
  if (name != null){
  headerMessage('You joined')
  socket.emit('new-user', roomName, name)//emit sends the message from client to the server

  messageForm.addEventListener('submit', e => {//whenever we submit our form
    e.preventDefault()//we want to stop that form from  posting to our server and also it prevent from refreshing,not doing it will result in loosing all our chat message
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  headerMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  headerMessage(`${name} disconnected`)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

function headerMessage(message){
    const headerElement = document.createElement('div')
    headerElement.innerText=message
    headerContainer.append(headerElement)
    
}