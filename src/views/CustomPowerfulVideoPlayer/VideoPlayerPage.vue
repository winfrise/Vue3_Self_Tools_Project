<template>
  <div class="player-wrapper">
    <h2>视频播放器 - 可拖拽蒙版（无放大）</h2>

    <div class="top-controls">
      <input type="file" id="localVideoInput" accept="video/*" style="display:none;" />
      <button id="loadLocalVideoBtn">📁 加载本地视频</button>

      <input type="text" id="urlInput" placeholder="输入网络视频地址（.m3u8 或 .mp4）"
             value="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
      <button id="loadUrlBtn">🔗 加载网络视频</button>

      <button id="resetView">重置视图</button>

      <button id="toggleMaskMode">开启绘制蒙版</button>
      <select id="maskShapeSelect">
        <option value="rect">长方形</option>
        <option value="square">正方形</option>
        <option value="circle">圆形</option>
      </select>
      <label>蒙版颜色: <input type="color" id="maskColor" value="#000000" /></label>
      <label>透明度: <input type="range" id="maskOpacity" min="0" max="1" step="0.05" value="0.7" /></label>
      <button id="clearMask">清除蒙版</button>
    </div>

    <div class="player-fullscreen-target" id="fullscreenTarget">
      <div class="video-container" id="container">
        <video id="video" muted></video>
        <canvas id="maskCanvas"></canvas>
      </div>

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

    <p class="hint">
      操作说明：<br>
      • 开启绘制 → 拖拽创建蒙版区域<br>
      • 创建后可拖拽整个蒙版移动位置<br>
      • 蒙版区域显示原始比例的视频内容（无放大）<br>
      • 全局缩放（无蒙版时）以鼠标位置为中心
    </p>
  </div>
</template>

  <script setup>
