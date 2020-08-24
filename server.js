const express = require('express')
const app = express()
const server = require('http').Server(app)//setting up server for express
const io = require('socket.io')(server)

app.set('views', './views')//setting up the express server and the views
app.set('view engine', 'ejs')//tells what to use to parse our views in this case we use ejs.ejs is a templating language like html.easier to include data to the template in ejs file than html
app.use(express.static('public'))//this is where all our javascript goes
app.use(express.urlencoded({ extended: true }))//this will allow to use url encoded parameters inside a body or a form

const rooms = { }

app.get('/', (req, res) => {//setting up a simple get route .req is request and res is response
  res.render('index', { rooms: rooms })//rendering the index page
})

app.post('/room', (req, res) => {//handling the post route after user submit the name of the new room
  if (rooms[req.body.room] != null) {//to checkif room already exists
    return res.redirect('/')//redirecting user back to the index page so that they know that room already exits
  }
  rooms[req.body.room] = { users: {} }//adding our room to rooms variable.room is the nameof the variable
  res.redirect(req.body.room)//redirecting to that room name
  // Send message that new room was created
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {//if the room doesnot exists then redirect it to the home page
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })//rendering the room page
})//get route for getting a room i.e room is the parameter that get passed in the url

server.listen(3000)

io.on('connection', socket => {//this is called every time the browser is loaded
  socket.on('new-user', (room, name) => {
    socket.join(room)//join the user to the specific room
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', (room, message) => {
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}