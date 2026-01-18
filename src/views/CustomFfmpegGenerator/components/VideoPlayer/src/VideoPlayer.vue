<template>
  <div class="custom-video-player" ref="containerRef">
    <div class="video-container">
      <video
        ref="videoRef"
        :poster="props.poster"
        class="video-element"
        @loadedmetadata="onLoadedMetadata"
      ></video>
      <div v-if="$slots.default" style="position: absolute; top: 0; left: 0; width: 100%; height: calc(100% - 80px);">
            <slot></slot>
      </div>
    </div>

    <div style="width: 100%;height: 80px">
      <VideoControls v-if="videoRef" :video="videoRef" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import VideoControls from './VideoControls.vue' // 请根据实际路径调整
import Hls from 'hls.js'
import { calculateCenteredScale } from './utils/calculateCenteredScale'

interface Props {
  src: string
  poster?: string
}

const props = defineProps<Props>()

const videoRef = ref<HTMLVideoElement | null>(null)
let hlsInstance: Hls | null = null

// 判断是否为 m3u8
const isM3U8 = computed(() => props.src.endsWith('.m3u8'))

const emit = defineEmits<{
  (e: 'loadedMetaData', data): void
}>()

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
const onLoadedMetadata = (e) => {
  if (!videoRef.value) return
  const rect = e.target.getBoundingClientRect();
  const containerWidth = rect.width
  const containerHeight = rect.height
  const videoWidth = videoRef.value?.videoWidth
  const videoHeight = videoRef.value?.videoHeight
  const { left, right, top, bottom, scale, displayWidth, displayHeight } = calculateCenteredScale(containerWidth, containerHeight, videoWidth, videoHeight)
  emit('loadedMetaData', {
    left, right, top, bottom, scale, displayWidth, displayHeight
  })
}
</script>

<style lang="scss" scoped>
.custom-video-player {
  position: relative;
  width: 100%;
  background: black;
}
.video-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  .video-element {
    display: block;
    outline: none;
    width: 100%;
    object-fit: contain;
  }
}
</style>