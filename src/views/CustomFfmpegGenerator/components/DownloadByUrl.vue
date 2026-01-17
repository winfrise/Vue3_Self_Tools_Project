<!-- src/components/DownloadByUrl.vue -->
<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">📥 通过 URL 下载视频</div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="small"
      @submit.prevent
    >
      <el-form-item label="视频URL" prop="url">
        <el-input v-model="form.url" placeholder="https://example.com/video.mp4" />
      </el-form-item>
      <el-form-item label="保存路径" prop="output">
        <el-input v-model="form.output" placeholder="2026年01月17日17时30分123.mp4">
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
  url: string
  output: string
}

const form = reactive<FormModel>({
  url: 'https://example.com/sample.mp4',
  output: ''
})

const validateUrl = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入视频URL'))
  } else if (!/^https?:\/\/\S+$/i.test(value)) {
    callback(new Error('请输入有效的URL'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<FormModel>>({
  url: [{ validator: validateUrl, trigger: 'blur' }],
  output: [{ required: true, message: '请输入输出文件名', trigger: 'blur' }]
})

const formRef = ref<FormInstance>()

const command = computed(() => {
  return `ffmpeg -i "${form.url}" -c copy "${form.output}"`
})

const generateOutputName = () => {
  // 尝试从 URL 提取扩展名，失败则默认 mp4
  let ext = 'mp4'
  try {
    const url = new URL(form.url)
    const path = url.pathname
    const lastDot = path.lastIndexOf('.')
    if (lastDot > -1) {
      const possibleExt = path.slice(lastDot + 1)
      if (possibleExt.length <= 5 && /^[a-zA-Z0-9]+$/.test(possibleExt)) {
        ext = possibleExt
      }
    }
  } catch (e) {
    // ignore
  }
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