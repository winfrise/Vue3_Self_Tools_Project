<template>
  <div class="video-splitter">
    <!-- 上传区 -->
    <div class="upload-section">
      <label class="upload-label">
        📎 选择视频文件：
        <input type="file" accept="video/*" @change="handleFileUpload" />
      </label>
      <div v-if="videoInfo" class="video-meta">
        {{ videoInfo.file.name }} |
        {{ Math.round(videoInfo.duration) }}s |
        {{ videoInfo.width }}×{{ videoInfo.height }}
      </div>
    </div>

    <!-- 主区域 -->
    <div class="main-area" v-if="videoInfo">
      <!-- 视频播放器 -->
      <div class="video-container">
        <VideoPlayer
          ref="videoPlayerRef"
          :video-info="videoInfo"
          :current-time="currentTime"
          :selectedSegment="selectedSegment"
          v-model:videoDisplayInfo="videoDisplayInfo"
          @time-update="currentTime = $event"
          @play="isPlaying = true"
          @pause="isPlaying = false"
        />
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button @click="isPlaying ? pause() : play()">
          {{ isPlaying ? '⏸️ 暂停' : '▶️ 播放' }}
        </button>
        <button @click="takeScreenshot()">📷 截图</button>
        <button @click="exportSegments()">💾 导出片段</button>
      </div>

      <!-- 时间轴（带工具栏） -->
      <Timeline
        :video-info="videoInfo"
        :segments="segments"
        :current-time="currentTime"
        :is-playing="isPlaying"
        v-model:selectedSegment="selectedSegment"
        @segment-change="segments = $event"
        @current-time-change="handleCurrentTimeChange"
        @play="play"
        @pause="pause"
      />
    </div>

    <!-- 侧边栏：片段列表 -->
    <div class="sidebar" v-if="videoInfo">
      <SegmentList :segments="segments" :video-info="videoInfo" :videoDisplayInfo="videoDisplayInfo" @remove="removeSegment" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onBeforeUnmount, reactive } from 'vue';
import VideoPlayer from './VideoPlayer.vue';
import Timeline from './Timeline.vue';
import SegmentList from './SegmentList.vue';
import { VideoInfo, Segment, VideoDisplayInfo } from '../types/video';

// refs
const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null);

// 状态
const videoFile = ref<File | null>(null);
const videoInfo = ref<VideoInfo | null>(null);
const currentTime = ref(0);
const segments = ref<Segment[]>([]);
const isPlaying = ref(false);

const videoDisplayInfo = reactive<VideoDisplayInfo>({
  videoY: 0,
  videoX: 0,
  displayWidth: 0,
  displayHeight: 0,
  containerWidth: 0,
  containerHeight: 0
})

const selectedSegment = ref()

// --- 文件上传 ---
const handleFileUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  if (!file.type.startsWith('video/')) {
    alert('请上传视频文件！');
    return;
  }

  // 释放旧 URL
  if (videoInfo.value?.url) {
    URL.revokeObjectURL(videoInfo.value.url);
  }

  videoFile.value = file;
  const url = URL.createObjectURL(file);
  videoInfo.value = {
    file,
    filename: file.name,
    url,
    duration: 0,
    width: 0,
    height: 0
  };

  // 获取视频元数据
  const video = document.createElement('video');
  video.src = url;
  video.onloadedmetadata = () => {
    videoInfo.value!.duration = video.duration;
    videoInfo.value!.width = video.videoWidth;
    videoInfo.value!.height = video.videoHeight;
    currentTime.value = 0;
    segments.value = [];
  };
};


// --- 视频控制 ---
const play = () => {
  if (videoPlayerRef.value && videoInfo.value) {
    videoPlayerRef.value.play();
    isPlaying.value = true;
  }
};

const pause = () => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pause();
    isPlaying.value = false;
  }
};

// 截图（示例）
const takeScreenshot = () => {
  alert(`截图时间: ${currentTime.value.toFixed(2)}s`);
};

// 导出（示例）
const exportSegments = () => {
  if (segments.value.length === 0) {
    alert('请先添加至少一个片段！');
    return;
  }
  console.log('导出片段:', segments.value);
  alert(`共 ${segments.value.length} 个片段，已打印到控制台`);
};

// 删除片段
const removeSegment = (id: string) => {
  segments.value = segments.value.filter(s => s.id !== id);
};

// 清理 Object URL
onBeforeUnmount(() => {
  if (videoInfo.value?.url) {
    URL.revokeObjectURL(videoInfo.value.url);
  }
});

const handleCurrentTimeChange = (newCurrentTime:number) => {
  currentTime.value = newCurrentTime
  videoPlayerRef.value?.setCurrentTime(newCurrentTime)
}
</script>

<style scoped>
.video-splitter {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-label {
  font-weight: bold;
  cursor: pointer;
  display: inline-block;
  padding: 8px 12px;
  background-color: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  width: fit-content;
}

.upload-label input {
  display: none;
}

.video-meta {
  font-size: 12px;
  color: #6b7280;
}

.main-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #ffffff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.video-container {
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: 6px;
  overflow: hidden;
}

.controls {
  display: flex;
  gap: 8px;
}

.controls button {
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
}

.controls button:hover {
  opacity: 0.9;
}

.sidebar {
  margin-top: 16px;
}
</style>