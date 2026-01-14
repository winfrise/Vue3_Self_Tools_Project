<template>
  <el-container>
    <!-- 顶部导航栏 -->
    <el-header style="padding-left: 0; padding-right: 0; margin-bottom: 10px;">
      <el-card>
        <el-button type="success" @click="download">下载印章</el-button>
      </el-card>
    </el-header>

    <!-- 主体：三列 -->
    <el-container style="height: 600px;">
      <!-- 左侧列 -->
      <el-aside width="140px" style="padding: 0;">
        <el-scrollbar>
          <el-card>
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
        </el-scrollbar>
      </el-aside>

      <!-- 中间主列 -->
      <el-aside width="300px" style="padding: 0;">
        <el-scrollbar>
          <SealPreview 
            :config="config" 
            :external-image-config="externalImageConfig" 
            :template="currentTemplate"
            :agingEffects="agingEffects"
          />
          <SealImagePanel v-model="externalImageConfig" />
          <SealDebugPanel v-model="config.debugConfig" />
        </el-scrollbar>
      </el-aside>

      <!-- 右侧列 -->
      <el-aside width="500px" style="padding: 0;">
        <el-scrollbar>
          <SealConfigForm v-model="config" />
        </el-scrollbar>
      </el-aside>

      <el-aside width="400px">
        <AgingEffectManager v-model="agingEffects" />
      </el-aside>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import SealTemplate from './components/SealTemplate.vue'
import SealPreview from './components/SealPreview.vue'
import SealConfigForm from './components/SealConfigForm.vue'
import SealDebugPanel from './components/SealDebugPanel.vue'
import SealImagePanel from './components/SealImagePanel.vue'
import AgingEffectManager from './components/AgingEffectManager.vue'

const currentTemplate = ref('round')

const templates = {
  round: { image: '/assets/templates/round.png', label: '圆形印章' },
  oval: { image: '/assets/templates/oval.png', label: '椭圆印章' },
  square: { image: '/assets/templates/square.png', label: '方形印章' },
}

const config = ref({
  size: 300,
  color: '#DC143C', // 标准红色
  dpr: 2, // 分辨率
  enableAging: false,
  aging: 50,

  companyName: '北京小米科技有限公司',
  companyRadius: 90,
  companyFontFamily: 'FZShuSong-Z01',
  companyFontSize: 30,
  companyFontWeight: 'normal',
  companyColor: '',
  companyNameLetterSpacing: 5,
  companyNameWidthRatio: 1,
  companyNameHeightRatio: 1.5,

  sealName: '骑行专用章',
  sealNameStartY: 50,
  sealNameFontFamily: 'FZShuSong-Z01',
  sealNameFontSize: 25,
  sealNameFontWeight: 'normal',
  sealNameColor: '',
  sealNameLetterSpacing: 0,
  sealNameWidthRatio: 1,
  sealNameHeightRatio: 1,

  centerText: '★',
  centerTextFontSize: 40,

  verifyCode: '1234567890123',
  verifyCodeRadius: 100,
  verifyCodeFontFamily: 'Arial',
  verifyCodeFontSize: 14,
  verifyCodeFontWeight: 'normal',
  verifyCodeColor: '',
  verifyCodeLetterSpacing: 0,


  enableCircleLine: true,
  circleLineWidth: 8,
  circleLineRadius: 125,
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
  },
  effectList: []
})

// 背景配置
const externalImageConfig = ref({
    enable: true,
    size: 300,
    imageUrl: '',
    offsetX: 0,
    offsetY: 0,
    width: 0, 
    height: 0,
    scale: 1,
})

const agingEffects = ref([])

// 切换模板
function handleTemplateSelected(templateKey) {
  currentTemplate.value = templateKey
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