<template>
  <cropper-canvas
      ref="cropperCanvasRef"
      :disabled="false"
      :scaleStep="0.1"
      themeColor="#3399ff"
  >
    <!-- 遮罩效果 -->
    <cropper-shade theme-color="rgba(0, 0, 0, 0.5)" />
    <!-- 新建选区 -->
    <cropper-handle action="select" theme-color="rgba(51, 153, 255, 0.5)" :plain="true" />

    <cropper-selection ref="cropperSelectionRef" outlined
        :x="initSelection?.cropX"
        :y="initSelection?.cropY"
        :width="initSelection?.cropWidth"
        :height="initSelection?.cropHeight"
        :initial-aspect-ratio="4/3"
        :aspect-ratio="selectionOptions.aspectRatio"
        :movable="true"
        :resizable="true"
        :precise="true"
        @change="handleCropperSelectionChange"
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
    import { ref, unref, reactive, computed } from 'vue'
    import { CropperCanvas, CropperSelection, CropperCrosshair, CropperGrid, CropperHandle, CropperShade  } from 'cropperjs';
    import { Selection, SelectionOptions } from '../types/custom'



    interface Props {
      initSelection: Selection | null,
      maxSelection: Selection | null,
      selectionOptions: SelectionOptions
    }

    const props = defineProps<Props>();

    const initSelection = ref(props.initSelection)

    const emit = defineEmits<{
        (e: 'selectionChange', data: Selection):void
    }>()


    const handleCropperSelectionChange = (e: CustomEvent) => {
        const { x, y, width, height} = e.detail
        const selection = {cropX: x, cropY: y, cropWidth: width, cropHeight: height}

        const { maxSelection } = props
        if (maxSelection) {
            if (!checkInSelection(selection, maxSelection)) {
                e.preventDefault();
            }
        }

        emit('selectionChange', selection)
    }

    const checkInSelection = (selection: Selection, maxSelection: Selection) => {
        return (
            selection.cropX >= maxSelection.cropX
            && selection.cropY >= maxSelection.cropY
            && (selection.cropX + selection.cropWidth) <= (maxSelection.cropX + maxSelection.cropWidth)
            && (selection.cropY + selection.cropHeight) <= (maxSelection.cropY + maxSelection.cropHeight)
        );
    }
</script>