<template>
      <el-radio-group v-model="videoMode" size="small" fill="#409eff">
        <el-radio-button label="本地视频" value="localVideo" />
        <el-radio-button label="网络视频" value="onlineVideo" />
      </el-radio-group>
      

      <el-upload size="small" 
        v-if="videoMode === 'localVideo'" 
        drag 
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        accept="video/*"
        action=""
      >
      <el-button>上传视频</el-button>
      </el-upload>

      <template v-else>
            <el-input size="small" 
              placeholder="输入视频地址（支持 .m3u8 或 .mp4）"
              v-model="onlineVideoUrl" 
            />
            <el-button @click="handleLoadOnlineVideo">加载网络视频</el-button>

      </template>

</template>

<script lang="ts" setup>
import { ref, unref } from 'vue';

const emit = defineEmits(['change'])
const videoMode = ref('localVideo')
const onlineVideoUrl = ref('')
const localVideoUrl = ref('')

const handleLoadOnlineVideo = () => {
  emit('change', onlineVideoUrl.value)
}


// 当用户选择文件时
const handleFileChange = (file) => {
  const rawFile = file.raw // 原生 File 对象

  // 可选：校验是否为视频（虽然 accept 已限制，但可二次确认）
  if (!rawFile.type.startsWith('video/')) {
    console.warn('非视频文件:', rawFile.type)
    return
  }

  // 释放之前的 URL（避免内存泄漏）
  if (unref(localVideoUrl)) {
    URL.revokeObjectURL(unref(localVideoUrl))
  }

  // 生成本地 blob URL
  localVideoUrl.value = URL.createObjectURL(rawFile)

  console.log('生成的视频 URL:', localVideoUrl.value)

  emit('change', localVideoUrl.value)
}
</script>

<style lang="scss" scoped>
::v-deep(.el-upload-dragger) {
  margin: 0;
  padding: 0;
}
</style>