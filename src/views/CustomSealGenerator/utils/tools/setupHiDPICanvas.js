   export function setupHiDPICanvas(canvas, canvasSize, dpr) {
      dpr = dpr || window.devicePixelRatio || 1;

      // 设置 CSS 显示尺寸（用户看到的大小）
      canvas.style.width = canvasSize + 'px';
      canvas.style.height = canvasSize + 'px';

      // 设置实际绘图缓冲区尺寸（物理像素）
      canvas.width = canvasSize * dpr;
      canvas.height = canvasSize * dpr;

      // 获取上下文并缩放以匹配 DPR
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr); // 关键：所有后续绘图自动高清

      return { ctx, dpr };
    }
