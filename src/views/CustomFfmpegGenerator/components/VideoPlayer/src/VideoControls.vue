<template>
  <div class="custom-controls">
    <div class="progress-row" @click="handleProgressClick">
      <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <div class="controls-row">
      <div class="playback-controls">
        <button class="control-btn" @click="seekTo(0)">««</button>
        <button class="control-btn" @click="seekBy(-10)">«</button>
        <button class="control-btn" @click="togglePlayPause">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="control-btn" @click="seekBy(10)">»</button>
        <button class="control-btn" @click="seekToEnd">»»</button>
      </div>
      <div class="status-group">
        <span class="time-display">{{ currentTimeFormatted }} / {{ durationFormatted }}</span>
        <div class="volume-control" @click="handleVolumeClick">
          <span>🔈</span>
          <div class="volume-slider">
            <div class="volume-level" :style="{ width: volumePercent + '%' }"></div>
          </div>
        </div>
        <select class="speed-select" v-model="playbackRate">
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1">1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
        <button class="control-btn" @click="toggleFullscreen">
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { formatTime } from './utils/formatTime'

// Props 类型定义
interface Props {
  video: HTMLVideoElement
}

const props = defineProps<Props>()

// === 响应式状态 ===
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const playbackRate = ref('1') // 注意：select 的 value 是字符串
const isFullscreen = ref(false)

// === 计算属性 ===
const progressPercent = computed(() => (currentTime.value / (duration.value || 1)) * 100)
const volumePercent = computed(() => volume.value * 100)
const currentTimeFormatted = computed(() => formatTime(currentTime.value))
const durationFormatted = computed(() => formatTime(duration.value))

// 全屏目标：默认为 video 元素本身
const fullscreenTarget = props.video

// === 方法 ===
const togglePlayPause = async () => {
  const video = props.video
  if (video.paused) {
    await video.play()
    isPlaying.value = true
  } else {
    video.pause()
    isPlaying.value = false
  }
}

const seekTo = (time: number) => {
  props.video.currentTime = Math.max(0, Math.min(duration.value || Infinity, time))
}

const seekBy = (seconds: number) => {
  seekTo(props.video.currentTime + seconds)
}

const seekToEnd = () => {
  if (duration.value) seekTo(duration.value)
}

const handleProgressClick = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  props.video.currentTime = ratio * (duration.value || 0)
}

const handleVolumeClick = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const newVol = ratio
  volume.value = newVol
  props.video.volume = newVol
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    if (fullscreenTarget.requestFullscreen) {
      fullscreenTarget.requestFullscreen()
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

// === 生命周期与事件监听 ===
let cleanupFns: (() => void)[] = []

watch(
  () => props.video,
  (video) => {
    if (!video) return

    // 初始化
    video.volume = volume.value
    video.playbackRate = parseFloat(playbackRate.value)

    // 事件处理器
    const onLoadedMetadata = () => {
      duration.value = video.duration
    }

    const onTimeUpdate = () => {
      currentTime.value = video.currentTime
    }

    const onPlay = () => (isPlaying.value = true)
    const onPause = () => (isPlaying.value = false)

    const onFullscreenChange = () => {
      isFullscreen.value = document.fullscreenElement === fullscreenTarget
      if (isFullscreen.value) {
        fullscreenTarget.classList.add('fullscreen')
      } else {
        fullscreenTarget.classList.remove('fullscreen')
      }
    }

    // 绑定事件
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    // 注册清理函数
    cleanupFns = [
      () => video.removeEventListener('loadedmetadata', onLoadedMetadata),
      () => video.removeEventListener('timeupdate', onTimeUpdate),
      () => video.removeEventListener('play', onPlay),
      () => video.removeEventListener('pause', onPause),
      () => document.removeEventListener('fullscreenchange', onFullscreenChange),
    ]
  },
  { immediate: true }
)

// 监听播放速率变化
watch(playbackRate, (rateStr) => {
  props.video.playbackRate = parseFloat(rateStr)
})

// 清理监听器
onBeforeUnmount(() => {
  cleanupFns.forEach((fn) => fn())
})
</script>

<style scoped>
.custom-controls {
  position: relative;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  pointer-events: none;
}
.custom-controls > * {
  pointer-events: auto;
}
.progress-row {
  width: 100%;
  height: 6px;
  background: #444;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  margin-bottom: 8px;
}
.progress-bar {
  height: 100%;
  background: #1e90ff;
  border-radius: 3px;
  width: 0%;
  transition: width 0.1s;
}
.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.playback-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.control-btn {
  background: none;
  border: 1px solid #666;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 36px;
  text-align: center;
}
.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #999;
}
.status-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.time-display {
  font-size: 13px;
  white-space: nowrap;
}
.volume-control {
  display: flex;
  align-items: center;
  gap: 6px;
}
.volume-slider {
  width: 60px;
  height: 4px;
  background: #444;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
}
.volume-level {
  height: 100%;
  background: white;
  border-radius: 2px;
  width: 80%;
}
select.speed-select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid #666;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
}
</style>