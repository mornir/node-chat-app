const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', socket => {
  console.log('New user connected')

  socket.emit('newMessage', {
    from: 'admin',
    text: 'Welcome to the chat app',
    createAt: new Date().getTime(),
  })

  socket.broadcast.emit('newMessage', {
    from: 'admin',
    text: 'New user joined the chat',
    createAt: new Date().getTime(),
  })

  socket.on('createMessage', msg => {
    console.log('createMessage', msg)
    io.emit('newMessage', {
      from: msg.from,
      text: msg.text,
      createAt: new Date().getTime(),
    })

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
