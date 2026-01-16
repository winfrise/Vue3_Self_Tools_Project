<template>
  <div class="timeline-container">
    <!-- 时间轴 -->
    <div ref="timelineRef" class="timeline" @click="jumpToTime">
      <div class="track">
        <!-- 播放进度 -->
        <div class="progress" :style="{ width: `${(currentTime / totalDuration) * 100}%` }"></div>

        <!-- 点击跳转指示线 -->
        <div v-if="currentTime !== null" class="indicator-line" :style="{ left: timeToPercent(currentTime) }">

        </div>

        <!-- 片断临时开始标记 -->
        <div v-if="tempStart !== null" class="temp-start-marker" :style="{ left: timeToPercent(tempStart) }"></div>

        <!-- 已保存片段 -->
        <div v-for="seg in segments" :key="seg.id" class="segment" :class="{ 'selected': seg.id === selectedSegmentId }"
          :style="{ left: timeToPercent(seg.startTime), width: `${(seg.duration / totalDuration) * 100}%` }"
          @click="selectedSegment = seg"
        >
          <span class="label">{{ formatTime(seg.startTime) }} - {{ formatTime(seg.endTime) }}</span>
          
          <!-- 删除按钮 -->
          <button class="remove-btn" @click.stop="removeSegment(seg.id)">×</button>            ✏️


          <!-- 左右 resize 手柄（仅在编辑状态显示） -->
          <template v-if="seg.id === editingSegmentId">
            <div 
              class="resize-handle left" 
              @mousedown.stop="startResize(seg, 'start', $event)"
            ></div>
            <div 
              class="resize-handle right" 
              @mousedown.stop="startResize(seg, 'end', $event)"
            ></div>
            
            <!-- 整体拖动区域（覆盖整个 segment） -->
            <div 
              class="drag-overlay" 
              @mousedown.stop="startDrag(seg, $event)"
            ></div>
          </template>

        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 选中片段信息 -->
      <div class="selected-info">
        <template v-if="selectedSegment">
          选中: <strong>{{ selectedSegment.id }} </strong>
          <el-divider direction="vertical" />
          [ {{ formatTime(selectedSegment.startTime) }} → {{ formatTime(selectedSegment.endTime) }} ] 
        </template>
        <span v-else>未选中任何片段</span>

        <div class="selected-tools">
          <el-button type="info" :disabled="!selectedSegment" @click="goToSegmentStart">
            跳转到选中片段开始
          </el-button>
          <el-button type="info" :disabled="!selectedSegment" @click="goToSegmentEnd">
            跳转到选中片段结束
          </el-button>

          <el-switch v-if="selectedSegment"
            v-model="selectedSegment!.enableCrop"
        
            active-text="裁剪开启"
            inactive-text="裁剪关闭"
          ></el-switch>

          <el-divider direction="vertical" />

          <el-button type="danger" @click="cancelSelectedSegment">取消选中</el-button>

          <el-button :disabled="!selectedSegment"
            @click="toggleEdit(selectedSegment!.id)"
          >{{ editingSegmentId ? '取消调整' : '调整' }}</el-button>
        </div>
      </div>

      <!-- 时间轴控制按钮 -->
      <div class="video-controls">
        <el-button type="info" @click="goToStart">回到最开始</el-button>
        <el-button type="info" @click="goBackFrame">⏪前一帧</el-button>
        <el-button type="info" @click="togglePlayPause">
          {{ isPlaying ? '暂停⏸️' : '播放▶️' }}
        </el-button>
        <el-button type="info" @click="goForwardFrame">后一帧⏩</el-button>
        <el-button type="info" @click="goToEnd">回到最末尾</el-button>
      </div>

      <!-- 标记工具 -->
      <div class="marking-tools">
        <div class="temp-info">
          <span v-if="tempStart !== null">
            🟢 开始时间: {{ formatTime(tempStart) }}
          </span>
          <span v-else>⏳ 请点击“标记开始时间”</span>
        </div>
        <div class="buttons">
          <el-button type="primary" :disabled="currentTime < 0 || currentTime > totalDuration"
            @click="setStartTime">
            标记开始时间
          </el-button>
          <el-button type="success" :disabled="tempStart === null || currentTime <= (tempStart || 0)"
            @click="setEndTime">
            标记结束时间
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Segment, VideoInfo } from '../types/video';

