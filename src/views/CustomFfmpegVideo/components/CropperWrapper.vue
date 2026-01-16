<template>
  <cropper-canvas
      ref="cropperCanvasRef"
      :background="background"
      :disabled="false"
      :scaleStep="0.1"
      themeColor="#3399ff"
  >
    <!-- 遮罩效果 -->
    <cropper-shade theme-color="rgba(0, 0, 0, 0.5)" />
    <!-- 新建选区 -->
    <cropper-handle action="select" theme-color="rgba(51, 153, 255, 0.5)" :plain="true" />

    <cropper-selection ref="cropperSelectionRef" outlined
        :x="initSelection.x"
        :y="initSelection.y"
        :width="initSelection.width"
        :height="initSelection.height"
        :aspect-ratio="selectionOptions.aspectRatio"
        :initial-aspect-ratio="4/3"
        :movable="true"
        :resizable="true"
        :precise="true"
        @change="onCropperSelectionChange"
    >
      <!-- 网格 -->
      <cropper-grid :rows="3" :columns="3" :bordered="true" :covered="true" themeColor="rgba(0, 0, 0, 0.5)" />

      <!-- 十字准线 -->
      <cropper-crosshair :centered="true" themeColor="rgba(0, 0, 0, 0.5)" />
        <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0)" />
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

    interface SelectionOptions {
        aspectRatio: number | undefined
    }

    interface Props {
        background: boolean,
        initSelection: Selection,
        selectionOptions: SelectionOptions,
        maxSelection: Selection | undefined,
    }

    const props = defineProps<Props>();

    const { initSelection, selectionOptions} = props

    const emit = defineEmits(['imageTransform', 'selectionChange'])

    const selectionData = ref({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })

    const cropperCanvasRef = ref()
    const cropperSelectionRef = ref()
    const onCropperSelectionChange = (event: CustomEvent) => {
        const cropperCanvas = cropperCanvasRef.value as CropperCanvas;

        if (!cropperCanvas) {
            return;
        }

        const selection = event.detail as Selection;
        const { maxSelection } = props
        if (maxSelection) {
            if (!checkInSelection(selection, maxSelection)) {
                event.preventDefault();
            }
        }
        selectionData.value = event.detail;
        console.log(event)
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

    // 选区居中显示
    const center = () => {
        cropperSelectionRef.value.$center()
    }

    defineExpose({center})
</script>