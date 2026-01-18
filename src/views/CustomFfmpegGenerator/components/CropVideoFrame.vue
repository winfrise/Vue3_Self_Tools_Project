<!-- src/components/CropVideoFrame.vue -->
<template>
  <el-card shadow="hover">
    <template #header>
      <div style="font-weight: bold;">🖼️ 裁剪视频画面（区域裁剪）</div>
    </template>
    <div style="display: flex; ">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="small"
        @submit.prevent
      >
        <el-form-item label="输入视频" prop="input">
          <el-input v-model="form.input" placeholder="input.mp4" />
        </el-form-item>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="宽度 (w)" prop="w">
              <el-input-number
                v-model="form.w"
                :min="1"
                controls-position="right"
                style="width: 100%"
              >
      <template #suffix>
        <span class="computed-suffix"> → 111</span>
      </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="高度 (h)" prop="h">
              <el-input-number
                v-model="form.h"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="X 坐标" prop="x">
              <el-input-number
                v-model="form.x"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Y 坐标" prop="y">
              <el-input-number
                v-model="form.y"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="输出文件" prop="output">
          <el-input v-model="form.output" placeholder="2026年01月17日17时30分123.mp4">
            <template #append>
              <el-button @click="generateOutputName" size="small">✨ 时间戳名</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-row>
          <el-alert type="info" show-icon :closable="false" :title="command" />
          <el-button size="small" type="primary" style="margin-top: 8px" @click="handleCopy">
            📋 复制命令
          </el-button>
        </el-row>
      </el-form>
    </div>
    <VideoPlayer :src="form.input" >
      <VideoMask v-model:shape="shape"
      ></VideoMask>
    </VideoPlayer>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { copyToClipboard } from '../utils/copyToClipboard'
import { generateTimestampFilename } from '../utils/generateTimestampFilename'
import { VideoPlayer, VideoMask } from './VideoPlayer'

interface FormModel {
  input: string
  w: number
  h: number
  x: number
  y: number
  output: string
}

const form = reactive<FormModel>({
  input: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  w: 640,
  h: 480,
  x: 640,
  y: 360,
  output: ''
})

const shape = computed({
  get() {
    return {
      x: form.x,
      y: form.y, 
      width: form.w, 
      height: form.h
    }
  },
  set(val) {
    form.x = val.x
    form.y = val.y
    form.w = val.width
    form.h = val.height
  }
})

const rules = reactive<FormRules<FormModel>>({
  input: [{ required: true, message: '请输入输入视频', trigger: 'blur' }],
  w: [{ required: true, message: '请输入宽度', trigger: 'blur' }],
  h: [{ required: true, message: '请输入高度', trigger: 'blur' }],
  x: [{ required: true, message: '请输入X坐标', trigger: 'blur' }],
  y: [{ required: true, message: '请输入Y坐标', trigger: 'blur' }],
  output: [{ required: true, message: '请输入输出文件', trigger: 'blur' }]
})

const formRef = ref<FormInstance>()

const command = computed(() => {
  return `ffmpeg -i "${form.input}" -vf "crop=${form.w}:${form.h}:${form.x}:${form.y}" -c:a copy "${form.output}"`
})

const generateOutputName = () => {
  const ext = form.input.includes('.') ? form.input.split('.').pop() || 'mp4' : 'mp4'
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

</style>