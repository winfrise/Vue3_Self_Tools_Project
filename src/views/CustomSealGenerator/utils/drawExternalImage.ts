// utils/drawExternalImage.ts
export function useDrawExternalImage(ctx, config = {}) {
  const {
    imageUrl,
    offsetX = 0,
    offsetY = 0,
    width, // 原始绘制宽度（可选）
    height, // 原始绘制高度（可选）
    scale = 1,
    size = ctx.canvas.width || 512, // 默认取 canvas 宽度，或设默认值
  } = config;

  if (!imageUrl) {
    console.warn('No image URL provided');
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    // 清除画布
    ctx.clearRect(0, 0, size, size);

    // 确定绘制尺寸
    const drawWidth = (width !== undefined ? width : img.width) * scale;
    const drawHeight = (height !== undefined ? height : img.height) * scale;

    // 计算居中位置（考虑 offset）
    const centerX = size / 2 + offsetX;
    const centerY = size / 2 + offsetY;

    // 保存当前状态（用于 restore）
    ctx.save();

    // 将原点移到画布中心（可选，也可以直接计算绝对坐标）
    // 这里我们改用直接计算左上角，避免 translate 带来的副作用
    const x = centerX - drawWidth / 2;
    const y = centerY - drawHeight / 2;

    // 绘制图片
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    // 恢复上下文（如果用了 save）
    ctx.restore();
  };

  img.onerror = (e) => {
    console.error('Failed to load image:', imageUrl, e);
  };

  img.src = imageUrl;
}