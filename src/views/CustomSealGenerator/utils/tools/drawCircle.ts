export function drawCircle(
  ctx,
  x,
  y,
  radius,
  options = {}
) {
  const {
    color = 'transparent',
    lineWidth = 1,
  } = options;

  if (radius <= 0) return;

  ctx.save();
  
  ctx.lineWidth = lineWidth;
  
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  ctx.strokeStyle = color;
  ctx.stroke();


  ctx.restore();
}