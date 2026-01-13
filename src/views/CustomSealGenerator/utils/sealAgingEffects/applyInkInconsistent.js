export function applyInkInconsistent(ctx, options, w = 300, h = 300) {
    const { intensity } = options
  // 假设印章位于画布中心，半径为90像素
  const cx = w / 2;
  const cy = h / 2;
  const radius = 90;

  // 计算要添加的油墨不均点的数量，基于强度参数
  const patches = Math.floor(5 * intensity); // 强度越大，油墨不均越明显

  for (let i = 0; i < patches; i++) {
    // 随机生成一个位置，确保该位置在印章范围内
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;

    // 随机生成一个大小和透明度
    const size = 20 + Math.random() * 30 * intensity;
    const opacity = 0.3 * intensity;

    // 绘制一个半透明的圆圈以模拟印油不均
    ctx.fillStyle = `rgba(0,0,0,${opacity})`; // 使用白色填充，表示油墨缺失
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}