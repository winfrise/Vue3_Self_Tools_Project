<template>
    <div class="start-marker" :style="{left: `${props.offsetX}%`}"></div>
</template>

<script setup lang="ts">
    interface Props {
        offsetX?: number
    }

    const props = withDefaults(defineProps<Props>(), {
        offsetX: 0
    })
</script>


<style lang="scss" scoped>
.start-marker {
  position: absolute;
  top: 0;
  height: 30px;
  width: 1px;
  background-color: #4ade80;
  z-index: 6;

  &::before, &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 10px;
    height: 1px;
    background-color: #4ade80;
  }
  &::before {
    top: 0;
  }
  &::after {
    bottom: 0;
  }
}

</style>