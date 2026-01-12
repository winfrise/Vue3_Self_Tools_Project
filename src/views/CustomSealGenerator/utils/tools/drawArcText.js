export function drawArcText(ctx, text, radius, isTop = true, options = {}) {
  const {
    fontSize = 20,
    fontFamily = 'FangSong',
    fontWeight = 'bold',
    color = '#e60000',
    arcRatio = 0.9,
    letterSpacing = 0,
    widthRatio = 1,
    heightRatio = 1
  } = options;

  if (!text) return;

  ctx.font = `${fontWeight} ${fontSize}px 等线, "${fontFamily}"`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = Array.from(text);
  const totalChars = chars.length;
  if (totalChars === 0) return;

  const maxArcAngle = (4 * Math.PI) / 3;
  const usableArc = maxArcAngle * arcRatio;

  // 精确测量每个字符的实际宽度
  const charWidths = [];
  let totalCharWidth = 0;

  for (let i = 0; i < totalChars; i++) {
    const charWidth = ctx.measureText(chars[i]).width || fontSize;
    charWidths.push(charWidth);
    totalCharWidth += charWidth;
  }

  const avgCharWidth = totalCharWidth / totalChars;
  const spacingAngle = letterSpacing / radius;
  const scaledAvgCharWidth = avgCharWidth * widthRatio;
  const charAngle = (scaledAvgCharWidth / radius) + spacingAngle;
  const totalSpan = charAngle * totalChars - spacingAngle;

  const centerAngle = isTop ? (3 * Math.PI) / 2 : Math.PI / 2;
  const startAngle = centerAngle - totalSpan / 2 + charAngle / 2;

  for (let i = 0; i < totalChars; i++) {
    const angle = startAngle + i * charAngle;
    const charToDraw = isTop ? chars[i] : chars[totalChars - 1 - i];

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + (isTop ? Math.PI / 2 : -Math.PI / 2));
    
    // 先设置缩放，再绘制文字
    ctx.scale(widthRatio, heightRatio);
    
    // 使用未缩放的坐标，因为缩放已经应用到上下文中
    ctx.fillText(charToDraw, 0, 0);
    
    ctx.restore();
  }
}