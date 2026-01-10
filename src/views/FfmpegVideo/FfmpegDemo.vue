<template>
<el-card>
    <CropperWrapper ref="cropperWrapperRef"  
        :displayWidth="400" 
        :displayHeight="400"
        :initCropBoxData="cropBoxData" 
        @crop-box-change="handleCropBoxChange"
    />
    <CropperTools :cropBoxData="cropBoxData"  :displayHeight="500" :displayWidth="600"
        @crop-box-data-change="handleCropBoxDataChange"
    />
</el-card>

</template>

<script setup lang="ts">
    import CropperWrapper from './components/CropperWrapperTest.vue';
    import CropperTools from './components/CropperTools.vue';

    import { CropBoxData } from './types/cropper';

    import { computed, ref, watch } from 'vue'

    const cropBoxData = ref({
        x: 0, // 选框的水平坐标
        y: 0, // 选框的垂直坐标
        width: 300, // 选框的宽度
        height: 300, // 选框的高度
    })



    // 接收裁剪框数据
    const handleCropBoxChange = (data: CropBoxData) => {
        cropBoxData.value = data
    }

    const handleCropBoxDataChange = (data: CropBoxData) => {
        // cropperWrapperRef.value?.setCropBoxData(data)
    }

</script>