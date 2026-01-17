<!-- src/components/AddWatermark.vue -->
<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">💧 添加水印</div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="small"
      @submit.prevent
    >
      <el-form-item label="视频文件" prop="video">
        <el-input v-model="form.video" placeholder="video.mp4" />
      </el-form-item>
      <el-form-item label="水印图片" prop="watermark">
        <el-input v-model="form.watermark" placeholder="watermark.png" />
      </el-form-item>
      <el-form-item label="位置" prop="position">
        <el-select v-model="form.position" placeholder="选择位置" style="width: 100%">
          <el-option label="右下角" value="main_w-overlay_w-10:main_h-overlay_h-10" />
          <el-option label="左上角" value="10:10" />
          <el-option label="居中" value="(main_w-overlay_w)/2:(main_h-overlay_h)/2" />
        </el-select>
      </el-form-item>
      <el-form-item label="输出文件" prop="output">
        <el-input v-model="form.output" placeholder="2026年01月17日17时30分[1729183845123].mp4">
          <template #append>
            <el-button @click="generateOutputName" size="small">✨ 时间戳名</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <div class="command-preview">
      <el-alert type="info" show-icon :closable="false" :title="command" />
      <el-button size="small" type="primary" style="margin-top: 8px" @click="handleCopy">
        📋 复制命令
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { copyToClipboard } from '../utils/copyToClipboard'
import { generateTimestampFilename } from '../utils/generateTimestampFilename'

interface FormModel {
  video: string
  watermark: string
  position: string
  output: string
}

const form = reactive<FormModel>({
  video: 'video.mp4',
  watermark: 'logo.png',
  position: 'main_w-overlay_w-10:main_h-overlay_h-10',
  output: ''
})

const rules = reactive<FormRules<FormModel>>({
  video: [{ required: true, message: '请输入视频文件', trigger: 'blur' }],
  watermark: [{ required: true, message: '请输入水印图片路径', trigger: 'blur' }],
  position: [{ required: true, message: '请选择水印位置', trigger: 'change' }],
  output: [{ required: true, message: '请输入输出文件', trigger: 'blur' }]
})

const formRef = ref<FormInstance>()

const command = computed(() => {
  return `ffmpeg -i "${form.video}" -i "${form.watermark}" -filter_complex "overlay=${form.position}" -codec:a copy "${form.output}"`
})

const generateOutputName = () => {
  const ext = form.video.includes('.') ? form.video.split('.').pop() || 'mp4' : 'mp4'
  form.output = generateTimestampFilename(ext)
}

const handleCopy = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid) {
      const success = await copyToClipboard(command.value)
      if (success) {
        ElMessage.success('命令已复制到剪贴板')
      } else {
        ElMessage.error('复制失败，请手动复制')
      }
    }
  })
}
</script>

<style scoped>
.card-header {
  font-weight: bold;
}
.command-preview {
  margin-top: 16px;
}
</style>