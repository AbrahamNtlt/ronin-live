<script setup lang="ts">

import {ref} from "vue";
// let tempLocalDevice = null
const localDevice = ref<{
  audioIn: MediaDeviceInfo[],
  videoIn: MediaDeviceInfo[],
  audioOut: MediaDeviceInfo[],
}>({
  audioIn: [],
  videoIn: [],
  audioOut: []
})

const formInline = ref({
  videoId: undefined,
  audioInId: undefined,
  audioOutId: undefined,
  width: 1080,
  height: 720,
  frameRate: 24
})

// function handleError(error: Error) {
//   // alert("摄像头无法正常使用，请检查是否占用或缺失")
//   console.error('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
// }
async function getMediaDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices()
  console.log(devices)
  devices.map(device => {
    if (device.kind === 'audioinput') {
      localDevice.value.audioIn.push(device)
    } else if (device.kind === 'videoinput') {
      localDevice.value.videoIn.push(device)
    } else if (device.kind === 'audiooutput') {
      localDevice.value.audioOut.push(device)
    } else {
      console.error(device)
    }
  })

}

getMediaDevices()
const videoRef = ref<HTMLVideoElement>()

async function onSubmit() {
  console.log(formInline.value)
  const VideoConstraints: MediaStreamConstraints = {
    video: {
      deviceId: formInline.value.videoId
    },
  }
  const localStream = await navigator.mediaDevices.getUserMedia(VideoConstraints);
  videoRef.value!.srcObject = localStream

}
</script>

<template>
  <div id="app">
    <div style="width: 98%;height: 98%;margin-top: 20px;">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form :inline="true" :model="formInline" class="demo-form-inline">
            <el-form-item label="选择摄像头">
              <el-select v-model="formInline.videoId" placeholder="摄像头">
                <el-option v-for="(item,index) in localDevice.videoIn " :key="index" :label="item.label"
                           :value="item.deviceId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="选择麦克风">
              <el-select v-model="formInline.audioInId" placeholder="麦克风">
                <el-option v-for="(item,index) in localDevice.audioIn " :key="index" :label="item.label"
                           :value="item.deviceId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="选择听筒">
              <el-select v-model="formInline.audioOutId" placeholder="听筒">
                <el-option v-for="(item,index) in localDevice.audioOut " :key="index" :label="item.label"
                           :value="item.deviceId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="分辨率:Width">
              <el-input v-model="formInline.width"></el-input>
            </el-form-item>
            <el-form-item label="分辨率:Height">
              <el-input v-model="formInline.height"></el-input>
            </el-form-item>
            <el-form-item label="FPS">
              <el-input v-model="formInline.frameRate"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">确定</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <video ref="videoRef" id="localdemo01" autoplay controls muted></video>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
#localdemo01 {
  width: 500px;
  height: 400px;
}


</style>
