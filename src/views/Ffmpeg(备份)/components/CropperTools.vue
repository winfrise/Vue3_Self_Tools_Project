<template>
    <div>
        <div>
            <label>裁剪比例：</label>
            <el-select v-model="selectedRatio" style="padding: 4px;">
                <el-option label="自由" value="NaN"></el-option>
                <el-option label="1:1" value="1/1"></el-option>
                <el-option label="3:4" value="3/4"></el-option>
                <el-option label="16:9" value="16/9"></el-option>
                <el-option label="自定义" value="custom"></el-option>
            </el-select>
            <div v-if="selectedRatio === 'custom'" style="margin-top: 8px; display: flex; gap: 8px;">
                <input
                    v-model="customRatio.width"
                    type="number"
                    placeholder="宽"
                    style="width: 80px; padding: 4px;"
                />
                <span>:</span>
                <input
                    v-model="customRatio.height"
                    type="number"
                    placeholder="高"
                    style="width: 80px; padding: 4px;"
                />
            </div>
        </div>

        <div>
            <div>
                <label>X坐标：</label>
                <input
                    v-model.number="cropBoxData.x"
                    type="number"
                    style="width: 80px; padding: 4px;"
                    @change="updateCropBoxData"
                />
            </div>
            <div>
                <label>Y坐标：</label>
                <input
                    v-model.number="cropBoxData.y"
                    type="number"
                    style="width: 80px; padding: 4px;"
                    @change="updateCropBoxData"
                />
            </div>
            <div>
                <label>宽度：</label>
                <input
                    v-model.number="cropBoxData.width"
                    type="number"
                    style="width: 80px; padding: 4px;"
                    @change="updateCropBoxData"
                />
            </div>
            <div>
                <label>高度：</label>
                <input
                    v-model.number="cropBoxData.height"
                    type="number"
                    style="width: 80px; padding: 4px;"
                    @change="updateCropBoxData"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, unref, computed, PropType } from 'vue'
    import { CropBoxData } from '../types/cropper'

    const props = defineProps({
        displayWidth: {
            type: Number,
            required: true
        },
        displayHeight: {
            type: Number,
            required: true
        },
        cropBoxData: {
            type: Object as PropType<CropBoxData>,
            required: true
        }
    })

    const emit = defineEmits<{
        (e: 'cropBoxDataChange', value: CropBoxData): void,
    }>()

    // 裁剪比例
    const selectedRatio = ref<string>('16/9')

    // 用户自定义宽高
    const customRatio = ref({
        width: props.displayWidth,
        height: props.displayHeight
    })

    // 宽高比
    const currentAspectRatio = computed(() => {
        const customRatioRaw = unref(customRatio)
        if (selectedRatio.value === 'NaN') {
            return NaN
        } else if (selectedRatio.value === 'custom') {
            if (customRatioRaw.width && customRatioRaw.height) {
                return Number(customRatioRaw.width) / Number(customRatioRaw.height)
            }
        } else {
            const [w, h] = selectedRatio.value.split('/').map(Number)
            return w / h
        }
    })

    const cropBoxData = computed(() => {
        return props.cropBoxData
    })

    // 手动更新裁剪框数据
    const updateCropBoxData = () => {
        const { x, y, width, height} = unref(cropBoxData)
        emit('cropBoxDataChange', {
            x, y, width, height
        })
    }
</script>

<style lang="scss" scoped>


</style>