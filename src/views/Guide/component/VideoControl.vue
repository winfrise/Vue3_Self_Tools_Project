<template>
      <el-card class="video-preview-wrapper">

        <div class="top-actions-bar">
            <el-button 
                type="danger" 
                :icon="RefreshLeft"
                @click="handleFullReset"
                :disabled="!videoStore.videoFile && segmentStore.segments.length === 0"
            >
                重置所有状态
            </el-button>
        </div>
        <div v-if="videoStore.videoFile" class="video-preview-section">
          <div class="video-container">
            <div class="video-crop-container" ref="cropContainerRef">
              <video
                ref="videoRef"
                :src="videoStore.videoUrl"
                class="video-player"
                @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleLoadedMetadata"
                @loadeddata="adjustCropBoxToVideo"
                @ended="handleVideoEnded"
                @click="togglePlayPause"
                :controls="false"

              ></video>
              <div class="crop-box"
                v-if="segmentStore.selectedSegment && segmentStore.selectedSegment.enableCrop"
                :style="cropBoxStyles"
                @mousedown="startCropBoxDrag"
              >
                <div class="crop-handle top-left" @mousedown="(e) => startCropBoxResize(e, 'tl')"></div>
                <div class="crop-handle top-right" @mousedown="(e) => startCropBoxResize(e, 'tr')"></div>
                <div class="crop-handle bottom-left" @mousedown="(e) => startCropBoxResize(e, 'bl')"></div>
                <div class="crop-handle bottom-right" @mousedown="(e) => startCropBoxResize(e, 'br')"></div>
                <div class="crop-info">
                  {{ Math.round(segmentStore.selectedSegment.cropWidth) }}
                  x{{ Math.round(segmentStore.selectedSegment.cropHeight) }}
                   | X:{{ Math.round(segmentStore.selectedSegment.cropX) }}
                   , Y:{{ Math.round(segmentStore.selectedSegment.cropY) }}
                </div>
              </div>
              <!-- 播放按钮 -->
              <div class="video-overlay" v-if="!isPlaying">
                <el-icon @click="togglePlayPause"><VideoPlay /></el-icon>
              </div>
            </div>

            <!-- 播放控制栏 -->
            <div class="video-controls">
              <el-button class="control-btn" :icon="isPlaying ? VideoPause : VideoPlay " @click="togglePlayPause"></el-button>

              <!-- 进度条 -->
              <div class="progress-container">
                <el-input
                  type="range"
                  class="progress-bar"
                  min="0"
                  :max="videoStore.duration"
                  v-model="videoStore.currentTime"
                  @input="seekVideo"
                />
              </div>

                <div class="time-display">
                  {{ videoStore.formatTime(videoStore.currentTime) }} / {{ videoStore.formatTime(videoStore.duration) }}
                </div>

              <div class="volume-control">
                <!-- 静音图标 -->
                <el-button class="control-btn" :icon="videoStore.muted ? Mute : Microphone " @click="toggleMute"></el-button>
                <el-input
                  type="range"
                  class="volume-bar"
                  min="0"
                  max="1"
                  step="0.01"
                  :disabled="videoStore.muted"
                  v-model="videoStore.volume"
                  @input="setVolume"
                />
              </div>

              <!-- 全屏播放按钮 -->
              <el-button class="control-btn" :icon="FullScreen" @click="toggleFullscreen"></el-button>
            </div>
          </div>

          <div class="timeline-container">
            <div class="timeline" @click="handleTimelineClick">
              <div
                v-for="(seg, idx) in segmentStore.segments"
                :key="idx"
                class="timeline-segment"
                :style="{
                  left: `${(seg.startTime / videoStore.duration) * 100}%`,
                  width: `${(((seg.endTime || seg.startTime )- seg.startTime) / videoStore.duration) * 100}%`,
                }"
                @click.stop="selectSegment(idx)"
                :class="{ 
                    active: segmentStore.selectedSegmentIdx === idx,

                }"
              >
                <span class="segment-label">片段{{ idx + 1 }}</span>
              </div>
              <div class="play-cursor" :style="{ left: `${videoStore.playProgressPercent}%` }"></div>
            </div>

            <div class="segment-btn-group">
              <el-button type="primary" @click="markSegmentStart">标记片段开始</el-button>
              <el-button type="success" @click="markSegmentEnd">标记片段结束</el-button>
              <el-button type="danger" @click="clearSegments">清空所有片段</el-button>
            </div>
          </div>
        </div>

        <div v-else class="no-video-tip">
          <el-empty description="请先上传视频文件"></el-empty>
        </div>
      </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSegmentStore, useVideoEditorStore } from '@/store/ffmpeg/videoEditor';