interface Props {
  videoInfo: VideoInfo | null;
  segments: Segment[];
  currentTime: number;
  onSegmentChange: (segments: Segment[]) => void;
  onCurrentTimeChange: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  selectedSegment: Segment | undefined
}

const props = defineProps<Props>();
const emit = defineEmits(['update:selectedSegment'])

const timelineRef = ref<HTMLDivElement | null>(null);
const tempStart = ref<number | null>(null); // 入点
const clickPosition = ref<number | null>(null); // 点击跳转位置


const totalDuration = computed(() => props.videoInfo?.duration || 0);

const selectedSegment = computed({
  get() {
    return props.selectedSegment
  },
  set(seg) {
    emit('update:selectedSegment', seg)
  }
})

const selectedSegmentId = computed(() => {
  return selectedSegment.value?.id
})

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 点击时间轴：跳转 + 显示指示线
const jumpToTime = (e: MouseEvent) => {
  if ((e.target as HTMLDivElement).className === 'track') {
    cancelSelectedSegment()
  }

  const rect = timelineRef.value?.getBoundingClientRect();
  if (!rect || totalDuration.value <= 0) return;

  // 暂停播放
  if (props.isPlaying) {
    props.onPause();
  }

  const x = e.clientX - rect.left;
  const percent = Math.max(0, Math.min(1, x / rect.width));
  const targetTime = percent * totalDuration.value;

  props.onCurrentTimeChange(targetTime);
  clickPosition.value = targetTime;
};

// 取消选中的片断
const cancelSelectedSegment = () => {
  selectedSegment.value = undefined
}

const setStartTime = () => {
  if (props.currentTime >= 0 && props.currentTime <= totalDuration.value) {
    tempStart.value = props.currentTime;
  }
};

const setEndTime = () => {
  if (tempStart.value === null) {
    alert('请先标记开始时间！');
    return;
  }

  const end = props.currentTime;
  if (end <= tempStart.value) {
    alert('结束时间必须大于开始时间！');
    return;
  }

  const newSegment: Segment = {
    id: `seg-${Date.now()}`,
    startTime: tempStart.value,
    endTime: end,
    duration: end - tempStart.value,
    frames: Math.round((end - tempStart.value) * 30),
    size: '~' + ((end - tempStart.value) * 100).toFixed(0) + 'KB'
  };

  const updatedSegments = [...props.segments, newSegment];
  props.onSegmentChange(updatedSegments);
  tempStart.value = null;
};

const removeSegment = (id: string) => {
  const filtered = props.segments.filter(seg => seg.id !== id);
  props.onSegmentChange(filtered);
  if (selectedSegmentId.value === id) cancelSelectedSegment()
};

const timeToPercent = (time: number): string => {
  if (totalDuration.value <= 0) return '0%';
  return `${Math.max(0, Math.min(100, (time / totalDuration.value) * 100))}%`;
};

// 新增：控制函数
const goToStart = () => props.onCurrentTimeChange(0);
const goToEnd = () => props.onCurrentTimeChange(totalDuration.value);
const goToSegmentStart = () => {
  if (selectedSegment.value) {
    props.onCurrentTimeChange(selectedSegment.value.startTime);
  }
};
const goToSegmentEnd = () => {
  if (selectedSegment.value) {
    props.onCurrentTimeChange(selectedSegment.value.endTime);
  }
};
const togglePlayPause = () => {
  if (props.isPlaying) {
    props.onPause();
  } else {
    props.onPlay();
  }
};
const goBackFrame = () => {
  // 假设 30fps
  const frameDuration = 1 / 30;
  const newTime = Math.max(0, props.currentTime - frameDuration);
  props.onCurrentTimeChange(newTime);
};
const goForwardFrame = () => {
  // 假设 30fps
  const frameDuration = 1 / 30;
  const newTime = Math.min(totalDuration.value, props.currentTime + frameDuration);
  props.onCurrentTimeChange(newTime);
};

