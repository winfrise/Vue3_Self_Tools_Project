<template>
    <div>
        <el-descriptions size="large" :column="1" title="Selection Data">
            <el-descriptions-item label="x">{{ selectionData.x  }}</el-descriptions-item>
            <el-descriptions-item label="y">{{ selectionData.y }}</el-descriptions-item>
            <el-descriptions-item label="width">{{ selectionData.width }}</el-descriptions-item>
            <el-descriptions-item label="height">{{ selectionData.height }}</el-descriptions-item>

            <el-descriptions-item>
            <label for="selectionAspectRatio">aspect-ratio</label>
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
            </el-descriptions-item>
        </el-descriptions>


        <el-button type="primary" @click="emit('center')">$center()</el-button>

        <el-descriptions size="large" :column="1" title="Image Data">
            <el-descriptions-item label="scaleX">{{ imageData.scaleX }}</el-descriptions-item>
            <el-descriptions-item label="scaleY">{{ imageData.scaleY }}</el-descriptions-item>
            <el-descriptions-item label="skewX">{{ imageData.skewX }}</el-descriptions-item>
            <el-descriptions-item label="skewY">{{ imageData.skewY }}</el-descriptions-item>
            <el-descriptions-item label="translateX">{{ imageData.translateX }}</el-descriptions-item>
            <el-descriptions-item label="translateY">{{ imageData.translateY }}</el-descriptions-item>
        </el-descriptions>

    </div>
</template>

<script setup lang="ts">
    import { toRefs } from 'vue'
    const props = defineProps({
        imageData: {
            type: Object,
            default: () => ({})
        },
        selectionData: {
            type: Object,
            default: () => ({})
        },
        selectionOptions: {
            type: Object,
            default: () => ({})
        }
    })

    const emit = defineEmits(['center'])

    const { imageData, selectionData, selectionOptions } = toRefs(props)

</script>