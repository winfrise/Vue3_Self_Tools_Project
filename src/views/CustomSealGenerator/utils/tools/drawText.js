export function drawText(ctx, text, x, y, options = {}) {
  const {
    fontSize = 20,
    fontFamily = 'FangSong',
    fontWeight = 'bold',
    color = '#e60000',
    letterSpacing = 0,
    widthRatio = 1,
    heightRatio = 1
  } = options;

  if (!text) return;

  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;

  const chars = Array.from(text);
  if (chars.length === 0) {
    ctx.restore();
    return;
  }

  // 使用原始字体测量
  const font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.font = font;

  // 计算每个字符的原始宽度
  const charWidths = chars.map(char => ctx.measureText(char).width);
  const totalOriginalWidth = charWidths.reduce((a, b) => a + b, 0);
  const totalVisualWidth = totalOriginalWidth * widthRatio + letterSpacing * (chars.length - 1);

  let currentX = x - totalVisualWidth / 2;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const originalWidth = charWidths[i];
    const scaledWidth = originalWidth * widthRatio;

    // 计算字符中心（视觉坐标）
    const centerX = currentX + scaledWidth / 2;

    ctx.save();
    // 先平移到字符中心
    ctx.translate(centerX, y);
    // 再缩放（注意：缩放会影响后续 fillText 的坐标）
    ctx.scale(widthRatio, heightRatio);
    // 在缩放后的坐标系中，绘制在 (0, 0)，但要抵消缩放对 baseline 的影响
    ctx.font = font; // 重要：确保字体一致
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 0, 0);
    ctx.restore();

    currentX += scaledWidth + letterSpacing;
  }

  ctx.restore();
}