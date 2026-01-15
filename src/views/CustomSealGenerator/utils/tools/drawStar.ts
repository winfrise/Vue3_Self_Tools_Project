/**
 * 在 Canvas 2D 上绘制一个五角星
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 上下文（必需）
 * @param {number} [cx] - 星星中心 x 坐标（默认：画布水平居中）
 * @param {number} [cy] - 星星中心 y 坐标（默认：画布垂直居中）
 * @param {Object} [options={}] - 配置选项
 * @param {number} [options.outerRadius=10] - 外圆半径
 * @param {number} [options.innerRadius=options.outerRadius * 0.382] - 内圆半径（依赖 outerRadius）
 * @param {number} [options.rotation=-Math.PI / 2] - 旋转角度（弧度，默认尖角朝上）
 * @param {string} [options.fillColor='gold'] - 填充颜色
 * @param {string} [options.strokeColor=''] - 描边颜色（空字符串表示无描边）
 */
export function drawStar(ctx, cx, cy, options = {}) {
  // 安全检查
  if (!ctx || typeof ctx !== 'object' || !ctx.beginPath) {
    console.error('drawStar: Invalid canvas context');
    return;
  }

  // 默认值
  const defaultOptions = {
    outerRadius: 25,
    rotation: -Math.PI / 2,
    fillColor: 'gold',
    strokeColor: ''
  };

  // 合并用户传入的 options
  const config = { ...defaultOptions, ...options };

  // 如果 innerRadius 未提供，则基于 outerRadius 计算
  if (config.innerRadius === undefined) {
    config.innerRadius = config.outerRadius * 0.382; // 黄金比例近似
  }

  // 如果 cx/cy 未传，自动居中
  const finalCx = cx !== undefined ? cx : ctx.canvas.width / 2;
  const finalCy = cy !== undefined ? cy : ctx.canvas.height / 2;

  // 生成五角星顶点（10个点：外-内交替）
  const points = [];
  const step = Math.PI / 5; // 36° in radians

  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? config.outerRadius : config.innerRadius;
    const angle = config.rotation + i * step;
    const x = finalCx + Math.cos(angle) * radius;
    const y = finalCy + Math.sin(angle) * radius;
    points.push({ x, y });
  }

  // 绘制路径
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();

  // 填充
  if (config.fillColor) {
    ctx.fillStyle = config.fillColor;
    ctx.fill();
  }

  // 描边
  if (config.strokeColor) {
    ctx.strokeStyle = config.strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}