<template>
  <div class="aging-effect-manager">
    <h2>印章老化效果管理器（10种差异化参数）</h2>

    <!-- 预览区域 -->
    <div class="preview-container">
      <canvas ref="canvasRef" width="400" height="400"></canvas>
      <p>实时预览（模拟叠加效果）</p>
    </div>

    <!-- 效果类型选择 + 添加按钮 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: end;">
      <el-select v-model="selectedType" placeholder="请选择要添加的老化效果" style="width: 220px">
        <el-option
          v-for="opt in effectOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-button type="primary" @click="addEffect" :disabled="!selectedType">
        + 添加效果
      </el-button>
    </div>

    <!-- 效果列表 -->
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item
        v-for="(effect, index) in sealAgingEffects"
        :key="index"
        :name="index.toString()"
        :title="`效果 ${index + 1} - ${getTypeLabel(effect.type)}`"
      >
        <el-form label-width="120px" size="small">
          <el-form-item label="效果类型">
            <el-input :model-value="getTypeLabel(effect.type)" readonly />
          </el-form-item>

          <!-- 边缘磨损 -->
          <template v-if="effect.type === 'edgeWear'">
            <el-form-item label="磨损强度">
              <el-slider v-model="effect.params.intensity" :min="0" :max="1" :step="0.05" @change="renderPreview" />
            </el-form-item>
            <el-form-item label="边缘点密度">
              <el-slider v-model="effect.params.density" :min="0.1" :max="2" :step="0.1" @change="renderPreview" />
            </el-form-item>
          </template>

          <!-- 印面龟裂 -->
          <template v-else-if="effect.type === 'cracking'">
            <el-form-item label="裂缝数量">
              <el-slider v-model="effect.params.count" :min="5" :max="50" :step="1" @change="renderPreview" />
            </el-form-item>
            <el-form-item label="裂缝长度">
              <el-slider v-model="effect.params.length" :min="10" :max="60" :step="5" @change="renderPreview" />
            </el-form-item>
          </template>

          <!-- 污渍晕染 -->
          <template v-else-if="effect.type === 'smudge'">
            <el-form-item label="晕染强度">
              <el-slider v-model="effect.params.intensity" :min="0" :max="1" :step="0.05" @change="renderPreview" />
            </el-form-item>
            <el-form-item label="污渍半径">
              <el-slider v-model="effect.params.radius" :min="2" :max="10" :step="0.5" @change="renderPreview" />
            </el-form-item>
          </template>

          <!-- 虫蛀/磕碰 -->
          <template v-else-if="effect.type === 'physicalDamage'">
            <el-form-item label="损伤数量">
              <el-slider v-model="effect.params.count" :min="1" :max="15" :step="1" @change="renderPreview" />
            </el-form-item>
            <el-form-item label="损伤大小">
              <el-slider v-model="effect.params.size" :min="3" :max="20" :step="1" @change="renderPreview" />
            </el-form-item>
          </template>

          <template v-else-if="effect.type === 'ghosting'">
            <el-form-item label="x轴偏移">
              <el-slider v-model="effect.params.offsetX" :min="-30" :max="30" :step="1" @change="renderPreview" />
            </el-form-item>

            <el-form-item label="Y轴偏移">
              <el-slider v-model="effect.params.offsetY" :min="-30" :max="30" :step="1" @change="renderPreview" />
            </el-form-item>

            <el-form-item label="透明度">
              <el-slider v-model="effect.params.alpha" :min="0" :max="1" :step="0.1" show-input @change="renderPreview" />
            </el-form-item>
          </template>

          <!-- 其他效果：通用强度 -->
          <template v-else>
            <el-form-item label="效果强度">
              <el-slider v-model="effect.params.intensity" :min="0" :max="1" :step="0.05" @change="renderPreview" />
            </el-form-item>
          </template>

          <!-- 启用开关 & 删除 -->
          <el-form-item label="启用">
            <el-switch v-model="effect.enabled" @change="renderPreview" />
          </el-form-item>
          <el-form-item>
            <el-button type="danger" size="small" @click="removeEffect(index)">删除</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref,reactive, watch, onMounted, nextTick, computed } from 'vue'

const props = defineProps({
  modelValue: Array,
})

