<template>

  <el-card style="width: 380px">
    <template #header>
        <h3>片段列表 (共{{ segmentStore.segments.length }}个)</h3>
    </template>

          <div v-if="segmentStore.segments.length === 0" class="no-segment-tip">
            <el-empty description="暂无片段，请点击左侧「标记片段开始/结束」添加"></el-empty>
          </div>

          <el-card
            v-else
            shadow="hover"
            class="segment-item"
            v-for="(seg, idx) in segmentStore.segments"
            :key="idx"
            :class="{ active: segmentStore.selectedSegmentIdx === idx }"
            @click="selectSegment(idx)"
          >
            <div class="segment-info">
              <p>
                <strong>片段 {{ idx + 1 }}</strong>
                <el-switch
                  v-model="seg.enableCrop"
                  active-text="裁剪开启"
                  inactive-text="裁剪关闭"
                  style="margin-left: 10px;"
                ></el-switch>

                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click.stop="deleteSegment(idx)"
                  style="margin-left: 10px;"
                ></el-button>
              </p>
              <div class="time-editors">
                <div class="time-item">
                  <label>开始时间：</label>
                  <el-input-number
                    v-model="seg.startTime"
                    :min="0"
                    :max="seg.endTime ? seg.endTime - 0.1 : videoStore.duration"
                    :step="0.1"
                  ></el-input-number>
                </div>
                <div class="time-item">
                  <label>结束时间：</label>
                  <el-input-number
                    v-model="seg.endTime"
                    :min="seg.startTime + 0.01"
                    :max="videoStore.duration"
                    :step="0.1"
                  ></el-input-number>
                </div>
              </div>

              <div class="crop-size-editor" v-if="seg.enableCrop">
                <h4>画面裁剪尺寸（最大：{{ videoStore.videoWidth }}x{{ videoStore.videoHeight }}）</h4>
                <div class="size-row">
                  <div class="size-item">
                    <label>裁剪宽度 (px)：</label>
                    <el-input-number
                      v-model="seg.cropWidth"
                      :min="1"
                      :max="videoStore.videoWidth"
                      :step="1"
                    ></el-input-number>
                  </div>
                  <div class="size-item">
                    <label>裁剪高度 (px)：</label>
                    <el-input-number
                      v-model="seg.cropHeight"
                      :min="1"
                      :max="videoStore.videoHeight"
                      :step="1"
                    ></el-input-number>
                  </div>
                </div>
                <div class="position-row">
                  <div class="size-item">
                    <label>X 偏移 (px)：</label>
                    <el-input-number
                      v-model="seg.cropX"
                      :min="0"
                      :max="videoStore.videoWidth - (seg.cropWidth || 0)"
                      :step="1"
                    ></el-input-number>
                  </div>
                  <div class="size-item">
                    <label>Y 偏移 (px)：</label>
                    <el-input-number
                      v-model="seg.cropY"
                      :min="0"
                      :max="videoStore.videoHeight - (seg.cropHeight || 0)"
                      :step="1"
                    ></el-input-number>
                  </div>
                </div>
                <div class="size-tips">
                  偏移范围：X(0~{{ videoStore.videoWidth - (seg.cropWidth || 0) }}) Y(0~{{ videoStore.videoHeight - (seg.cropHeight || 0) }})
                </div>
              </div>

              <div class="cmd-generator">
                <el-button 
                  type="info" 
                  :icon="DocumentCopy"
                  @click.stop="copySingleCmd(idx)"
                >复制命令</el-button>

                <div v-if="seg.ffmpegCmd" class="cmd-display">
                  <el-tag type="info">FFmpeg 命令</el-tag>
                  <pre>{{ seg.ffmpegCmd }}</pre>
                </div>
              </div>
            </div>
          </el-card>

          <el-card v-if="segmentStore.segments.length > 0">
            <div class="batch-cmd-header">
              <el-button 
                type="info" 
                :icon="CopyDocument"
                @click="copyBatchCmd"
              >复制批量截取命令</el-button>
            </div>
            <div v-if="segmentStore.batchCmds" class="batch-cmd-display">
              <el-tag type="success">批量截取 FFmpeg 命令</el-tag>
              <pre>{{ segmentStore.batchCmds }}</pre>
            </div>
          </el-card>




    <template #footer>Footer content</template>
  </el-card>

</template>

<script lang="ts" setup>
import { useVideoEditorStore, useSegmentStore } from '@/store/ffmpeg/videoEditor';
import { useVideoStore } from '@/store/ffmpeg/videoStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CopyDocument, DocumentCopy, Delete } from '@element-plus/icons-vue'

const store = useVideoEditorStore();
const segmentStore = useSegmentStore()
const videoStore= useVideoStore()


const selectSegment = (idx: number) => {
  segmentStore.selectSegment(idx);
  const seg = segmentStore.segments[idx];
//   videoRef.value.currentTime = seg.startTime;
  videoStore.currentTime = seg.startTime;
  ElMessage.info(`已选中片段 ${idx + 1}，视频已跳转到片段开始位置`);
};


const deleteSegment = async (idx: number) => {
  const confirm = await ElMessageBox.confirm('确定删除该片段吗？', '提示', {
    type: 'warning',
  });
  if (confirm) {
    segmentStore.deleteSegment(idx);
    ElMessage.success('片段已删除');
  }
};


// 命令复制
const copySingleCmd = async (idx: number) => {
  const cmd = segmentStore.generateSingleCmd(idx);
  if (cmd) {
    const success = await store.copyToClipboard(cmd);
    if (success) {
      ElMessage.success('命令已成功复制到剪贴板！');
    }
  }
};

const copyBatchCmd = async () => {
  const cmd = segmentStore.generateBatchCmd();
  if (cmd) {
    const success = await store.copyToClipboard(cmd);
    if (success) {
      ElMessage.success('批量命令已成功复制到剪贴板！');
    }
  }
};

</script>