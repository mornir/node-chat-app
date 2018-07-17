const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const { generateMessage } = require('./utils/message')
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
    console.log('createMessage', msg)
    io.emit('newMessage', generateMessage(msg.from, msg.text))
    callback('This is from the server')

    /*     socket.broadcast.emit('newMessage', {
      from: msg.from,
      text: msg.text,
      createAt: new Date().getTime(),
    }) */
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
