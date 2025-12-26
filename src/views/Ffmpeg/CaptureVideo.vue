<template>
<CroppingBox image-url="https://hips.hearstapps.com/hmg-prod/images/%E5%AE%8B%E6%99%BA%E5%AD%9D-1597774015.jpg?crop=0.500xw:1.00xh;0.500xw,0&resize=640:*" />
<Test></Test>

<el-card>
    <CropperWrapperTest  v-model:cropBoxData="cropBoxData"  :displayWidth="400" :displayHeight="300" />
    <CropperTools v-model:cropBoxData="cropBoxData"  :displayHeight="400" :displayWidth="300" />
</el-card>

{{cropBoxData}}


</template>

<script setup lang="ts">
    import Test from './components/Test.vue';
    import CroppingBox from './components/CroppingBox.vue';
    import CropperWrapperTest from './components/CropperWrapperTest.vue';
    import CropperTools from './components/CropperTools.vue';

    import { ref } from 'vue'

    const cropBoxData = ref({
        x: 1, // 选框的水平坐标
        y: 2, // 选框的垂直坐标
        width: 3, // 选框的宽度
        height: 4, // 选框的高度
        percentX: 0, // 选框水平坐标（百分比）
        percentY: 0, // 选框垂直坐标（百分比）
        percentWidth: 0, // 选框宽度（百分比）
        percentHeight: 0 // 选框高度（百分比）
    })

</script>