<template>
  <div class="video-editor-container">
    <div class="top-actions-bar">
      <el-button 
        type="danger" 
        icon="el-icon-refresh-left"
        @click="handleFullReset"
        :disabled="!store.videoFile && store.segments.length === 0"
      >
        重置所有状态
      </el-button>
    </div>

        <el-upload
          class="upload-section"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">拖拽视频到此处，或<em>点击上传</em></div>
        </el-upload>

    <div class="video-segment-layout">
      <div class="video-preview-wrapper">


        <div v-if="store.videoFile" class="video-preview-section">
          <div class="video-container">
            <div class="video-crop-container" ref="cropContainerRef">
              <video
                ref="videoRef"
                :src="store.videoUrl"
                class="video-player"
                @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleLoadedMetadata"
                @loadeddata="adjustCropBoxToVideo"
                @ended="handleVideoEnded"
                @click="togglePlayPause"
                controls="false"
                playsinline
              ></video>
              <div
                v-if="store.selectedSegmentIdx !== -1 && store.videoWidth > 0 && store.segments[store.selectedSegmentIdx].enableCrop"
                class="crop-box"
                :style="{
                  left: `${store.cropBoxX + videoOffsetX}px`,
                  top: `${store.cropBoxY + videoOffsetY}px`,
                  width: `${store.cropBoxWidth}px`,
                  height: `${store.cropBoxHeight}px`,
                }"
                @mousedown="startCropBoxDrag"
              >
                <div class="crop-handle top-left" @mousedown="(e) => startCropBoxResize(e, 'tl')"></div>
                <div class="crop-handle top-right" @mousedown="(e) => startCropBoxResize(e, 'tr')"></div>
                <div class="crop-handle bottom-left" @mousedown="(e) => startCropBoxResize(e, 'bl')"></div>
                <div class="crop-handle bottom-right" @mousedown="(e) => startCropBoxResize(e, 'br')"></div>
                <div class="crop-info">
                  {{ Math.round(store.cropBoxWidth) }}x{{ Math.round(store.cropBoxHeight) }} | X:{{ Math.round(store.cropBoxX) }}, Y:{{ Math.round(store.cropBoxY) }}
                </div>
              </div>
              <div class="video-overlay" v-if="!store.isPlaying">
                <i class="el-icon-video-play" @click="togglePlayPause"></i>
              </div>
            </div>

            <div class="video-controls">
              <button class="control-btn" @click="togglePlayPause">
                <i :class="store.isPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>
              </button>

              <div class="progress-container">
                <input
                  type="range"
                  class="progress-bar"
                  min="0"
                  :max="store.videoDuration"
                  v-model="store.currentTime"
                  @input="seekVideo"
                >
                <div class="time-display">
                  {{ store.formatTime(store.currentTime) }} / {{ store.formatTime(store.videoDuration) }}
                </div>
              </div>

              <div class="volume-control">
                <button class="control-btn" @click="toggleMute">
                  <i :class="store.isMuted ? 'el-icon-volume-off' : 'el-icon-volume-on'"></i>
                </button>
                <input
                  type="range"
                  class="volume-bar"
                  min="0"
                  max="1"
                  step="0.01"
                  v-model="store.volume"
                  @input="setVolume"
                >
              </div>

              <button class="control-btn" @click="toggleFullscreen">
                <i class="el-icon-full-screen"></i>
              </button>
            </div>
          </div>

          <div class="timeline-container">
            <div class="timeline-bg" @click="handleTimelineClick">
              <div class="play-progress" :style="{ width: `${store.playProgressPercent}%` }"></div>
              <div
                v-for="(seg, idx) in store.segments"
                :key="idx"
                class="timeline-segment"
                :style="{
                  left: `${(seg.startTime / store.videoDuration) * 100}%`,
                  width: `${((seg.endTime - seg.startTime) / store.videoDuration) * 100}%`,
                }"
                @click="selectSegment(idx)"
                :class="{ active: store.selectedSegmentIdx === idx }"
              >
                <span class="segment-label">片段{{ idx + 1 }}</span>
              </div>
              <div class="play-thumb" :style="{ left: `${store.playProgressPercent}%` }"></div>
            </div>
            <div class="timeline-ticks">
              <span
                v-for="tick in store.timelineTicks"
                :key="tick"
                :style="{ left: `${(tick / store.videoDuration) * 100}%` }"
                class="tick-mark"
              >
                {{ store.formatTime(tick) }}
              </span>
            </div>

            <div class="segment-btn-group">
              <el-button type="primary" @click="markSegmentStart">标记片段开始</el-button>
              <el-button type="success" @click="markSegmentEnd">标记片段结束</el-button>
              <el-button type="warning" @click="updateSelectedSegment" v-if="store.selectedSegmentIdx !== -1">更新当前片段</el-button>
              <el-button type="danger" @click="clearSegments">清空所有片段</el-button>
            </div>
          </div>
        </div>

        <div v-else class="no-video-tip">
          <el-empty description="请先上传视频文件"></el-empty>
        </div>
      </div>

      <div class="segments-list-wrapper">
        <div class="segments-scroll-container">
          <el-card class="segments-header">
            <h3>片段列表 (共{{ store.segments.length }}个)</h3>
          </el-card>

          <div v-if="store.segments.length === 0" class="no-segment-tip">
            <el-empty description="暂无片段，请点击左侧「标记片段开始/结束」添加"></el-empty>
          </div>

          <el-card
            v-else
            shadow="hover"
            class="segment-item"
            v-for="(seg, idx) in store.segments"
            :key="idx"
            :class="{ active: store.selectedSegmentIdx === idx }"
            @click="selectSegment(idx)"
            style="cursor: pointer;"
          >
            <div class="segment-info">
              <p>
                <strong>片段 {{ idx + 1 }}</strong>
                <el-switch
                  v-model="seg.enableCrop"
                  active-text="裁剪开启"
                  inactive-text="裁剪关闭"
                  @change="() => store.toggleCropSwitch(idx, seg.enableCrop)"
                  style="margin-left: 10px;"
                ></el-switch>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click.stop="deleteSegment(idx)"
                  style="margin-left: 10px;"
                ></el-button>
              </p>
              <div class="time-editors">
                <div class="time-item">
                  <label>开始时间：</label>
                  <el-input-number
                    v-model="seg.startTime"
                    :min="0"
                    :max="seg.endTime - 0.1"
                    step="0.1"
                    @change="() => store.validateSegment(idx)"
                  ></el-input-number>
                </div>
                <div class="time-item">
                  <label>结束时间：</label>
                  <el-input-number
                    v-model="seg.endTime"
                    :min="seg.startTime + 0.1"
                    :max="store.videoDuration"
                    step="0.1"
                    @change="() => store.validateSegment(idx)"
                  ></el-input-number>
                </div>
              </div>

              <div class="crop-size-editor" v-if="seg.enableCrop">
                <h4>画面裁剪尺寸（最大：{{ store.videoWidth }}x{{ store.videoHeight }}）</h4>
                <div class="size-row">
                  <div class="size-item">
                    <label>裁剪宽度 (px)：</label>
                    <el-input-number
                      v-model="seg.cropWidth"
                      :min="1"
                      :max="store.videoWidth"
                      step="1"
                      @change="() => store.validateCropParams(idx)"
                    ></el-input-number>
                  </div>
                  <div class="size-item">
                    <label>裁剪高度 (px)：</label>
                    <el-input-number
                      v-model="seg.cropHeight"
                      :min="1"
                      :max="store.videoHeight"
                      step="1"
                      @change="() => store.validateCropParams(idx)"
                    ></el-input-number>
                  </div>
                </div>
                <div class="position-row">
                  <div class="size-item">
                    <label>X 偏移 (px)：</label>
                    <el-input-number
                      v-model="seg.cropX"
                      :min="0"
                      :max="store.videoWidth - seg.cropWidth"
                      step="1"
                      @change="() => store.validateCropParams(idx)"
                    ></el-input-number>
                  </div>
                  <div class="size-item">
                    <label>Y 偏移 (px)：</label>
                    <el-input-number
                      v-model="seg.cropY"
                      :min="0"
                      :max="store.videoHeight - seg.cropHeight"
                      step="1"
                      @change="() => store.validateCropParams(idx)"
                    ></el-input-number>
                  </div>
                </div>
                <div class="size-tips">
                  偏移范围：X(0~{{ store.videoWidth - seg.cropWidth }}) Y(0~{{ store.videoHeight - seg.cropHeight }})
                </div>
              </div>

              <div class="cmd-generator">
                <el-button 
                  type="info" 
                  icon="el-icon-copy-document"
                  @click.stop="copySingleCmd(idx)"
                >复制命令</el-button>
                <div v-if="seg.ffmpegCmd" class="cmd-display">
                  <el-tag type="info">FFmpeg 命令</el-tag>
                  <pre>{{ seg.ffmpegCmd }}</pre>
                </div>
              </div>
            </div>
          </el-card>

          <el-card v-if="store.segments.length > 0" class="batch-cmd-card">
            <div class="batch-cmd-header">
              <el-button 
                type="info" 
                icon="el-icon-copy-document"
                @click="copyBatchCmd"
              >复制批量截取命令</el-button>
            </div>
            <div v-if="store.batchCmds" class="batch-cmd-display">
              <el-tag type="success">批量截取 FFmpeg 命令</el-tag>
              <pre>{{ store.batchCmds }}</pre>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useVideoEditorStore } from '@/store/ffmpeg/videoEditor';

