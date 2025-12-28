<template>

<CroppingBox image-url="https://hips.hearstapps.com/hmg-prod/images/%E5%AE%8B%E6%99%BA%E5%AD%9D-1597774015.jpg?crop=0.500xw:1.00xh;0.500xw,0&resize=640:*" />
<Test></Test>

<el-card>
    <CropperWrapper ref="cropperWrapperRef"  
        :displayWidth="400" 
        :displayHeight="400"
        :initCropBoxData="cropBoxData" 
        @crop-box-change="handleCropBoxChange"
    />
    <!-- <CropperTools :cropBoxData="cropBoxData"  :displayHeight="500" :displayWidth="600"
        @crop-box-data-change="handleCropBoxDataChange"
    /> -->
</el-card>

{{cropBoxData}}

</template>

<script setup lang="ts">
    import Test from './components/Test.vue';
    import CroppingBox from './components/CroppingBox.vue';
    import CropperWrapper from './components/CropperWrapperTest.vue';
    import CropperTools from './components/CropperTools.vue';

    import { CropBoxData } from './types/cropper';

    import { computed, ref, watch } from 'vue'
    const cropperWrapperRef = ref<InstanceType<typeof CropperWrapper>>()

    const cropBoxData = ref({
        x: 0, // 选框的水平坐标
        y: 0, // 选框的垂直坐标
        width: 300, // 选框的宽度
        height: 300, // 选框的高度
    })

    const cropBoxPercentData = computed(() => {
        return {
            percentX: 0, // 选框水平坐标（百分比）
            percentY: 0, // 选框垂直坐标（百分比）
            percentWidth: 0, // 选框宽度（百分比）
            percentHeight: 0 // 选框高度（百分比）
        }
    })

    // 接收裁剪框数据
    const handleCropBoxChange = (data: CropBoxData) => {
        cropBoxData.value = data
    }

    const handleCropBoxDataChange = (data: CropBoxData) => {
        // cropperWrapperRef.value?.setCropBoxData(data)
    }

</script>