import { VideoPlay, VideoPause, Microphone, Mute, FullScreen } from '@element-plus/icons-vue'
import { useVideoStore } from '@/store/ffmpeg/videoStore';
import { useVideoContainerStore } from '@/store/ffmpeg/VideoContainerStore';
import { RefreshLeft } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia';
const store = useVideoEditorStore()
const segmentStore = useSegmentStore()
const videoStore = useVideoStore()
const videoContainerStore = useVideoContainerStore()
const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref<boolean>(false) // 是否正在播放视频



const cropContainerRef = ref<HTMLDivElement | null>(null);


// 拖拽/缩放状态
const isDragging = ref(false);
const isResizing = ref(false);
const resizeType = ref('');
const startPos = ref({ x: 0, y: 0 });
const startCropBox = ref({ x: 0, y: 0, width: 0, height: 0 });

const cropBoxStyles = computed(() => {
  if (!segmentStore.selectedSegment) {
    return {}
  }
  const { cropX, cropY, cropWidth, cropHeight } = segmentStore.selectedSegment
  const { videoOffsetX, videoOffsetY, displayWidth, displayHeight} = storeToRefs(videoContainerStore)
  return {
    left: `${cropX + videoOffsetX.value}px`,
    top: `${cropY + videoOffsetY.value}px`,
    width: `${cropWidth * displayWidth.value}px`,
    height: `${cropHeight * displayHeight.value}px`,
  }
})


// ========== 新增：处理完整重置 ==========
const handleFullReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有状态吗？这将清空所有视频、片段和裁剪设置！',
      '确认重置',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    );
     videoStore.videoUrl = ''
    
    ElMessage.success('已重置所有状态，回到初始页面');
  } catch (error) {
    ElMessage.info('已取消重置');
  }
};




const handleTimeUpdate = () => {
  if (!videoRef.value) return;
  videoStore.currentTime = videoRef.value.currentTime;
  isPlaying.value = !videoRef.value.paused;
};

const handleVideoEnded = () => {
  isPlaying.value = false;
  videoStore.currentTime = 0;
  if (videoRef.value) {
    videoRef.value.currentTime = 0;
    videoRef.value.pause();
  }
};

// 裁剪框拖拽逻辑
const startCropBoxDrag = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  const { selectedSegment } = segmentStore
  if (!selectedSegment || !selectedSegment.enableCrop) return;

  isDragging.value = true;
  startPos.value = { x: e.clientX, y: e.clientY };
  startCropBox.value = {
    x: store.cropBoxX,
    y: store.cropBoxY,
    width: store.cropBoxWidth,
    height: store.cropBoxHeight,
  };

  document.addEventListener('mousemove', handleCropBoxDrag);
  document.addEventListener('mouseup', stopCropBoxDrag);
};


// 视频事件处理
const handleLoadedMetadata = () => {
  if (!videoRef.value) return;
  // 更新原始视频尺寸
  const { duration, videoWidth, videoHeight} = videoRef.value

  videoStore.duration = duration
  videoStore.videoWidth= videoWidth
  videoStore.videoHeight = videoHeight
  videoStore.volume = videoRef.value.volume;
  videoStore.muted = videoRef.value.muted;

  const container = cropContainerRef.value;
  if (container) {
    videoContainerStore.containerWidth = container.clientWidth;
    videoContainerStore.containerHeight = container.clientHeight;
  }
};

const adjustCropBoxToVideo = () => {
  const container = cropContainerRef.value;
  if (container) {
    videoContainerStore.containerWidth = container.clientWidth;
    videoContainerStore.containerHeight = container.clientHeight;
  }
};