const emit = defineEmits(['update:modelValue'])

const sealAgingEffects = reactive([ ...props.modelValue ])

watch(sealAgingEffects, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// 老化效果选项
const effectOptions = [
  { label: '边缘磨损', value: 'edgeWear' },
  { label: '印油不均', value: 'inkInconsistent' },
  { label: '印面龟裂', value: 'cracking' },
  { label: '局部缺失', value: 'partialLoss' },
  { label: '污渍与晕染', value: 'smudge' },
  { label: '微移重影（实现）', value: 'ghosting' },
  { label: '背景噪点', value: 'backgroundNoise' },
  { label: '印泥干涸', value: 'dryStamp' },
  { label: '虫蛀或磕碰痕迹', value: 'physicalDamage' }
]

// 获取标签
const getTypeLabel = (type) => {
  const opt = effectOptions.find(item => item.value === type)
  return opt ? opt.label : type
}

// 当前选中的类型（用于添加）
const selectedType = ref('')

// 折叠面板控制
const activeNames = ref([])

// Canvas 引用
const canvasRef = ref(null)

// 获取默认参数
const getDefaultParams = (type) => {
  const defaultParamsMap = {
    ghosting: { // 重影
      offsetX: 5,
      offsetY: 5,
      alpha: 0.5
    }
  }
  const defaultParams = defaultParamsMap[type]
  if (defaultParams) {
    return defaultParams
  }

  switch (type) {
    case 'edgeWear':
      return { intensity: 0.6, density: 1.0 }
    case 'cracking':
      return { count: 20, length: 30 }
    case 'smudge':
      return { intensity: 0.4, radius: 5 }
    case 'physicalDamage':
      return { count: 5, size: 8 }
    default:
      return { intensity: 0.5 }
  }
}

// 添加效果
const addEffect = () => {
  if (!selectedType.value) return

  const newEffect = {
    type: selectedType.value,
    enabled: true,
    params: getDefaultParams(selectedType.value)
  }

  sealAgingEffects.push(newEffect)

  // 自动展开新项
  nextTick(() => {
    activeNames.value = [(sealAgingEffects.length - 1).toString()]
  })

  // 清空选择（可选）
  selectedType.value = ''

  renderPreview()
}

// 删除效果
const removeEffect = (index) => {
  sealAgingEffects.splice(index, 1)
  if (activeNames.value.includes(index.toString())) {
    activeNames.value = []
  }
  renderPreview()
}

// ========== Canvas 渲染逻辑 ==========
onMounted(() => {
  renderPreview()
})

const renderPreview = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height

  // 清空
  ctx.clearRect(0, 0, w, h)

  // 绘制基础印章
  ctx.fillStyle = '#b00'
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, 90, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 28px "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('仿古印', w / 2, h / 2)

  // 离屏 canvas 保存原始图（用于重影等）
  const offscreen = document.createElement('canvas')
  offscreen.width = w
  offscreen.height = h
  const offCtx = offscreen.getContext('2d')
  offCtx.drawImage(canvas, 0, 0)

  // 清空主画布
  ctx.clearRect(0, 0, w, h)

  const enabledEffects = sealAgingEffects.filter(e => e.enabled)

  // 先处理背景噪点
  enabledEffects.forEach(effect => {
    if (effect.type === 'backgroundNoise') {
      applyBackgroundNoise(ctx, w, h, effect.params.intensity)
    }
  })

  // 绘制印章
  ctx.drawImage(offscreen, 0, 0)

  // 应用其他效果
  enabledEffects.forEach(effect => {
    const { type, params } = effect
    if (type === 'backgroundNoise') return

    switch (type) {
      case 'edgeWear':
        applyEdgeWear(ctx, w, h, params.intensity, params.density || 1)
        break
      case 'inkInconsistent':
        applyInkInconsistent(ctx, w, h, params.intensity)
        break
      case 'cracking':
        applyCracking(ctx, w, h, params.count || 20, params.length || 30)
        break
      case 'partialLoss':
        applyPartialLoss(ctx, w, h, params.intensity)
        break
      case 'smudge':
        applySmudge(ctx, w, h, params.intensity, params.radius || 5)
        break
      case 'ghosting':
        applyGhosting(ctx, offscreen, w, h, params)
        break
      case 'dryStamp':
        applyDryStamp(ctx, w, h, params.intensity)
        break
      case 'physicalDamage':
        applyPhysicalDamage(ctx, w, h, params.count || 5, params.size || 8)
        break
    }
  })
}

