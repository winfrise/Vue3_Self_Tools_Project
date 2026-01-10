<!-- components/SealGenerator.vue -->
<template>
  <div class="seal-generator">
    <!-- 顶部操作栏 -->
    <div class="header">
      <el-button type="primary" @click="generateChinese">生成中文印章</el-button>
      <el-button @click="generateEnglish">生成英文印章</el-button>
      <el-button type="success" @click="download">下载印章</el-button>
    </div>

    <!-- 主体内容 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 左侧：模板选择 -->
      <el-col :span="5">
        <h3 style="margin-bottom: 16px;">印章模板</h3>
        <el-row :gutter="10">
          <el-col
            v-for="(tmpl, key) in templates"
            :key="key"
            :span="8"
          >
            <SealTemplate
              :image-src="tmpl.image"
              :label="tmpl.label"
              :value="key"
              :selected="currentTemplate === key"
              @select="setTemplate"
            />
          </el-col>
        </el-row>
      </el-col>

      <!-- 中间：预览 -->
      <el-col :span="10" style="display: flex; justify-content: center;">
        <SealPreview :config="config" :template="currentTemplate" />
      </el-col>

      <!-- 右侧：配置表单 -->
      <el-col :span="9">
        <SealConfigForm v-model="config" />
      </el-col>
    </el-row>

    <!-- 免责声明 -->
    <el-alert
      title="郑重声明"
      type="error"
      description="本工具生成的印章仅供个人学习测试使用，请勿用于非法用途，否则后果自负！"
      show-icon
      style="margin-top: 20px;"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import SealTemplate from './components/SealTemplate.vue'
import SealPreview from './components/SealPreview.vue'
import SealConfigForm from './components/SealConfigForm.vue'

const currentTemplate = ref('round')

const templates = {
  round: { image: '/assets/templates/round.png', label: '圆形印章' },
  oval: { image: '/assets/templates/oval.png', label: '椭圆印章' },
  square: { image: '/assets/templates/square.png', label: '方形印章' },
}

const config = reactive({
  company: '喜牛牛骑缝印章科技有限公司',
  sealName: '骑缝专用章',
  centerText: '★',
  verifyCode: '1234567890123ZHANG',
  outerLine: 4,
  innerLine: 1,
  showLines: true,
  color: '#e60000',
  size: 240,
  aging: 90,
  enableAging: true,
  fontFamily: 'FangSong',
  fontSize: 20,
  fontWeight: 'bold',
})

function setTemplate(templateKey) {
  currentTemplate.value = templateKey
}

function generateChinese() {
  // 可扩展逻辑
  console.log('生成中文印章')
}

function generateEnglish() {
  console.log('生成英文印章')
}

function download() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return
  const link = document.createElement('a')
  link.download = 'seal.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>

<style scoped>
.seal-generator {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}
</style>