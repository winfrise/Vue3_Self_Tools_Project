<template>
  <cropper-canvas style="width: 800px; height: 600px;"
      ref="cropperCanvasRef"
      :background="true"
      :disabled="false"
      :scaleStep="0.1"
      themeColor="#3399ff"
  >

    <cropper-image
        ref="cropperImageRef"
        :hidden="false"
        initial-center-size="contain"
        :scalable="true"
        :translatable="true"
        src="https://fengyuanchen.github.io/cropperjs/picture.jpg",
        @transform="onImageTransform"
    />

    <!-- 遮罩效果 -->
    <cropper-shade theme-color="rgba(0, 0, 0, 0.5)" />
    <cropper-handle action="select" theme-color="rgba(51, 153, 255, 0.5)" :plain="true" />

    <cropper-selection ref="cropperSelectionRef"
        :x="initSelection.x"
        :y="initSelection.y"
        :width="initSelection.width"
        :height="initSelection.height"
        :aspect-ratio="selectionOptions.aspectRatio"
        :initial-coverage="0.5"
        :initial-aspect-ratio="4/3"
        :movable="true"
        :resizable="true"
        @change="onCropperSelectionChange"
    >
      <!-- 网格 -->
      <cropper-grid :rows="3" :columns="3" :bordered="true" :covered="true" themeColor="rgba(0, 0, 0, 0.5)" />

      <!-- 十字准线 -->
      <cropper-crosshair :centered="true" themeColor="rgba(0, 0, 0, 0.5)" />
        <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)" />
        <cropper-handle action="n-resize" theme-color="#3399ff" />
        <cropper-handle action="e-resize" theme-color="#3399ff" />
        <cropper-handle action="s-resize" theme-color="#3399ff" />
        <cropper-handle action="w-resize" theme-color="#3399ff" />
        <cropper-handle action="ne-resize" theme-color="#3399ff" />
        <cropper-handle action="nw-resize" theme-color="#3399ff" />
        <cropper-handle action="se-resize" theme-color="#3399ff" />
        <cropper-handle action="sw-resize" theme-color="#3399ff" />
      
    </cropper-selection>
  </cropper-canvas>
</template>


<script setup lang="ts">
    import { ref, unref, reactive } from 'vue'
    import { CropperCanvas, CropperImage, CropperSelection, CropperCrosshair, CropperGrid, CropperHandle, CropperShade  } from 'cropperjs';
    import type { Selection } from '@cropper/element-selection';

    const props = defineProps({
        initSelection: {
            type: Object,
            default: () => ({
                x: undefined,
                y: undefined,
                width: undefined,
                height: undefined,
            })
        },
        selectionOptions: {
            type: Object,
            default: () => ({
                aspectRatio: undefined
            })
        }
    })

    const { initSelection, selectionOptions} = props

    const emit = defineEmits(['imageTransform', 'selectionChange'])

    const imageData = ref({
        scaleX: 0,
        skewY: 0,
        skewX: 0,
        scaleY: 0,
        translateX: 0,
        translateY: 0,
    })

    const selectionData = ref({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })

    const onImageTransform = (event: CustomEvent) => {
        const [ scaleX, skewY, skewX, scaleY, translateX, translateY ] = event.detail.matrix
        imageData.value = {scaleX, scaleY, skewX, skewY, translateX, translateY}
        emit('imageTransform', unref(imageData))
    }


    const cropperCanvasRef = ref()
    const cropperImageRef = ref()
    const cropperSelectionRef = ref()
    const onCropperSelectionChange = (event: CustomEvent) => {
    const cropperCanvas = cropperCanvasRef.value as CropperCanvas;

    if (!cropperCanvas) {
        return;
    }

    const cropperCanvasRect = cropperCanvas.getBoundingClientRect();
    const selection = event.detail as Selection;

    const cropperImage = cropperImageRef.value as CropperImage;
        const cropperImageRect = cropperImage.getBoundingClientRect();
        const maxSelection: Selection = {
            x: cropperImageRect.left - cropperCanvasRect.left,
            y: cropperImageRect.top - cropperCanvasRect.top,
            width: cropperImageRect.width,
            height: cropperImageRect.height,
        };

        if (!checkInSelection(selection, maxSelection)) {
            event.preventDefault();
        }
        selectionData.value = event.detail;
        emit('selectionChange', unref(selectionData))
    }

    // 验证是否在图片范围之内
    const checkInSelection = (selection: Selection, maxSelection: Selection) => {
        return (
            selection.x >= maxSelection.x
            && selection.y >= maxSelection.y
            && (selection.x + selection.width) <= (maxSelection.x + maxSelection.width)
            && (selection.y + selection.height) <= (maxSelection.y + maxSelection.height)
        );
    }

    const center = () => {
        cropperSelectionRef.value.$center()
    }

    defineExpose({center})
</script>