// utils/sealGenerator.js
import { createAgingMask } from "./createAgingMask";

import { drawArcText } from './tools/drawArcText'
import { drawText } from './tools/drawText'
import { drawStar } from "./tools/drawStar";
import { drawCircle } from "./tools/drawCircle";
import { drawDebugOptions } from "./tools/drawDebugOptions";


export function useSealGenerator(config, template, ctx) {
  const {
    companyName = 'xxx有限公司',
    companyRadius = 80,
    companyFontSize,
    companyFontFamily,
    companyFontWeight,
    companyColor,
    companyNameLetterSpacing,
    companyNameWidthRatio,
    companyNameHeightRatio,
    
    sealName = '合同专用章',
    sealNameStartY = 40,
    sealNameFontSize,
    sealNameFontFamily,
    sealNameFontWeight,
    sealNameColor,
    sealNameLetterSpacing,
    sealNameWidthRatio,
    sealNameHeightRatio,


    centerText = '★',

    verifyCode = '',
    verifyCodeFontSize,
    verifyCodeRadius,
    verifyCodeFontFamily,
    verifyCodeFontWeight,
    verifyCodeColor,
    verifyCodeLetterSpacing,

    color = '#e60000',
    size = 240,

    enableCircleLine = true,
    circleLineWidth,
    circleLineColor,
    circleLineRadius,

    enableInnerCircleLine = false,
    innerCircleLineWidth,
    innerCircleLineColor,
    innerCircleLineRadius,

    enableOuterCircleLine = false,
    outerCircleLineWidth,
    outerCircleLineColor,
    outerCircleLineRadius,


    enableAging = false,
    aging = 90,
    fontFamily = 'FangSong',
    fontSize = 20,
    fontWeight = 'bold',
  } = config


  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.save()

  // 启用抗锯齿
  ctx.imageSmoothingEnabled = true;

  drawDebugOptions(ctx, config.debugConfig)

  // const centerX = size / 2;
  // const centerY = size / 2;
  const centerX = ctx.canvas.width / 2
  const centerY = ctx.canvas.height / 2
  const outerRadius = size * 0.45; // 外圈半径
  const innerRadius = size * 0.25; // 内圈半径

  // 缩放和平移画布到中心
  ctx.translate(centerX, centerY)
  // ctx.scale(size / 200, size / 200)

  // 设置全局颜色
  ctx.strokeStyle = color
  ctx.fillStyle = color


  // === 应用轻微随机旋转（模拟手盖）===
  // const rotation = (Math.random() - 0.5) * 0.06; // ±1.7度

  // ctx.save();
  // ctx.translate(centerX, centerY);
  // ctx.rotate(rotation);

  // === 1. 绘制圆 ===
  if (enableCircleLine) {
    drawCircle(ctx, 0, 0, circleLineRadius, {
      lineWidth: circleLineWidth,
      color: circleLineColor || color,
    })
  }


    // === 1. 绘制外圆 ===
  if (enableOuterCircleLine) {
    drawCircle(ctx, 0, 0, outerCircleLineRadius, {
      lineWidth: outerCircleLineWidth,
      color: outerCircleLineColor || color,
    })
  }

  if (enableInnerCircleLine) {
    drawCircle(ctx, 0, 0, innerCircleLineRadius, {
      lineWidth: innerCircleLineWidth,
      color: innerCircleLineColor || color,
    })
  }


  // === 2. 绘制内圆 ===
  // if (showLines && innerLine > 0) {
  //   ctx.lineWidth = innerLine;
  //   ctx.beginPath();
  //   ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
  //   ctx.stroke();
  // }

     // === 3. 绘制五角星 ===
  drawStar(ctx, {fontWeight, fontSize, fontFamily, centerText});

  // === 4. 绘制公司名（上半圆，逆时针）==
  drawArcText(ctx, companyName, companyRadius, true, {
    fontSize: companyFontSize || fontSize,
    fontFamily: companyFontFamily || fontFamily,
    fontWeight: companyFontWeight || fontWeight,
    color: companyColor || color,
    letterSpacing: companyNameLetterSpacing, 
    widthRatio: companyNameWidthRatio,
    heightRatio: companyNameHeightRatio,
  })

  // === 绘制章名 ===
  drawText(ctx, sealName, 0, sealNameStartY, {
    fontSize: sealNameFontSize,
    fontFamily: sealNameFontFamily,
    fontWeight: sealNameFontWeight,
    color: sealNameColor,
    letterSpacing: sealNameLetterSpacing,
    widthRatio: sealNameWidthRatio,
    heightRatio: sealNameHeightRatio,
  })



  // === 绘制防伪码（下半圆弧形）===
  drawArcText(ctx, verifyCode, verifyCodeRadius, false, {
    fontSize: verifyCodeFontSize,
    fontFamily: verifyCodeFontFamily,
    fontWeight: verifyCodeFontWeight,
    color: verifyCodeColor,
    letterSpacing: verifyCodeLetterSpacing,
  })

  ctx.restore()

 // === 3. ✅ 新增：应用做旧效果 ===
  if (enableAging && aging > 0) {
    try {
      const mask = createAgingMask(size, aging);
      ctx.save();
      // 关键：用蒙版裁剪当前印章内容
      ctx.globalCompositeOperation = 'destination-in';   
      ctx.drawImage(mask, (ctx.canvas.width - size) / 2,  (ctx.canvas.height - size )/ 2 , size , size );
      ctx.restore();
    } catch (e) {
      console.warn('做旧效果应用失败:', e);
    }
  }
}