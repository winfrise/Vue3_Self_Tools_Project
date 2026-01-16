<template>
    <video :controls="false" class="video" ref="videoRef"
      :src="props.videoUrl"
      @loadedmetadata="handleLoadedMetaData"
      @timeupdate="handleTimeUpdate"
      @play="emit('play')"
      @pause="emit('pause')"

    />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VideoDisplayInfo } from '../types/custom';

interface Props {
  videoUrl: string | undefined,
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'loadedMetaData', data: VideoDisplayInfo) : void
  (e: 'timeupdate', val: number) :void
  (e: 'play'):void
  (e: 'pause'):void
}>()

const videoDisplayInfo = ref<VideoDisplayInfo | null>(null)

const handleLoadedMetaData = (e : Event) => {

  const target = e.target as HTMLVideoElement

  const containerWidth = target.offsetWidth
  const containerHeight = target.offsetHeight

  const videoWidth = target.videoWidth
  const videoHeight = target.videoHeight

  const scaleRatio = (() => {
      const scaleX = containerWidth / videoWidth
      const scaleY = containerHeight / videoHeight
      return Math.min(scaleX, scaleY)
  })()

  const displayWidth = videoWidth * scaleRatio;
  const displayHeight = videoHeight * scaleRatio

  // 3. 计算位置 (居中显示)
  // 在容器中水平垂直居中
  const displayX = (containerWidth - displayWidth) / 2
  const displayY = (containerHeight - displayHeight) / 2


  videoDisplayInfo.value = {
    displayX,
    displayY,
    displayWidth,
    displayHeight,
    containerWidth,
    containerHeight,
    scaleRatio,
    videoWidth,
    videoHeight,
  }
  emit('loadedMetaData', videoDisplayInfo.value)
}

const handleTimeUpdate = (e) => {
  console.log(videoRef.value.currentTime)
  if (videoRef.value) {
    emit('timeupdate', videoRef.value.currentTime)
  }
};

const videoRef = ref()
// 播放
const play = () => {
  if (!videoRef.value) return
  videoRef.value.play()
}

// 暂停
const pause = () => {
  if (!videoRef.value) return
  videoRef.value.pause()
}

// 切换播放/暂停状态
const togglePlayPause = () => {
  if (videoRef.value.paused) {
    play()
  } else {
    pause()
  }
}

/**
 * 快退（默认 2 秒）
 */
const backward = (seconds: number = 2) => {
    videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - seconds)
}

/**
 * 快进（默认 2 秒）
 */
const forward = (seconds: number = 2) => {
    const duration = videoRef.value.duration || Infinity
    videoRef.value.currentTime = Math.min(duration, videoRef.value.currentTime + seconds)
}

/**
 * 跳转到视频开头
 */
const jumpStart = () => {
  videoRef.value.currentTime = 0
}

/**
 * 跳转到视频结尾
 */
const jumpEnd = () => {
  videoRef.value.currentTime = videoRef.value.duration
}

/**
 * 上一帧（通过暂停 + 微小回退实现）
 */
const prevFrame = async () => {
  // 确保视频已加载
  if (videoRef.value.readyState < 2) return

  const originalPaused = videoRef.value.paused
  const originalTime = videoRef.value.currentTime

  // 暂停
  if(!originalPaused) {
    videoRef.value.pause()
  }

  // 计算一帧时间（假设 30fps → ~0.033s）
  const frameDuration = 1 / 30

  // 回退一帧
  let newTime = Math.max(0, originalTime - frameDuration)
  videoRef.value.currentTime = newTime

  // 强制渲染当前帧（等待 seeked）
  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      videoRef.value?.removeEventListener('seeked', onSeeked)
      resolve()
    }
    videoRef.value?.addEventListener('seeked', onSeeked, { once: true })
  })

  // 如果原来在播放，不自动恢复（帧步进通常用于逐帧查看）
}

/**
 * 下一帧
 */
const nextFrame = async () => {
  if (!videoRef.value) return
  if (videoRef.value.readyState < 2) return

  const originalPaused = videoRef.value.paused
  const originalTime = videoRef.value.currentTime

  if (!originalPaused) {
    videoRef.value.pause()
  }

  const frameDuration = 1 / 30
  let newTime = Math.min(videoRef.value.duration || Infinity, originalTime + frameDuration)
  videoRef.value.currentTime = newTime

  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      videoRef.value?.removeEventListener('seeked', onSeeked)
      resolve()
    }
    videoRef.value?.addEventListener('seeked', onSeeked, { once: true })
  })
}

const setCurrentTime = (currentTime:number) => {
  if (videoRef.value) {
    videoRef.value.currentTime = currentTime
  }
}

// ========== 暴露方法给父组件 ==========
defineExpose({
  play,
  pause,
  togglePlayPause,
  backward,
  forward,
  jumpStart,
  jumpEnd,
  prevFrame,
  nextFrame,
  setCurrentTime,
})

</script>



<style lang="scss" scoped>
  .video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    aspect-ratio: 16/9;
    background-color: #000;
  }

</style>