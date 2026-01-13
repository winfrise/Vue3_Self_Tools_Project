// 重影效果

export function applyGhosting(ctx, offscreen, params) {
  const { offsetX, offsetY, alpha} = params
  ctx.globalAlpha = alpha
  ctx.drawImage(offscreen, offsetX, offsetY)
  ctx.globalAlpha = 1
}