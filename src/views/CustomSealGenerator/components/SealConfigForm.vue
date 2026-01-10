<!-- components/SealConfigForm.vue -->
<template>
  <el-form label-width="100px" size="small">
    <el-form-item label="公司名称：">
      <el-input v-model="config.company" placeholder="请输入公司名称" />
    </el-form-item>

    <el-form-item label="章名：">
      <el-input v-model="config.sealName" placeholder="如：合同专用章" />
    </el-form-item>

    <el-form-item label="中心内容：">
      <el-input v-model="config.centerText" placeholder="如：★" />
    </el-form-item>

    <el-form-item label="防伪码：">
      <el-input v-model="config.verifyCode" placeholder="如：1234567890" />
    </el-form-item>

    <el-form-item label="外边线宽度：">
      <el-input-number v-model="config.outerLine" :min="0" :max="10"/>
    </el-form-item>

    <el-form-item label="内边线宽度：">
      <el-input-number v-model="config.innerLine" :min="0" :max="10" />
    </el-form-item>

    <el-form-item label="显示边线：">
      <el-switch v-model="config.showLines" />
    </el-form-item>

    <el-form-item label="印章颜色：">
      <el-color-picker v-model="config.color" show-alpha />
    </el-form-item>

    <el-form-item label="印章尺寸：">
      <el-input-number v-model="config.size" :min="100" :max="500" />
    </el-form-item>

    <el-form-item label="老化程度：">
      <el-input-number v-model="config.aging" :min="0" :max="100" />
      <el-switch v-model="config.enableAging" style="margin-top: 8px" />
    </el-form-item>

    <el-form-item label="字体：">
      <el-select v-model="config.fontFamily" placeholder="请选择字体">
        <el-option label="仿宋" value="FangSong" />
        <el-option label="楷体" value="KaiTi" />
        <el-option label="宋体" value="SimSun" />
      </el-select>
    </el-form-item>

    <el-form-item label="字号：">
      <el-input-number v-model="config.fontSize" :min="8" :max="100" controls-position="right" />
    </el-form-item>

    <el-form-item label="粗细：">
      <el-radio-group v-model="config.fontWeight">
        <el-radio label="normal">正常</el-radio>
        <el-radio label="bold">加粗</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: Object,
})

const emit = defineEmits(['update:modelValue'])

const config = reactive({ ...props.modelValue })

watch(config, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })
</script>