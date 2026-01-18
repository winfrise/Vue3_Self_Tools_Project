<template>
<div class="video-tools">
    <el-button @click="emit('jump-start')">
        <el-icon><ArrowLeft /></el-icon>
        视频头
    </el-button>

    <el-button @click="emit('backward')">
        <el-icon><ArrowLeft /></el-icon>
        快退
    </el-button>

    <el-button @click="emit('prev-frame')">
        <el-icon><ArrowLeft /></el-icon>
        上一帧
    </el-button>


    <el-button @click="emit('set-segment-start-time')">
        设置片断开始
    </el-button>

            <select 
                v-model.number="selectionOptions.aspectRatio"
            >
                <option :value="undefined">
                Free
                </option>
                <option :value="16/9">
                16:9
                </option>
                <option :value="4/3">
                4:3
                </option>
                <option :value="1">
                1:1
                </option>
                <option :value="3/4">
                3:4
                </option>
                <option :value="9/16">
                9:16
                </option>
            </select>


    <el-button @click="togglePlayPause">
        <el-icon v-if="props.isPlaying" size="24"><VideoPause /></el-icon>
        <el-icon v-else size="24"><VideoPlay/></el-icon>
    </el-button>

    <el-button @click="emit('set-segment-end-time')">
        设置片断结束
    </el-button>

    <el-button @click="emit('next-frame')">
        下一帧
        <el-icon><ArrowRight /></el-icon>
    </el-button>

    <el-button @click="emit('forward')">
        快进
        <el-icon><ArrowRight /></el-icon>
    </el-button>

    <el-button @click="emit('jump-end')">
        视频尾
        <el-icon><ArrowRight /></el-icon>
    </el-button>


</div>

</template>

<script lang="ts" setup>
import { VideoPlay, VideoPause, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { SelectionOptions } from '../types/custom';

interface Props {
    isPlaying: boolean,
    selectionOptions: SelectionOptions
}
const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:isPlaying', value: boolean): void
    (e: 'play'): void
    (e: 'pause'): void
    (e: 'backward'): void       // 快退
    (e: 'forward'): void        // 快进
    (e: 'prev-frame'): void                       // 上一帧
    (e: 'next-frame'): void                           // 下一帧
    (e: 'jump-start'): void                          // 跳到开头
    (e: 'jump-end'): void                            // 跳到结尾
    (e: 'set-segment-start-time'): void
    (e: 'set-segment-end-time'): void
}>()


const togglePlayPause = () => {
    if (props.isPlaying) {
        emit('pause')
    } else {
        emit('play')
    }
}
</script>

<style lang="scss" scoped>
.video-tools {
    display: flex;
    justify-content: center;
}

</style>