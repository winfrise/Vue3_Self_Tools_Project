<template>
    <!-- 放大镜效果 -->
    <teleport to="body">
        <!-- 放大镜 -->
        <div class="magnifier" 
            v-show="visible" 
            :style="{
                left: props.x + 'px', 
                top: props.y + 'px'
            }"
        >
            <canvas width="150" height="150" ref="canvasRef" class="canvas"></canvas>
        </div>
    </teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, unref , watch } from 'vue'
import { calculateCenteredScale } from '../utils/calculateCenteredScale'

interface Props {
    visible: boolean,
    x: number,
    y: number,
    video: HTMLVideoElement
}
const canvasRef = ref<HTMLCanvasElement | null>(null)
const props = defineProps<Props>()


onMounted(async () => {
    await nextTick()
    // 视频鼠标移动事件
    const video = unref(props.video)
    video.addEventListener('mousemove', (e) => {
        const magnifierSize = 150 // 放大镜尺寸
        const zoomFactor = 3; // 放大倍数
        // 获取视频元素的边界
        const rect = video.getBoundingClientRect();

        // 原始视频宽高
        const originalVideoWidth = video.videoWidth;
        const originalVideoHeight = video.videoHeight;

        // 视频真实的宽高(缩放后)(包含上下或左右的黑色区域)
        const actualVideoWidth = rect.width
        const actualVideoHeight = rect.height

        const { 
            left: leftMargin, 
            top: topMargin, 
            displayWidth, 
            displayHeight,
            scale
        } = calculateCenteredScale(actualVideoWidth, actualVideoHeight, originalVideoWidth, originalVideoHeight)


        // 计算相对于视频元素的坐标
        const x = e.clientX - rect.left - leftMargin;
        const y = e.clientY - rect.top - topMargin;
        
        
        const clampX = Math.max(0, Math.min(x, displayWidth));
        const clampY = Math.max(0, Math.min(y, displayHeight));
        


        const videoX = clampX / scale;
        const videoY = clampY / scale;

        
        // 计算裁剪区域大小（原始视频中）
        const cropSize = magnifierSize / zoomFactor / scale;
        
        // 确保裁剪区域在视频范围内
        let cropX = videoX - cropSize / 2;
        let cropY = videoY - cropSize / 2;

        if (cropX < 0) cropX = 0;
        if (cropY < 0) cropY = 0;
        if (cropX + cropSize > originalVideoWidth) cropX = originalVideoWidth - cropSize;
        if (cropY + cropSize > originalVideoHeight) cropY = originalVideoHeight - cropSize;
        
        
        // 清除并绘制
        const magnifierCtx = unref(canvasRef)?.getContext('2d') as CanvasRenderingContext2D
        magnifierCtx.clearRect(0, 0, magnifierSize, magnifierSize);

        magnifierCtx.drawImage(
            video,
            cropX, cropY, cropSize, cropSize,
            0, 0, magnifierSize, magnifierSize
        );
    });
            
})

</script>

<style scoped>
/* 放大镜效果 */
.magnifier {
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 12px rgba(0,0,0,0.6);
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
  background: red;
  opacity: 0.7;
}
.canvas {
    display: block;
    width: 150px;
    height: 150px
}
</style>