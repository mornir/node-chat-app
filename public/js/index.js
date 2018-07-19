import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.5.13/dist/vue.esm.browser.js'

const socket = io()

socket.on('connect', () => {
  console.log('Connected to Server')
})

socket.on('disconnect', () => {
  console.log('Disconnected from Server')
})

new Vue({
  el: '#app',
  data: {
    message: '',
    messages: [],
    isButtonDisabled: false,
    sendLocationButtonText: 'Send Location',
  },
  methods: {
    sendMessage() {
      socket.emit('createMessage', { from: 'test', text: this.message }, () => {
        this.message = ''
      })
    },
    sendLocation() {
      this.isButtonDisabled = true
      this.sendLocationButtonText = 'Sending location...'
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          socket.emit('createLocationMessage', {
            latitude,
            longitude,
          })
        },
        () => {
          alert('Unable to fetch location.')
          this.isButtonDisabled = false
          this.sendLocationButtonText = 'Send Location'
        }
      )
    },
  },
  created() {
    socket.on('newMessage', msg => {
      console.log('received a new message', msg)
      this.messages.push(msg)
    })

    socket.on('newLocationMessage', msg => {
      console.log('received a new message', msg)
      this.messages.push(msg)
      this.isButtonDisabled = false
      this.sendLocationButtonText = 'Send Location'
    })
  },
})