const store = useVideoEditorStore();
const videoRef = ref<HTMLVideoElement | null>(null);
const cropContainerRef = ref<HTMLDivElement | null>(null);

// 视频偏移量（居中显示时的margin）
const videoOffsetX = ref(0);
const videoOffsetY = ref(0);

// 拖拽/缩放状态
const isDragging = ref(false);
const isResizing = ref(false);
const resizeType = ref('');
const startPos = ref({ x: 0, y: 0 });
const startCropBox = ref({ x: 0, y: 0, width: 0, height: 0 });

// 保存resize handler引用，防止内存泄漏
let resizeHandler: () => void;

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
    // 执行完整重置
    store.fullReset();
    // 重置视频元素
    if (videoRef.value) {
      videoRef.value.src = '';
      videoRef.value.currentTime = 0;
      videoRef.value.pause();
    }
    ElMessage.success('已重置所有状态，回到初始页面');
  } catch (error) {
    ElMessage.info('已取消重置');
  }
};

// 核心：计算视频显示尺寸和偏移（适配宽高比）
const calculateVideoDisplaySize = () => {
  if (!cropContainerRef.value || !videoRef.value) return;
  
  const container = cropContainerRef.value;
  const video = videoRef.value;
  
  // 容器尺寸
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  // 原始视频宽高比
  const videoRatio = store.videoAspectRatio;
  const containerRatio = containerWidth / containerHeight;

  let displayWidth, displayHeight;
  if (containerRatio > videoRatio) {
    // 容器更宽，高度填满，宽度自适应
    displayHeight = containerHeight;
    displayWidth = containerHeight * videoRatio;
  } else {
    // 容器更高，宽度填满，高度自适应
    displayWidth = containerWidth;
    displayHeight = containerWidth / videoRatio;
  }

  // 计算视频居中偏移
  videoOffsetX.value = Math.floor((containerWidth - displayWidth) / 2);
  videoOffsetY.value = Math.floor((containerHeight - displayHeight) / 2);

  // 更新Store中的显示尺寸
  store.videoDisplayWidth = Math.floor(displayWidth);
  store.videoDisplayHeight = Math.floor(displayHeight);
  
  // 同步裁剪框
  if (store.selectedSegmentIdx !== -1) {
    store.syncCropBoxFromSegment(store.selectedSegmentIdx);
  }
};

