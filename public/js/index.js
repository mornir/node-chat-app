const socket = io()

socket.on('connect', () => {
  console.log('Connected to Server')
})

socket.on('disconnect', () => {
  console.log('Disconnected from Server')
})

socket.on('newMessage', msg => {
  console.log('received a new message', msg)
})
