const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const { generateMessage, generateLocationMessage } = require('./utils/message')
const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', socket => {
  console.log('New user connected')

  socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'))

  socket.broadcast.emit(
    'newMessage',
    generateMessage('Admin', 'New user joined the chat')
  )

  socket.on('createMessage', (msg, callback) => {
    io.emit('newMessage', generateMessage(msg.from, msg.text))
    callback()
  })

  socket.on('createLocationMessage', ({ latitude, longitude }) => {
    io.emit(
      'newLocationMessage',
      generateLocationMessage('Admin', latitude, longitude)
    )
  })

  socket.on('disconnect', () => {
    console.log('Disconnected from Server!!')
  })
})

io.on('disconnection', socket => {
  console.log('User disconnected')
})

/* app.get('/', (req, res) => res.sendFile('index.html')) */
server.listen(port, () => console.log('Example app listening on port ' + port))
