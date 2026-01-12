export function drawDebugOptions (ctx, debugConfig = {}) {
  // 解构所有独立调试开关 + 默认值 (所有开关默认false，需要哪个开哪个)
  const {
    size,
    debugShowCenterPoint = false,    // 显示中心点
    debugShowCenterLines = false,    // 显示横竖中心线
    debugShowCircleBaselines = false,// 显示所有圆形参考基线
    debugShowRadiusLabel = false,    // 显示圆形半径数值标注
    debugShowSealNameBaseLine = false,//显示章名基准线
    debugShowSealBorder = false,     // 显示印章整体外框
    debugShowCoordinateLabel = false,// 显示中心点坐标文字
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
    ctx.arc(centerX, centerY, pointSize, 0, Math.PI * 2);
    ctx.fill();

    // 中心点坐标文字 - 独立开关控制
    if (debugShowCoordinateLabel) {
      ctx.fillStyle = style.text;
      ctx.font = `${style.fontSize} ${style.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(`中心点 (${centerX}, ${centerY})`, centerX, centerY + 20);
    }
  }

  // ========== 2. 绘制【横竖中心线】- 独立开关控制 ==========
  if (debugShowCenterLines) {
    ctx.strokeStyle = style.main;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.solidLine);
    // 水平中心线
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasW, centerY);
    ctx.stroke();
    // 垂直中心线
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvasH);
    ctx.stroke();
  }

  // ========== 3. 绘制【圆形参考基线】- 独立开关控制 ==========
  if (debugShowCircleBaselines) {
    ctx.strokeStyle = style.main;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.dashLine); // 虚线绘制，绝对不与印章实线混淆
    // 自动读取你的印章真实配置半径，精准匹配
    const radiusList = [
      debugConfig.innerCircleLineRadius,
      debugConfig.companyRadius,
      debugConfig.circleLineRadius,
      debugConfig.verifyCodeRadius,
      debugConfig.outerCircleLineRadius
    ].filter(item => item && item > 0); // 过滤无效值/未配置值

    radiusList.forEach(radius => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      // 半径数值标注 - 独立开关控制
      if (debugShowRadiusLabel) {
        ctx.fillStyle = style.text;
        ctx.font = `${style.fontSize} ${style.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillText(`r=${radius}`, centerX + radius, centerY);
      }
    });
    ctx.setLineDash(style.solidLine); // 重置为实线
  }

  // ========== 4. 绘制【章名基准线】- 独立开关控制 ==========
  if (debugShowSealNameBaseLine) {
    ctx.strokeStyle = style.main;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash([3, 3]); // 更细的虚线区分
    const baselineY = centerY + (debugConfig.sealNameStartY || 40);
    ctx.beginPath();
    ctx.moveTo(centerX - 120, baselineY);
    ctx.lineTo(centerX + 120, baselineY);
    ctx.stroke();
    // 文字标注
    ctx.fillStyle = style.text;
    ctx.font = `${style.fontSize} ${style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText('章名基准线', centerX, baselineY + 15);
    ctx.setLineDash(style.solidLine);
  }

  // ========== 5. 绘制【印章整体外框】- 独立开关控制 ==========
  if (debugShowSealBorder) {
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(
      (canvasW - sealSize) / 2,
      (canvasH - sealSize) / 2,
      sealSize,
      sealSize
    );
    ctx.stroke();
  }

  // 恢复画布原始状态，必加！防止调试样式影响印章绘制
  ctx.restore();
}