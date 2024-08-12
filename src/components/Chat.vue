<script setup lang="ts">
import { io } from 'socket.io-client';
import { NSelect, NFlex, NButton, NInput } from 'naive-ui';
import { onMounted, ref, shallowRef } from 'vue';
import { getLocalDevices, getLocalDisplayMedia, getLocalUserMedia } from '../common/localMedia.ts';

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
  getLocalUserMedia({
    video: videoIpt.value ? {
      deviceId: videoIpt.value,
    } : true,
    audio: audioIpt.value ? {
      deviceId: audioIpt.value,
    } : true,
  })
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
  getLocalDisplayMedia({ video: true, audio: true }).then((stream) => {
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


const audioIpt = ref(null);
const videoIpt = ref(null);
const audioOpt = ref(null);


const localDevices = shallowRef<{
  audioInputs: MediaDeviceInfo[],
  videoInputs: MediaDeviceInfo[],
  audioOutputs: MediaDeviceInfo[]
}>({ audioInputs: [], videoInputs: [], audioOutputs: [] });

onMounted(async () => {
  getLocalDevices().then(devices => {
    localDevices.value = devices;
  });
});
const closeVideo = () => {
  const videoTracks = localVideo.value!.srcObject!.getTracks();
  videoTracks.forEach(track => {
    track.stop();
  });
};

const changeAudio = () => {
  // const audioTracks = localVideo.value!.srcObject!.getTracks();
  const senders = pc.getSenders();
  const sender = senders.find(s => s.track!.kind === 'video');
  if (sender) {
    sender.track!.enabled = !sender.track!.enabled;
  }
};

const changeCamera = async () => {
  const senders = pc.getSenders();
  const sender = senders.find(s => s.track!.kind === 'video');
  if (sender) {
    console.log('sender', sender);
    const newVideoStream = await getLocalUserMedia({
      video: videoIpt.value ? {
        deviceId: videoIpt.value,
      } : true,
      audio: false,
    });
    const newLocalStream = new MediaStream();
    const [videoTrack] = newVideoStream.getTracks();
    newLocalStream.addTrack(videoTrack);
    localStream.getTracks().forEach(track => {
      if (track.kind === 'video') {
        track.stop();
      } else {
        newLocalStream.addTrack(track);
      }
    });
    localVideo.value!.srcObject = localStream = newLocalStream;
    await sender.replaceTrack(videoTrack);
  }
};

const text = ref<string>('');

let channel;
const sendChannel = () => {
  channel.send(text.value);
  text.value = '';
};


function initChannel() {
  if (channel) return;
  channel = pc.createDataChannel('chat');
  pc.ondatachannel = (evt) => {
    evt.channel.onopen = () => {

    };
    evt.channel.onmessage = (msg) => {
      console.log(msg);
    };
    evt.channel.onclose = () => {

    };
  };
}

onMounted(initChannel);
</script>

<template>
  <n-flex justify="center">
    <n-select v-model:value="videoIpt" :options="localDevices.videoInputs" value-field="deviceId" />
    <n-select v-model:value="audioIpt" :options="localDevices.audioInputs" value-field="deviceId" />
    <n-select v-model:value="audioOpt" :options="localDevices.audioOutputs" value-field="deviceId" />
  </n-flex>
  <n-button @click="closeVideo">关闭视频</n-button>
  <n-button @click="changeAudio">切换音视频模式</n-button>
  <n-button @click="changeCamera">切换摄像头</n-button>


  <div>userId: {{ id }}</div>
  <input v-model="calleeId">
  <n-button @click="clickBtn">sendCall</n-button>
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

  <n-input v-model:value="text" type="text" placeholder="发送文本" clearable />
  <n-button @click="sendChannel">发送文本</n-button>
</template>

<style scoped>
.video {
  width: 400px;
  height: 225px;
  background: #f8f8f8f8;
}
</style>
