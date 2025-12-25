<template>
      <el-card>
        <el-upload
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">拖拽视频到此处，或<em>点击上传</em></div>
        </el-upload>
      </el-card>

</template>

<script setup lang="ts">
import { useVideoEditorStore } from '@/store/ffmpeg/videoEditor';
import { useVideoStore } from '@/store/ffmpeg/VideoStore';
const store = useVideoEditorStore();
const videoStore = useVideoStore()

// 上传处理
const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/');
  if (!isVideo) ElMessage.error('请上传视频文件！');
  return isVideo;
};

const handleFileChange = (uploadFile: any) => {
  const file = uploadFile.raw;
  if (!file) return;
  videoStore.initVideoInfo(file);
};
</script>