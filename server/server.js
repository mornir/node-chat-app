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

    socket.join(room)
    users.removeUser(socket.id)
    users.addUser(socket.id, name, room)

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
    const { room, name } = users.getUser(socket.id)

    if (room && isRealString(msg.text)) {
      io.to(room).emit('newMessage', generateMessage(name, msg.text))
    }

    callback()
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
    console.log('disconnecting', user)

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room))
      io.to(user.room).emit('createMessage', {
        from: 'Admin',
        text: `${user.name} has left the room`,
      })
    }
  })
})

io.on('disconnection', socket => {
  console.log('User disconnected')
})

/* app.get('/', (req, res) => res.sendFile('index.html')) */
server.listen(port, () => console.log('Example app listening on port ' + port))
