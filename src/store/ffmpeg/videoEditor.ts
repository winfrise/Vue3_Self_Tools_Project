// src/stores/videoEditor.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Segment {
  id: string;
  startTime: number;
  endTime: number;
  enableCrop: boolean;
  cropWidth: number; // 原始视频像素宽度
  cropHeight: number; // 原始视频像素高度
  cropX: number; // 原始视频像素X偏移
  cropY: number; // 原始视频像素Y偏移
  ffmpegCmd: string;
}

// ========== 升级：时间戳转"xxxx年xx月xx日xx时xx分xx秒"格式 ==========
const formatTimestampToDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}年${month}月${day}日${hour}时${minute}分${second}秒`;
};

export const useVideoEditorStore = defineStore('videoEditor', () => {
  // 基础状态
  const videoFile = ref<File | null>(null);
  const videoUrl = ref('');
  const videoDuration = ref(0);
  const videoWidth = ref(0); // 视频原始宽度
  const videoHeight = ref(0); // 视频原始高度
  const videoAspectRatio = computed(() => {
    return videoWidth.value / videoHeight.value || 1;
  });
  const currentTime = ref(0);
  const originalFileName = ref('');
  const originalFileExt = ref('mp4');

  // 片段管理
  const segments = ref<Segment[]>([]);
  const selectedSegmentIdx = ref(-1);
  const currentSegmentStart = ref(0);

  // 裁剪框状态（基于显示容器的像素）
  const cropBoxX = ref(0); // 显示容器中的X
  const cropBoxY = ref(0); // 显示容器中的Y
  const cropBoxWidth = ref(0); // 显示容器中的宽度
  const cropBoxHeight = ref(0); // 显示容器中的高度
  // 视频在容器中的实际显示尺寸（关键：用于比例转换）
  const videoDisplayWidth = ref(0); // 视频实际显示宽度
  const videoDisplayHeight = ref(0); // 视频实际显示高度

  const batchCmds = ref('');

  // 计算属性
  const playProgressPercent = computed(() => {
    console.log(currentTime.value, videoDuration.value)
    return videoDuration.value ? (currentTime.value / videoDuration.value) * 100 : 0;
  });


  // ========== 新增：完整重置功能（回到初始状态） ==========
  const fullReset = () => {
    // 清空视频相关
    videoFile.value = null;
    videoUrl.value = '';
    videoDuration.value = 0;
    videoWidth.value = 0;
    videoHeight.value = 0;
    currentTime.value = 0;
    originalFileName.value = '';
    originalFileExt.value = 'mp4';

    // 清空片段相关
    segments.value = [];
    selectedSegmentIdx.value = -1;
    currentSegmentStart.value = 0;

    // 清空裁剪相关
    cropBoxX.value = 0;
    cropBoxY.value = 0;
    cropBoxWidth.value = 0;
    cropBoxHeight.value = 0;
    videoDisplayWidth.value = 0;
    videoDisplayHeight.value = 0;

    // 清空命令
    batchCmds.value = '';

    // 释放视频URL
    if (videoUrl.value) {
      URL.revokeObjectURL(videoUrl.value);
    }
  };

  // 核心：更新视频显示尺寸（适配宽高比）
  const updateVideoDisplaySize = (containerWidth: number, containerHeight: number) => {
    if (!videoWidth.value || !videoHeight.value) return;

    // 计算容器与视频的比例，保持宽高比
    const containerRatio = containerWidth / containerHeight;
    const videoRatio = videoAspectRatio.value;

    let displayWidth, displayHeight;
    if (containerRatio > videoRatio) {
      // 容器更宽，高度填满，宽度自适应
      displayHeight = containerHeight;
      displayWidth = containerHeight * videoRatio;
    } else {
      // 容器更高，宽度填满，高度自适应
      displayWidth = containerWidth;
      displayHeight = containerWidth / videoRatio;
    }

    // 修正显示尺寸（取整）
    videoDisplayWidth.value = Math.floor(displayWidth);
    videoDisplayHeight.value = Math.floor(displayHeight);

    // 同步裁剪框到显示尺寸
    if (selectedSegmentIdx.value !== -1) {
      // syncCropBoxFromSegment(selectedSegmentIdx.value);
    }
  };



  // 更新视频元数据（原始尺寸）
  const updateVideoMetadata = (duration: number, width: number, height: number) => {
    videoDuration.value = duration;
    videoWidth.value = width;
    videoHeight.value = height;
    // segments.value.forEach((_, idx) => validateCropParams(idx));
  };







  const deleteSegment = (idx: number) => {
    if (idx < 0 || idx >= segments.value.length) return;
    segments.value.splice(idx, 1);
    if (selectedSegmentIdx.value === idx) {
      selectedSegmentIdx.value = segments.value.length > 0 ? 0 : -1;
    } else if (selectedSegmentIdx.value > idx) {
      selectedSegmentIdx.value -= 1;
    }
  };

  const clearSegments = () => {
    segments.value = [];
    selectedSegmentIdx.value = -1;
    batchCmds.value = '';
  };

  // const validateSegment = (idx: number) => {
  //   const seg = segments.value[idx];
  //   if (!seg) return;
  //   if (seg.startTime >= seg.endTime) {
  //     seg.endTime = seg.startTime + 0.1;
  //   }
  //   if (seg.endTime > videoDuration.value) {
  //     seg.endTime = videoDuration.value;
  //   }
  // };



  // 验证裁剪参数（基于原始尺寸）
  // const validateCropParams = (idx: number) => {
  //   const seg = segments.value[idx];
  //   if (!seg || !seg.enableCrop) return;

  //   // 限制裁剪尺寸不超过原始视频尺寸
  //   seg.cropWidth = Math.min(Math.max(1, seg.cropWidth), videoWidth.value);
  //   seg.cropHeight = Math.min(Math.max(1, seg.cropHeight), videoHeight.value);
    
  //   // 限制偏移不超过 原始尺寸 - 裁剪尺寸
  //   seg.cropX = Math.min(Math.max(0, seg.cropX), videoWidth.value - seg.cropWidth);
  //   seg.cropY = Math.min(Math.max(0, seg.cropY), videoHeight.value - seg.cropHeight);
  // };

  // 从片段同步裁剪框（原始→显示尺寸）
  // const syncCropBoxFromSegment = (idx: number) => {
  //   const seg = segments.value[idx];
  //   if (!seg || !seg.enableCrop || !videoDisplayWidth.value || !videoDisplayHeight.value) {
  //     cropBoxX.value = 0;
  //     cropBoxY.value = 0;
  //     cropBoxWidth.value = 0;
  //     cropBoxHeight.value = 0;
  //     return;
  //   }

  //   // 计算原始→显示的缩放比例
  //   const scaleX = videoDisplayWidth.value / videoWidth.value;
  //   const scaleY = videoDisplayHeight.value / videoHeight.value;

  //   // 转换原始像素到显示像素
  //   cropBoxX.value = seg.cropX * scaleX;
  //   cropBoxY.value = seg.cropY * scaleY;
  //   cropBoxWidth.value = seg.cropWidth * scaleX;
  //   cropBoxHeight.value = seg.cropHeight * scaleY;
  // };

  // 从裁剪框同步到片段（显示→原始尺寸）
  // const syncSegmentFromCropBox = () => {
  //   if (selectedSegmentIdx.value === -1 || !videoDisplayWidth.value || !videoDisplayHeight.value) return;

  //   const seg = segments.value[selectedSegmentIdx.value];
  //   if (!seg.enableCrop) return;

  //   // 计算显示→原始的缩放比例
  //   const scaleX = videoWidth.value / videoDisplayWidth.value;
  //   const scaleY = videoHeight.value / videoDisplayHeight.value;

  //   // 转换显示像素到原始像素（取整，避免小数）
  //   seg.cropX = Math.round(cropBoxX.value * scaleX);
  //   seg.cropY = Math.round(cropBoxY.value * scaleY);
  //   seg.cropWidth = Math.round(cropBoxWidth.value * scaleX);
  //   seg.cropHeight = Math.round(cropBoxHeight.value * scaleY);

  //   // 验证参数，确保不超出范围
  //   validateCropParams(selectedSegmentIdx.value);
  // };

  // ========== 升级：生成单个片段命令（时间戳含时分秒） ==========
  // const generateSingleCmd = (idx: number) => {
  //   const seg = segments.value[idx];
  //   if (!seg || !videoFile.value) return '';

  //   // 生成命令前再次验证裁剪参数
  //   validateCropParams(idx);

  //   const inputFile = `${originalFileName.value}.${originalFileExt.value}`;
  //   const timestamp = Date.now();
  //   // 使用升级后的时间格式：xxxx年xx月xx日xx时xx分xx秒
  //   const dateTimeStr = formatTimestampToDateTime(timestamp);
  //   const outputFile = `output_${dateTimeStr}_segment${idx + 1}.${originalFileExt.value}`;

  //   let cmd = '';
  //   if (seg.enableCrop) {
  //     // 关键：使用原始视频像素的裁剪参数
  //     cmd = `ffmpeg -ss ${seg.startTime.toFixed(1)} -to ${seg.endTime.toFixed(1)} -i "${inputFile}" -filter:v "crop=${seg.cropWidth}:${seg.cropHeight}:${seg.cropX}:${seg.cropY}" -c:a copy "${outputFile}"`;
  //   } else {
  //     cmd = `ffmpeg -ss ${seg.startTime.toFixed(1)} -to ${seg.endTime.toFixed(1)} -i "${inputFile}" -c:v copy -c:a copy "${outputFile}"`;
  //   }

  //   seg.ffmpegCmd = cmd;
  //   return cmd;
  // };



  // 工具方法
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
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
  };

  return {
    // 状态
    videoFile,
    videoUrl,
    videoDuration,
    videoWidth,
    videoHeight,
    videoAspectRatio,
    videoDisplayWidth,
    videoDisplayHeight,
    currentTime,
    originalFileName,
    originalFileExt,
    segments,
    selectedSegmentIdx,
    currentSegmentStart,
    cropBoxX,
    cropBoxY,
    cropBoxWidth,
    cropBoxHeight,
    batchCmds,

    // 计算属性
    playProgressPercent,

    fullReset, // 新增：完整重置
    updateVideoMetadata,
    updateVideoDisplaySize,
    deleteSegment,
    clearSegments,
    // validateSegment,
    // toggleCropSwitch,
    // validateCropParams,
    // syncCropBoxFromSegment,
    // syncSegmentFromCropBox,
    formatTime,
    copyToClipboard
  };
});


export const useSegmentStore = defineStore('segment', () => {
    // 片段管理
  const segments = ref<Segment[]>([]);
  const selectedSegmentIdx = ref<number>(-1);
  const isMarking = ref<boolean>(false)

  const originalFileName = ref('test-xxx.mp4');
  const originalFileExt = ref('mp4');

  const batchCmds = ref(''); // 批量下载命令

  const selectedSegment = computed(() => {
    return segments.value[selectedSegmentIdx.value]
  })


  // 片段开始时间
  const markSegmentStart = (startTime : number) => {
    if (isMarking.value) {
      segments.value[selectedSegmentIdx.value].startTime = startTime
    } else {
      isMarking.value = true
      segments.value.push({
        id: Date.now() + '-' + Math.random().toString(36).slice(2),
        startTime,
        endTime: startTime + 1,
        enableCrop: false,
        cropWidth: 1,
        cropHeight: 1,
        cropX: 0,
        cropY: 0,
        ffmpegCmd: '',
      })
      selectedSegmentIdx.value = segments.value.length - 1;
      console.log(segments.value[0].startTime)
    }
  }

  // 片断结束时间
  const markSegmentEnd = (endTime: number) => {
    segments.value[selectedSegmentIdx.value].endTime = endTime
    isMarking.value = false
    console.log(segments.value)
  }

  // 选择片熂
  const selectSegment = (idx: number) => {
    if (idx < 0 || idx >= segments.value.length) return;
    selectedSegmentIdx.value = idx;
  };

  const deleteSegment = (idx: number) => {
    if (idx < 0 || idx >= segments.value.length) return;
    segments.value.splice(idx, 1);
    if (selectedSegmentIdx.value === idx) {
      selectedSegmentIdx.value = segments.value.length > 0 ? 0 : -1;
    } else if (selectedSegmentIdx.value > idx) {
      selectedSegmentIdx.value -= 1;
    }
  };

  // 清空片熂
  const clearSegments = () => {
    segments.value = [];
    selectedSegmentIdx.value = -1;
    batchCmds.value = '';
  };

  const toggleCropSwitch = (idx: number, enable: boolean) => {
    const seg = segments.value[idx];
    if (!seg) return;

    // validateCropParams(idx);
    if (selectedSegmentIdx.value === idx) {
      // syncCropBoxFromSegment(idx);
    }
  };

  // 生成单个命令
  const generateSingleCmd = (idx: number) => {
    const seg = segments.value[idx];
    if (!seg || !seg.endTime) return '';


    const inputFile = `${originalFileName.value}.${originalFileExt.value}`;
    const timestamp = Date.now();
    // 使用升级后的时间格式：xxxx年xx月xx日xx时xx分xx秒
    const dateTimeStr = formatTimestampToDateTime(timestamp);
    const outputFile = `output_${dateTimeStr}_segment${idx + 1}.${originalFileExt.value}`;

    let cmd = '';
    if (seg.enableCrop) {
      // 关键：使用原始视频像素的裁剪参数
      cmd = `ffmpeg -ss ${seg.startTime.toFixed(1)} -to ${seg.endTime.toFixed(1)} -i "${inputFile}" -filter:v "crop=${seg.cropWidth}:${seg.cropHeight}:${seg.cropX}:${seg.cropY}" -c:a copy "${outputFile}"`;
    } else {
      cmd = `ffmpeg -ss ${seg.startTime.toFixed(1)} -to ${seg.endTime.toFixed(1)} -i "${inputFile}" -c:v copy -c:a copy "${outputFile}"`;
    }

    seg.ffmpegCmd = cmd;
    return cmd;
  };


  // 生成批量任务
  const generateBatchCmd = () => {
    if (!segments.value.length) return '';


    const inputFile = `${originalFileName.value}.${originalFileExt.value}`;
    const timestamp = Date.now();
    // 使用升级后的时间格式：xxxx年xx月xx日xx时xx分xx秒
    const dateTimeStr = formatTimestampToDateTime(timestamp);

    let filterComplex = '';
    let mapOutputs = '';

    segments.value.forEach((seg, idx) => {
      if (seg.endTime) {
        let videoFilter = `trim=start=${seg.startTime.toFixed(1)}:end=${seg.endTime.toFixed(1)},setpts=PTS-STARTPTS`;
        // 关键：使用原始视频像素的裁剪参数
        if (seg.enableCrop) {
          videoFilter += `,crop=${seg.cropWidth}:${seg.cropHeight}:${seg.cropX}:${seg.cropY}`;
        }
        filterComplex += `[0:v]${videoFilter}[v${idx}];[0:a]atrim=start=${seg.startTime.toFixed(1)}:end=${seg.endTime.toFixed(1)},asetpts=PTS-STARTPTS[a${idx}];`;
        const outputFile = `output_${dateTimeStr}_segment${idx + 1}.${originalFileExt.value}`;
        mapOutputs += ` -map '[v${idx}]' -map '[a${idx}]' "${outputFile}"`;
      }

    });

    filterComplex = filterComplex.replace(/;$/, '');
    // 修复：移除 -c:v copy，裁剪需要重新编码
    const batchCmd = `ffmpeg -i "${inputFile}" -filter_complex '${filterComplex}'${mapOutputs} -c:a copy`;

    batchCmds.value = batchCmd;
    return batchCmd;
  };


  return {
    segments,
    selectedSegmentIdx,
    selectedSegment,
    batchCmds,
    markSegmentStart,
    markSegmentEnd,
    selectSegment,
    clearSegments,
    deleteSegment,
    toggleCropSwitch,
    generateSingleCmd,
    generateBatchCmd
  }

}, {persist: false})