// ========== 老化效果实现（简化模拟）==========
function applyEdgeWear(ctx, w, h, intensity, density) {
  const cx = w / 2, cy = h / 2, r = 90
  const points = Math.floor(200 * intensity * density)
  for (let i = 0; i < points; i++) {
    const a = Math.random() * Math.PI * 2
    const rad = r - Math.random() * 8 * intensity
    const x = cx + Math.cos(a) * rad
    const y = cy + Math.sin(a) * rad
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y, 1.5 + intensity * 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function applyCracking(ctx, w, h, count, len) {
  for (let i = 0; i < count; i++) {
    const x = w / 2 + (Math.random() - 0.5) * 100
    const y = h / 2 + (Math.random() - 0.5) * 100
    const angle = Math.random() * Math.PI * 2
    const endX = x + Math.cos(angle) * len
    const endY = y + Math.sin(angle) * len
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1 + Math.random() * 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }
}

function applySmudge(ctx, w, h, intensity, radius) {
  const dots = Math.floor(100 * intensity)
  for (let i = 0; i < dots; i++) {
    const dx = (Math.random() - 0.5) * 140
    const dy = (Math.random() - 0.5) * 140
    const dist = Math.hypot(dx, dy)
    if (dist > 80 && dist < 110) {
      ctx.fillStyle = `rgba(120, 100, 100, ${0.05 * intensity})`
      ctx.beginPath()
      ctx.arc(w / 2 + dx, h / 2 + dy, radius * intensity, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function applyPhysicalDamage(ctx, w, h, count, size) {
  for (let i = 0; i < count; i++) {
    const x = w / 2 + (Math.random() - 0.5) * 100
    const y = h / 2 + (Math.random() - 0.5) * 100
    if (Math.random() > 0.5) {
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(x - size / 2, y - 2, size, 4)
    }
  }
}

// 通用效果（使用 intensity）
function applyInkInconsistent(ctx, w, h, intensity) {
  // 假设印章位于画布中心，半径为90像素
  const cx = w / 2;
  const cy = h / 2;
  const radius = 90;

  // 计算要添加的油墨不均点的数量，基于强度参数
  const patches = Math.floor(5 * intensity); // 强度越大，油墨不均越明显

  for (let i = 0; i < patches; i++) {
    // 随机生成一个位置，确保该位置在印章范围内
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;

    // 随机生成一个大小和透明度
    const size = 20 + Math.random() * 30 * intensity;
    const opacity = 0.3 * intensity;

    // 绘制一个半透明的圆圈以模拟印油不均
    ctx.fillStyle = `rgba(255,255,255,${opacity})`; // 使用白色填充，表示油墨缺失
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}
function applyPartialLoss(ctx, w, h, intensity) {
  const holes = 8 * intensity
  for (let i = 0; i < holes; i++) {
    const x = w / 2 + (Math.random() - 0.5) * 80
    const y = h / 2 + (Math.random() - 0.5) * 80
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y, 5 + 15 * intensity, 0, Math.PI * 2)
    ctx.fill()
  }
}




function applyDryStamp(ctx, w, h, intensity) {
  const streaks = 40 * intensity
  for (let i = 0; i < streaks; i++) {
    const x = w / 2 + (Math.random() - 0.5) * 100
    const y = h / 2 + (Math.random() - 0.5) * 100
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 3 + 5 * intensity, y)
    ctx.stroke()
  }
}

function applyBackgroundNoise(ctx, w, h, intensity) {
  const dots = w * h * 0.0005 * intensity
  for (let i = 0; i < dots; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const g = 200 + Math.random() * 55
    ctx.fillStyle = `rgba(${g},${g},${g},${0.3 * intensity})`
    ctx.fillRect(x, y, 1, 1)
  }
}
</script>

<style scoped>
.aging-effect-manager {
  padding: 20px;
  margin: 0 auto;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.preview-container {
  text-align: center;
  margin-bottom: 24px;
}

.preview-container canvas {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #fafafa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
</style>