/**
 * 绘制五角星（居中）
 */
export function drawStar(ctx, { fontWeight, fontSize, fontFamily, centerText}) {
  ctx.font = `${fontWeight} ${fontSize * 2}px "${fontFamily}", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(centerText, 0, 0)
}
