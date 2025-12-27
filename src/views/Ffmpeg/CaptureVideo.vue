<template>
  <el-container style="width: 1200px">
    <el-main>
      <el-card>
          <cropper-canvas style="width: 800px; height: 600px;" v-if="isMounted" 
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
              :aspect-ratio="initSelection.aspectRatio"
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
      </el-card>
    </el-main>

    <el-main style="width: 300px">
      <el-card>

        <el-descriptions size="large" :column="1" title="Selection Data">
            <el-descriptions-item label="x">{{ selectionData.x  }}</el-descriptions-item>
            <el-descriptions-item label="y">{{ selectionData.y }}</el-descriptions-item>
            <el-descriptions-item label="width">{{ selectionData.width }}</el-descriptions-item>
            <el-descriptions-item label="height">{{ selectionData.height }}</el-descriptions-item>



            <el-descriptions-item>
            <label for="selectionAspectRatio">aspect-ratio</label>
            <select 
              v-model.number="initSelection.aspectRatio"
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


        <el-button type="primary" @click="cropperSelectionRef.$center()">$center()</el-button>

        <el-descriptions size="large" :column="1" title="Image Data">
            <el-descriptions-item label="scaleX">{{ imageData.scaleX }}</el-descriptions-item>
            <el-descriptions-item label="scaleY">{{ imageData.scaleY }}</el-descriptions-item>
            <el-descriptions-item label="skewX">{{ imageData.skewX }}</el-descriptions-item>
            <el-descriptions-item label="skewY">{{ imageData.skewY }}</el-descriptions-item>
            <el-descriptions-item label="translateX">{{ imageData.translateX }}</el-descriptions-item>
            <el-descriptions-item label="translateY">{{ imageData.translateY }}</el-descriptions-item>
        </el-descriptions>


      </el-card>
    </el-main>
  </el-container>
</template>


<script setup lang="ts">
  import { CropperCanvas, CropperImage, CropperSelection, CropperCrosshair, CropperGrid, CropperHandle, CropperShade  } from 'cropperjs';
  import { onMounted, reactive, ref, nextTick } from 'vue';
  import type { Selection } from '@cropper/element-selection';

  const isMounted = ref(false)

  onMounted(async () => {
    await nextTick()
    isMounted.value = true
  })

  const initSelection = reactive({
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    aspectRatio: undefined
  })

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
</script>

