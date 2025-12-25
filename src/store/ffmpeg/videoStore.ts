import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useVideoStore = defineStore('videoStore', () => {
    // 基础状态
    const videoFile = ref<File | null>(null);
    const videoUrl = ref('');
    const videoDuration = ref(0);
    const videoWidth = ref(0); // 视频原始宽度
    const videoHeight = ref(0); // 视频原始高度


    const currentTime = ref(0);
    const originalFileName = ref('');
    const originalFileExt = ref('mp4');


    const videoAspectRatio = computed(() => {
        return videoWidth.value / videoHeight.value || 1;
    });

    const playProgressPercent = computed(() => {
        return videoDuration.value ? (currentTime.value / videoDuration.value) * 100 : 0;
    });

    // 初始化视频信息
    const initVideoInfo = (file: File) => {
        videoFile.value = file;
        videoUrl.value = URL.createObjectURL(file);
        const fullName = file.name;
        const extIndex = fullName.lastIndexOf('.');
        if (extIndex > -1) {
            originalFileName.value = fullName.substring(0, extIndex);
            originalFileExt.value = fullName.substring(extIndex + 1).toLowerCase();
        } else {
            originalFileName.value = fullName;
            originalFileExt.value = 'mp4';
        }
        // 重置其他状态但保留视频信息
        resetVideoState();
    };

    const resetVideoState = () => {
        currentTime.value = 0;
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };


    return {
        videoFile,
        videoUrl,
        currentTime,
        playProgressPercent,
        videoAspectRatio,
        videoDuration,
        videoWidth,
        videoHeight,
        originalFileName,
        originalFileExt,
        initVideoInfo,
        formatTime,
    }
})