const handleCropBoxDrag = (e: MouseEvent) => {
  const { selectedSegment, selectedSegmentIdx, segments } = storeToRefs(segmentStore)
  if (!isDragging.value || !videoRef.value || !selectedSegment.value) return;


  const { displayWidth, displayHeight} = videoContainerStore
  if (!selectedSegment.value.enableCrop) return;

  const dx = e.clientX - startPos.value.x;
  const dy = e.clientY - startPos.value.y;

  // 新位置
  let newX = startCropBox.value.x + dx;
  let newY = startCropBox.value.y + dy;

  // 限制在视频显示区域内
  newX = Math.max(0, newX);
  newY = Math.max(0, newY);
  newX = Math.min(newX, displayWidth - selectedSegment.value.cropWidth);
  newY = Math.min(newY, displayHeight - selectedSegment.value.cropHeight);

  segments.value[selectedSegmentIdx.value] = {...selectedSegment.value, cropX: newX, cropY: newY}
  // 更新裁剪框位置
  // store.cropBoxX = newX;
  // store.cropBoxY = newY;

  // 同步到片段（转换为原始尺寸）
//   store.syncSegmentFromCropBox();
};

const stopCropBoxDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleCropBoxDrag);
  document.removeEventListener('mouseup', stopCropBoxDrag);
};

// 裁剪框缩放逻辑
const startCropBoxResize = (e: MouseEvent, type: string) => {
  e.preventDefault();
  e.stopPropagation();
  if (store.selectedSegmentIdx === -1 || !store.segments[store.selectedSegmentIdx].enableCrop) return;

  isResizing.value = true;
  resizeType.value = type;
  startPos.value = { x: e.clientX, y: e.clientY };
  startCropBox.value = {
    x: store.cropBoxX,
    y: store.cropBoxY,
    width: store.cropBoxWidth,
    height: store.cropBoxHeight,
  };

  document.addEventListener('mousemove', handleCropBoxResize);
  document.addEventListener('mouseup', stopCropBoxResize);
};

const handleCropBoxResize = (e: MouseEvent) => {
  if (!isResizing.value || !videoRef.value || store.selectedSegmentIdx === -1) return;

  const seg = store.segments[store.selectedSegmentIdx];
  if (!seg.enableCrop) return;

  const dx = e.clientX - startPos.value.x;
  const dy = e.clientY - startPos.value.y;
  let newX = startCropBox.value.x;
  let newY = startCropBox.value.y;
  let newWidth = startCropBox.value.width;
  let newHeight = startCropBox.value.height;

  // 根据缩放类型计算新尺寸
  switch (resizeType.value) {
    case 'tl':
      newX = startCropBox.value.x + dx;
      newY = startCropBox.value.y + dy;
      newWidth = startCropBox.value.width - dx;
      newHeight = startCropBox.value.height - dy;
      break;
    case 'tr':
      newY = startCropBox.value.y + dy;
      newWidth = startCropBox.value.width + dx;
      newHeight = startCropBox.value.height - dy;
      break;
    case 'bl':
      newX = startCropBox.value.x + dx;
      newWidth = startCropBox.value.width - dx;
      newHeight = startCropBox.value.height + dy;
      break;
    case 'br':
      newWidth = startCropBox.value.width + dx;
      newHeight = startCropBox.value.height + dy;
      break;
  }

  // 最小尺寸限制
  const minSize = 20;
  newWidth = Math.max(minSize, newWidth);
  newHeight = Math.max(minSize, newHeight);

  // 限制在视频显示区域内
  newX = Math.max(0, newX);
  newY = Math.max(0, newY);
  newWidth = Math.min(newWidth, store.videoDisplayWidth - newX);
  newHeight = Math.min(newHeight, store.videoDisplayHeight - newY);

  // 更新裁剪框
  store.cropBoxX = newX;
  store.cropBoxY = newY;
  store.cropBoxWidth = newWidth;
  store.cropBoxHeight = newHeight;

  // 同步到片段并验证
//   store.syncSegmentFromCropBox();
//   store.validateCropParams(store.selectedSegmentIdx);
};

const stopCropBoxResize = () => {
  isResizing.value = false;
  resizeType.value = '';
  document.removeEventListener('mousemove', handleCropBoxResize);
  document.removeEventListener('mouseup', stopCropBoxResize);
};

// 视频控制方法
const togglePlayPause = () => {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play();
    isPlaying.value = true;
  } else {
    videoRef.value.pause();
    isPlaying.value = false;
  }
};

const seekVideo = () => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = videoStore.currentTime;
};

// 静音切换
const toggleMute = () => {
  if (!videoRef.value) return;
  videoStore.muted = !videoStore.muted;
  videoRef.value.muted = videoStore.muted;
};

// 改变音量
const setVolume = () => {
  if (!videoRef.value) return;
  videoRef.value.volume = videoStore.volume;
};

