<!-- src/views/FfmpegCommandGenerator.vue -->
<template>
  <div class="ffmpeg-generator">
    <el-page-header content="FFmpeg 命令生成器" />

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <DownloadByUrl />
      </el-col>
      <el-col :span="12">
        <SegmentVideo />
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <CropVideo />
      </el-col>
      <el-col :span="12">
        <AddWatermark />
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <CropVideoFrame />
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>
  </div>

  <VideoPlayer src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
</template>

<script setup lang="ts">
import DownloadByUrl from './components/DownloadByUrl.vue'
import SegmentVideo from './components/SegmentVideo.vue'
import CropVideo from './components/CropVideo.vue'
import AddWatermark from './components/AddWatermark.vue'
import CropVideoFrame from './components/CropVideoFrame.vue'

import {VideoPlayer} from './components/VideoPlayer'

</script>

<style scoped>
.ffmpeg-generator {
  padding: 20px;
}
</style>