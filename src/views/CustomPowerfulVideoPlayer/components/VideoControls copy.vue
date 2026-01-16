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
    const props = defineProps({
        isPlaying: {
            type: Boolean,
        }
    })

    const emit = defineEmits([
        'update:isPlaying',
        'play',
        'pause'
    ])

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
    
    // 切换播放暂停
    const togglePlayPause = () => {
      if (props.isPlaying) {
        emit('update:isPlaying', false)
        emit('pause')
      } else {
        emit('update:isPlaying', true)
        emit('play')
      }
    }
</script>

<style scoped>
    
</style>