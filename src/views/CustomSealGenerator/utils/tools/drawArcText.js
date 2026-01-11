/**
 * 沿圆弧绘制文字，并自动居中
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} radius
 * @param {boolean} isTop
 * @param {Object} options
 */
export function drawArcText(ctx, text, radius, isTop = true, options = {}) {
  const {
    fontSize = 20,
    fontFamily = 'FangSong',
    fontWeight = 'bold',
    color = '#e60000',
    arcRatio = 0.9,
    letterSpacing = 0 // 新增：字符间距（像素）
  } = options;

  if (!text) return;

  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = text.split('');
  const totalChars = chars.length;
  if (totalChars === 0) return;

  // === 关键：动态计算起始角度，实现居中 + 字符间距 ===

  const maxArcAngle = (4 * Math.PI) / 3; // 240°
  const usableArc = maxArcAngle * arcRatio;

  // 估算单个字符的平均宽度（简化处理，用一个典型汉字）
  const avgCharWidth = ctx.measureText('国').width || fontSize * 0.8;
  
  // 将 letterSpacing 转换为角度增量（弧度）
  const spacingAngle = letterSpacing / radius;

  // 每个字符占据的角度 = 字符本身所需角度 + 间距角度
  // 注意：n 个字符有 (n - 1) 个间距
  const totalSpacingAngle = spacingAngle * (totalChars - 1);
  const totalTextAngle = usableArc - totalSpacingAngle;

  if (totalTextAngle <= 0) {
    console.warn('弧长不足或间距过大，无法绘制文字');
    return;
  }

  const charAngle = totalTextAngle / totalChars; // 每个字符“内容”占的角度

  // 总跨度 = 所有字符内容角度 + 所有间距角度
  const totalSpan = charAngle * (totalChars - 1) + totalSpacingAngle;

  const centerAngle = isTop ? (3 * Math.PI) / 2 : Math.PI / 2;
  const startAngle = centerAngle - totalSpan / 2;

  // === 开始绘制 ===
  for (let i = 0; i < totalChars; i++) {
    // 累计角度：前 i 个字符的内容角度 + 前 i 个间距
    const angle = startAngle + i * charAngle + i * spacingAngle;

    const charToDraw = isTop ? chars[i] : chars[totalChars - 1 - i];

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2); // 字头朝外
    ctx.fillText(charToDraw, 0, 0);
    ctx.restore();
  }
}