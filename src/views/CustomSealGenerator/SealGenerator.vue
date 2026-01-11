<!-- components/SealGenerator.vue -->
<template>
  <div class="seal-generator" style="padding: 20px; min-width: 1200px;">
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
      <el-main style="flex-basis: 300px;">
        <SealPreview :config="config" :template="currentTemplate" />
        <DebugConfigForm v-model="config.debugConfig" />
      </el-main>

      <!-- 右侧：配置表单 -->
      <el-main style="flex-basis: 700px;">
        <SealConfigForm v-model="config" />
      </el-main>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import SealTemplate from './components/SealTemplate.vue'
import SealPreview from './components/SealPreview.vue'
import SealConfigForm from './components/SealConfigForm.vue'
import DebugConfigForm from './components/DebugConfigForm.vue'

const currentTemplate = ref('round')

const templates = {
  round: { image: '/assets/templates/round.png', label: '圆形印章' },
  oval: { image: '/assets/templates/oval.png', label: '椭圆印章' },
  square: { image: '/assets/templates/square.png', label: '方形印章' },
}

const config = ref({
  size: 240,
  color: '#e60000',
  enableAging: true,
  aging: 50,

  companyName: '北京小米科技有限公司',
  companyRadius: 95,
  companyFontFamily: 'FZFangSong-Z02',
  companyFontSize: 30,
  conpanyFontWeight: 'normal',
  companyColor: '',
  companyNameLetterSpacing: 5,
  companyNameWidthRatio: 1,
  companyNameHeightRatio: 1,

  sealName: '骑行专用章',
  sealNameStartY: 50,
  sealNameFontFamily: 'FZFangSong-Z02',
  sealNameFontSize: 25,
  sealNameFontWeight: 'normal',
  sealNameColor: '',
  sealNameLetterSpacing: 0,
  sealNameWidthRatio: 1,
  sealNameHeightRatio: 1,

  centerText: '★',

  verifyCode: '1234567890123',
  verifyCodeRadius: 100,
  verifyCodeFontFamily: 'FZFangSong-Z02',
  verifyCodeFontSize: 14,
  verifyCodeFontWeight: 'normal',
  verifyCodeColor: '',
  verifyCodeLetterSpacing: 0,


  enableCircleLine: true,
  circleLineWidth: 4,
  circleLineRadius: 120,
  circleLineColor: '',

  enableOuterCircleLineWidth: false,
  outerCircleLineWidth: 1,
  outerCircleLineRadius: 130,
  outerCircleLineColor: '',

  enableInnerCircleLine: false,
  innerCircleLineWidth: 1,
  innerCircleLineRadius: 110,
  innerCircleLineColor: '',

  debugConfig: {
    debugShowCenterPoint: false,    // 显示中心点
    debugShowCenterLines: false,    // 显示横竖中心线
    debugShowCircleBaselines: false,// 显示所有圆形参考基线
    debugShowRadiusLabel: false,    // 显示圆形半径数值标注
    debugShowSealNameBaseLine: false,//显示章名基准线
    debugShowSealBorder: false,     // 显示印章整体外框
    debugShowCoordinateLabel: false,// 显示中心点坐标文字
}
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

.header {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}
</style>