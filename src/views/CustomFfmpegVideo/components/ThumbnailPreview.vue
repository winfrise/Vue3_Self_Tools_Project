<!-- src/components/ThumbnailPreview.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue';
import { VideoInfo } from '../types/video';

interface Props {
  videoInfo: VideoInfo | null;
  currentTime: number;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const imgRef = ref<HTMLImageElement | null>(null);

watch(
  () => props.currentTime,
  async () => {
    if (!props.videoInfo || !canvasRef.value || !imgRef.value) return;

    const video = document.createElement('video');
    video.src = props.videoInfo.url;
    await video.load();

    if (props.currentTime > 0) {
      video.currentTime = props.currentTime;
      await new Promise(r => video.onseeked = r);
    }

    const ctx = canvasRef.value.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvasRef.value.width, canvasRef.value.height);
    imgRef.value.src = canvasRef.value.toDataURL('image/jpeg');
  },
  { immediate: true }
);
</script>

<template>
  <div class="thumbnail-preview">
    <canvas ref="canvasRef" width="160" height="90" style="display: none;"></canvas>
    <img ref="imgRef" alt="Thumbnail" style="width: 160px; height: 90px; object-fit: cover;" />
  </div>
</template>

<style scoped>
.thumbnail-preview {
  margin: 10px;
}
</style>