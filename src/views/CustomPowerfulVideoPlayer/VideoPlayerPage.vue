<template>
  <div class="player-wrapper">
    <!-- 顶部控制 -->
    <div class="top-controls">
      <ChooseVideo @change="handleLoadVideo" />
      <button id="zoomIn">+</button>
      <button id="zoomOut">−</button>
      <span id="zoomLevel">100%</span>
      <button id="resetView">重置视图</button>
    </div>

    <div>
      显示遮罩：<el-switch size="samll" v-model="canvasMaskVisible"></el-switch>

      显示放大镜：<el-switch size="samll" v-model="magnifierVisible"></el-switch>
    </div>
    <p class="hint">
      操作提示：<br>
      • 滚轮：缩放｜直接拖动：平移｜Shift+拖动：裁剪<br>
      • 鼠标悬停视频：显示放大镜
    </p>

    <ZoomContainer>
      <template #default="{mouseEvent, isMouseOver}">
        <video class="video"  ref="videoRef" ></video>

        <VideoMagnifier v-if="magnifierVisible"
          :visible="isMouseOver"
          :x="mouseEvent.clientX"
          :y="mouseEvent.clientY"
          :video="videoRef"
        />
        
      </template>
      <template v-if="canvasMaskVisible" #extra>
          <VideoMask />
      </template>
    </ZoomContainer>
      <!-- 自定义控制条 -->
      <VideoControls :video="videoRef" />


  </div>

</template>

  <script setup>
  import { onMounted, ref, unref } from 'vue';
  import Hls from 'hls.js';
  import { loadVideo } from './utils/loadVideo';
  import VideoControls from './components/VideoControls.vue';
  import ZoomContainer from './components/ZoomContainer.vue';
  import VideoMagnifier from './components/VideoMagnifier.vue';
  import VideoMask from './components/VideoMask.vue';
  import ChooseVideo from './components/ChooseVideo.vue'
    
  const videoRef = ref(null)
  const onlineVideoUrl = ref('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8') // 网络视频地址

    const canvasMaskVisible = ref(false)
    const magnifierVisible = ref(false)

  const handleLoadVideo = (videoUrl) => {
    // resetView() // 重置
    loadVideo({videoEl: unref(videoRef), videoUrl: videoUrl})
  }

  onMounted(() => {
    if (unref(onlineVideoUrl)) {
      handleLoadVideo(unref(onlineVideoUrl))
    }
  })
  </script>

  <style scoped>
    .player-wrapper {
      max-width: 960px;
      margin: 0 auto;
      .video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform-origin: center center;
        transition: none;
      }
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

    .hint {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
  </style>