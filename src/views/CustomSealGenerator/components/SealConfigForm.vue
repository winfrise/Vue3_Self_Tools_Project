<!-- components/SealConfigForm.vue -->
<template>
  <el-card>
    <template #header>
      印章配置
    </template>
    <el-form  size="small" inline>

      <div>
        <el-form-item label="印章颜色：">
          <el-color-picker v-model="config.color" show-alpha 
            :predefine="[
              '#DC143C',
              '#A03030'
            ]" 
          />
        </el-form-item>


        <el-form-item label="印章尺寸：">
          <el-input-number v-model="config.size" :min="100" :max="500" />
        </el-form-item>

        <el-form-item label="老化程度：">
          <el-switch v-model="config.enableAging" />
          <el-input-number v-model="config.aging" :disabled="!config.enableAging" :min="0" :max="100" style="margin-left: 10px;" />
        </el-form-item>

        <el-form-item label="分辨率：">
          <el-select v-model="config.dpr" style="width: 80px;">
            <el-option label="0.5倍" :value="0.5"></el-option>
            <el-option label="1倍" :value="1"></el-option>
            <el-option label="2" :value="2"></el-option>
            <el-option label="4" :value="4"></el-option>
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

        <el-form-item label="颜色：">
          <el-color-picker v-model="config.companyColor" show-alpha  />
        </el-form-item>

        <el-form-item label="字体">
          <el-select v-model="config.companyFontFamily"  style="width: 80px;" >
            <el-option label="华文宋体(宋体)" value="Songti SC" />
            <el-option label="华广黑体(雅黑)" value="Heiti SC" />
            <el-option label="方正仿宋" value="FZFangSong-Z02" />
            <el-option label="方正楷体" value="FZKai-Z03" />
            <el-option label="方正宋体" value="FZShuSong-Z01" />
            <el-option label="方正黑体" value="FZHei-B01" />
            <el-option label="思源黑体" value="Source Han Sans CN" />
            <el-option label="思源宋体" value="Source Han Serif SC" />
          </el-select>
        </el-form-item>


        <el-form-item label="字号">
          <el-input-number v-model="config.companyFontSize" :min="8"  style="width: 100px;" />
        </el-form-item>

        <el-form-item label="粗细">
          <el-select style="width: 60px;" v-model="config.companyFontWeight" >
            <el-option label="300" value="300"></el-option>
            <el-option label="500" value="500"></el-option>
            <el-option label="700" value="700"></el-option>
            <el-option label="900" value="900"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="字间距">
          <el-input-number v-model="config.companyNameLetterSpacing"  :step="5"   style="width: 100px;"  />
        </el-form-item>

        <el-form-item label="宽度缩放">
          <el-input-number v-model="config.companyNameWidthRatio" :step="0.01" style="width: 100px;"  />
        </el-form-item>

        <el-form-item label="高度缩放">
          <el-input-number v-model="config.companyNameHeightRatio" :step="0.1" style="width: 100px;"  />
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


        <el-form-item label="颜色：">
          <el-color-picker v-model="config.sealNameColor" show-alpha  />
        </el-form-item>


        <el-form-item label="字体">
          <el-select v-model="config.sealNameFontFamily"  style="width: 80px;">
            <el-option label="仿宋" value="FZFangSong-Z02" />
            <el-option label="楷体" value="FZKai-Z03" />
            <el-option label="宋体" value="FZShuSong-Z01" />
            <el-option label="黑体" value="FZHei-B01" />
          </el-select>
        </el-form-item>


        <el-form-item label="字号">
          <el-input-number v-model="config.sealNameFontSize" :min="8"  style="width: 100px;" />
        </el-form-item>

        <el-form-item label="粗细">
          <el-select style="width: 60px;" v-model="config.sealNameFontWeight">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="加粗" value="bold"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="字间距">
          <el-input-number v-model="config.sealNameLetterSpacing" :step="1" style="width: 100px;"  />
        </el-form-item>

        <el-form-item label="宽度缩放">
          <el-input-number v-model="config.sealNameWidthRatio" :step="0.01" style="width: 100px;"  />
        </el-form-item>

        <el-form-item label="高度缩放">
          <el-input-number v-model="config.sealNameHeightRatio" :step="0.1" style="width: 100px;"  />
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
          <el-input v-model="config.verifyCode"/>
        </el-form-item>

        <el-form-item label="半径">
          <el-input-number v-model="config.verifyCodeRadius" :min="8"  style="width: 100px;" />
        </el-form-item>

        <el-form-item label="颜色：">
          <el-color-picker v-model="config.verifyCodeColor" show-alpha  />
        </el-form-item>

        <el-form-item label="字体">
          <el-select v-model="config.verifyCodeFontFamily"  style="width: 80px;">
            <el-option label="仿宋" value="FZFangSong-Z02" />
            <el-option label="楷体" value="FZKai-Z03" />
            <el-option label="宋体" value="FZShuSong-Z01" />
            <el-option label="黑体" value="FZHei-B01" />
          </el-select>
        </el-form-item>

        <el-form-item label="字号">
          <el-input-number v-model="config.verifyCodeFontSize" :min="8"  style="width: 100px;" />
        </el-form-item>

        <el-form-item label="粗细">
          <el-select style="width: 60px;" v-model="config.verifyCodeFontWeight">
            <el-option label="正常" value="normal"></el-option>
            <el-option label="加粗" value="bold"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="字间距">
          <el-input-number v-model="config.verifyCodeLetterSpacing"  :step="10"  style="width: 100px;"  />
        </el-form-item>
      </div>

      <el-divider border-style="dotted" />

      <div>
        <el-form-item label="显示边线：">
          <el-switch v-model="config.enableCircleLine" />
        </el-form-item>

        <el-form-item label="宽度：">
          <el-input-number v-model="config.circleLineWidth" :min="0" :max="10" :disabled="!config.enableCircleLine" />
        </el-form-item>

        <el-form-item label="半径">
          <el-input-number v-model="config.circleLineRadius" :min="8" style="width: 100px;" :disabled="!config.enableCircleLine" />
        </el-form-item>

        <el-form-item label="颜色：">
          <el-color-picker v-model="config.circleLineColor" show-alpha :disabled="!config.enableCircleLine"  />
        </el-form-item>
      </div>

      <el-divider border-style="dotted" />
      
      <div>
        <el-form-item label="显示内边线：">
          <el-switch v-model="config.enableInnerCircleLine" />
        </el-form-item>

        <el-form-item label="宽度：">
          <el-input-number v-model="config.innerCircleLineWidth" :min="0" :max="10" :disabled="!config.enableInnerCircleLine" />
        </el-form-item>

        <el-form-item label="半径">
          <el-input-number v-model="config.innerCircleLineRadius" :min="8" style="width: 100px;" :disabled="!config.enableInnerCircleLine" />
        </el-form-item>

        <el-form-item label="颜色：">
          <el-color-picker v-model="config.innerCircleLineColor" show-alpha :disabled="!config.enableInnerCircleLine"  />
        </el-form-item>
      </div>

      <el-divider border-style="dotted" />

      <div>
        <el-form-item label="显示外边线：">
          <el-switch v-model="config.enableOuterCircleLine" />
        </el-form-item>

        <el-form-item label="宽度：">
          <el-input-number v-model="config.outerCircleLineWidth" :min="0" :max="10" :disabled="!config.enableOuterCircleLine" />
        </el-form-item>
        <el-form-item label="半径">
          <el-input-number v-model="config.outerCircleLineRadius" :min="8"  style="width: 100px;" :disabled="!config.enableOuterCircleLine" />
        </el-form-item>

        <el-form-item label="颜色：">
          <el-color-picker v-model="config.outerCircleLineColor" show-alpha :disabled="!config.enableOuterCircleLine"  />
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