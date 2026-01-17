<template>
  <div class="canvas-container">
    <div class="toolbar">
      <button @click="setMode('rect')">矩形</button>
      <button @click="setMode('square')">正方形</button>
      <button @click="setMode('circle')">圆形</button>
      <button @click="clearAll">清除</button>
    </div>
    <canvas
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mousemove.prevent="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, nextTick } from 'vue';

interface Shape {
  type: 'rect' | 'square' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  // 用于交互状态
  resizingCorner?: 'tl' | 'tr' | 'bl' | 'br';
  isMoving?: boolean;
}

export default defineComponent({
  name: 'MaskCanvas',
  setup() {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const shapes = ref<Shape[]>([]);
    const currentMode = ref<'rect' | 'square' | 'circle' | null>(null);
    const isDrawing = ref(false);
    const activeShapeIndex = ref<number | null>(null);
    const startX = ref(0);
    const startY = ref(0);

    // 设置绘制模式
    const setMode = (mode: 'rect' | 'square' | 'circle') => {
      currentMode.value = mode;
      activeShapeIndex.value = null; // 退出编辑状态
    };

    const clearAll = () => {
      shapes.value = [];
      redraw();
    };

    // 初始化画布
    onMounted(() => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      redraw();
    });

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
    const getResizingCorner = (shape: Shape, mouseX: number, mouseY: number): Shape['resizingCorner'] => {
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
      if (shape.type === 'circle') {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = shape.width / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        return dx * dx + dy * dy <= radius * radius;
      } else {
        return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const pos = getMousePos(e);
      const mouseX = pos.x;
      const mouseY = pos.y;

      // 先检查是否点击到已有形状（从上到下）
      for (let i = shapes.value.length - 1; i >= 0; i--) {
        const shape = shapes.value[i];
        const corner = getResizingCorner(shape, mouseX, mouseY);
        if (corner) {
          // 开始调整大小
          activeShapeIndex.value = i;
          shape.resizingCorner = corner;
          startX.value = mouseX;
          startY.value = mouseY;
          isDrawing.value = true;
          return;
        }
        if (isPointInShape(shape, mouseX, mouseY)) {
          // 开始移动
          activeShapeIndex.value = i;
          shape.isMoving = true;
          startX.value = mouseX - shape.x;
          startY.value = mouseY - shape.y;
          isDrawing.value = true;
          return;
        }
      }

      // 否则开始绘制新形状
      if (currentMode.value) {
        isDrawing.value = true;
        startX.value = mouseX;
        startY.value = mouseY;
        shapes.value.push({
          type: currentMode.value,
          x: mouseX,
          y: mouseY,
          width: 0,
          height: 0,
        });
        activeShapeIndex.value = shapes.value.length - 1;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing.value || activeShapeIndex.value === null) return;
      const pos = getMousePos(e);
      const mouseX = pos.x;
      const mouseY = pos.y;
      const shape = shapes.value[activeShapeIndex.value];

      if (shape.isMoving) {
        shape.x = mouseX - startX.value;
        shape.y = mouseY - startY.value;
        redraw();
        return;
      }

      if (shape.resizingCorner) {
        const dx = mouseX - startX.value;
        const dy = mouseY - startY.value;

        switch (shape.resizingCorner) {
          case 'tl':
            shape.x += dx;
            shape.y += dy;
            shape.width -= dx;
            shape.height -= dy;
            break;
          case 'tr':
            shape.y += dy;
            shape.width += dx;
            shape.height -= dy;
            break;
          case 'bl':
            shape.x += dx;
            shape.width -= dx;
            shape.height += dy;
            break;
          case 'br':
            shape.width += dx;
            shape.height += dy;
            break;
        }
        // 保持最小尺寸
        shape.width = Math.max(10, shape.width);
        shape.height = Math.max(10, shape.height);
        // 对于正方形/圆形，强制宽高一致
        if (shape.type === 'square' || shape.type === 'circle') {
          const size = Math.max(shape.width, shape.height);
          shape.width = size;
          shape.height = size;
        }
        startX.value = mouseX;
        startY.value = mouseY;
        redraw();
        return;
      }

      // 正在绘制新形状
      let w = mouseX - startX.value;
      let h = mouseY - startY.value;

      if (currentMode.value === 'square') {
        const size = Math.abs(w) > Math.abs(h) ? w : h > 0 ? Math.abs(w) : -Math.abs(w);
        w = size;
        h = w;
      }

      shape.x = w < 0 ? startX.value + w : startX.value;
      shape.y = h < 0 ? startY.value + h : startY.value;
      shape.width = Math.abs(w);
      shape.height = Math.abs(h);
      redraw();
    };

    const handleMouseUp = () => {
      if (isDrawing.value && activeShapeIndex.value !== null) {
        const shape = shapes.value[activeShapeIndex.value];
        shape.isMoving = false;
        shape.resizingCorner = undefined;
      }
      isDrawing.value = false;
    };

    // 核心绘制函数：反向遮罩
    const redraw = () => {
      if (!canvasRef.value) return;
      const ctx = canvasRef.value.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvasRef.value.clientWidth;
      const height = canvasRef.value.clientHeight;

      ctx.clearRect(0, 0, width * dpr, height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 重置缩放

      // 1. 填充半透明遮罩
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, height);

      // 2. “挖出”每个形状区域（使用 globalCompositeOperation）
      ctx.globalCompositeOperation = 'destination-out';

      shapes.value.forEach((shape) => {
        ctx.beginPath();
        if (shape.type === 'circle') {
          const centerX = shape.x + shape.width / 2;
          const centerY = shape.y + shape.height / 2;
          const radius = Math.min(shape.width, shape.height) / 2;
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        } else {
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
        }
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over'; // 恢复默认

      // 可选：绘制边框和控制点（调试用）
    //   shapes.value.forEach((shape) => {
    //     ctx.strokeStyle = '#fff';
    //     ctx.lineWidth = 2;
    //     ctx.beginPath();
    //     if (shape.type === 'circle') {
    //       const centerX = shape.x + shape.width / 2;
    //       const centerY = shape.y + shape.height / 2;
    //       const radius = Math.min(shape.width, shape.height) / 2;
    //       ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    //     } else {
    //       ctx.rect(shape.x, shape.y, shape.width, shape.height);
    //     }
    //     ctx.stroke();

    //     // 绘制控制点（角点）
    //     if (shape.type !== 'circle') {
    //       const corners = [
    //         [shape.x, shape.y],
    //         [shape.x + shape.width, shape.y],
    //         [shape.x, shape.y + shape.height],
    //         [shape.x + shape.width, shape.y + shape.height],
    //       ];
    //       ctx.fillStyle = '#ff0';
    //       corners.forEach(([cx, cy]) => {
    //         ctx.beginPath();
    //         ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    //         ctx.fill();
    //       });
    //     }
    //   });
    };

    return {
      canvasRef,
      setMode,
      clearAll,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
    };
  },
});
</script>

<style scoped>
.canvas-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:transparent;
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