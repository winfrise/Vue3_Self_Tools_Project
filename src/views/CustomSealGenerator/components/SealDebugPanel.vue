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
      <el-form>
        <el-form-item label="中心点">
          <el-switch
            v-model="debugForm.debugShowCenterPoint"
          />
          <el-divider direction="vertical" />
          <span class="tips">红色圆点+坐标</span>
        </el-form-item>

        
        <el-form-item label="中心线">
          <el-switch
            v-model="debugForm.debugShowCenterLines"
          />

          <el-divider direction="vertical" />
          <span class="tips">显示横竖中心线(贯穿画布)</span>
        </el-form-item>

        
      </el-form>
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
  ElMessage.success('所有调试项已开启')
}

// 一键全关
const handleAllClose = () => {
  debugForm.debugShowCenterPoint = false
  debugForm.debugShowCenterLines = false
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
:deep(.el-form-item) {
  margin-bottom: 5px!important;
}
</style>