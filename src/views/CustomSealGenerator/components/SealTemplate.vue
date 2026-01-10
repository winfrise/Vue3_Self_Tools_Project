<!-- components/SealTemplate.vue -->
<template>
  <el-card
    shadow="hover"
    :class="{ active: selected }"
    @click="selectTemplate"
    style="width: 100%; cursor: pointer; margin: 15px 0;"
  >
    <el-image :src="imageSrc" alt="模板" style="width: 100%; height:80px; object-fit: contain;" />
    <div style="line-height: 30px; text-align: center;">{{ label }}</div>
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

<style lang="scss" scoped>
:deep(.el-card__body) {
  padding: 5px;
}
.active {
  border-color: #409eff !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>