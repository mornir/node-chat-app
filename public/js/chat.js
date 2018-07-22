import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.5.13/dist/vue.esm.browser.js'

import { deparam } from './lib/deparam.js'

const socket = io()

socket.on('connect', () => {
  const params = deparam(window.location.search)
  socket.emit('join', params, err => {
    if (err) {
      alert(err)
      window.location.href = '/'
    } else {
      console.log('No error')
    }
  })
})

socket.on('disconnect', () => {
  console.log('Disconnected from Server')
})

Vue.component('message-template', {
  props: ['msg'],
  data() {
    return {
      dd: 0,
    }
  },
  filters: {
    formatTime(str) {
      return dateFns.format(str, 'HH:mm a')
    },
  },
  template: `        <li class="message">
        <div class="message__title">
           <h4> {{ msg.from }}</h4>
          <span>
            {{ msg.createAt | formatTime }}
          </span>
          </div>
          <div class="message__body">
          <p v-if="msg.text"> {{ msg.text }}</p>
          <p v-else>  <a :href="msg.url" target="_blank">My location</a></p>
          </div>

        </li>`,
})

new Vue({
  el: '#app',
  data: {
    message: '',
    messages: [],
    isButtonDisabled: false,
    sendLocationButtonText: 'Send Location',
    users: [],
    peer: null,
  },
  methods: {
    async startAudioChat() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        })

        //TODO: understand why this.stream using vue doesn't work

        this.peer = new SimplePeer({
          initiator: true,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
              { urls: 'stun:stun.services.mozilla.com' },
            ],
          },
        })

        this.bindEvents(this.peer)
      } catch (e) {
        console.log(e.message)
      }
    },
    sendMessage() {
      //const params = deparam(window.location.search)
      socket.emit('createMessage', { text: this.message }, () => {
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
    bindEvents(p) {
      p.on('error', err => {
        console.log(err)
      })

      p.on('signal', data => {
        socket.emit('createOffer', data)
      })

      p.on('stream', stream => {
        console.log('got remote audio stream', stream)
        document.querySelector('#audio-tag').srcObject = stream
      })
    },
  },

  created() {
    socket.on('newMessage', msg => {
      this.messages.push(msg)
    })

    socket.on('transmitOffer', data => {
      console.log('receiving Offer', data)
      if (this.peer === null) {
        // peer 2
        this.peer = new SimplePeer({
          initiator: false,
          config: {
            iceServers: [
              {
                urls: 'stun:stun.l.google.com:19302',
              },
              {
                urls: 'stun:global.stun.twilio.com:3478?transport=udp',
              },
              {
                urls: 'stun:stun.services.mozilla.com',
              },
            ],
          },
        })
        this.bindEvents(this.peer)
      }

      this.peer.signal(data)
    })

    socket.on('newLocationMessage', msg => {
      this.messages.push(msg)
      this.isButtonDisabled = false
      this.sendLocationButtonText = 'Send Location'
    })

    socket.on('updateUserList', users => {
      this.users = users
    })
  },
})
