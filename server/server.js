const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const { generateMessage, generateLocationMessage } = require('./utils/message')
const { isRealString } = require('./utils/validation')
const { Users } = require('./utils/users')

const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketIO(server)
const users = new Users()

app.use(express.static(publicPath))

io.on('connection', socket => {
  console.log('New user connected')

  socket.on('join', ({ name, room }, callback) => {
    if (!isRealString(name) || !isRealString(room)) {
      return callback('Name and room are required.')
    }

    console.log(`${name} has join the room`)

    socket.join(room)
    users.removeUser(socket.id)
    const user = users.addUser(socket.id, name, room)

    console.log('nouvel utilisateur', user)

    io.to(room).emit('updateUserList', users.getUserList(room))

    socket.emit(
      'newMessage',
      generateMessage('Admin', 'Welcome to the chat app')
    )

    socket.broadcast
      .to(room)
      .emit('newMessage', generateMessage('Admin', `${name} has joined`))

    callback()
  })

  socket.on('createMessage', (msg, callback) => {
    const user = users.getUser(socket.id)

    if (user) {
      console.log('createMessage', user)
      const { room, name } = user
      io.to(room).emit('newMessage', generateMessage(name, msg.text))
    }

    callback()
  })

  socket.on('createOffer', data => {
    const { room, name } = users.getUser(socket.id)
    console.log('got Offer')
    socket.broadcast.to(room).emit('transmitOffer', { name, data })
  })

  socket.on('createLocationMessage', ({ latitude, longitude }) => {
    const { room, name } = users.getUser(socket.id)
    if (room) {
      io.to(room).emit(
        'newLocationMessage',
        generateLocationMessage(name, latitude, longitude)
      )
    }
  })

  socket.on('disconnect', () => {
    const user = users.removeUser(socket.id)

    if (user) {
      const { room, name } = user

      console.log(`${name} has left the room`)

      io.to(room).emit('updateUserList', users.getUserList(room))
      io.to(room).emit(
        'newMessage',
        generateMessage('Admin', `${name} has left`)
      )
    }
  })
})

io.on('disconnection', socket => {
  console.log('User disconnected')
})

/* app.get('/', (req, res) => res.sendFile('index.html')) */
server.listen(port, () => console.log('Example app listening on port ' + port))
