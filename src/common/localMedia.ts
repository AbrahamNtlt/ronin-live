
/**
 * 获取摄像头
 */
export const getLocalUserMedia = (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getUserMedia(constraints);
};

/**
 * 获取屏幕共享
 */
export const getLocalDisplayMedia = async (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getDisplayMedia(constraints);
};

/**
 * 获取本地设备
 */
export const getLocalDevices = () => {
  const localDevices: {
    audioInputs: MediaDeviceInfo[],
    videoInputs: MediaDeviceInfo[],
    audioOutputs: MediaDeviceInfo[]
  } = {
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  };
  return navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.forEach(device => {
      switch (device.kind) {
        case 'audioinput':
          localDevices.audioInputs.push(device);
          break;
        case 'videoinput':
          localDevices.videoInputs.push(device);
          break;
        case 'audiooutput':
          localDevices.audioOutputs.push(device);
      }
    });
    return localDevices;
  })
};
