<!-- components/SealConfigForm.vue -->
<template>
  <el-card>
    <template #header>
      印章配置
    </template>
    <el-form  size="small" inline>

      <div>
        <el-form-item label="印章颜色：">
          <el-color-picker v-model="config.color" show-alpha />
        </el-form-item>


        <el-form-item label="印章尺寸：">
          <el-input-number v-model="config.size" :min="100" :max="500" />
        </el-form-item>

        <el-form-item label="老化程度：">
          <el-switch v-model="config.enableAging" />
          <el-input-number v-model="config.aging" :disabled="!config.enableAging" :min="0" :max="100" style="margin-left: 10px;" />
        </el-form-item>
      </div>

      <div>
        <el-form-item label="字体：">
          <el-select style="width: 80px;" v-model="config.fontFamily">
            <el-option label="仿宋" value="FangSong" />
            <el-option label="楷体" value="KaiTi" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
          </el-select>
        </el-form-item>


      <el-form-item label="字号：">
        <el-input-number v-model="config.fontSize" :min="8" :max="100" />
      </el-form-item>

      <el-form-item label="粗细：">
        <el-select style="width: 80px;" v-model="config.fontWeight">
          <el-option label="正常" value="normal"></el-option>
          <el-option label="加粗" value="bold"></el-option>
        </el-select>
      </el-form-item>
      </div>


      <el-divider border-style="dotted" />

      <!-- 公司名称配置 -->
      <div>
        <el-form-item label="公司名称：">
          <el-input v-model="config.companyName" placeholder="请输入公司名称" />
        </el-form-item>

        <el-form-item label="半径">
          <el-input-number v-model="config.companyRadius" :min="8" :max="100" style="width: 100px;" />
        </el-form-item>

        <el-form-item label="自定义样式">
          <el-switch v-model="config.enableCustomCompanyNameStyle" />
        </el-form-item>
        <el-form-item label="颜色：">
          <el-color-picker v-model="config.companyColor" show-alpha  :disabled="!config.enableCustomCompanyNameStyle"/>
        </el-form-item>



      </div>

      <div>
        <el-form-item label="字体">
          <el-select v-model="config.companyFontFamily"  style="width: 80px;" :disabled="!config.enableCustomCompanyNameStyle">
            <el-option label="仿宋" value="FangSong" />
            <el-option label="楷体" value="KaiTi" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
          </el-select>
        </el-form-item>


        <el-form-item label="字号">
          <el-input-number v-model="config.companyFontSize" :min="8" :max="100" :disabled="!config.enableCustomCompanyNameStyle" style="width: 100px;" />
        </el-form-item>

        <el-form-item label="粗细">
          <el-select style="width: 60px;" v-model="config.companyFontWeight" :disabled="!config.enableCustomCompanyNameStyle">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="加粗" value="bold"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="字间距">
          <el-input v-model="config.companyWordSpace" :disabled="!config.enableCustomCompanyNameStyle" style="width: 60px;"  />
        </el-form-item>
      </div>

      <el-divider border-style="dotted" />

      <div>
        <el-form-item label="章名：">
          <el-input v-model="config.sealName" />
        </el-form-item>


        <el-form-item label="位置">
          <el-input-number v-model="config.sealNameStartY" :min="8" :max="100" style="width: 100px;" />
        </el-form-item>

        <el-form-item label="自定义样式">
          <el-switch v-model="config.enableCustomSealNameStyle" />
        </el-form-item>

        <el-form-item label="颜色：">
          <el-color-picker v-model="config.sealNameColor" show-alpha :disabled="!config.enableCustomSealNameStyle" />
        </el-form-item>

      </div>

      <div>
        <el-form-item label="字体">
          <el-select v-model="config.sealNameFontFamily"  style="width: 80px;" :disabled="!config.enableCustomSealNameStyle">
            <el-option label="仿宋" value="FangSong" />
            <el-option label="楷体" value="KaiTi" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
          </el-select>
        </el-form-item>


        <el-form-item label="字号">
          <el-input-number v-model="config.sealNameFontSize" :min="8" :max="100" :disabled="!config.enableCustomSealNameStyle" style="width: 100px;" />
        </el-form-item>

        <el-form-item label="粗细">
          <el-select style="width: 60px;" v-model="config.sealNameFontWeight" :disabled="!config.enableCustomSealNameStyle">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="加粗" value="bold"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="字间距">
          <el-input v-model="config.sealNameWordSpace" :disabled="!config.enableCustomSealNameStyle" style="width: 60px;"  />
        </el-form-item>
      </div>

      <el-divider border-style="dotted" />

      <div>
        <el-form-item label="中心内容：">
          <el-input v-model="config.centerText" placeholder="如：★" />
        </el-form-item>
      </div>

      <div>
        <el-form-item label="防伪码：">
          <el-input v-model="config.verifyCode" placeholder="如：1234567890" />
        </el-form-item>
      </div>

      <div>
        <el-form-item label="外边线宽度：">
          <el-input-number v-model="config.outerLine" :min="0" :max="10"/>
        </el-form-item>
      </div>

      <div>
        <el-form-item label="内边线宽度：">
          <el-input-number v-model="config.innerLine" :min="0" :max="10" />
        </el-form-item>
      </div>


      <div>
        <el-form-item label="显示边线：">
          <el-switch v-model="config.showLines" />
        </el-form-item>
      </div>
    </el-form>
  </el-card>

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