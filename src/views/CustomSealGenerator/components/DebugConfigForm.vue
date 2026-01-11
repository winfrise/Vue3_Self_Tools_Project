<template>
  <div class="seal-debug-panel">
    <el-card shadow="hover" border :body-style="{ padding: '12px 16px' }">
      <div slot="header" class="panel-header">
        <span>印章调试面板</span>
        <el-divider direction="vertical" />
        <span class="tips">调试线不影响印章生成结果</span>
      </div>

      <!-- 快捷操作按钮 -->
      <div class="btn-group mb-3">
        <el-button size="small" type="primary" plain @click="handleAllOpen">一键全开</el-button>
        <el-button size="small" type="warning" plain @click="handleAllClose">一键全关</el-button>
      </div>

      <!-- 所有调试项开关 -->
      <el-space direction="vertical" size="8" fill>
        <el-switch
          v-model="debugForm.debugShowCenterPoint"
          active-text="显示中心点(红色圆点+坐标)"
          inactive-text="隐藏中心点"
        />
        <el-switch
          v-model="debugForm.debugShowCenterLines"
          active-text="显示横竖中心线(贯穿画布)"
          inactive-text="隐藏中心线"
        />
        <el-switch
          v-model="debugForm.debugShowCircleBaselines"
          active-text="显示圆形参考基线(所有半径虚线)"
          inactive-text="隐藏圆形参考线"
        />
        <el-switch
          v-model="debugForm.debugShowRadiusLabel"
          active-text="显示半径数值标注(r=xxx)"
          inactive-text="隐藏半径标注"
          :disabled="!debugForm.debugShowCircleBaselines"
        />
        <el-switch
          v-model="debugForm.debugShowSealNameBaseLine"
          active-text="显示章名基准线(横向虚线)"
          inactive-text="隐藏章名基线"
        />
        <el-switch
          v-model="debugForm.debugShowSealBorder"
          active-text="显示印章外框边界(红色矩形)"
          inactive-text="隐藏印章外框"
        />
        <el-switch
          v-model="debugForm.debugShowCoordinateLabel"
          active-text="显示中心点坐标文本"
          inactive-text="隐藏坐标文本"
          :disabled="!debugForm.debugShowCenterPoint"
        />
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // 支持父组件v-model双向绑定调试配置
  modelValue: {
    type: Object,
    default: () => ({
      debugShowCenterPoint: false,
      debugShowCenterLines: false,
      debugShowCircleBaselines: false,
      debugShowRadiusLabel: false,
      debugShowSealNameBaseLine: false,
      debugShowSealBorder: false,
      debugShowCoordinateLabel: false
    })
  }
})

const emit = defineEmits(['update:modelValue'])

// 调试表单数据
const debugForm = reactive({ ...props.modelValue })

// 监听表单变化，实时同步给父组件
watch(
  debugForm,
  (val) => {
    emit('update:modelValue', { ...val })
  },
  { deep: true }
)

// 监听父组件传值变化，同步到本地表单
watch(
  () => props.modelValue,
  (val) => {
    Object.assign(debugForm, val)
  },
  { deep: true }
)

// 一键全开
const handleAllOpen = () => {
  debugForm.debugShowCenterPoint = true
  debugForm.debugShowCenterLines = true
  debugForm.debugShowCircleBaselines = true
  debugForm.debugShowRadiusLabel = true
  debugForm.debugShowSealNameBaseLine = true
  debugForm.debugShowSealBorder = true
  debugForm.debugShowCoordinateLabel = true
  ElMessage.success('所有调试项已开启')
}

// 一键全关
const handleAllClose = () => {
  debugForm.debugShowCenterPoint = false
  debugForm.debugShowCenterLines = false
  debugForm.debugShowCircleBaselines = false
  debugForm.debugShowRadiusLabel = false
  debugForm.debugShowSealNameBaseLine = false
  debugForm.debugShowSealBorder = false
  debugForm.debugShowCoordinateLabel = false
  ElMessage.success('所有调试项已关闭')
}
</script>

<style scoped>
.seal-debug-panel {
  width: 100%;
  max-width: 420px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 15px;
  font-weight: 500;
}
.tips {
  font-size: 12px;
  color: #666;
}
.btn-group {
  display: flex;
  gap: 8px;
}
:deep(.el-switch__label) {
  font-size: 13px !important;
}
</style>