// 上传处理
const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/');
  if (!isVideo) ElMessage.error('请上传视频文件！');
  return isVideo;
};

const handleFileChange = (uploadFile: any) => {
  const file = uploadFile.raw;
  if (!file) return;
  store.initVideoInfo(file);
};

// 视频事件处理
const handleLoadedMetadata = () => {
  if (!videoRef.value) return;
  // 更新原始视频尺寸
  store.updateVideoMetadata(
    videoRef.value.duration,
    videoRef.value.videoWidth,
    videoRef.value.videoHeight
  );
  // 计算显示尺寸
  calculateVideoDisplaySize();
  // 初始化音量
  store.volume = videoRef.value.volume;
  store.isMuted = videoRef.value.muted;
};

const adjustCropBoxToVideo = () => {
  // 先计算显示尺寸
  calculateVideoDisplaySize();
  // 同步裁剪框
  if (store.selectedSegmentIdx !== -1) {
    store.syncCropBoxFromSegment(store.selectedSegmentIdx);
  }
};

const handleTimeUpdate = () => {
  if (!videoRef.value) return;
  store.currentTime = videoRef.value.currentTime;
  store.isPlaying = !videoRef.value.paused;
};

const handleVideoEnded = () => {
  store.isPlaying = false;
  store.currentTime = 0;
  if (videoRef.value) {
    videoRef.value.currentTime = 0;
    videoRef.value.pause();
  }
};

