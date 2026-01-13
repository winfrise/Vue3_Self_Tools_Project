<template>
  <div class="aging-effect-manager">
    <h2>印章老化效果管理器</h2>


    <!-- 操作区 -->
    <el-button type="primary" @click="addEffect">
      + 添加老化效果
    </el-button>

    <!-- 效果列表 -->
    <el-collapse accordion>
      <el-collapse-item
        v-for="(effect, index) in sealAgingEffects"
        :key="index"
        :name="index.toString()"
        :title="`效果 ${index + 1} - ${effectOptionsMap[effect.type]?.label} - ${effect.type}`"
      >
        <el-form>
          <el-form-item label="效果类型">
            <el-select v-model="effect.type" @change="renderPreview">
                <el-option
                    v-for="opt in effectOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                />
            </el-select>
          </el-form-item>

          <el-form-item label="强度 (0～1)">
            <el-slider v-model="effect.intensity" :min="0" :max="1" :step="0.05"/>
          </el-form-item>

          <el-form-item label="启用">
            <el-switch v-model="effect.enabled" />
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
import { ref, onMounted, nextTick, computed } from 'vue'

import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: Array,
})

const emit = defineEmits(['update:modelValue'])

const sealAgingEffects = reactive([ ...props.modelValue ])

watch(sealAgingEffects, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })


const effectOptions = [
  { label: '边缘磨损', value: 'edgeWear' },
  { label: '印油不均', value: 'inkInconsistent' },
  { label: '印面龟裂', value: 'cracking' },
  { label: '局部缺失', value: 'partialLoss' },
  { label: '污渍与晕染', value: 'smudge' },
  { label: '氧化变色', value: 'discoloration' },
  { label: '微移重影', value: 'ghosting' },
  { label: '背景噪点', value: 'backgroundNoise' },
  { label: '印泥干涸', value: 'dryStamp' },
  { label: '虫蛀或磕碰痕迹', value: 'physicalDamage' }
]


const effectOptionsMap = computed(() => {
    return effectOptions.reduce((acc, item) => {
        acc[item.value] = {...item}
        return acc
    }, {})
})

const canvasRef = ref(null)

// 添加新效果
const addEffect = () => {
  sealAgingEffects.push({
    type: 'edgeWear',
    enabled: false,
    intensity: 0.5,
  })
}

// 删除效果
const removeEffect = (index) => {
  sealAgingEffects.splice(index, 1)
}

</script>

<style scoped>
.aging-effect-manager {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.preview-container {
  text-align: center;
  margin-bottom: 24px;
}

.preview-container canvas {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}
</style>