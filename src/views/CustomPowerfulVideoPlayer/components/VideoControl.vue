<template>
      <div class="custom-controls">
        <div class="progress-row" id="progressContainer">
          <div class="progress-bar" id="progressBar"></div>
        </div>
        <div class="controls-row">
          <div class="playback-controls">
            <button class="control-btn" id="toStart">««</button>
            <button class="control-btn" id="rewind">«</button>
            <button class="control-btn" id="playPause" @click="togglePlayPause">
                {{ props.isPlaying ? '⏸' : '▶' }}
            </button>
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

</template>

<script setup>
    import { onMounted } from 'vue';
    import { formatTime } from '../utils/formatTime';
    
    const props = defineProps({
        video: {
            
        }
    })




    onMounted(() => {
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

</style>