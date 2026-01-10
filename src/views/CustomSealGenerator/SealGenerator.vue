<!-- components/SealGenerator.vue -->
<template>
  <div class="seal-generator">
    <!-- 顶部操作栏 -->
    <el-header class="header">
      <el-button type="primary" @click="generateChinese">生成中文印章</el-button>
      <el-button type="success" @click="download">下载印章</el-button>
    </el-header>

    <!-- 主体内容 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 左侧：模板选择 -->
      <el-aside style="width: 140px;">
        <el-card style="margin: 15px 0;">
          <template #header>
          印章模板
          </template>
          <SealTemplate
            v-for="(tmpl, key) in templates"
            :key="key"
            :image-src="tmpl.image"
            :label="tmpl.label"
            :value="key"
            :selected="currentTemplate === key"
            @select="handleTemplateSelected"
          />
        </el-card>

      </el-aside>

      <!-- 中间：预览 -->
      <el-col :span="10" style="display: flex; justify-content: center;">
        <SealPreview :config="config" :template="currentTemplate" />
      </el-col>

      <!-- 右侧：配置表单 -->
      <el-col :span="9">
        <SealConfigForm v-model="config" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import SealTemplate from './components/SealTemplate.vue'
import SealPreview from './components/SealPreview.vue'
import SealConfigForm from './components/SealConfigForm.vue'

const currentTemplate = ref('round')

const templates = {
  round: { image: '/assets/templates/round.png', label: '圆形印章' },
  oval: { image: '/assets/templates/oval.png', label: '椭圆印章' },
  square: { image: '/assets/templates/square.png', label: '方形印章' },
}

const config = ref({
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

function handleTemplateSelected(templateKey) {
  currentTemplate.value = templateKey
}

function generateChinese() {
  // 可扩展逻辑
  console.log('生成中文印章')
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