// 新增状态
const editingSegmentId = ref<string | null>(null);

// 处理 segment 点击（避免与 edit 按钮冲突）
const handleSegmentClick = (seg: Segment, e: MouseEvent) => {
  // 如果点击的是 edit/remove 按钮，不触发选中
  const target = e.target as HTMLElement;
  if (target.classList.contains('edit-btn') || target.classList.contains('remove-btn')) {
    return;
  }
  selectedSegment.value = seg;
};

// 切换编辑模式
const toggleEdit = (id: string) => {
  if (editingSegmentId.value === id) {
    editingSegmentId.value = null; // 退出编辑
  } else {
    editingSegmentId.value = id;   // 进入编辑
  }
};

// ===== 拖拽调整起止时间（已有逻辑，略作优化）=====
const resizingSegment = ref<{ id: string; type: 'start' | 'end' } | null>(null);
const initialX = ref(0);
const initialTime = ref(0);

const startResize = (seg: Segment, type: 'start' | 'end', e: MouseEvent) => {
  e.preventDefault();
  resizingSegment.value = { id: seg.id, type };
  initialX.value = e.clientX;
  initialTime.value = type === 'start' ? seg.startTime : seg.endTime;

  window.addEventListener('mousemove', onResize);
  window.addEventListener('mouseup', stopResize);
};

const onResize = (e: MouseEvent) => {
  if (!resizingSegment.value || !timelineRef.value || totalDuration.value <= 0) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const deltaX = e.clientX - initialX.value;
  const deltaPercent = deltaX / rect.width;
  const deltaTime = deltaPercent * totalDuration.value;
  let newTime = initialTime.value + deltaTime;

  newTime = Math.max(0, Math.min(totalDuration.value, newTime));

  const segId = resizingSegment.value.id;
  const seg = props.segments.find(s => s.id === segId);
  if (!seg) return;

  let updatedSeg: Segment;
  if (resizingSegment.value.type === 'start') {
    const newStart = Math.min(newTime, seg.endTime - 0.01);
    updatedSeg = { ...seg, startTime: newStart, duration: seg.endTime - newStart };
  } else {
    const newEnd = Math.max(newTime, seg.startTime + 0.01);
    updatedSeg = { ...seg, endTime: newEnd, duration: newEnd - seg.startTime };
  }

  const updatedSegments = props.segments.map(s =>
    s.id === segId ? updatedSeg : s
  );
  props.onSegmentChange(updatedSegments);
};

const stopResize = () => {
  resizingSegment.value = null;
  window.removeEventListener('mousemove', onResize);
  window.removeEventListener('mouseup', stopResize);
};

// ===== 新增：整体拖动逻辑 =====
const draggingSegment = ref<string | null>(null);
const dragOffset = ref(0); // 鼠标相对于 segment 左边缘的偏移（百分比）

const startDrag = (seg: Segment, e: MouseEvent) => {
  e.preventDefault();
  draggingSegment.value = seg.id;

  const rect = timelineRef.value?.getBoundingClientRect();
  if (!rect) return;

  const segmentLeftPx = (seg.startTime / totalDuration.value) * rect.width;
  const mouseInTimeline = e.clientX - rect.left;
  dragOffset.value = (mouseInTimeline - segmentLeftPx) / rect.width; // 相对位置 [0~1]

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
};