// 裁剪框拖拽逻辑
const startCropBoxDrag = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (store.selectedSegmentIdx === -1 || !store.segments[store.selectedSegmentIdx].enableCrop) return;

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

const handleCropBoxDrag = (e: MouseEvent) => {
  if (!isDragging.value || !videoRef.value || store.selectedSegmentIdx === -1) return;

  const seg = store.segments[store.selectedSegmentIdx];
  if (!seg.enableCrop) return;

  const dx = e.clientX - startPos.value.x;
  const dy = e.clientY - startPos.value.y;

  // 新位置
  let newX = startCropBox.value.x + dx;
  let newY = startCropBox.value.y + dy;

  // 限制在视频显示区域内
  newX = Math.max(0, newX);
  newY = Math.max(0, newY);
  newX = Math.min(newX, store.videoDisplayWidth - store.cropBoxWidth);
  newY = Math.min(newY, store.videoDisplayHeight - store.cropBoxHeight);

  // 更新裁剪框位置
  store.cropBoxX = newX;
  store.cropBoxY = newY;

  // 同步到片段（转换为原始尺寸）
  store.syncSegmentFromCropBox();
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
  store.syncSegmentFromCropBox();
  store.validateCropParams(store.selectedSegmentIdx);
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
    store.isPlaying = true;
  } else {
    videoRef.value.pause();
    store.isPlaying = false;
  }
};

const seekVideo = () => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = store.currentTime;
};

const toggleMute = () => {
  if (!videoRef.value) return;
  store.isMuted = !store.isMuted;
  videoRef.value.muted = store.isMuted;
};

const setVolume = () => {
  if (!videoRef.value) return;
  videoRef.value.volume = store.volume;
  store.isMuted = store.volume === 0;
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
  if (!store.videoDuration || !videoRef.value) return;
  const timeline = e.currentTarget as HTMLElement;
  const clickX = e.offsetX;
  const percent = clickX / timeline.offsetWidth;
  const targetTime = percent * store.videoDuration;
  videoRef.value.currentTime = targetTime;
  store.currentTime = targetTime;
};

// 片段操作
const markSegmentStart = () => {
  if (!store.videoFile) {
    ElMessage.warning('请先上传视频文件！');
    return;
  }
  store.markSegmentStart(store.currentTime);
  ElMessage.info(`已标记开始时间: ${store.formatTime(store.currentTime)}`);
};

const markSegmentEnd = () => {
  if (!store.videoFile) {
    ElMessage.warning('请先上传视频文件！');
    return;
  }
  if (store.currentSegmentStart >= store.currentTime) {
    ElMessage.error('结束时间必须晚于开始时间！');
    return;
  }
  const success = store.addSegment(store.currentSegmentStart, store.currentTime);
  if (success) {
    ElMessage.success(`已添加片段: ${store.formatTime(store.currentSegmentStart)} - ${store.formatTime(store.currentTime)}`);
  }
};

const selectSegment = (idx: number) => {
  if (!videoRef.value) return;
  store.selectSegment(idx);
  const seg = store.segments[idx];
  videoRef.value.currentTime = seg.startTime;
  store.currentTime = seg.startTime;
  ElMessage.info(`已选中片段 ${idx + 1}，视频已跳转到片段开始位置`);
};

const deleteSegment = async (idx: number) => {
  const confirm = await ElMessageBox.confirm('确定删除该片段吗？', '提示', {
    type: 'warning',
  });
  if (confirm) {
    store.deleteSegment(idx);
    ElMessage.success('片段已删除');
  }
};

const clearSegments = () => {
  store.clearSegments();
  ElMessage.info('已清空所有片段');
};

const updateSelectedSegment = () => {
  if (store.selectedSegmentIdx === -1) {
    ElMessage.warning('请先选中要更新的片段');
    return;
  }
  const seg = store.segments[store.selectedSegmentIdx];
  seg.startTime = store.currentTime;
  store.validateSegment(store.selectedSegmentIdx);
  ElMessage.success(`已更新片段 ${store.selectedSegmentIdx + 1} 的开始时间为: ${store.formatTime(store.currentTime)}`);
};

