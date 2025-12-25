<template>
  <div class="video-editor-container">

    <video-upload  v-if="!videoStore.videoFile"/>


    <div class="video-segment-layout" v-else>
      <video-control />



      <segement-bar />



    </div>
  </div>
</template>

<script setup lang="ts">
import { useVideoEditorStore } from '@/store/ffmpeg/videoEditor';
import { useVideoStore } from '@/store/ffmpeg/videoStore';
import SegementBar from './component/SegementBar.vue';
import VideoControl from './component/VideoControl.vue';
import VideoUpload from './component/VideoUpload.vue';

const store = useVideoEditorStore();
const videoStore = useVideoStore()




</script>

<style>
/* ========== 新增：顶部操作栏样式 ========== */
.top-actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
  padding-right: 5px;
}

.video-editor-container {
  /* width: 100%;
  max-width: 1400px; */
  width: 1220px; 
  height: 700px;
  padding: 20px;
  box-sizing: border-box;
}

.video-segment-layout {
  display: flex;
  gap: 20px;
  width: 100%;
}


.no-segment-tip {
  padding: 20px;
  text-align: center;
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



.play-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #409eff;
  border-radius: 15px;
  z-index: 1;
}



.segment-label {
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  padding: 0 4px;
}



.segment-btn-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.segment-item {
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


pre {
  margin: 5px 0 0 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  color: #333;
  font-family: monospace;
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