<template>
  <div class="indicator-line"></div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
    .indicator-line {
        position: relative;
        width: 1px;
        height: 30px;
        background-color: #466eb2;
        &::before, &::after {
            content: '';
            position: absolute;
            left: 50%;
            width: 0;
            height: 0;
            transform: translate(-50%, 0);
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
        }


      &::before {
        top: -0;
        border-top: 8px solid #466eb2;
      }

      &::after {
        bottom: -0;
        border-bottom: 8px solid #466eb2;
      }

    }
</style>
