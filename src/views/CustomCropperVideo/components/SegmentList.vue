<!-- src/components/SegmentList.vue -->
<template>
  <div class="segment-list">
    <div>
      <el-button type="primary" @click="copyBatchCmd">复制批量命令</el-button>
    </div>
    <el-table border :data="props.segments">
      <el-table-column label="ID" prop="id"></el-table-column>

      <el-table-column label="时间">
        <template #default="{row}">
          {{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}
        </template>
      </el-table-column>

      <el-table-column label="时长">
        <template #default="{row}">
          {{ row.duration.toFixed(3) }}s
        </template>
      </el-table-column>

      <el-table-column label="帧数" prop="frames">
        <template #default="{row}">
          {{ row.frames }} frames
        </template>
      </el-table-column>

      <el-table-column label="裁剪">
        <template #default="{row}">
          {{ row.enableCrop ? '是' : '否' }}
        </template>
      </el-table-column>

      <el-table-column label="裁剪坐标">
        <template #default="{row}">
          x:{{ row.cropX }}px / y: {{ row.cropY }}
        </template>
      </el-table-column>

      <el-table-column label="裁剪宽高">
        <template #default="{row}">
          宽:{{ row.cropWidth }}px / 高: {{ row.cropHeight }}
        </template>
      </el-table-column>

      <el-table-column label="大小" prop="size"></el-table-column>

      <el-table-column label="操作" width="200px">
        <template #default="{row}">
          <el-button size="small" type="primary" @click="copySingleCmd(row)">复制命令</el-button>
          <el-button size="small" type="danger" @click="onRemove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { Segment, VideoInfo, VideoDisplayInfo } from '../types/video';
import dayjs from 'dayjs'

interface Props {
  segments: Segment[];
  onRemove: (id: string) => void;
  videoInfo: VideoInfo | null,
  videoDisplayInfo: VideoDisplayInfo
}

const props = defineProps<Props>();

const { videoInfo } = props

// 时间格式化
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}


// 命令复制
const copySingleCmd = async (seg) => {
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
  const generateSingleCmd = (segment, filename) => {
    const { id, startTime, endTime, enableCrop, cropWidth, cropHeight, cropX, cropY} = segment 
    const fileExt= 'mp4'
    const dateTimeStr = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const outputFile = `output_${dateTimeStr}_${id}.${fileExt}`;

    let videoFilter = ''
    if (enableCrop) {
      const { displayWidth, displayHeight, containerWidth, containerHeight, videoX, videoY} = props.videoDisplayInfo
      const width = videoInfo!.width * cropWidth
      const height = videoInfo!.height * cropHeight
      const x = (containerWidth * cropX - videoX) / displayWidth * videoInfo!.width
      const y = (containerHeight * cropY - videoY) / displayHeight * videoInfo!.height
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

<style scoped>
.segment-list {
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  max-height: 300px;
  overflow-y: auto;
}

</style>