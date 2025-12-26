<template>
    <!-- 基于指定宽高的空白裁剪容器 -->
    <div class="cropper-wrapper">
        <canvas ref="imgRef" :style="{width: displayWidth + 'px', height: displayHeight + 'px'}" />
    </div>
</template>

<script setup lang="ts">
    import { ref, unref, onMounted, nextTick, PropType, watch, computed } from 'vue'
    import Cropper from 'cropperjs'
    import 'cropperjs/dist/cropper.min.css'
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
            required: true,
        }
    })

    const emit = defineEmits<{
        (e: 'update:cropBoxData', value: CropBoxData): void
    }>()

    // const DEFAULT_CROP_BOX_DATA = {
    //     x: 0, // 选框的水平坐标
    //     y: 0, // 选框的垂直坐标
    //     width: 0, // 选框的宽度
    //     height: 0, // 选框的高度
    //     percentX: 0, // 选框水平坐标（百分比）
    //     percentY: 0, // 选框垂直坐标（百分比）
    //     percentWidth: 0, // 选框宽度（百分比）
    //     percentHeight: 0 // 选框高度（百分比）
    // }

    // const innerCropBoxData = ref<CropBoxData>()

    const imgRef = ref<HTMLCanvasElement>()
    const cropperRef = ref<Cropper>()
    const intiCropper = () => {
        if (!unref(imgRef)) return
        const imgEl = unref(imgRef)!

        const ctx = imgEl.getContext('2d')
        if (ctx) {
            // 绘制透明背景（完全空白）
            ctx.clearRect(0, 0, imgEl.width, imgEl.height)
            ctx.fillStyle = 'green';
            ctx.fillRect(0, 0, imgEl.width, imgEl.height)
        }

        cropperRef.value = new Cropper(imgEl, {
            aspectRatio: NaN,
            viewMode: 1,
            dragMode: 'move',
            // cropBoxResizable: false,
            // cropBoxMovable: false,
            scalable: false,// 是否允许缩放画布
            zoomable: false, // 是否允许滚轮缩放
            toggleDragModeOnDblclick: false,
            checkCrossOrigin: false,
            ready() {
                // resetCropBox()
            },
            cropmove() {
                // getBase64()
            },
            crop(e: any) {
                cropBoxData.value = {
                    // 裁剪框绝对坐标/尺寸
                    x: Math.round(e.detail.x),
                    y: Math.round(e.detail.y),
                    width: Math.round(e.detail.width),
                    height: Math.round(e.detail.height),
                    // 相对画布的百分比（便于后续适配）
                    percentX: Number((e.detail.x / props.displayWidth).toFixed(4)),
                    percentY: Number((e.detail.y / props.displayHeight).toFixed(4)),
                    percentWidth: Number((e.detail.width / props.displayWidth).toFixed(4)),
                    percentHeight: Number((e.detail.height / props.displayHeight).toFixed(4))
                }
            }
        })
    }

    const cropBoxData = computed<CropBoxData>({
        get() {
            return props.cropBoxData
        },
        set(newVal) {
            emit('update:cropBoxData', newVal)
        }
    })

    // watch(cropBoxData, () => {
    //     if (!unref(cropperRef)) return
    //     unref(cropperRef)!.setCropBoxData(cropBoxData.value)
    // })


    onMounted(async () => {
        await nextTick()
        intiCropper()
    })

</script>

<style lang="scss" scoped>
    .cropper-wrapper {
        position: relative;
        width: 800px;
        height: 600px;
        overflow: hidden;
        background: #f5f5f5;
    }

</style>