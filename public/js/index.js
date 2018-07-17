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
  },
  methods: {
    sendMessage() {
      socket.emit(
        'createMessage',
        { from: 'test', text: this.message },
        data => {
          console.log('got it', data)
        }
      )
    },
  },
  created() {
    socket.on('newMessage', msg => {
      console.log('received a new message', msg)
      this.messages.push(msg)
    })
  },
})
