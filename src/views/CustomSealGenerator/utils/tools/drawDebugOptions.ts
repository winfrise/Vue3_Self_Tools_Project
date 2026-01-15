export function drawDebugOptions (ctx, debugConfig = {}) {
  // 解构所有独立调试开关 + 默认值 (所有开关默认false，需要哪个开哪个)
  const {
    size,
    debugShowCenterPoint = false,    // 显示中心点
    debugShowCenterLines = false,    // 显示横竖中心线
  } = debugConfig;

  // 调试样式统一配置 - 可按需修改颜色/粗细/透明度，不影响印章主体
  const style = {
    main: 'rgba(60, 180, 255, 0.6)',    // 参考线主色-半透天蓝
    point: 'rgba(255, 40, 40, 0.9)',     // 中心点-醒目半透红
    text: 'rgba(255, 150, 0, 0.9)',      // 文字标注-半透橙黄
    border: 'rgba(255, 40, 40, 0.5)',    // 印章外框-半透红
    lineWidth: 1,
    dashLine: [5, 5],                    // 虚线样式(区分印章正式线条)
    solidLine: [],
    fontSize: '12px',
    fontFamily: 'sans-serif'
  }

  // 画布基础常量
  const canvasW = size;
  const canvasH = size;
  const centerX = canvasW / 2;
  const centerY = canvasH / 2;
  const sealSize = debugConfig.size || 240;

  // 保存画布状态，防止调试样式污染印章绘制
  ctx.save();

  // ========== 1. 绘制【中心点】- 独立开关控制 ==========
  if (debugShowCenterPoint) {
    ctx.fillStyle = style.point;
    const pointSize = 6;
    ctx.beginPath();
    ctx.arc(0, 0, pointSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== 2. 绘制【横竖中心线】- 独立开关控制 ==========
  if (debugShowCenterLines) {
    ctx.strokeStyle = style.main;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.solidLine);
    // 垂直中心线
    ctx.beginPath();
    ctx.moveTo(0, - canvasH / 2);
    ctx.lineTo(0, canvasH / 2);
    ctx.stroke();

    // 水平中心线
    ctx.beginPath();
    ctx.moveTo(- canvasW / 2, 0);
    ctx.lineTo(canvasW / 2,  0);
    ctx.stroke();
  }


  // 恢复画布原始状态，必加！防止调试样式影响印章绘制
  ctx.restore();
}