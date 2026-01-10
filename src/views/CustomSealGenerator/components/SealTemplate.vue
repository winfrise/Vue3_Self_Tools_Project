<!-- components/SealTemplate.vue -->
<template>
  <el-card
    shadow="hover"
    :class="{ active: selected }"
    @click="selectTemplate"
    style="width: 100px; cursor: pointer; text-align: center;"
  >
    <img :src="imageSrc" alt="模板" style="width: 60px; height: 60px; object-fit: contain;" />
    <div style="font-size: 12px; margin-top: 8px;">{{ label }}</div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  imageSrc: String,
  label: String,
  value: String,
  selected: Boolean,
})

const emit = defineEmits(['select'])

const selectTemplate = () => {
  emit('select', props.value)
}
</script>

<style scoped>
.active {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>