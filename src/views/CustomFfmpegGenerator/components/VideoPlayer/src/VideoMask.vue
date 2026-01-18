<template>
  <div class="canvas-container">
    <!-- <div class="toolbar">
      <p>
        透明度:
        <el-input-number
          v-model="config.alpha"
          size="small"
          :min="0"
          :max="1"
          :step="0.1"
        ></el-input-number>
      </p>
    </div> -->

    <canvas
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mousemove.prevent="handleMouseMove"
      @mouseup="handleMouseUp"
    ></canvas>
  </div>
</template>

<script lang="ts" setup>
    import { onMounted, ref, unref, watch, reactive, nextTick, watchEffect, computed } from 'vue';

    interface Shape {
      x: number;
      y: number;
      width: number;
      height: number;
    }

    interface Props {
      shape: Shape
    }

    type ResizingCorner = 'tl' | 'tr' | 'bl' | 'br' | null;

    const props = defineProps<Props>()

    const emit = defineEmits<{
      (e: 'update:shape', data: Shape): void
    }>()

    watch(() => props.shape, () => {
      shape.value = props.shape
      resizeCanvas()
    }, {deep: true})



    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const shape = ref<Shape | null>(null);
    const isDrawing = ref(false);
    const startX = ref(0);
    const startY = ref(0);
    const resizingCorner = ref<ResizingCorner>(null)
    const isMoving = ref(false)

    const config = reactive({
      alpha: 0.5,
    })


    watch(shape, () => {
      if (shape.value) {
        emit('update:shape', shape.value)
      }
    }, {deep: true})

    // 初始化画布
    onMounted(() => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    });
    // 核心绘制函数：反向遮罩
    const redraw = () => {
      if (!canvasRef.value) return;
      const ctx = canvasRef.value.getContext('2d');
      if (!ctx) return;
      if (!shape.value) return

      const dpr = window.devicePixelRatio || 1;
      const width = canvasRef.value.clientWidth;
      const height = canvasRef.value.clientHeight;

      ctx.clearRect(0, 0, width * dpr, height * dpr);

      // 1. 填充半透明遮罩
      ctx.fillStyle = `rgba(0, 0, 0, ${config.alpha})`;
      ctx.fillRect(0, 0, width, height);

      // 2. “挖出”每个形状区域（使用 globalCompositeOperation）
      ctx.globalCompositeOperation = 'destination-out';

      ctx.beginPath();
      ctx.rect(shape.value.x, shape.value.y, shape.value.width, shape.value.height);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over'; // 恢复默认

    };


    const resizeCanvas = () => {
      if (!canvasRef.value) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasRef.value.parentElement?.getBoundingClientRect();
      if (!rect) return;

      canvasRef.value.width = rect.width * dpr;
      canvasRef.value.height = rect.height * dpr;
      canvasRef.value.style.width = rect.width + 'px';
      canvasRef.value.style.height = rect.height + 'px';

      const ctx = canvasRef.value.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      redraw();
    };

    const getMousePos = (e: MouseEvent): { x: number; y: number } => {
      if (!canvasRef.value) return { x: 0, y: 0 };
      const rect = canvasRef.value.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // 判断是否点击在某个形状的角点上（用于调整大小）
    const getResizingCorner = (shape: Shape, mouseX: number, mouseY: number): ResizingCorner | undefined=> {
      const tolerance = 8;
      const { x, y, width, height } = shape;

      if (Math.abs(mouseX - x) < tolerance && Math.abs(mouseY - y) < tolerance) return 'tl';
      if (Math.abs(mouseX - (x + width)) < tolerance && Math.abs(mouseY - y) < tolerance) return 'tr';
      if (Math.abs(mouseX - x) < tolerance && Math.abs(mouseY - (y + height)) < tolerance) return 'bl';
      if (Math.abs(mouseX - (x + width)) < tolerance && Math.abs(mouseY - (y + height)) < tolerance) return 'br';

      return undefined;
    };

    // 判断是否点击在形状内部（用于移动）
    const isPointInShape = (shape: Shape, x: number, y: number): boolean => {
      return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!e.shiftKey)  return
      isDrawing.value = true;
      const pos = getMousePos(e);
      const mouseX = pos.x;
      const mouseY = pos.y;
      if (shape.value) {
        const corner = getResizingCorner(shape.value, mouseX, mouseY);
        if (corner) {
          // 开始调整大小
          resizingCorner.value = corner;
          startX.value = mouseX;
          startY.value = mouseY;
          return;
        }

        if (isPointInShape(shape.value, mouseX, mouseY)) {
          // 开始移动
          isMoving.value = true;
          startX.value = mouseX - shape.value.x;
          startY.value = mouseY - shape.value.y;
          return;
        }
      }


      startX.value = mouseX;
      startY.value = mouseY;
      shape.value = ({
        x: mouseX,
        y: mouseY,
        width: 0,
        height: 0,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!e.shiftKey)  return
      if (!isDrawing.value) return;
      const pos = getMousePos(e);
      const mouseX = pos.x;
      const mouseY = pos.y;


      if (shape.value) {
        if (isMoving.value) {
          shape.value.x = mouseX - startX.value;
          shape.value.y = mouseY - startY.value;
          redraw();
          return;
        }

        if (resizingCorner.value) {
          const dx = mouseX - startX.value;
          const dy = mouseY - startY.value;

          switch (resizingCorner.value) {
            case 'tl':
              shape.value.x += dx;
              shape.value.y += dy;
              shape.value.width -= dx;
              shape.value.height -= dy;
              break;
            case 'tr':
              shape.value.y += dy;
              shape.value.width += dx;
              shape.value.height -= dy;
              break;
            case 'bl':
              shape.value.x += dx;
              shape.value.width -= dx;
              shape.value.height += dy;
              break;
            case 'br':
              shape.value.width += dx;
              shape.value.height += dy;
              break;
          }
          // 保持最小尺寸
          shape.value.width = Math.max(10, shape.value.width);
          shape.value.height = Math.max(10, shape.value.height);
          startX.value = mouseX
          startY.value = mouseY
        } else {
          // 正在绘制新形状
          let w = mouseX - startX.value;
          let h = mouseY - startY.value;


          shape.value.x = w < 0 ? startX.value + w : startX.value;
          shape.value.y = h < 0 ? startY.value + h : startY.value;
          shape.value.width = Math.abs(w);
          shape.value.height = Math.abs(h);
        }

        redraw();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!e.shiftKey)  return

      if (shape.value && isDrawing.value ) {
        isMoving.value = false;
        resizingCorner.value = null;
      }
      isDrawing.value = false;
    };


    watchEffect(() => {
      redraw()
    })
</script>

<style scoped>
.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  z-index: 9990;
}

.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 6px;
}

.toolbar button {
  margin-right: 8px;
  padding: 4px 8px;
  cursor: pointer;
}

canvas {
  display: block;
}
</style>
