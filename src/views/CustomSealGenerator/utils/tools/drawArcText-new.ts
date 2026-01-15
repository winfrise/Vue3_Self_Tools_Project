export function drawArcText(ctx, text, radius, isTop = true, options = {}) {
  const {
    fontSize = 20,
    fontFamily = 'FangSong',
    fontWeight = 'bold',
    color = '#e60000',
    arcRatio = 0.9,
    letterSpacing = 0, // 字符间距（像素）
    widthRatio = 1, // 宽度缩放比例
    heightRatio = 1 // 高度缩放比例
  } = options;

  if (!text) return;

  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = Array.from(text);
  const totalChars = chars.length;
  if (totalChars === 0) return;

  const maxArcAngle = (4 * Math.PI) / 3; // 240°
  const usableArc = maxArcAngle * arcRatio;

  // 使用原始字体测量一个典型汉字的宽度
  const avgCharWidth = ctx.measureText('国').width || fontSize * 0.8;
  
  // 计算字符间距的角度增量（弧度），注意这里用的是未缩放的letterSpacing
  const spacingAngle = letterSpacing / radius;

  // 每个字符占据的角度 = 字符本身所需角度（基于缩放后宽度）+ 间距角度
  const scaledAvgCharWidth = avgCharWidth * widthRatio; // 应用宽度缩放
  const charAngle = (scaledAvgCharWidth / radius) + spacingAngle;
  
  // 总跨度 = 所有字符内容角度（基于缩放）+ 所有间距角度
  const totalSpan = charAngle * totalChars - spacingAngle;

  const centerAngle = isTop ? (3 * Math.PI) / 2 : Math.PI / 2;
  const startAngle = centerAngle - totalSpan / 2;

  for (let i = 0; i < totalChars; i++) {
    const angle = startAngle + i * charAngle;

    const charToDraw = isTop ? chars[i] : chars[totalChars - 1 - i];

    // 获取当前字符的实际宽度用于缩放
    const charWidth = ctx.measureText(charToDraw).width;
    const scaledCharWidth = charWidth * widthRatio;
    const scaledCharHeight = fontSize * heightRatio;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);

    // 先旋转，再缩放
    ctx.rotate(angle + (isTop ? Math.PI / 2 : -Math.PI / 2)); // 根据是顶部还是底部调整旋转角度
    ctx.scale(widthRatio, heightRatio); // 缩放上下文

    ctx.fillText(charToDraw, -(scaledCharWidth / 2), -(scaledCharHeight / 2)); // 调整位置以适应缩放
    ctx.restore();
  }
}