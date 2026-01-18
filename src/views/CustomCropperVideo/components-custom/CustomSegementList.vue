<template>
    <el-card>
        <template #header>
            <h3>片段列表 (共{{ props.segments.length }}个)</h3>
            <el-button type="primary" @click="copyBatchCmd">复制批量命令</el-button>
        </template>

        <div v-if="props.segments.length === 0" class="no-segment-tip">
            <el-empty description="暂无片段，请点击左侧「标记片段开始/结束」添加"></el-empty>
        </div>

        <div class="segment-item" v-else 
            v-for="(seg, idx) in props.segments" 
            :key="seg.id"
            :class="{ active: props.selectedSegmentId === seg.id }" 
        >

            <p class="segment-item-header">
                <strong>片段 {{ idx + 1 }}</strong>
                <el-button size="small" type="primary" @click="copySingleCmd(seg)">复制命令</el-button>
            </p>
  
            <p class="time-item">
                <label>开始时间：</label>
                <el-input-number v-model="seg.startTime" :min="0" :step="0.1"></el-input-number>
            </p>

            <p class="time-item">
                <label>结束时间：</label>
                <el-input-number v-model="seg.endTime" :min="seg.startTime + 0.01" :step="0.1"></el-input-number>
            </p>

            <p>
                <label>时长：</label>
                <span>{{ formatTime(seg.endTime - seg.startTime) }}</span>
            </p>

            <p>
                <el-switch active-text="裁剪开启" inactive-text="裁剪关闭"
                    v-model="seg.enableCrop" 
                ></el-switch>
            </p>
            <div v-if="seg.enableCrop">
                <p>
                    <label>裁剪宽度 (px)：</label>
                    <el-input-number v-model="seg.cropWidth" :min="1" :step="1"></el-input-number>
                </p>
                <p>
                    <label>裁剪高度 (px)：</label>
                    <el-input-number v-model="seg.cropHeight" :min="1" :step="1"></el-input-number>
                </p>

                <p>
                    <label>X 偏移 (px)：</label>
                    <el-input-number v-model="seg.cropX" :min="0" :step="1"></el-input-number>
                </p>
                
                <p>
                    <label>Y 偏移 (px)：</label>
                    <el-input-number v-model="seg.cropY" :min="0" :step="1"></el-input-number>
                </p>
            </div>
        </div>
    </el-card>

</template>

<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { CopyDocument, DocumentCopy, Delete } from '@element-plus/icons-vue'
import { Segment, VideoDisplayInfo, VideoInfo } from '../types/custom';
import dayjs from 'dayjs';

interface Props {
    segments: Segment[],
    videoInfo: VideoInfo | null,
    selectedSegmentId: string | null,
    videoDisplayInfo: VideoDisplayInfo | null
}

const props = defineProps<Props>()
// 时间格式化
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0秒'
  }

  const totalSeconds = Math.round(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (hours > 0) {
    return `${hours}小时${minutes}分${secs}秒`
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// 命令复制
const copySingleCmd = async (seg:Segment) => {
    const { videoInfo  } = props
    if (!videoInfo) return
    const cmd = generateSingleCmd(seg, videoInfo.filename);
    if (cmd) {
        const success = await copyToClipboard(cmd);
        if (success) {
        ElMessage.success('命令已成功复制到剪贴板！');
        }
    }
};

const copyBatchCmd = async () => {
    const { videoInfo  } = props
    const cmd = generateBatchCmd(props.segments, videoInfo?.filename);
    if (cmd) {
        const success = await copyToClipboard(cmd);
        if (success) {
        ElMessage.success('批量命令已成功复制到剪贴板！');
        }
    }
};

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }


  // 生成单个命令
  const generateSingleCmd = (segment: Segment, filename:string) => {
    const { videoDisplayInfo } = props
    const { id, startTime, endTime, enableCrop, cropWidth, cropHeight, cropX, cropY} = segment 
    const fileExt= 'mp4'
    const dateTimeStr = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const outputFile = `output_${dateTimeStr}_${id}.${fileExt}`;

    let videoFilter = ''
    if (enableCrop) {
      const { scaleRatio, displayX, displayY } = videoDisplayInfo as VideoDisplayInfo
      const width = cropWidth as number / scaleRatio
      const height = cropHeight as number / scaleRatio
      const x = (cropX as number - displayX) / scaleRatio
      const y = (cropY as number - displayY) /scaleRatio
      videoFilter = ` -filter:v "crop=${width}:${height}:${x}:${y}"`
    }

    let cmd = `ffmpeg -ss ${startTime} -to ${endTime} -i "${filename}" ${videoFilter} -c:a copy "${outputFile}"`;
    return cmd;
  };


  // 生成批量任务
  const generateBatchCmd = (segments, filename) => {
    if (!segments.length) return '';
    const fileExt = 'mp4'
    const dateTimeStr = dayjs().format('YYYY-MM-DD HH:mm:ss');


    let filterComplex = '';
    let mapOutputs = '';

    segments.forEach((seg, idx) => {
      const { id, startTime, endTime, enableCrop, cropWidth, cropHeight, cropX, cropY} = seg 

      let videoFilter = `trim=start=${startTime.toFixed(1)}:end=${seg.endTime.toFixed(1)},setpts=PTS-STARTPTS`;
      // 关键：使用原始视频像素的裁剪参数
      if (enableCrop) {
        videoFilter += `,crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`;
      }

      filterComplex += `[0:v]${videoFilter}[v${idx}];[0:a]atrim=start=${startTime.toFixed(1)}:end=${endTime.toFixed(1)},asetpts=PTS-STARTPTS[a${idx}];`;
      const outputFile = `output_${dateTimeStr}_${id}.${fileExt}`;
      mapOutputs += ` -map '[v${idx}]' -map '[a${idx}]' "${outputFile}"`;

    });

    filterComplex = filterComplex.replace(/;$/, '');
    // 修复：移除 -c:v copy，裁剪需要重新编码
    const batchCmd = `ffmpeg -i "${filename}" -filter_complex '${filterComplex}'${mapOutputs} -c:a copy`;

    return batchCmd;
  };


</script>

<style lang="scss" scoped>
    .segment-item {
        border-bottom: 1px solid #dcdfe6;
        padding: 15px 0;
        &.selected, &:hover {
            background: #eee;
        }
    }
    .segment-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
</style>