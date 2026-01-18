<template>
    <el-upload  accept="video/*" drag
        :auto-upload="true"
        :before-upload="beforeUpload"
    >

        <i class="el-icon-upload"></i>
        <div class="el-upload__text">拖拽视频到此处，或<em>点击上传</em></div>

            <div v-if="videoInfo" class="video-meta">
                文件名称: {{ videoInfo.filename }} |
                时长: {{ videoInfo.duration }}s |
                宽高: {{ videoInfo.videoWidth }}×{{ videoInfo.videoHeight }}
            </div>
    </el-upload>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VideoInfo, VideoMetadata } from '../types/custom'

interface Props {
    videoInfo: VideoInfo | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (e: 'update:videoInfo', data: VideoInfo) : void
}>()

const videoInfo = ref<VideoInfo | null>(null);

const beforeUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
        alert('请上传视频文件！');
        return;
    }

    // 释放旧 URL
    if (videoInfo.value?.url) {
        URL.revokeObjectURL(videoInfo.value.url);
    }

    const url = URL.createObjectURL(file);
    loadVideo(url)
        .then(e => {
            console.log(e)
            const {videoWidth, videoHeight, duration} = e
            videoInfo.value = {
                videoWidth,
                videoHeight,
                duration,
                url,
                filename: file.name,
                ext: file.name.split('.').pop()!
            }
            emit('update:videoInfo', videoInfo.value)
        })
        
    return false
}


// 加载视频，获取视频元数据
const loadVideo = (url: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'metadata'; // 建议加上，提示只加载元数据

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
    };

    const onloadedmetadata = () => {
      cleanup();
      
      // 检查 duration 是否有效
      if (isNaN(video.duration) || video.duration <= 0) {
        reject(new Error('Invalid video duration'));
        return;
      }

      resolve({
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
    };

    const onerror = () => {
      cleanup();
      reject(new Error('Failed to load video metadata'));
    };

    video.onloadedmetadata = onloadedmetadata;
    video.onerror = onerror;

    // 可选：防止长时间无响应
    setTimeout(() => {
      if (video.readyState < 1) {
        cleanup();
        reject(new Error('Video metadata load timeout'));
      }
    }, 10000);
  });
};
</script>

<style lang="scss" scoped>
.video-meta {
    font-size: 12px;
    color: #6b7280;
}

</style>