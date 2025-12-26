<template>
  <!-- 基于指定宽高的空白裁剪容器 -->
  <div 
    class="cropper-wrapper" 
    :style="{ 
      width: `${canvasWidth}px`, 
      height: `${canvasHeight}px`, 
      border: '1px solid #eee', 
      position: 'relative', 
      overflow: 'hidden', 
      background: '#f5f5f5' 
    }"
  >
    <!-- 核心：空白画布（替代图片），用于承载裁剪框 -->
    <img 
      ref="canvasRef" 
      :src="blankImageSrc"
      style="width: 100%; height: 100%; display: block;"
      @load="initCropper"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick} from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

// ========== Props 定义（接收外部传入的画布宽高 + 裁剪比例） ==========
interface CropperWrapperProps {
  // 画布宽度（必填）
  canvasWidth: number
  // 画布高度（必填）
  canvasHeight: number
  // 裁剪宽高比（默认自由比例）
  aspectRatio: number
}

// 设置默认值
const props = withDefaults(defineProps<CropperWrapperProps>(), {
  canvasWidth: 800,
  canvasHeight: 600,
  aspectRatio: NaN
})

// ========== Emits 定义（向外传递裁剪框数据） ==========
const emit = defineEmits<{
  (e: 'cropBoxChange', cropBoxData: { 
    x: number; 
    y: number; 
    width: number; 
    height: number;
    // 额外返回相对画布的百分比（可选）
    percentX: number;
    percentY: number;
    percentWidth: number;
    percentHeight: number;
  }): void
}>()

// ========== 核心变量 ==========
// 空白图片URL（用base64生成透明空白图，适配任意宽高）
const blankImageSrc = ref<string>('')
// 画布DOM引用
const canvasRef = ref<HTMLImageElement | null>(null)
// Cropper实例
let cropperInstance: Cropper | null = null

// ========== 核心方法 ==========
/**
 * 生成指定宽高的透明空白base64图片（核心：替代真实图片）
 */
const generateBlankImage = (width: number, height: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // 绘制透明背景（完全空白）
    ctx.clearRect(0, 0, width, height)
    blankImageSrc.value = canvas.toDataURL('image/png')
  }
}

/**
 * 初始化Cropper（空白画布加载完成后执行）
 */
const initCropper = async () => {
  await nextTick()
  
  if (!canvasRef.value || !blankImageSrc.value) return

  // 销毁旧实例
  if (cropperInstance) {
    cropperInstance.destroy()
  }

  // 初始化Cropper（核心：在空白图上创建裁剪框）
  cropperInstance = new Cropper(canvasRef.value, {
    // 裁剪比例
    aspectRatio: props.aspectRatio,
    // 视图模式（限制裁剪框在画布内）
    viewMode: 1,
    // 拖拽模式（裁剪框）
    dragMode: 'crop',
    // 是否允许移动画布（空白画布不需要移动，设为false）
    movable: false,
    // 是否允许旋转（空白画布不需要，设为false）
    rotatable: false,
    // 是否允许缩放画布（设为false）
    scalable: false,
    // 是否允许滚轮缩放（设为false）
    zoomable: false,
    // 裁剪框是否可移动（核心功能：开启）
    cropBoxMovable: true,
    // 裁剪框是否可调整大小（核心功能：开启）
    cropBoxResizable: true,
    // 显示辅助线
    guides: true,
    // 显示中心十字线
    center: true,
    // 显示裁剪框阴影
    highlight: true,
    // 裁剪框变化时触发
    crop: (e: any) => {
      const cropBoxData = {
        // 裁剪框绝对坐标/尺寸
        x: Math.round(e.detail.x),
        y: Math.round(e.detail.y),
        width: Math.round(e.detail.width),
        height: Math.round(e.detail.height),
        // 相对画布的百分比（便于后续适配）
        percentX: Number((e.detail.x / props.canvasWidth).toFixed(4)),
        percentY: Number((e.detail.y / props.canvasHeight).toFixed(4)),
        percentWidth: Number((e.detail.width / props.canvasWidth).toFixed(4)),
        percentHeight: Number((e.detail.height / props.canvasHeight).toFixed(4))
      }
      emit('cropBoxChange', cropBoxData)
    },
    // 初始化完成后触发（返回初始裁剪框数据）
    ready: () => {
      if (cropperInstance) {
        const initialData = cropperInstance.getCropBoxData()
        const cropBoxData = {
          x: Math.round(initialData.left),
          y: Math.round(initialData.top),
          width: Math.round(initialData.width),
          height: Math.round(initialData.height),
          percentX: Number((initialData.left / props.canvasWidth).toFixed(4)),
          percentY: Number((initialData.top / props.canvasHeight).toFixed(4)),
          percentWidth: Number((initialData.width / props.canvasWidth).toFixed(4)),
          percentHeight: Number((initialData.height / props.canvasHeight).toFixed(4))
        }
        emit('cropBoxChange', cropBoxData)
      }
    }
  })
}

/**
 * 手动设置裁剪框位置/尺寸（供父组件调用）
 */
const setCropBoxData = (data: { x?: number; y?: number; width?: number; height?: number }) => {
  if (!cropperInstance) return
  cropperInstance.setCropBoxData({
    left: data.x ?? cropperInstance.getCropBoxData().left,
    top: data.y ?? cropperInstance.getCropBoxData().top,
    width: data.width ?? cropperInstance.getCropBoxData().width,
    height: data.height ?? cropperInstance.getCropBoxData().height
  })
}

/**
 * 重置裁剪框到初始状态
 */
const resetCropper = () => {
  if (cropperInstance) {
    cropperInstance.reset()
  }
}

// ========== 监听逻辑 ==========
// 监听画布宽高变化，重新生成空白图并初始化
watch([() => props.canvasWidth, () => props.canvasHeight], () => {
  generateBlankImage(props.canvasWidth, props.canvasHeight)
})

// 监听裁剪比例变化，更新Cropper
watch(() => props.aspectRatio, (newRatio) => {
  if (cropperInstance) {
    cropperInstance.setAspectRatio(newRatio)
    cropperInstance.reset()
  }
})

// ========== 初始化 ==========
// 组件挂载时生成空白图片
generateBlankImage(props.canvasWidth, props.canvasHeight)

// ========== 组件卸载 ==========
onUnmounted(() => {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
})

// ========== 向外暴露方法 ==========
defineExpose({
  resetCropper,
  setCropBoxData
})
</script>

<style scoped>
.cropper-wrapper {
  box-sizing: border-box;
}

/* 隐藏Cropper默认的图片控制按钮（空白画布不需要） */
:deep(.cropper-controls) {
  display: none !important;
}
</style>