<!-- src/components/SegmentVideo.vue -->
<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">✂️ 视频分段</div>
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
      <el-form-item label="每段时长(秒)" prop="duration">
        <el-input-number
          v-model="form.duration"
          :min="1"
          :step="10"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="输出模板" prop="outputTemplate">
        <el-input v-model="form.outputTemplate" placeholder="segment_%03d.mp4" />
      </el-form-item>
    </el-form>

    <div class="command-preview">
      <el-alert
        type="info"
        show-icon
        :closable="false"
        :title="command"
      />
      <el-button
        size="small"
        type="primary"
        style="margin-top: 8px"
        @click="handleCopy"
      >
        📋 复制命令
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { copyToClipboard } from '../utils/copyToClipboard'

interface FormModel {
  input: string
  duration: number
  outputTemplate: string
}

const form = reactive<FormModel>({
  input: 'input.mp4',
  duration: 60,
  outputTemplate: 'segment_%03d.mp4'
})

const rules = reactive<FormRules<FormModel>>({
  input: [{ required: true, message: '请输入输入文件', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入分段时间', trigger: 'blur' }],
  outputTemplate: [{ required: true, message: '请输入输出模板', trigger: 'blur' }]
})

const formRef = ref<FormInstance>()

const command = computed(() => {
  return `ffmpeg -i "${form.input}" -c copy -f segment -segment_time ${form.duration} -reset_timestamps 1 "${form.outputTemplate}"`
})

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