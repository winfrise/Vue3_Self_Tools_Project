<template>
  <el-container style="width: 1200px">
    <el-main>
      <el-card>
        <custom-cropper-wrapper ref="cropperWrapperRef" 
          :selection-options="selectionOptions"
          @image-transform="val => imageData = val" 
          @selection-change="val => selectionData = val"
        />
      </el-card>
    </el-main>

    <el-main style="width: 300px">
      <el-card>
        <custom-cropper-details 
          :selectionOptions="selectionOptions" 
          :image-data="imageData" 
          :selection-data="selectionData" 
          @center="cropperWrapperRef.center()" 
        />
      </el-card>
    </el-main>
  </el-container>
</template>


<script setup lang="ts">
 
  import { onMounted, reactive, ref, nextTick } from 'vue';

  import CustomCropperWrapper from './components/CustomCropperWrapper.vue';
  import CustomCropperDetails from './components/CustomCropperDetails.vue';

  const isMounted = ref(false)

  onMounted(async () => {
    await nextTick()
    isMounted.value = true
  })

  const cropperWrapperRef = ref()

  const selectionOptions = reactive({
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

</script>

