export function drawText(ctx, text, x, y, options = {}) {
  const {
    fontSize = 20,
    fontFamily = 'FangSong',
    fontWeight = 'bold',
    color = '#e60000',
    letterSpacing = 0 // 新增：字符间距（像素）
  } = options;

  if (!text) return;

  const font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';

  const chars = Array.from(text); // 支持 emoji/中文等 Unicode
  if (chars.length === 0) return;

  // 计算总宽度（含 letter-spacing）
  let totalWidth = 0;
  const charWidths = [];

  for (const char of chars) {
    const width = ctx.measureText(char).width;
    charWidths.push(width);
    totalWidth += width;
  }

  // 添加字符之间的间距：n 个字符有 (n - 1) 个间隔
  totalWidth += letterSpacing * (chars.length - 1);

  // 起始 x 位置（使整体居中于传入的 x）
  let currentX = x - totalWidth / 2;

  // 逐字绘制
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const width = charWidths[i];

    // 绘制当前字符（水平居中于 currentX + width/2）
    ctx.fillText(char, currentX + width / 2, y);

    // 移动到下一个字符起始位置
    currentX += width + letterSpacing;
  }
}