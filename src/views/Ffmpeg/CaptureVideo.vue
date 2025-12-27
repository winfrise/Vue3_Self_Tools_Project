<template>
<el-card>
  <div class="cropper-wrapper" style="position: relative;" >
    <cropper-canvas class="cropper-canvas" v-if="isMounted"
      :background="true"
      :disabled="false"
      :scaleStep="0.1"
      themeColor="#3399ff"
    >

      <cropper-image
        ref="cropperImage"
        initial-center-size="contain"
        :rotatable="true"
        :scalable="true"
        :skewable="true"
        :translatable="true"
        src="https://fengyuanchen.github.io/cropperjs/picture.jpg",
        @transform="onImageTransform"
      />

      <!-- 遮罩效果 -->
      <cropper-shade
        theme-color="rgba(0, 0, 0, 0.5)"
      />
      <cropper-handle
        action="select",
        theme-color="rgba(51, 153, 255, 0.5)"
        :plain="true"
      />

      <cropper-selection
          :x="selection.x"
          :y="selection.y"
          :width="selection.width"
          :height="selection.height"
          :aspect-ratio="selection.aspectRatio"
          :initial-coverage="selection.initialCoverage"
          :hidden="selection.hidden"
          :initial-aspect-ratio="selection.initialAspectRatio"
          :movable="selection.movable"
          :resizable="selection.resizable"
          :zoomable="selection.zoomable"
          :multiple="selection.multiple"
          :keyboard="selection.keyboard"
          :outlined="selection.outlined"
          :precise="selection.precise"
          :dynamic="selection.dynamic"
        @change="onSelectionChange"
      >
            <!-- 网格 -->
            <cropper-grid
                :rows="3"
                :columns="3"
                :bordered="true"
                :covered="true",
                themeColor="rgba(0, 0, 0, 0.5)"
            />

            <!-- 十字准线 -->
            <cropper-crosshair
                :centered="true"
                themeColor="rgba(0, 0, 0, 0.5)"
            />
            <cropper-handle
              v-for="subhandle in handles"
              :key="subhandle.action"
              :action="subhandle.action"
              :hidden="subhandle.hidden"
              :theme-color="subhandle.themeColor"
            />
      </cropper-selection>
    </cropper-canvas>
  </div>
</el-card>

<el-card>
        <section>
        <h6>Image Data</h6>
        <ul>
          <li>
            <span>scaleX</span>
            <span>{{ imageData.scaleX }}</span>
          </li>
          <li>
            <span>skewY</span>
            <span>{{ imageData.skewY }}</span>
          </li>
          <li>
            <span>skewX</span>
            <span>{{ imageData.skewX }}</span>
          </li>
          <li>
            <span>scaleY</span>
            <span>{{ imageData.scaleY }}</span>
          </li>
          <li>
            <span>translateX</span>
            <span>{{ imageData.translateX }}</span>
          </li>
          <li>
            <span>translateY</span>
            <span>{{ imageData.translateY }}</span>
          </li>
        </ul>
      </section>
      <section>
        <h6>Selection Data</h6>
        <ul>
          <li>
            <span>x</span>
            <span>{{ selectionData.x }}</span>
          </li>
          <li>
            <span>y</span>
            <span>{{ selectionData.y }}</span>
          </li>
          <li>
            <span>width</span>
            <span>{{ selectionData.width }}</span>
          </li>
          <li>
            <span>height</span>
            <span>{{ selectionData.height }}</span>
          </li>
        </ul>
      </section>
</el-card>

</template>


<script setup lang="ts">
  import { CropperCanvas, CropperImage, CropperSelection, CropperCrosshair, CropperGrid, CropperHandle, CropperShade  } from 'cropperjs';
  import { onMounted, reactive, ref, nextTick } from 'vue';

  const isMounted = ref(false)

  onMounted(async () => {
    await nextTick()
    isMounted.value = true
  })

  const selection = reactive({
    hidden: false,
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    aspectRatio: undefined,
    initialAspectRatio: undefined,
    initialCoverage: 0.5,
    dynamic: false,
    movable: true,
    resizable: true,
    zoomable: false,
    multiple: false,
    keyboard: false,
    outlined: false,
    precise: false,
  })

  const handles = ref([
        {
          hidden: false,
          action: 'move',
          themeColor: 'rgba(255, 255, 255, 0.35)',
        },
        {
          hidden: false,
          action: 'n-resize',
          themeColor: '#3399ff',
        },
        {
          hidden: false,
          action: 'e-resize',
          themeColor: '#3399ff',
        },
        {
          hidden: false,
          action: 's-resize',
          themeColor: '#3399ff',
        },
        {
          hidden: false,
          action: 'w-resize',
          themeColor: '#3399ff',
        },
        {
          hidden: false,
          action: 'ne-resize',
          themeColor: '#3399ff',
        },
        {
          hidden: false,
          action: 'nw-resize',
          themeColor: '#3399ff',
        },
        {
          hidden: false,
          action: 'se-resize',
          themeColor: '#3399ff',
        },
        {
          hidden: false,
          action: 'sw-resize',
          themeColor: '#3399ff',
        },
      ])

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

const onSelectionChange = (event: CustomEvent) => {
  selectionData.value = event.detail;
}
</script>

<style lang="scss" scoped>
  .cropper-wrapper {
    width: 800px;
    height: 600px;
  }
  .cropper-canvas {
    width: 100%;
    height: 100%;
  }
</style>