<!-- components/SealPreview.vue -->
<template>
  <div class="preview-container">
    <canvas ref="canvas" width="300" height="300"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useSealGenerator } from '../utils/sealGenerator'
import { setupHiDPICanvas } from '../utils/tools/setupHiDPICanvas'

const props = defineProps({
  config: Object,
  template: String,
})

const canvas = ref(null)

onMounted(() => {
  setupHiDPICanvas(canvas.value, props.config.size)
  setTimeout(drawSeal, 800)
})

watch(() => props.config, () => {
  drawSeal()
}, { deep: true })

function drawSeal() {
  const el = canvas.value
  if (!el) return

  const ctx = el.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, el.width, el.height)
  useSealGenerator(props.config, props.template, ctx)
}
</script>

<style scoped>
.preview-container {
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
</style>