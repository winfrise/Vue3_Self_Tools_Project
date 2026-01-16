<template>
  <div class="player-wrapper">
    <h2>高级视频播放器 - 全屏优化版</h2>

    <!-- 全屏目标容器 -->
    <div class="player-fullscreen-target" id="fullscreenTarget">
      <div class="video-container" id="container">
        <video id="video" ref="videoRef"></video>
        <div id="selection"></div>
      </div>

      <!-- 自定义控制条 -->
      <div class="custom-controls">
        <div class="progress-row" id="progressContainer">
          <div class="progress-bar" id="progressBar"></div>
        </div>
        <div class="controls-row">
          <div class="playback-controls">
            <button class="control-btn" id="toStart">««</button>
            <button class="control-btn" id="rewind">«</button>
            <button class="control-btn" id="playPause">▶</button>
            <button class="control-btn" id="forward">»</button>
            <button class="control-btn" id="toEnd">»»</button>
          </div>
          <div class="status-group">
            <span class="time-display" id="timeDisplay">00:00 / 00:00</span>
            <div class="volume-control">
              <span>🔈</span>
              <div class="volume-slider" id="volumeSlider">
                <div class="volume-level" id="volumeLevel"></div>
              </div>
            </div>
            <select class="speed-select" id="speedSelect">
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1" selected>1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
            <button class="control-btn" id="fullscreenBtn">全屏</button>
          </div>
        </div>
      </div>
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
    
  const videoRef = ref(null)
  const networkVideoUrl = ref('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8') // 网络视频地址

  const handleLoadVideo = () => {
    // resetView() // 重置
    loadVideo({videoEl: unref(videoRef), videoUrl: unref(networkVideoUrl)})
  }

  onMounted(() => {
        // ========== DOM ==========
    const video = document.getElementById('video');
    const container = document.getElementById('container');
    const fullscreenTarget = document.getElementById('fullscreenTarget');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetBtn = document.getElementById('resetView');
    const zoomLevelEl = document.getElementById('zoomLevel');
    const magnifier = document.getElementById('magnifier');
    const magnifierCanvas = magnifier.querySelector('canvas');
    const selection = document.getElementById('selection');
    const cropPreview = document.getElementById('cropPreview');
    const previewContainer = document.getElementById('previewContainer');

    // 控制条
    const playPauseBtn = document.getElementById('playPause');
    const toStartBtn = document.getElementById('toStart');
    const rewindBtn = document.getElementById('rewind');
    const forwardBtn = document.getElementById('forward');
    const toEndBtn = document.getElementById('toEnd');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeLevel = document.getElementById('volumeLevel');
    const speedSelect = document.getElementById('speedSelect');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    // ========== 状态 ==========
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    const minScale = 0.1;
    const maxScale = 10;

    let isPanning = false;
    let isSelecting = false;
    let isMovingSelection = false;
    let startPanX = 0, startPanY = 0;
    let selectStart = { x: 0, y: 0 };
    let cropRect = null;

    const magSize = 150;
    const halfMag = magSize / 2;
    const magCtx = magnifierCanvas.getContext('2d');
    magnifierCanvas.width = magSize;
    magnifierCanvas.height = magSize;

    let needsPreviewUpdate = false;

    // ========== 工具函数 ==========
    function formatTime(seconds) {
      if (isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTransform() {
      video.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
      zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
      if (cropRect) needsPreviewUpdate = true;
    }

    function resetView() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
      hideSelection();
    }

    // ========== 缩放 ==========
    zoomInBtn.addEventListener('click', () => {
      scale = Math.min(maxScale, scale + 0.2);
      updateTransform();
    });

    zoomOutBtn.addEventListener('click', () => {
      scale = Math.max(minScale, scale - 0.2);
      updateTransform();
    });

    resetBtn.addEventListener('click', resetView);

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.min(maxScale, Math.max(minScale, scale + delta));
      updateTransform();
    }, { passive: false });

    // ========== 裁剪 ==========
    function hideSelection() {
      selection.style.display = 'none';
      previewContainer.style.display = 'none';
      cropRect = null;
    }

    function updateCropFromSelection() {
      const rect = container.getBoundingClientRect();
      const selLeft = parseFloat(selection.style.left);
      const selTop = parseFloat(selection.style.top);
      const selWidth = parseFloat(selection.style.width);
      const selHeight = parseFloat(selection.style.height);

      if (selWidth <= 0 || selHeight <= 0) return;

      const videoRatio = video.videoWidth / video.videoHeight;
      const containerRatio = rect.width / rect.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (containerRatio > videoRatio) {
        drawHeight = rect.height;
        drawWidth = video.videoWidth * (drawHeight / video.videoHeight);
        offsetX = (rect.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = rect.width;
        drawHeight = video.videoHeight * (drawWidth / video.videoWidth);
        offsetX = 0;
        offsetY = (rect.height - drawHeight) / 2;
      }

      const cropX = ((selLeft - offsetX) / drawWidth) * video.videoWidth;
      const cropY = ((selTop - offsetY) / drawHeight) * video.videoHeight;
      const cropW = (selWidth / drawWidth) * video.videoWidth;
      const cropH = (selHeight / drawHeight) * video.videoHeight;

      cropRect = { x: cropX, y: cropY, width: cropW, height: cropH };
      needsPreviewUpdate = true;
    }

    function updateCropPreview() {
      if (!cropRect) return;
      const { x, y, width, height } = cropRect;
      const aspect = width / height;
      let pw = 300, ph = 180;
      if (aspect > pw / ph) ph = pw / aspect;
      else pw = ph * aspect;
      cropPreview.width = pw;
      cropPreview.height = ph;
      const ctx = cropPreview.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, pw, ph);
      ctx.drawImage(video, x, y, width, height, 0, 0, pw, ph);
      needsPreviewUpdate = false;
    }

    // ========== 控制条逻辑 ==========
    video.addEventListener('loadedmetadata', () => {
      timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
    });

    video.addEventListener('timeupdate', () => {
      const percent = (video.currentTime / (video.duration || 1)) * 100;
      progressBar.style.width = `${percent}%`;
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    });

    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playPauseBtn.textContent = '⏸';
      } else {
        video.pause();
        playPauseBtn.textContent = '▶';
      }
    });

    video.addEventListener('play', () => playPauseBtn.textContent = '⏸');
    video.addEventListener('pause', () => playPauseBtn.textContent = '▶');

    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      video.currentTime = ratio * (video.duration || 0);
    });

    rewindBtn.addEventListener('click', () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
    });

    forwardBtn.addEventListener('click', () => {
      video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
    });

    toStartBtn.addEventListener('click', () => {
      video.currentTime = 0;
    });

    toEndBtn.addEventListener('click', () => {
      if (video.duration) video.currentTime = video.duration;
    });

    // 音量
    video.volume = 0.8;
    volumeLevel.style.width = '80%';

    volumeSlider.addEventListener('click', (e) => {
      const rect = volumeSlider.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      let vol = Math.max(0, Math.min(1, clickX / rect.width));
      video.volume = vol;
      volumeLevel.style.width = `${vol * 100}%`;
    });

    // 播放速度
    speedSelect.addEventListener('change', () => {
      video.playbackRate = parseFloat(speedSelect.value);
    });

    // ✅ 全屏逻辑（关键修复）
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        if (fullscreenTarget.requestFullscreen) {
          fullscreenTarget.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // 监听全屏状态变化（可靠方式）
    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement === fullscreenTarget) {
        fullscreenBtn.textContent = '退出全屏';
        fullscreenTarget.classList.add('fullscreen');
      } else {
        fullscreenBtn.textContent = '全屏';
        fullscreenTarget.classList.remove('fullscreen');
      }
    });

    // ========== 鼠标交互 ==========
    container.addEventListener('mousedown', (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (selection.style.display !== 'none') {
        const selRect = selection.getBoundingClientRect();
        if (e.clientX >= selRect.left && e.clientX <= selRect.right &&
            e.clientY >= selRect.top && e.clientY <= selRect.bottom) {
          isMovingSelection = true;
          startPanX = e.clientX - parseFloat(selection.style.left);
          startPanY = e.clientY - parseFloat(selection.style.top);
          e.preventDefault();
          return;
        }
      }

      if (e.shiftKey) {
        selectStart.x = mouseX;
        selectStart.y = mouseY;
        isSelecting = true;
        selection.style.display = 'block';
        selection.style.left = mouseX + 'px';
        selection.style.top = mouseY + 'px';
        selection.style.width = '0px';
        selection.style.height = '0px';
        e.preventDefault();
        return;
      }

      isPanning = true;
      startPanX = e.clientX - translateX;
      startPanY = e.clientY - translateY;
      container.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();

      if (isMovingSelection) {
        selection.style.left = (e.clientX - startPanX) + 'px';
        selection.style.top = (e.clientY - startPanY) + 'px';
        updateCropFromSelection();
        return;
      }

      if (isSelecting) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const left = Math.min(selectStart.x, mouseX);
        const top = Math.min(selectStart.y, mouseY);
        const width = Math.abs(mouseX - selectStart.x);
        const height = Math.abs(mouseY - selectStart.y);
        selection.style.left = left + 'px';
        selection.style.top = top + 'px';
        selection.style.width = width + 'px';
        selection.style.height = height + 'px';
        return;
      }

      if (isPanning) {
        translateX = e.clientX - startPanX;
        translateY = e.clientY - startPanY;
        updateTransform();
        return;
      }

      // 放大镜
      if (video.videoWidth) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const videoRatio = video.videoWidth / video.videoHeight;
        const containerRatio = rect.width / rect.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (containerRatio > videoRatio) {
          drawHeight = rect.height;
          drawWidth = video.videoWidth * (drawHeight / video.videoHeight);
          offsetX = (rect.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = rect.width;
          drawHeight = video.videoHeight * (drawWidth / video.videoWidth);
          offsetX = 0;
          offsetY = (rect.height - drawHeight) / 2;
        }

        const videoX = ((mouseX - offsetX) / drawWidth) * video.videoWidth;
        const videoY = ((mouseY - offsetY) / drawHeight) * video.videoHeight;

        magCtx.clearRect(0, 0, magSize, magSize);
        magCtx.save();
        magCtx.beginPath();
        magCtx.arc(halfMag, halfMag, halfMag, 0, Math.PI * 2);
        magCtx.clip();
        magCtx.drawImage(video, 
          videoX - halfMag, 
          videoY - halfMag, 
          magSize, 
          magSize, 
          0, 0, magSize, magSize
        );
        magCtx.restore();

        let posX = e.clientX + 1;
        let posY = e.clientY + 1;

        if (posX + magSize > window.innerWidth) {
          posX = e.clientX - magSize - 1;
        }
        if (posY + magSize > window.innerHeight) {
          posY = e.clientY - magSize - 1;
        }
        if (posX < 0) posX = 1;
        if (posY < 0) posY = 1;

        magnifier.style.left = posX + 'px';
        magnifier.style.top = posY + 'px';
        magnifier.style.display = 'block';
      }
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        container.style.cursor = 'move';
      }
      if (isSelecting) {
        isSelecting = false;
        const w = parseFloat(selection.style.width);
        const h = parseFloat(selection.style.height);
        if (w < 10 || h < 10) {
          hideSelection();
        } else {
          updateCropFromSelection();
          previewContainer.style.display = 'block';
        }
      }
      isMovingSelection = false;
    });

    container.addEventListener('mouseleave', () => {
      magnifier.style.display = 'none';
    });

    // ========== 渲染循环 ==========
    function renderLoop() {
      if (needsPreviewUpdate) {
        updateCropPreview();
      }
      requestAnimationFrame(renderLoop);
    }
    renderLoop();

  })
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

    #video {
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

    /* 自定义控制条 */
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

    /* 第1行：进度条 */
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

    /* 第2行：按钮 + 状态 */
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
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid #666;
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 12px;
      cursor: pointer;
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