const onDrag = (e: MouseEvent) => {
  if (!draggingSegment.value || !timelineRef.value || totalDuration.value <= 0) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const mouseInTimeline = e.clientX - rect.left;
  const percent = (mouseInTimeline / rect.width) - dragOffset.value;
  const newStartTime = Math.max(0, Math.min(totalDuration.value - 0.01, percent * totalDuration.value));
  const newEndTime = newStartTime + props.segments.find(s => s.id === draggingSegment.value)!.duration;

  // 边界：不能超出 [0, totalDuration]
  if (newEndTime > totalDuration.value) {
    const overflow = newEndTime - totalDuration.value;
    const finalStartTime = newStartTime - overflow;
    updateSegmentPosition(draggingSegment.value, finalStartTime);
  } else {
    updateSegmentPosition(draggingSegment.value, newStartTime);
  }
};

const updateSegmentPosition = (id: string, newStartTime: number) => {
  const seg = props.segments.find(s => s.id === id);
  if (!seg) return;

  const newSeg = {
    ...seg,
    startTime: newStartTime,
    endTime: newStartTime + seg.duration
  };

  const updatedSegments = props.segments.map(s =>
    s.id === id ? newSeg : s
  );
  props.onSegmentChange(updatedSegments);
};

const stopDrag = () => {
  draggingSegment.value = null;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
};
</script>

<style lang="scss" scoped>
.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: visible;
}

.timeline {
  height: 60px;
  background-color: #1f2937;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  overflow: visible;
}

// 进度轨道
.track {
  position: relative;
  height: 100%;
  width: 100%;
  .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: rgba(67, 68, 70, 0.8);
    z-index: 1;
  }


  // 标记线
  .indicator-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: #9ca3af;
    z-index: 5;
    &::before, &::after {
      content: '';
      position: absolute;
      left: 50%;
      width: 0;
      height: 0;
      transform: translate(-50%, 0);
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
    }


    &::before {
      top: -0;
      border-top: 8px solid #9ca3af;
    }

    &::after {
      bottom: -0;
      border-bottom: 8px solid #9ca3af;
    }

  }
}


.temp-start-marker {
  position: absolute;
  top: 0;
  height: 100%;
  width: 1px;
  background-color: #4ade80;
  z-index: 6;

  &::before, &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 10px;
    height: 1px;
    background-color: #4ade80;
  }
  &::before {
    top: 0;
  }
  &::after {
    bottom: 0;
  }
}


.segment {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: rgba(59, 130, 246, 0.2);
  border: 1px solid #3b82f6;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  padding: 0 4px;
  box-sizing: border-box;
  z-index: 2;
  cursor: pointer;

  &:hover,
  &.selected {
    background-color: rgba(59, 130, 246, 0.4);
    border-color: #1d4ed8;
  }

  // 调整按钮
  .edit-btn {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 16px;
    height: 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
  }

  // 编辑状态下的手柄
  &.editing {
    .resize-handle {
      opacity: 1 !important;
    }
  }

  // Resize 手柄（默认隐藏）
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

  // 拖动覆盖层（透明但可捕获事件）
  .drag-overlay {
    position: absolute;
    top: 0;
    left: 6px;   // 避开左右手柄
    right: 6px;
    bottom: 0;
    cursor: grab;
    z-index: 9;
  }

  &:active .drag-overlay {
    cursor: grabbing;
  }
}



.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.selected-info {
  font-size: 12px;
  color: #4b5563;
  .selected-tools{
    display: flex;
    align-items: center;
    gap: 6px;
  }

}

.btn-clear {
  margin-left: 8px;
  padding: 2px 6px;
  font-size: 10px;
  background: #d1d5db;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.video-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.divider {
  height: 24px;
  width: 1px;
  background-color: #d1d5db;
}

.btn {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


.btn-play {
  width: 40px;
  height: 32px;
  font-size: 16px;
  background-color: #10b981;
  color: white;
}

.marking-tools {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.temp-info {
  font-size: 12px;
  color: #4b5563;
}

.marking-tools .buttons {
  display: flex;
  gap: 8px;
}

.btn-start {
  background-color: #10b981;
  color: white;
}

.btn-end {
  background-color: #8b5cf6;
  color: white;
}
</style>