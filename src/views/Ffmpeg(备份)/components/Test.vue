<template>
  <div class="cropper-container" style="max-width: 1200px; margin: 20px auto; padding: 10px;">
    <!-- 1. 画布参数配置 -->
    <div class="canvas-config" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
      <div>
        <label>画布宽度：</label>
        <input
          v-model.number="canvasWidth"
          type="number"
          min="100"
          style="width: 100px; padding: 4px;"
        />
      </div>
      <div>
        <label>画布高度：</label>
        <input
          v-model.number="canvasHeight"
          type="number"
          min="100"
          style="width: 100px; padding: 4px;"
        />
      </div>
      <div>
        <label>裁剪比例：</label>
        <select v-model="selectedRatio" @change="updateAspectRatio" style="padding: 4px;">
          <option value="NaN">自由比例</option>
          <option value="1/1">1:1</option>
          <option value="3/4">3:4</option>
          <option value="16/9">16:9</option>
          <option value="custom">自定义</option>
        </select>
        <div v-if="selectedRatio === 'custom'" style="margin-top: 8px; display: flex; gap: 8px;">
          <input
            v-model="customRatio.width"
            type="number"
            placeholder="宽"
            style="width: 80px; padding: 4px;"
            @input="updateCustomAspectRatio"
          />
          <span>:</span>
          <input
            v-model="customRatio.height"
            type="number"
            placeholder="高"
            style="width: 80px; padding: 4px;"
            @input="updateCustomAspectRatio"
          />
        </div>
      </div>
      <button @click="resetCropper" class="btn btn-secondary">重置裁剪框</button>
    </div>

    <!-- 2. 裁剪框参数显示/手动设置 -->
    <div class="crop-box-config" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
      <div>
        <label>X坐标：</label>
        <input
          v-model.number="cropBoxData.x"
          type="number"
          style="width: 80px; padding: 4px;"
          @change="updateCropBoxData"
        />
      </div>
      <div>
        <label>Y坐标：</label>
        <input
          v-model.number="cropBoxData.y"
          type="number"
          style="width: 80px; padding: 4px;"
          @change="updateCropBoxData"
        />
      </div>
      <div>
        <label>宽度：</label>
        <input
          v-model.number="cropBoxData.width"
          type="number"
          style="width: 80px; padding: 4px;"
          @change="updateCropBoxData"
        />
      </div>
      <div>
        <label>高度：</label>
        <input
          v-model.number="cropBoxData.height"
          type="number"
          style="width: 80px; padding: 4px;"
          @change="updateCropBoxData"
        />
      </div>
      <div style="color: #666; font-size: 12px;">
        相对比例：{{ cropBoxData.percentWidth }} / {{ cropBoxData.percentHeight }}
      </div>
    </div>

    <!-- 3. 引入空白画布裁剪组件（核心） -->
    <CropperWrapper
      ref="cropperWrapperRef"
      :canvas-width="canvasWidth"
      :canvas-height="canvasHeight"
      :aspect-ratio="currentAspectRatio"
      @crop-box-change="handleCropBoxChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import CropperWrapper from './CropperWrapper.vue'

// ========== 类型定义 ==========
interface CropBoxData {
  x: number
  y: number
  width: number
  height: number
  percentX: number
  percentY: number
  percentWidth: number
  percentHeight: number
}

// ========== 核心变量 ==========
const cropperWrapperRef = ref<InstanceType<typeof CropperWrapper>>()
// 画布宽高（可由外部传入/手动修改）
const canvasWidth = ref<number>(800)
const canvasHeight = ref<number>(600)
// 裁剪比例
const selectedRatio = ref<string>('NaN')
const currentAspectRatio = ref<number>(NaN)
// 自定义比例
const customRatio = reactive({
  width: '',
  height: ''
})
// 裁剪框数据
const cropBoxData = reactive<CropBoxData>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  percentX: 0,
  percentY: 0,
  percentWidth: 0,
  percentHeight: 0
})

// ========== 方法定义 ==========
// 更新裁剪比例
const updateAspectRatio = () => {
  if (selectedRatio.value === 'NaN') {
    currentAspectRatio.value = NaN
  } else if (selectedRatio.value !== 'custom') {
    const [w, h] = selectedRatio.value.split('/').map(Number)
    currentAspectRatio.value = w / h
  }
}

// 更新自定义比例
const updateCustomAspectRatio = () => {
  if (customRatio.width && customRatio.height) {
    currentAspectRatio.value = Number(customRatio.width) / Number(customRatio.height)
  }
}

// 接收裁剪框数据
const handleCropBoxChange = (data: CropBoxData) => {
  Object.assign(cropBoxData, data)
}

// 手动更新裁剪框数据
const updateCropBoxData = () => {
  if (!cropperWrapperRef.value) return
  cropperWrapperRef.value.setCropBoxData({
    x: cropBoxData.x,
    y: cropBoxData.y,
    width: cropBoxData.width,
    height: cropBoxData.height
  })
}

// 重置裁剪框
const resetCropper = () => {
  if (cropperWrapperRef.value) {
    cropperWrapperRef.value.resetCropper()
  }
}
</script>

<style scoped>
.btn {
  padding: 6px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: #6c757d;
}

input[type="number"], select {
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  padding: 4px;
}

input[type="number"]:focus, select:focus {
  border-color: #409eff;
}
</style>