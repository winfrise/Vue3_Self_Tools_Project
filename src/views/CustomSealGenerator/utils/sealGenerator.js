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
  const {
    fontSize = 20,
    fontFamily = 'FangSong',
    fontWeight = 'bold',
    color = '#e60000'
  } = options

  if (!text) return

  // 设置字体样式
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  const totalChars = chars.length

  // 总弧度：上半圆约 240 度（4π/3 弧度），留出左右空白
  const totalAngle = (4 * Math.PI) / 3 // ～240°
  const startAngle = isTop ? -Math.PI / 2 - totalAngle / 2 : Math.PI / 2 - totalAngle / 2

  for (let i = 0; i < totalChars; i++) {
    const ratio = i / (totalChars - 1 || 1) // 防止除零
    const angle = startAngle + ratio * totalAngle

    // 字符中心坐标
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    // 保存上下文
    ctx.save()

    // 移动到字符位置
    ctx.translate(x, y)

    // 旋转：让文字“正立”
    // 顶部文字：旋转 angle + π（朝向圆心）
    // 底部文字：旋转 angle（朝向外侧，更符合公章习惯）
    const rotateAngle = isTop ? angle + Math.PI : angle
    ctx.rotate(rotateAngle)

    // 绘制字符（注意：此时 (0,0) 是字符中心）
    ctx.fillText(chars[i], 0, 0)

    // 恢复上下文
    ctx.restore()
  }
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

  // === 绘制章名（下半圆，顺时针）===
  drawArcText(ctx, sealName, 92, false, {
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

  // === 绘制防伪码（水平居中，在 ★ 下方）===
  if (verifyCode) {
    ctx.font = `${fontWeight} ${fontSize - 6}px "${fontFamily}", sans-serif`
    ctx.fillText(verifyCode, 0, 30)
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