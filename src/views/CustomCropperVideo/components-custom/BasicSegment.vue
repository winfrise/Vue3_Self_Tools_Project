<template>
  <div
    class="segment"
    :style="{
      left: `${offsetX}%`,
      width: `${offsetWidth}%`
    }"
  >
    <div class="label">{{ props.seg.startTime.toFixed(3) }}~{{ props.seg.endTime.toFixed(3) }}</div>
    <div class="duration">{{ (props.seg.endTime - props.seg.startTime).toFixed(3) }}s</div>

    <div class="resize-handle left" @mousedown.stop="startResize('start', $event)"></div>
    <div class="resize-handle right" @mousedown.stop="startResize('end', $event)"></div>
    <div class="drag-overlay" @mousedown.stop="startDrag($event)"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Segment } from '../types/custom'

interface Props {
  duration: number
  seg: Segment
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:seg', seg: Segment): void
}>()

const MIN_DURATION = 0.1 // 最小片段时长（秒）

const offsetX = computed(() => (props.seg.startTime / props.duration) * 100)
const offsetWidth = computed(() => ((props.seg.endTime - props.seg.startTime) / props.duration) * 100)

// 获取进度条容器宽度（像素）
const getContainerWidth = (): number => {
  const container = document.querySelector('.progress') as HTMLElement | null
  return container?.clientWidth || 1
}

let startX = 0
let initialStart = 0
let initialEnd = 0

// === 整体拖动 ===
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  startX = e.clientX
  initialStart = props.seg.startTime
  initialEnd = props.seg.endTime

  const onMouseMove = (ev: MouseEvent) => {
    const deltaX = ev.clientX - startX
    const deltaSeconds = (deltaX / getContainerWidth()) * props.duration

    let newStart = initialStart + deltaSeconds
    let newEnd = initialEnd + deltaSeconds

    // 边界限制
    if (newStart < 0) {
      const overflow = 0 - newStart
      newStart = 0
      newEnd = Math.min(props.duration, newEnd + overflow)
    } else if (newEnd > props.duration) {
      const overflow = newEnd - props.duration
      newEnd = props.duration
      newStart = Math.max(0, newStart - overflow)
    }

    emitValidSegment(newStart, newEnd)
  }

  cleanupOnMouseUp(onMouseMove)
}

// === 调整起止时间 ===
const startResize = (type: 'start' | 'end', e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  startX = e.clientX
  initialStart = props.seg.startTime
  initialEnd = props.seg.endTime

  const onMouseMove = (ev: MouseEvent) => {
    const deltaX = ev.clientX - startX
    const deltaSeconds = (deltaX / getContainerWidth()) * props.duration

    let newStart = initialStart
    let newEnd = initialEnd

    if (type === 'start') {
      newStart = initialStart + deltaSeconds
      // 不能超过 end - min
      newStart = Math.min(newStart, newEnd - MIN_DURATION)
      // 不能小于 0
      newStart = Math.max(0, newStart)
    } else {
      newEnd = initialEnd + deltaSeconds
      // 不能小于 start + min
      newEnd = Math.max(newEnd, newStart + MIN_DURATION)
      // 不能大于总时长
      newEnd = Math.min(props.duration, newEnd)
    }

    emitValidSegment(newStart, newEnd)
  }

  cleanupOnMouseUp(onMouseMove)
}

// === 发出合法的 Segment（带精度处理）===
const emitValidSegment = (startTime: number, endTime: number) => {
  // 确保顺序正确（防浮点误差）
  if (startTime >= endTime) {
    startTime = Math.max(0, endTime - MIN_DURATION)
  }

  const newSeg: Segment = {
    ...props.seg,
    startTime: parseFloat(startTime.toFixed(3)),
    endTime: parseFloat(endTime.toFixed(3))
  }
  emit('update:seg', newSeg)
}

// === 统一注册/注销事件 ===
const cleanupOnMouseUp = (moveHandler: (e: MouseEvent) => void) => {
  const upHandler = () => {
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
  }
  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
}
</script>

<style lang="scss" scoped>
/* 你的样式保持不变 */
.segment {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 4px;
  box-sizing: border-box;
  background-color: rgba(59, 130, 246, 0.2);
  border: 1px solid #3b82f6;
  border-radius: 2px;
  font-size: 10px;
  color: white;
  z-index: 2;
  cursor: pointer;

  &:hover {
    background-color: rgba(59, 130, 246, 0.4);
    border-color: #1d4ed8;
  }
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;

  &.left {
    left: -3px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent);
  }
  &.right {
    right: -3px;
    background: linear-gradient(to left, transparent, rgba(255,255,255,0.7), transparent);
  }
}

.segment:hover .resize-handle {
  opacity: 1;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 6px;
  right: 6px;
  bottom: 0;
  cursor: grab;
  z-index: 9;
  &:active {
    cursor: grabbing;
  }
}
</style>