import { onMounted } from 'vue';
import Hls from 'hls.js'

    // ========== DOM ==========
   onMounted(() => {
     const video = document.getElementById('video');
    const container = document.getElementById('container');
    const maskCanvas = document.getElementById('maskCanvas');
    const maskCtx = maskCanvas.getContext('2d');

    const localVideoInput = document.getElementById('localVideoInput');
    const loadLocalVideoBtn = document.getElementById('loadLocalVideoBtn');
    const urlInput = document.getElementById('urlInput');
    const loadUrlBtn = document.getElementById('loadUrlBtn');
    const resetBtn = document.getElementById('resetView');
    const playPauseBtn = document.getElementById('playPause');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const timeDisplay = document.getElementById('timeDisplay');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeLevel = document.getElementById('volumeLevel');
    const speedSelect = document.getElementById('speedSelect');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const toggleMaskModeBtn = document.getElementById('toggleMaskMode');
    const maskShapeSelect = document.getElementById('maskShapeSelect');
    const maskColorInput = document.getElementById('maskColor');
    const maskOpacityInput = document.getElementById('maskOpacity');
    const clearMaskBtn = document.getElementById('clearMask');

    // ========== 状态 ==========
    let scale = 1;
    let translateX = 0, translateY = 0;
    const minScale = 0.1, maxScale = 10;

    let isMaskMode = false;
    let mask = null; // { type, x/y/w/h 或 cx/cy/radius }
    let isDrawing = false;
    let drawStart = { x: 0, y: 0 };
    let isDraggingMask = false;
    let dragOffset = { x: 0, y: 0 };

    // ========== 工具函数 ==========
    function formatTime(seconds) {
      if (isNaN(seconds)) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function getVideoRect() {
      const rect = container.getBoundingClientRect();
      const videoW = video.videoWidth * scale;
      const videoH = video.videoHeight * scale;
      const left = (rect.width - videoW) / 2 + translateX;
      const top = (rect.height - videoH) / 2 + translateY;
      return { left, top, width: videoW, height: videoH };
    }

    function updateTransform() {
      video.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function resetView() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
    }

    function loadVideo(src) {
      resetView();
      if (Hls.isSupported() && typeof src === 'string' && src.endsWith('.m3u8')) {
        if (video.hls) video.hls.destroy();
        const hls = new Hls();
        video.hls = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      video.load();
    }

    // ========== 渲染蒙版（无放大）==========
    function renderMask() {
      const rect = container.getBoundingClientRect();
      maskCanvas.width = rect.width;
      maskCanvas.height = rect.height;

      const ctx = maskCtx;
      ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      if (!mask) return;

      // 背景遮罩
      const colorHex = maskColorInput.value;
      const opacity = parseFloat(maskOpacityInput.value);
      const r = parseInt(colorHex.slice(1, 3), 16);
      const g = parseInt(colorHex.slice(3, 5), 16);
      const b = parseInt(colorHex.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      ctx.save();

      // 剪裁蒙版区域
      if (mask.type === 'circle') {
        ctx.beginPath();
        ctx.arc(mask.cx, mask.cy, mask.radius, 0, Math.PI * 2);
        ctx.clip();
        // 绘制圆形区域（使用外接正方形）
        const x = mask.cx - mask.radius;
        const y = mask.cy - mask.radius;
        const size = mask.radius * 2;
        drawVideoRegion(ctx, x, y, size);
      } else {
        ctx.rect(mask.x, mask.y, mask.width, mask.height);
        ctx.clip();
        drawVideoRegion(ctx, mask.x, mask.y, mask.width, mask.height);
      }

      ctx.restore();
    }

    // 在指定区域绘制 1:1 视频内容（无缩放）
    function drawVideoRegion(ctx, dstX, dstY, dstW, dstH = dstW) {
      const videoRect = getVideoRect();
      const srcX = (dstX - videoRect.left) / scale;
      const srcY = (dstY - videoRect.top) / scale;
      const srcW = dstW / scale;
      const srcH = dstH / scale;
      ctx.drawImage(video, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
    }

    function clearMask() {
      mask = null;
      renderMask();
    }

    // ========== 判断点是否在蒙版内 ==========
    function isPointInMask(x, y) {
      if (!mask) return false;
      if (mask.type === 'circle') {
        const dx = x - mask.cx;
        const dy = y - mask.cy;
        return dx * dx + dy * dy <= mask.radius * mask.radius;
      } else {
        return x >= mask.x && x <= mask.x + mask.width &&
               y >= mask.y && y <= mask.y + mask.height;
      }
    }

    // ========== 事件绑定 ==========
    loadLocalVideoBtn.addEventListener('click', () => {
      localVideoInput.click();
    });

    localVideoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        loadVideo(url);
      }
    });

    loadUrlBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) loadVideo(url);
    });

    resetBtn.addEventListener('click', resetView);

    // ========== 全局缩放（以鼠标为中心）==========
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // ✂️ 不再处理蒙版区域的滚轮（无 zoom 功能）

      // 全局缩放
      const oldScale = scale;
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.min(maxScale, Math.max(minScale, scale + delta));

      const factor = scale / oldScale;
      translateX = mouseX - (mouseX - translateX) * factor;
      translateY = mouseY - (mouseY - translateY) * factor;

      updateTransform();
    }, { passive: false });

    // ========== 绘制 & 拖拽蒙版 ==========
    container.addEventListener('mousedown', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isMaskMode && !mask) {
        isDrawing = true;
        drawStart = { x, y };
      } else if (mask && isPointInMask(x, y)) {
        isDraggingMask = true;
        if (mask.type === 'circle') {
          dragOffset.x = x - mask.cx;
          dragOffset.y = y - mask.cy;
        } else {
          dragOffset.x = x - mask.x;
          dragOffset.y = y - mask.y;
        }
      }
    });

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isDrawing && isMaskMode) {
        const shape = maskShapeSelect.value;
        if (shape === 'circle') {
          const dx = x - drawStart.x;
          const dy = y - drawStart.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          mask = {
            type: 'circle',
            cx: drawStart.x,
            cy: drawStart.y,
            radius: radius
          };
        } else {
          let w = Math.abs(x - drawStart.x);
          let h = Math.abs(y - drawStart.y);
          if (shape === 'square') {
            const size = Math.max(w, h);
            w = h = size;
          }
          const x0 = x < drawStart.x ? x : drawStart.x;
          const y0 = y < drawStart.y ? y : drawStart.y;
          mask = {
            type: 'rect',
            x: x0,
            y: y0,
            width: w,
            height: h
          };
        }
        renderMask();
      } else if (isDraggingMask && mask) {
        if (mask.type === 'circle') {
          mask.cx = x - dragOffset.x;
          mask.cy = y - dragOffset.y;
        } else {
          mask.x = x - dragOffset.x;
          mask.y = y - dragOffset.y;
        }
        renderMask();
      }
    });

    window.addEventListener('mouseup', () => {
      isDrawing = false;
      isDraggingMask = false;
    });

    // ========== 控制按钮 ==========
    toggleMaskModeBtn.addEventListener('click', () => {
      isMaskMode = !isMaskMode;
      toggleMaskModeBtn.textContent = isMaskMode ? '退出绘制' : '开启绘制蒙版';
      if (!isMaskMode) isDrawing = false;
    });

    clearMaskBtn.addEventListener('click', clearMask);
    [maskColorInput, maskOpacityInput].forEach(el => {
      el.addEventListener('input', renderMask);
    });

    // ========== 视频控制 ==========
    video.addEventListener('loadedmetadata', () => {
      timeDisplay.textContent = `00:00 / ${formatTime(video.duration)}`;
    });
    video.addEventListener('timeupdate', () => {
      const percent = (video.currentTime / (video.duration || 1)) * 100;
      progressBar.style.width = `${percent}%`;
      timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      if (mask) renderMask(); // 实时更新蒙版内容
    });
    playPauseBtn.addEventListener('click', () => {
      if (video.paused) { video.play(); playPauseBtn.textContent = '⏸'; }
      else { video.pause(); playPauseBtn.textContent = '▶'; }
    });
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      video.currentTime = ratio * (video.duration || 0);
    });
    volumeSlider.addEventListener('click', (e) => {
      const rect = volumeSlider.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      let vol = Math.max(0, Math.min(1, clickX / rect.width));
      video.volume = vol;
      volumeLevel.style.width = `${vol * 100}%`;
    });
    speedSelect.addEventListener('change', () => {
      video.playbackRate = parseFloat(speedSelect.value);
    });

    // ========== 全屏 ==========
    const fullscreenTarget = document.getElementById('fullscreenTarget');
    function toggleFullscreen() {
      if (!document.fullscreenElement) fullscreenTarget.requestFullscreen();
      else document.exitFullscreen();
    }
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', () => {
      fullscreenBtn.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
      setTimeout(renderMask, 100);
    });

    // ========== 初始化 ==========
    window.addEventListener('load', () => loadVideo(urlInput.value.trim()));
    window.addEventListener('resize', renderMask);
   })
  </script>



  <style scoped>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0; padding: 0; background: #f5f5f5;
    }
    .player-wrapper {
      max-width: 960px;
      margin: 0 auto;
      padding: 20px;
    }
    .top-controls {
      position: sticky;
      top: 0;
      background: #f5f5f5;
      padding: 12px 0;
      margin-bottom: 16px;
      z-index: 1000;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      border-bottom: 1px solid #ddd;
    }
    .player-fullscreen-target {
      position: relative;
      border: 1px solid #ccc;
      background: #000;
      width: 100%;
      height: 500px;
      --controls-height: 70px;
    }
    .video-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    #video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transform-origin: 0 0;
      display: block;
    }
    #maskCanvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    .custom-controls {
      position: relative;
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 8px 12px;
    }
    .progress-row {
      width: 100%;
      height: 6px;
      background: #444;
      border-radius: 3px;
      cursor: pointer;
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
      background: rgba(255,255,255,0.1);
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
    select, input[type="color"] {
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid #666;
      border-radius: 3px;
      padding: 2px 6px;
      font-size: 12px;
      cursor: pointer;
    }
    input[type="color"] {
      padding: 2px;
      width: 40px;
      height: 24px;
    }
    button {
      padding: 6px 12px;
      cursor: pointer;
    }
    input[type="text"] {
      flex: 1;
      min-width: 200px;
      padding: 6px;
    }
    .hint {
      font-size: 12px;
      color: #666;
      margin-top: 10px;
    }
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
  </style>