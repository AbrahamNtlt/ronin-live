<script setup lang="ts">
import { io } from 'socket.io-client';
import { ref } from 'vue';

const socket = io('http://127.0.0.1:8080/');
const calleeId = ref('');

let localStream: MediaStream;
const localVideo = ref<HTMLVideoElement>();
const remoteVideo = ref<HTMLVideoElement>();

const id = Math.random().toString(36).substr(2, 9);
let remoteId: string;
socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('join', {
    roomId: 'room1',
    userId: id,
  });
});
const initCaller = async () => {
  // if (!pc) {
  //   pc = new RTCPeerConnection();
  //   for (const track of localStream.getTracks()) {
  //     console.log('initCaller track', track);
  //     pc.addTrack(track, localStream);
  //   }
  //   pcListener(pc);
  // }
  const offerSDP = await pc.createOffer();
  await pc.setLocalDescription(offerSDP);
};
socket.on('join', (payload) => {
  console.log('join', payload);
});

socket.on('leave', (payload) => {
  console.log('join', payload);
});

socket.on('chat', (payload) => {
  console.log('chat', payload);
});

socket.on('offer', async (payload) => {
  console.log('收到 offer', payload, 'pc:', pc);
  remoteId = payload.callerId;
  await initCallee(payload);
  payload = {
    callerId: payload.callerId,
    // calleeId: id,
    answerSDP: pc.localDescription,
  };
  console.log('发送answer', payload);
  setTimeout(() => {
    socket.emit('answer', payload);
  }, 2000);

});

socket.on('answer', async (payload) => {
  console.log('收到 answer', payload);
  await pc.setRemoteDescription(payload.answerSDP);
});

socket.on('candidate', async (payload) => {
  console.log('收到 candidate', payload);
  await pc.addIceCandidate(payload.candidate);
});

async function initCallee(payload: any) {
  // if (!pc) {
  //   pc = new RTCPeerConnection();
  //   for (const track of localStream.getTracks()) {
  //     console.log('initCallee track', track);
  //     pc.addTrack(track, localStream);
  //   }
  //   pcListener(pc);
  // }
  await pc.setRemoteDescription(payload.offerSDP);
  const answerSDP = await pc.createAnswer();
  await pc.setLocalDescription(answerSDP);
}

const clickBtn = async () => {
  remoteId = calleeId.value;
  await initCaller();
  const payload = {
    callerId: id,
    calleeId: remoteId,
    offerSDP: pc.localDescription,
  };
  console.log('发送offer', payload);
  socket.emit('offer', payload);
};

const pc = new RTCPeerConnection();
pcListener(pc);

function pcListener(pc: RTCPeerConnection) {
  pc.ontrack = (event) => {
    console.log('pc.ontrack', event);
    remoteVideo.value!.srcObject = event.streams[0];
  };
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('onCandidate', event);
      socket.emit('candidate', {
        targetId: remoteId,
        candidate: event.candidate,
      });
      // socket.emit('candidate', {
      //   userId: id,
      //   calleeId: calleeId.value,
      //   candidate: event.candidate,
      // });
    }
  };
}


const openCamera = () => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localVideo.value!.srcObject = localStream = stream;
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
    })
    .catch((error) => {
      console.error('Error accessing media devices.', error);
    });
};

const openDesktop = () => {
  navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
    localVideo.value!.srcObject = localStream = stream;
    for (const track of localStream.getTracks()) {
      pc.addTrack(track, localStream);
    }
  })
    .catch((error) => {
      console.error('Error accessing media devices.', error);
    });
};


const sendMsg = () => {
  console.log('sendMsg');
  socket.emit('message', {
    targetId: remoteId,
    msg: 'hello',
  }, res => {
    console.log('sendMsg res', res);
  });
};
</script>

<template>
  <div>userId: {{ id }}</div>
  <input v-model="calleeId">
  <button @click="clickBtn">sendCall</button>
  <table>
    <tr>
      <th>localVideo</th>
      <th>remoteVideo</th>
    </tr>
    <tr>
      <!--      localVideo      -->
      <td>
        <video autoplay class="video" ref="localVideo"></video>
        <button @click="openCamera">openCamera</button>
        <button @click="openDesktop">openDesktop</button>
      </td>
      <!--      remoteVideo      -->
      <td>
        <video autoplay class="video" ref="remoteVideo"></video>
        <button @click="sendMsg">sendMsg</button>
      </td>
    </tr>
  </table>
</template>

<style scoped>
.video {
  width: 400px;
  height: 225px;
  background: #f8f8f8f8;
}
</style>
