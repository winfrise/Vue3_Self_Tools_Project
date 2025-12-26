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
                    v-model.number="innerCropBoxData.x"
                    type="number"
                    style="width: 80px; padding: 4px;"
                />
            </div>
            <div>
                <label>Y坐标：</label>
                <input
                    v-model.number="innerCropBoxData.y"
                    type="number"
                    style="width: 80px; padding: 4px;"
                />
            </div>
            <div>
                <label>宽度：</label>
                <input
                    v-model.number="innerCropBoxData.width"
                    type="number"
                    style="width: 80px; padding: 4px;"
                />
            </div>
            <div>
                <label>高度：</label>
                <input
                    v-model.number="innerCropBoxData.height"
                    type="number"
                    style="width: 80px; padding: 4px;"
                />
            </div>
        </div>

      <button @click="resetCropper" class="btn btn-secondary">重置裁剪框</button>
    </div>
</template>

<script setup lang="ts">
    import { ref, unref, computed, watch, PropType } from 'vue'
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
        (e: 'update:cropBoxData', value: CropBoxData): void
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


    const DEFAULT_CROP_BOX_DATA = {
        x: 0, // 选框的水平坐标
        y: 0, // 选框的垂直坐标
        width: 0, // 选框的宽度
        height: 0, // 选框的高度
        percentX: 0, // 选框水平坐标（百分比）
        percentY: 0, // 选框垂直坐标（百分比）
        percentWidth: 0, // 选框宽度（百分比）
        percentHeight: 0 // 选框高度（百分比）
    }

    const innerCropBoxData = ref<CropBoxData>(props.cropBoxData || DEFAULT_CROP_BOX_DATA)

    watch(
        () => props.cropBoxData,
        (newVal) => {
            innerCropBoxData.value = newVal
        },
        { deep: true } // 初始化时立即同步一次
    )

    watch(
        innerCropBoxData,
        (newVal) => {
            emit('update:cropBoxData', {...newVal})
        }
    )

    // 重置裁剪框
    const resetCropper = () => {
        // if (cropperWrapperRef.value) {
        //     cropperWrapperRef.value.resetCropper()
        // }
    }
</script>

<style lang="scss" scoped>


</style>