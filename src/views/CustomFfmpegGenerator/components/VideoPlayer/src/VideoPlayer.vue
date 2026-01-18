<template>
  <div class="custom-video-player" ref="containerRef">
    <video
      ref="videoRef"
      :poster="props.poster"
      class="video-element"
      @loadedmetadata="onLoadedMetadata"
    ></video>
    <VideoControls v-if="videoRef" :video="videoRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import VideoControls from './VideoControls.vue' // 请根据实际路径调整
import Hls from 'hls.js'

interface Props {
  src: string
  poster?: string
}

const props = defineProps<Props>()

const videoRef = ref<HTMLVideoElement | null>(null)
let hlsInstance: Hls | null = null

// 判断是否为 m3u8
const isM3U8 = computed(() => props.src.endsWith('.m3u8'))


// 初始化播放器
const initializePlayer = () => {
  const video = videoRef.value
  if (!video) return

  // 销毁旧的 hls 实例（如果存在）
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }

  if (isM3U8.value) {
    // 使用 hls.js 播放 m3u8
    if (Hls.isSupported()) {
      hlsInstance = new Hls()
      hlsInstance.loadSource(props.src)
      hlsInstance.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 原生支持 HLS
      video.src = props.src
    } else {
      console.error('HLS is not supported in this browser')
    }
  } else {
    // 普通 MP4 或其他格式
    video.src = props.src
  }
}

// 监听 src 变化（支持动态切换视频）
watch(
  () => props.src,
  () => {
    initializePlayer()
  }
)

onMounted(() => {
  initializePlayer()
})

// 生命周期
onBeforeUnmount(() => {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
})

// 可选：监听元数据加载（用于调试）
const onLoadedMetadata = () => {
  console.log('Video metadata loaded')
}
</script>

<style scoped>
.custom-video-player {
  position: relative;
  width: 100%;
  background: black;
}
.video-element {
  width: 100%;
  display: block;
  outline: none;
}
/* 全屏样式 */
.video-element.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}
</style>