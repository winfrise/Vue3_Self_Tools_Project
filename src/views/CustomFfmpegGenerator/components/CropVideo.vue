<!-- src/components/CropVideo.vue -->
<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">🎞️ 视频裁剪（按时间段）</div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="small"
      @submit.prevent
    >
      <el-form-item label="输入文件" prop="input">
        <el-input v-model="form.input" placeholder="input.mp4" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-time-picker
          v-model="form.startTime"
          format="HH:mm:ss"
          value-format="HH:mm:ss"
          placeholder="00:00:00"
        />
      </el-form-item>
      <el-form-item label="持续时间(秒)" prop="duration">
        <el-input-number
          v-model="form.duration"
          :min="1"
          :step="5"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="输出文件" prop="output">
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
  input: string
  startTime: string | undefined
  duration: number
  output: string
}

const form = reactive<FormModel>({
  input: 'input.mp4',
  startTime: '00:01:30',
  duration: 10,
  output: ''
})

const validateStartTime = (rule: any, value: string | null, callback: any) => {
  if (!value) {
    callback(new Error('请选择开始时间'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules<FormModel>>({
  input: [{ required: true, message: '请输入输入文件', trigger: 'blur' }],
  startTime: [{ validator: validateStartTime, trigger: 'change' }],
  duration: [{ required: true, message: '请输入持续时间', trigger: 'blur' }],
  output: [{ required: true, message: '请输入输出文件', trigger: 'blur' }]
})

const formRef = ref<FormInstance>()

const command = computed(() => {
  return `ffmpeg -ss ${form.startTime} -i "${form.input}" -t ${form.duration} -c copy "${form.output}"`
})

const generateOutputName = () => {
  const ext = form.input.includes('.') ? form.input.split('.').pop() || 'mp4' : 'mp4'
  form.output = generateTimestampFilename(ext)
}

const handleCopy = async () => {
  await formRef.value?.validate(async (valid) => {
    if (valid && form.startTime) {
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