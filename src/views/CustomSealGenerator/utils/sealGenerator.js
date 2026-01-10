// utils/sealGenerator.js
import { createAgingMask } from "./createAgingMask";
/**
 * 沿圆弧绘制文字，并自动居中
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} radius
 * @param {boolean} isTop
 * @param {Object} options
 */
function drawArcText(ctx, text, radius, isTop = true, options = {}) {
  const {
    fontSize = 20,
    fontFamily = 'FangSong',
    fontWeight = 'bold',
    color = '#e60000',
    // 新增：控制弧长占比（0～1），1 = 全弧，0.8 = 留白20%
    arcRatio = 0.9
  } = options;

  if (!text) return;

  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const chars = text.split('');
  const totalChars = chars.length;
  if (totalChars === 0) return;

  // === 关键：动态计算起始角度，实现居中 ===

  // 1. 定义最大可用弧度（避免贴到左右边缘）
  const maxArcAngle = (4 * Math.PI) / 3; // 240°
  const usableArc = maxArcAngle * arcRatio; // 实际使用弧长

  // 2. 估算每个字符所需角度（简化：等分）
  // 更精确做法：测量每个字符宽度，但性能开销大
  const charAngle = usableArc / totalChars;

  // 3. 计算整个文字块的总跨度
  const totalSpan = charAngle * (totalChars - 1); // n个字有n-1个间隔

  // 4. 确定弧的“中心角度”
  const centerAngle = isTop ?  (3 * Math.PI) / 2 : Math.PI / 2; // 上半圆90°, 下半圆270°

  // 5. 起始角度 = 中心角 - 总跨度/2
  const startAngle = centerAngle - totalSpan / 2;

  // === 开始绘制 ===
  for (let i = 0; i < totalChars; i++) {
    const angle = startAngle + i * charAngle;

    // 如果是下半圆，需要镜像处理方向？→ 不需要！因为我们用 centerAngle 控制了位置
    // 但要注意：下半圆的阅读顺序应为从左到右（顺时针）
    // 所以我们可能需要反转字符顺序（仅当 isTop=false 时）
    const charToDraw = isTop ? chars[i] : chars[totalChars - 1 - i];

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    // ✅ 旋转使字头朝外
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(charToDraw, 0, 0);
    ctx.restore();
  }
}
/**
 * ✨ 新增：绘制普通水平居中文字（用于章名）
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {Object} options { fontSize, fontFamily, fontWeight, color }
 */
function drawText(ctx, text, x, y, options = {}) {
  const { fontSize = 20, fontFamily = 'FangSong', fontWeight = 'bold', color = '#e60000' } = options
  if (!text) return
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

/**
 * 绘制五角星（居中）
 */
function drawStar(ctx, { fontWeight, fontSize, fontFamily, centerText}) {
  ctx.font = `${fontWeight} ${fontSize * 2}px "${fontFamily}", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(centerText, 0, 0)
}

export function useSealGenerator(config, template, ctx) {
  const {
    company = 'XX有限公司',
    sealName = '合同专用章',
    centerText = '★',
    verifyCode = '',
    color = '#e60000',
    size = 240,
    outerLine = 4,
    innerLine = 1,
    showLines = true,
    enableAging = false,
    aging = 90,
    fontFamily = 'FangSong',
    fontSize = 20,
    fontWeight = 'bold',
  } = config

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.save()

  // 启用抗锯齿
  ctx.imageSmoothingEnabled = true;


  // const centerX = size / 2;
  // const centerY = size / 2;
  const centerX = ctx.canvas.width / 2
  const centerY = ctx.canvas.height / 2
  const outerRadius = size * 0.45; // 外圈半径
  const innerRadius = size * 0.25; // 内圈半径

  // 缩放和平移画布到中心
  ctx.translate(centerX, centerY)
  // ctx.scale(size / 200, size / 200)

  // 设置全局颜色
  ctx.strokeStyle = color
  ctx.fillStyle = color


  // === 应用轻微随机旋转（模拟手盖）===
  // const rotation = (Math.random() - 0.5) * 0.06; // ±1.7度

  // ctx.save();
  // ctx.translate(centerX, centerY);
  // ctx.rotate(rotation);

  // === 1. 绘制外圆 ===
  if (showLines) {
    ctx.lineWidth = outerLine;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === 2. 绘制内圆 ===
  if (showLines && innerLine > 0) {
    ctx.lineWidth = innerLine;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

     // === 3. 绘制五角星 ===
  drawStar(ctx, {fontWeight, fontSize, fontFamily, centerText});

  // === 4. 绘制公司名（上半圆，逆时针）===
  drawArcText(ctx, company, 92, true, {
    fontSize: fontSize - 2,
    fontFamily,
    fontWeight,
    color,
  })

  // === 绘制章名：使用新的 drawText 函数（水平居中，在 ★ 下方）===
  drawText(ctx, sealName, 0, 40, {
    fontSize: fontSize + 4,
    fontFamily,
    fontWeight,
    color,
  })



  // === 绘制防伪码（下半圆弧形）===
  if (verifyCode) {
    drawArcText(ctx, verifyCode, 65, false, {
      fontSize: fontSize - 6,
      fontFamily,
      fontWeight,
      color,
    })
  }

  ctx.restore()

 // === 3. ✅ 新增：应用做旧效果 ===
  if (enableAging && aging > 0) {
    try {
      const mask = createAgingMask(size, aging);
      ctx.save();
      // 关键：用蒙版裁剪当前印章内容
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, (ctx.canvas.width - size) / 2,  (ctx.canvas.height - size )/ 2 , size , size );
      ctx.restore();
    } catch (e) {
      console.warn('做旧效果应用失败:', e);
    }
  }
}