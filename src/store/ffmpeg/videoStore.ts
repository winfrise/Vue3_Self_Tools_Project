import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useVideoStore = defineStore('videoStore', () => {
    // 基础状态
    const videoFile = ref<File | null>(null);
    const videoUrl = ref('');
    const duration = ref(0);
    const muted = ref(false);
    const volume = ref(1)
    const videoWidth = ref(0); // 视频原始宽度
    const videoHeight = ref(0); // 视频原始高度

    // 视频宽高比
    const videoAspectRatio = computed(() => {
        return videoWidth.value / videoHeight.value;
    });

    const currentTime = ref(0);
    const originalFileName = ref('');
    const originalFileExt = ref('mp4');


    const containerWidth = ref(0) // 容器宽度
    const containerHeight = ref(0) // 容器高度

    // 容器宽高比
    const containerAspectRadio = computed(() => {
        if (!containerWidth.value || !containerHeight.value) return
        return containerWidth.value / containerHeight.value
    })




    const playProgressPercent = computed(() => {
        return duration.value ? (currentTime.value / duration.value) * 100 : 0;
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
        duration,
        muted,
        volume,
        videoWidth,
        videoHeight,
        videoAspectRatio,
        originalFileName,
        originalFileExt,
        containerWidth, 
        containerHeight,
        containerAspectRadio,
        initVideoInfo,
        formatTime,
    }
}, {persist: false})