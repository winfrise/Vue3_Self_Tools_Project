<template>
  <div
    ref="containerRef"
    class="zoom-container"
    @wheel.prevent="handleWheel"
    @mousedown="handleMouseDown"
  >
    <div
      ref="contentRef"
      class="zoom-content"
      :style="{
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transformOrigin: '0 0',
      }"
    >
      <!-- 你的内容放在这里 -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 状态
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)

// refs
const containerRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)

// 鼠标拖拽相关
let isDragging = false
let lastX = 0
let lastY = 0

// 滚轮缩放
const ZOOM_FACTOR = 0.1
const MIN_SCALE = 0.2
const MAX_SCALE = 5

function handleWheel(e: WheelEvent) {
  if (!containerRef.value || !contentRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()
  // 获取鼠标相对于容器的位置（作为缩放中心）
  const mouseX = e.clientX - containerRect.left
  const mouseY = e.clientY - containerRect.top

  // 计算当前缩放中心在内容坐标系中的位置（考虑当前平移和缩放）
  const contentCenterX = (mouseX - translateX.value) / scale.value
  const contentCenterY = (mouseY - translateY.value) / scale.value

  // 计算新缩放值
  const delta = e.deltaY > 0 ? -ZOOM_FACTOR : ZOOM_FACTOR
  const newScale = Math.min(Math.max(scale.value + delta, MIN_SCALE), MAX_SCALE)

  // 根据新的缩放值，重新计算平移量，使得缩放中心不变
  const newTranslateX = mouseX - contentCenterX * newScale
  const newTranslateY = mouseY - contentCenterY * newScale

  scale.value = newScale
  translateX.value = newTranslateX
  translateY.value = newTranslateY
}

// 鼠标拖拽
function handleMouseDown(e: MouseEvent) {
  if (!containerRef.value) return

  isDragging = true
  lastX = e.clientX
  lastY = e.clientY

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isDragging) return

    const dx = moveEvent.clientX - lastX
    const dy = moveEvent.clientY - lastY

    translateX.value += dx
    translateY.value += dy

    lastX = moveEvent.clientX
    lastY = moveEvent.clientY
  }

  const onMouseUp = () => {
    isDragging = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.zoom-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;
  cursor: grab;
  background: black;
}

.zoom-container:active {
  cursor: grabbing;
}

.zoom-content {
  position: absolute;
  top: 0;
  left: 0;
  transition: none; /* 可选：关闭过渡动画 */
  transform-origin: 0 0;
  width: 100%;
  height: 100%;
  background: green;
}
</style>