const toggleFullscreen = () => {
  if (!videoRef.value) return;
  const videoContainer = videoRef.value.parentElement;
  if (!videoContainer) return;

  if (!document.fullscreenElement) {
    if (videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen();
    } else if ((videoContainer as any).webkitRequestFullscreen) {
      (videoContainer as any).webkitRequestFullscreen();
    } else if ((videoContainer as any).msRequestFullscreen) {
      (videoContainer as any).msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }
};

// 时间轴处理
const handleTimelineClick = (e: MouseEvent) => {
  if (!videoStore.duration || !videoRef.value) return;
  const timeline = e.currentTarget as HTMLElement;
  const clickX = e.offsetX;
  const percent = clickX / timeline.offsetWidth;
  const targetTime = percent * videoStore.duration;
  videoRef.value.currentTime = targetTime;
  videoStore.currentTime = targetTime;
};

// 标记片断开始时间
const markSegmentStart = () => {
  segmentStore.markSegmentStart(videoStore.currentTime);
  ElMessage.info(`已标记开始时间: ${store.formatTime(store.currentTime)}`);
};

// 标记片断结束时间
const markSegmentEnd = () => {
    const currentSegment =  segmentStore.segments[segmentStore.selectedSegmentIdx]
    if (videoStore.currentTime <= currentSegment.startTime) {
        ElMessage.error('结束时间必须晚于开始时间！');
        return;
    }
    segmentStore.markSegmentEnd(videoStore.currentTime)
    ElMessage.success(`已添加片段: ${store.formatTime(segmentStore.selectedSegment.startTime)} - ${store.formatTime(store.currentTime)}`);
};

const selectSegment = (idx: number) => {
    if (!videoRef.value) return
    segmentStore.selectSegment(idx);
    const seg = segmentStore.segments[idx];
    videoRef.value.currentTime = seg.startTime;
    store.currentTime = seg.startTime;
    ElMessage.info(`已选中片段 ${idx + 1}，视频已跳转到片段开始位置`);
};

const clearSegments = async () => {
  const confirm = await ElMessageBox.confirm('确定删除所有片断', '提示', {
    type: 'warning',
  });
  if (confirm) {
    segmentStore.clearSegments();
    ElMessage.info('已清空所有片段');
  }
};


</script>

<style lang="scss" scoped>

.timeline {
  width: 100%;
  height: 30px;
  background: #333;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
  margin-bottom: 8px;

  .play-cursor {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 100%;
    background: #fff;
    z-index: 3;
    }
}


.timeline-segment {
    position: absolute;
    top: 0;
    height: 100%;
    background: rgba(64, 158, 255, 0.3);
    border: 1px solid #409eff;
    border-radius: 4px;
    z-index: 2;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &.active {
        background: rgba(64, 158, 255, 0.6);
    }
}



.video-preview-wrapper {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.no-video-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 480px;
}

.video-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
}

.video-crop-container {
  position: relative;
  width: 100%;
  height: 480px;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
  cursor: pointer;
}



.video-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: #222;
  color: #fff;
  width: 100%;
  box-sizing: border-box;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  padding: 5px;
  &:hover {
    background-color: #444;
  }
}


.progress-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: #444;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #409eff;
  cursor: pointer;
}

.time-display {
  font-size: 12px;
  color: #ccc;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.volume-bar {
  width: 80px;
  height: 6px;
  background-color: #444;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #409eff;
  cursor: pointer;
}

.segments-list-wrapper {
  flex: 1;
  height: calc(100vh - 40px);
  min-width: 300px;
}

.segments-scroll-container {
  height: 100%;
  overflow-y: auto;
  padding-right: 5px;
  scrollbar-width: thin;
  scrollbar-color: #409eff #f5f5f5;
}

.segments-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.segments-scroll-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.segments-scroll-container::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 3px;
}

.segments-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #337ecc;
}


// 视频裁剪
.crop-box {
  position: absolute;
  border: 2px solid #ff4757;
  background: rgba(255, 71, 87, 0.1);
  cursor: move;
  z-index: 10;
}

.crop-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ff4757;
  border-radius: 50%;
  cursor: nwse-resize;
  z-index: 11;
}

.crop-handle.top-left {
  top: -6px;
  left: -6px;
  cursor: nw-resize;
}

.crop-handle.top-right {
  top: -6px;
  right: -6px;
  cursor: ne-resize;
}

.crop-handle.bottom-left {
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
}

.crop-handle.bottom-right {
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
}

.crop-info {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 12px;
  color: #ff4757;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 12;
}
</style>