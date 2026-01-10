// utils/sealGenerator.js

/**
 * 在 Canvas 上沿圆弧绘制文字
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text 要绘制的文字
 * @param {number} radius 圆半径
 * @param {boolean} isTop 是否在顶部（逆时针），否则在底部（顺时针）
 * @param {Object} options { fontSize, fontFamily, fontWeight, color }
 */
function drawArcText(ctx, text, radius, isTop = true, options = {}) {
  const { fontSize = 20, fontFamily = 'FangSong', fontWeight = 'bold', color = '#e60000' } = options
  if (!text) return
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const chars = text.split('')
  const totalChars = chars.length
  if (totalChars === 0) return
  // 弧长范围：约 240 度（避免左右两端太挤）
  const totalAngle = (4 * Math.PI) / 3 // 240° in radians
  let startAngle
  if (isTop) {
    // 上半圆：从 150° 到 30°（逆时 遍历）
    startAngle = (5 * Math.PI) / 6 // 150°
  } else {
    // 下半圆：从 210° 到 330°（顺时 遍历）
    startAngle = (7 * Math.PI) / 6 // 210°
  }
  for (let i = 0; i < totalChars; i++) {
    const ratio = totalChars > 1 ? i / (totalChars - 1) : 0
    const angle = startAngle + (isTop ? -1 : 1) * ratio * totalAngle
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    ctx.save()
    ctx.translate(x, y)
    // ✅ 关键修正：旋转 angle + π/2，使字符“正立朝外”
    ctx.rotate(angle + Math.PI / 2)
    ctx.fillText(chars[i], 0, 0)
    ctx.restore()
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

  const centerX = ctx.canvas.width / 2
  const centerY = ctx.canvas.height / 2

  // 缩放和平移画布到中心
  ctx.translate(centerX, centerY)
  ctx.scale(size / 200, size / 200)

  // 设置全局颜色
  ctx.strokeStyle = color
  ctx.fillStyle = color

  // === 绘制外圆 ===
  if (showLines) {
    ctx.beginPath()
    ctx.arc(0, 0, 100, 0, Math.PI * 2)
    ctx.lineWidth = outerLine
    ctx.stroke()
  }

  // === 绘制内圆 ===
  if (showLines && innerLine > 0) {
    ctx.beginPath()
    ctx.arc(0, 0, 80, 0, Math.PI * 2)
    ctx.lineWidth = innerLine
    ctx.stroke()
  }

  // === 绘制公司名（上半圆，逆时针）===
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

  // === 绘制中心内容（如 ★）===
  ctx.font = `${fontWeight} ${fontSize * 2}px "${fontFamily}", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(centerText, 0, 0)

  // === 绘制防伪码（下半圆弧形）===
  if (verifyCode) {
    drawArcText(ctx, verifyCode, 65, false, {
      fontSize: fontSize - 6,
      fontFamily,
      fontWeight,
      color,
    })
  }

  // === 老化效果（可选）===
  if (enableAging) {
    const noise = Array.from({ length: 200 }, () =>
      Array.from({ length: 200 }, () => Math.random())
    )
    for (let i = 0; i < 200; i++) {
      for (let j = 0; j < 200; j++) {
        if (noise[i][j] < aging / 100) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.fillRect(i - 100, j - 100, 1, 1)
        }
      }
    }
  }

  ctx.restore()
}