// 命令复制
const copySingleCmd = async (idx: number) => {
  const cmd = store.generateSingleCmd(idx);
  if (cmd) {
    const success = await store.copyToClipboard(cmd);
    if (success) {
      ElMessage.success('命令已成功复制到剪贴板！');
    }
  }
};

const copyBatchCmd = async () => {
  const cmd = store.generateBatchCmd();
  if (cmd) {
    const success = await store.copyToClipboard(cmd);
    if (success) {
      ElMessage.success('批量命令已成功复制到剪贴板！');
    }
  }
};

// 生命周期
onMounted(() => {
  // 窗口大小变化时重新计算显示尺寸
  resizeHandler = () => {
    calculateVideoDisplaySize();
  };
  window.addEventListener('resize', resizeHandler);

  // 视频加载完成后计算显示尺寸
  watch([() => store.videoWidth, () => store.videoHeight], () => {
    if (videoRef.value) {
      calculateVideoDisplaySize();
    }
  });
});

onUnmounted(() => {
  // 移除resize监听，防止内存泄漏
  window.removeEventListener('resize', resizeHandler);
  // 移除拖拽/缩放监听
  document.removeEventListener('mousemove', handleCropBoxDrag);
  document.removeEventListener('mouseup', stopCropBoxDrag);
  document.removeEventListener('mousemove', handleCropBoxResize);
  document.removeEventListener('mouseup', stopCropBoxResize);
  // 释放视频URL
  if (store.videoUrl) {
    URL.revokeObjectURL(store.videoUrl);
  }
});
</script>

<style scoped>
/* ========== 新增：顶部操作栏样式 ========== */
.top-actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
  padding-right: 5px;
}

.video-editor-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.video-segment-layout {
  display: flex;
  gap: 20px;
  width: 100%;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #000;
  cursor: pointer;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 5;
  pointer-events: none;
}

.video-overlay i {
  font-size: 48px;
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
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
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: #444;
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

.no-segment-tip {
  padding: 20px;
  text-align: center;
}

.upload-section {
  width: 100%;
  height: 120px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  text-align: center;
  padding: 20px;
  margin-bottom: 10px;
}

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

.timeline-container {
  width: 100%;
  margin-top: 15px;
}

.timeline-bg {
  width: 100%;
  height: 30px;
  background: #f5f5f5;
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  margin-bottom: 8px;
}

.play-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #409eff;
  border-radius: 15px;
  z-index: 1;
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
}

.timeline-segment.active {
  background: rgba(64, 158, 255, 0.6);
}

.segment-label {
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  padding: 0 4px;
}

.play-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border: 2px solid #409eff;
  border-radius: 50%;
  z-index: 3;
}

.timeline-ticks {
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: relative;
}

.tick-mark {
  position: absolute;
  font-size: 12px;
  color: #666;
  transform: translateX(-50%);
}

.segment-btn-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.segment-item {
  padding: 15px;
  box-sizing: border-box;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.segment-item.active {
  border: 2px solid #409eff;
  background-color: #f0f7ff;
}

.segment-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.time-editors {
  display: flex;
  gap: 15px;
  margin: 10px 0;
  flex-wrap: wrap;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.crop-size-editor {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.crop-size-editor h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
}

.size-row, .position-row {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.size-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.size-tips {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.cmd-generator {
  margin-top: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.cmd-display, .batch-cmd-display {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  width: 100%;
}

.batch-cmd-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

pre {
  margin: 5px 0 0 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  color: #333;
  font-family: monospace;
}

.batch-cmd-card {
  margin-top: 10px;
  padding: 15px;
}

.segments-header {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .video-segment-layout {
    flex-direction: column;
  }
  .segments-list-wrapper {
    height: auto;
    max-height: 500px;
  }
  .crop-info {
    font-size: 10px;
    bottom: -18px;
  }
  .cmd-generator {
    flex-direction: column;
    align-items: flex-start;
  }
  .video-controls {
    flex-wrap: wrap;
  }
  .volume-control {
    width: 100%;
    justify-content: flex-end;
    margin-top: 5px;
  }
  .top-actions-bar {
    justify-content: center;
    margin-bottom: 10px;
  }
}
</style>