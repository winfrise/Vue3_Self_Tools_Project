import { defineStore, storeToRefs } from 'pinia';
import { ref, computed, ComputedRef } from 'vue';
import { useVideoStore } from './videoStore';

export const useVideoContainerStore = defineStore('videoContainer', () => {
    const { videoAspectRatio } = storeToRefs(useVideoStore())
    const containerWidth = ref(0) // 容器宽度
    const containerHeight = ref(0) // 容器高度

    // 容器宽高比
    const containerAspectRadio: ComputedRef<number> = computed(() => {
        if (!containerWidth.value || !containerHeight.value) return 1
        return containerWidth.value / containerHeight.value
    })

    // 视频显示宽度
    const displayWidth: ComputedRef<number>= computed(() => {
        if (containerAspectRadio.value > videoAspectRatio.value) {
            // 容器更宽，高度填满，宽度自适应
            return containerHeight.value * videoAspectRatio.value;
        } else {
            // 容器更高，宽度填满，高度自适应
            return containerWidth.value;
        }
    })

    // 视频显示高度
    const displayHeight: ComputedRef<number> = computed(() => {
        if (containerAspectRadio.value > videoAspectRatio.value) {
            // 容器更宽，高度填满，宽度自适应
            return containerHeight.value;
        } else {
            // 容器更高，宽度填满，高度自适应
            return containerWidth.value / videoAspectRatio.value;
        }
    })

    // 视频水平偏移量
    const videoOffsetX = computed(() => {
        return Math.floor((containerWidth.value - displayWidth.value) / 2);
    })


    // 视频垂直偏移量
    const videoOffsetY = computed(() => {
        return Math.floor((containerHeight.value - displayHeight.value) / 2);
    })

    return {
        containerWidth, 
        containerHeight,
        containerAspectRadio,
        displayWidth,
        displayHeight,
        videoOffsetX,
        videoOffsetY,
    }
}, {persist: false})