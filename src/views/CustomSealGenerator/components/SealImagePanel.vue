<template>
  <el-card>
    <!-- 文件上传区域 -->
    <el-upload
      class="upload-area"
      drag
      action=""
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      accept="image/*"
    >
      <div v-if="config.imageUrl">
        <el-image style="width: 100px; height: 100px" :src="config.imageUrl" />
      </div>

      <div v-else>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽图片至此或 <em>点击上传</em>
        </div>
      </div>

    </el-upload>

    {{ config.offsetX }}

    <!-- 控制面板 -->
    <div class="controls">
      <el-form size="small">
        <el-form-item label="X轴偏移:">
          <el-input-number v-model="config.offsetX" :min="-30" :style="0.1" :max="30" />
        </el-form-item>
        <el-form-item label="Y轴偏移:">
          <el-input-number v-model="config.offsetY"  :min="-30" :style="0.1" :max="30" />
        </el-form-item>
        <el-form-item label="缩放比例:">
          <el-input-number v-model="config.scale" :step="0.01"  />
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Object,
})

const emit = defineEmits(['update:modelValue'])

const config = reactive({ ...props.modelValue })

watch(config, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })


// 处理文件选择
const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = (e) => {
    const imageUrl = e.target.result

    const img = new Image();
    img.crossOrigin = 'anonymous'; // 避免跨域问题（如果需要）
    img.src = imageUrl;

    img.onload = () => {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      
      // 临时方案
      const canvasSize = 300

      // 计算图片居中的坐标
      const x = (canvasSize - imgWidth) / 2;
      const y = (canvasSize - imgHeight) / 2;


      config.x = x
      config.y = y
      config.imageUrl = imageUrl
      config.width = imgWidth
      config.height = imgHeight

    };

  }

}



</script>

<style scoped>
.upload-area {
  margin-bottom: 20px;
}
.controls {
  margin-bottom: 20px;
}
.canvas-container {
  text-align: center;
}
</style>