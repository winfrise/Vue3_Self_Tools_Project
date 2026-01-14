export function applyPressureVariation (ctx, options) {
    const { colors } = options
    const canvas = ctx.canvas
    ctx.globalCompositeOperation = 'source-in';
    // 细腻渐变节点
    const gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    // gradient.addColorStop(0,  'rgba(250, 149, 170, 1)');
    // gradient.addColorStop(0.3, 'rgba(138, 1, 28, 1)');
    // gradient.addColorStop(0.5, 'rgba(234, 31, 72, 1)');
    // gradient.addColorStop(1,   'rgba(220, 20, 60, 1)');
    gradient.addColorStop(...colors[0])
    gradient.addColorStop(...colors[1])
    gradient.addColorStop(...colors[2])
    gradient.addColorStop(...colors[3])
    // 填充渐变
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width, canvas.height);
    // 恢复状态
    ctx.restore();
}