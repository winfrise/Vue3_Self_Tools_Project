<!-- components/SealPreview.vue -->
<template>
  <div class="preview-container">
    <canvas ref="externalImageCanvasRef" width="300" height="300" class="external-image-canvas"></canvas>
    <canvas ref="sealCanvasRef" width="300" height="300" class="seal-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useSealGenerator } from '../utils/sealGenerator'
import { setupHiDPICanvas } from '../utils/tools/setupHiDPICanvas'
import { useDrawExternalImage } from '../utils/drawExternalImage'
import { useSealArgingEffect } from '../utils/sealAgingEffects'

const props = defineProps({
  config: Object,
  externalImageConfig: Object,
  template: String,
  agingEffects: Array,
})

const sealCanvasRef = ref(null)

onMounted(() => {
  drawSeal()
  drawExternalImage()
})

watch(() => props.config, () => {
  drawSeal()
}, { deep: true })

watch(() => props.agingEffects, () => {
  drawSeal()
}, {deep: true})

function drawSeal() {
  setupHiDPICanvas(sealCanvasRef.value, props.config.size, props.config.dpr)
  const el = sealCanvasRef.value
  if (!el) return

  const ctx = el.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, el.width, el.height)
  useSealGenerator(props.config, props.template, ctx)

  useSealArgingEffect(ctx, props.agingEffects, {dpr: props.config.dpr})
}

const externalImageCanvasRef = ref()

watch(() => props.externalImageConfig, () => {
  drawExternalImage()
}, { deep: true })


function drawExternalImage () {
  const el = externalImageCanvasRef.value
  if (!el) return

  const ctx = el.getContext('2d')
  if (!ctx) return
  // useSealGenerator(props.config, props.template, ctx)
  useDrawExternalImage(ctx, props.externalImageConfig)
}

</script>

<style scoped>
.preview-container {
  position: relative;
  width: 300px;
  height: 300px;
  border: 1px dashed #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.external-image-canvas {
  position: absolute;
  top: 0;
  left: 0
}
.seal-canvas {
  position: relative;
  z-index: 10;
}
</style>