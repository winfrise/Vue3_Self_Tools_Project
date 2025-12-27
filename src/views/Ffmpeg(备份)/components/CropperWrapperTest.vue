<template>
    <!-- 基于指定宽高的空白裁剪容器 -->
    <div class="cropper-wrapper">
        <canvas ref="imgRef" :width="displayWidth + 'px'" :height="displayHeight + 'px' " :style="{width: displayWidth + 'px', height: displayHeight + 'px'}" />
    </div>
</template>

<script setup lang="ts">
    import { ref, unref, onMounted, nextTick, PropType, watch, computed } from 'vue'
    import Cropper from 'cropperjs'
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
        initCropBoxData: {
            type: Object as PropType<CropBoxData>
        }
    })

    const emit = defineEmits<{
        (e: 'cropBoxChange', cropBoxData: { 
            x: number; 
            y: number; 
            width: number; 
            height: number;
        }): void
    }>()

    let cropperInstance:Cropper
    const imgRef = ref<HTMLCanvasElement>()
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

        cropperInstance = new Cropper(imgEl, {
            aspectRatio: NaN,
            viewMode: 2,
            dragMode: 'move',
            // cropBoxResizable: false,
            // cropBoxMovable: false,
            scalable: false,// 是否允许缩放画布
            zoomable: false, // 是否允许滚轮缩放
            toggleDragModeOnDblclick: false,
            checkCrossOrigin: false,
            ready() {
                if (props.initCropBoxData) {
                    setCropBoxData(props.initCropBoxData)
                }
            },
            cropmove() {
                // getBase64()
            },
            crop(e: any) {
                const { x, y, width, height} = e.detail
                console.log(e)
                const cropBoxData = {
                    x: Math.round(x),
                    y: Math.round(y),
                    width: Math.round(width),
                    height: Math.round(height)
                }

                emit('cropBoxChange', cropBoxData)
            }
        })
    }


    onMounted(async () => {
        await nextTick()
        intiCropper()
    })

    const setCropBoxData = (data: { x?: number; y?: number; width?: number; height?: number }) => {
        if (!cropperInstance) return

        cropperInstance.setCropBoxData({
            left: data.x,
            top: data.y,
            width: data.width,
            height: data.height
        })
    }

    defineExpose({
        setCropBoxData
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