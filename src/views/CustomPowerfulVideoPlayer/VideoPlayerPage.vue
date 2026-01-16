<template>
  <div class="player-wrapper">
    <h2>高级视频播放器 - 全屏优化版</h2>
    <ZoomContainer>
      <video class="video"  ref="videoRef" ></video>


    </ZoomContainer>
      <!-- 自定义控制条 -->
      <VideoControls :video="videoRef" />
    <!-- 全屏目标容器 -->
    <div class="player-fullscreen-target" id="fullscreenTarget">
      <div class="video-container" id="container">
        <video id="video" class="video" ></video>
        <div id="selection"></div>
      </div>

      <!-- 自定义控制条 -->
      <VideoControls :video="videoRef" />
    </div>



    <!-- 顶部控制 -->
    <div class="top-controls">
      <el-input placeholder="输入视频地址（支持 .m3u8 或 .mp4）"
        v-model="networkVideoUrl" />
      <el-button @click="handleLoadVideo">加载网络视频</el-button>
      <button id="zoomIn">+</button>
      <button id="zoomOut">−</button>
      <span id="zoomLevel">100%</span>
      <button id="resetView">重置视图</button>
    </div>
    <p class="hint">
      操作提示：<br>
      • 滚轮：缩放｜直接拖动：平移｜Shift+拖动：裁剪<br>
      • 鼠标悬停视频：显示放大镜
    </p>

    <div class="preview-container" id="previewContainer">
      <h3>区域裁剪预览</h3>
      <canvas id="cropPreview"></canvas>
    </div>
  </div>

  <teleport to="body">
    <!-- 放大镜 -->
    <div id="magnifier"><canvas></canvas></div>
  </teleport>

</template>

  <script setup>
  import { onMounted, ref, unref } from 'vue';
  import Hls from 'hls.js';
  import { loadVideo } from './utils/loadVideo';
  import VideoControls from './components/VideoControls.vue';
  import ZoomContainer from './components/ZoomContainer.vue';
    
  const videoRef = ref(null)
  const networkVideoUrl = ref('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8') // 网络视频地址

  const handleLoadVideo = () => {
    // resetView() // 重置
    loadVideo({videoEl: unref(videoRef), videoUrl: unref(networkVideoUrl)})
  }

  </script>

  <style scoped>
    .player-wrapper {
      max-width: 960px;
      margin: 0 auto;
    }

    /* 全屏目标容器 */
    .player-fullscreen-target {
      position: relative;
      border: 1px solid #ccc;
      background: #000;
      --controls-height: 70px; /* 控制条总高度 */
    }

    .video-container {
      position: relative;
      width: 100%;
      height: 500px;
      overflow: hidden;
      background: #000;
      cursor: move;
    }

    .video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transform-origin: center center;
      transition: none;
    }

    /* 放大镜 */
    #magnifier {
      position: absolute;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 12px rgba(0,0,0,0.6);
      pointer-events: none;
      display: none;
      z-index: 1000;
      overflow: hidden;
    }

    #selection {
      position: absolute;
      border: 2px dashed red;
      background: rgba(255, 0, 0, 0.1);
      display: none;
      z-index: 90;
      cursor: move;
    }


    /* ✅ 全屏样式（关键修复） */
    .player-fullscreen-target.fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2000;
      background: #000;
    }

    .player-fullscreen-target.fullscreen .video-container {
      height: calc(100vh - var(--controls-height)) !important;
    }

    .player-fullscreen-target.fullscreen #video {
      width: 100%;
      height: 100%;
      object-fit: cover; /* 填满无黑边（可改为 contain 保留比例） */
    }

    /* 顶部加载区 */
    .top-controls {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      align-items: center;
    }

    button {
      padding: 6px 12px;
      cursor: pointer;
    }

    input[type="text"] {
      flex: 1;
      padding: 6px;
    }

    .preview-container {
      margin-top: 15px;
      display: none;
    }

    #cropPreview {
      width: 300px;
      height: 180px;
      background: #000;
      border: 1px solid #999;
    }

    .hint {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
  </style>