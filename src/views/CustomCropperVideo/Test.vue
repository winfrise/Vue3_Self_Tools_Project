<template>
    <el-card>
        <CustomVideoUpload v-model:videoInfo="videoInfo" />
    </el-card>

    <el-container>
        <el-main>
            <el-card>
                <div class="video-wrapper">
                    <CustomVideoPlayer
                        ref="videoPlayerRef"
                        :videoUrl="videoInfo?.url"
                        @play="isPlaying = true"
                        @pause="isPlaying = false"
                        @loaded-meta-data="data => (videoDisplayInfo = data)"
                        @timeupdate="val => (currentTime = val)"
                    />
                    <CustomButton
                        v-if="true"
                        :loading="false"
                        class="btn"
                        @click="() => {}"
                    />
                    <CustomVideoCropper
                        v-if="selectedSegmentId && selectedSegment?.enableCrop"
                        class="video-cropper"
                        :selectionOptions="selectionOptions"
                        :maxSelection="maxSelection"
                        :initSelection="
                            selectedSegment.cropX &&
                            selectedSegment.cropY &&
                            selectedSegment.cropWidth &&
                            selectedSegment.cropHeight
                                ? {
                                      cropX: selectedSegment.cropX,
                                      cropY: selectedSegment.cropY,
                                      cropWidth: selectedSegment.cropWidth,
                                      cropHeight: selectedSegment.cropHeight,
                                  }
                                : null
                        "
                        @selection-change="
                            data => Object.assign(selectedSegment!, { ...data })
                        "
                    />
                </div>
            </el-card>

            <el-card>
                <CustomTimeLine
                    ref="timeLineRef"
                    :video-duration="videoInfo?.duration || 0"
                    :current-time="currentTime"
                    :segments="segments"
                    :selectedSegmentId="selectedSegmentId"
                    @addSegment="data => segments.push(data)"
                    @update:selectedSegmentId="updateSelectedSegmentId"
                    @update:current-time="updateCurrentTimeByTimeline"
                />
            </el-card>
            <el-card>
                <CustomVideoTools
                    :is-playing="isPlaying"
                    :selectionOptions="selectionOptions"
                    v-on="toolHandlers"
                />
            </el-card>
        </el-main>

        <el-aside width="320px">
            <CustomSegementList
                :segments="segments"
                :selectedSegmentId="selectedSegmentId"
                :video-info="videoInfo"
                :video-display-info="videoDisplayInfo"
            />
        </el-aside>
    </el-container>
</template>

<script setup lang="ts">
import { computed, ref, reactive, nextTick } from 'vue';
import { VideoInfo, VideoDisplayInfo, Segment } from './types/custom';

import CustomVideoUpload from './components-custom/CustomVideoUpload.vue';
import CustomVideoPlayer from './components-custom/CustomVideoPlayer.vue';
import CustomVideoCropper from './components-custom/CustomVideoCropper.vue';
import CustomVideoTools from './components-custom/CustomVideoTools.vue';
import CustomTimeLine from './components-custom/CustomTimeLine.vue';
import CustomSegementList from './components-custom/CustomSegementList.vue';

const videoPlayerRef = ref();
const timeLineRef = ref();
const videoInfo = ref<VideoInfo | null>(null);
const videoDisplayInfo = ref<VideoDisplayInfo | null>(null);
const isPlaying = ref<boolean>(false);

const segments = ref<Segment[]>([]); // 视频片断列表
const selectedSegmentId = ref<string | null>(null);
const selectedSegment = computed(() => {
    return segments.value.find(item => item.id === selectedSegmentId.value);
});

const selectionOptions = reactive({
    aspectRatio: undefined,
});

const maxSelection = computed(() => {
    if (!videoDisplayInfo.value) return null;
    return {
        cropX: videoDisplayInfo.value!.displayX,
        cropY: videoDisplayInfo.value!.displayY,
        cropWidth: videoDisplayInfo.value!.displayWidth,
        cropHeight: videoDisplayInfo.value!.displayHeight,
    };
});

const updateSelectedSegmentId = async val => {
    selectedSegmentId.value = null;
    await nextTick();
    selectedSegmentId.value = val;
};

const currentTime = ref<number>(0);
const updateCurrentTimeByTimeline = val => {
    currentTime.value = val;
    videoPlayerRef.value.setCurrentTime(val);
    videoPlayerRef.value.pause();
};

const toolHandlers = {
    play: () => {
        videoPlayerRef.value.play();
    },
    pause: () => {
        videoPlayerRef.value.pause();
    },
    backward: () => {
        videoPlayerRef.value.backward();
    },
    forward: () => {
        videoPlayerRef.value.forward();
    },
    jumpStart: () => {
        videoPlayerRef.value.jumpStart();
    },
    jumpEnd: () => {
        videoPlayerRef.value.jumpEnd();
    },
    prevFrame: () => {
        videoPlayerRef.value.prevFrame();
    },
    nextFrame: () => {
        videoPlayerRef.value.nextFrame();
    },
    setSegmentStartTime: () => {
        videoPlayerRef.value.pause();
        timeLineRef.value.markStartPosition();
    },
    setSegmentEndTime: () => {
        videoPlayerRef.value.pause();
        timeLineRef.value.markEndPosition();
    },
};
</script>

<style lang="scss" scoped>
.video-wrapper {
    position: relative;
    .video-cropper {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
    }
}
</style>
