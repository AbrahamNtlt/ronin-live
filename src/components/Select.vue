<script setup lang="ts">
import { NSelect, NSpace } from 'naive-ui';
import { onMounted, ref } from 'vue';

const videoInp = ref(null);
const option2 = ref([]);
const options = [
  {
    label: 'Everybody\'s Got Something to Hide Except Me and My Monkey',
    value: 'song0',
    disabled: true,
  },
  {
    label: 'Drive My Car',
    value: 'song1',
  },
  {
    label: 'Norwegian Wood',
    value: 'song2',
  },
  {
    label: 'You Won\'t See',
    value: 'song3',
    disabled: true,
  },
  {
    label: 'Nowhere Man',
    value: 'song4',
  },
  {
    label: 'Think For Yourself',
    value: 'song5',
  },
  {
    label: 'The Word',
    value: 'song6',
  },
  {
    label: 'Michelle',
    value: 'song7',
    disabled: true,
  },
  {
    label: 'What goes on',
    value: 'song8',
  },
  {
    label: 'Girl',
    value: 'song9',
  },
  {
    label: 'I\'m looking through you',
    value: 'song10',
  },
  {
    label: 'In My Life',
    value: 'song11',
  },
  {
    label: 'Wait',
    value: 'song12',
  },
];

onMounted(()=> {
  option2.value = options
})

const onClick = () => {
  console.log(videoInp.value);
};
</script>

<template>
  <n-space vertical>
    <n-select v-model:value="videoInp" :options="option2" />
<!--    <n-select v-model:value="videoInp" disabled :options="options" />-->
    <n-button @click="onClick">button</n-button>
  </n-space>
</template>

<style scoped>

</style>
