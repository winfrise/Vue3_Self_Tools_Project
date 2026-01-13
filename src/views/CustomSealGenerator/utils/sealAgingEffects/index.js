import { applyGhosting } from './applyGhostingEffect'
import { applyInkInconsistent} from './applyInkInconsistent'
export function useSealArgingEffect (ctx, effectList, options = {}) {

    const { dpr } = options

    if (!ctx) return
    const canvas = ctx.canvas
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    const w = canvasWidth / dpr
    const h = canvasHeight / dpr


  // 为支持“重影”等需要多次绘制的效果，先保存原始图像到离屏 canvas
  const offscreen = document.createElement('canvas')
  offscreen.width = w
  offscreen.height = h
  const offCtx = offscreen.getContext('2d')
  offCtx.drawImage(canvas, 0, 0, w, h)


  // 清空主画布
  ctx.clearRect(0, 0, w, h)

  const enabledEffects = effectList.filter(e => e.enabled)

  // 先处理背景噪点
  enabledEffects.forEach(effect => {
    if (effect.type === 'backgroundNoise') {
      applyBackgroundNoise(ctx, w, h, effect.params.intensity)
    }
  })

  // 绘制印章
  ctx.drawImage(offscreen, 0, 0)

  // 应用其他效果
  enabledEffects.forEach(effect => {
    const { type, params } = effect
    if (type === 'backgroundNoise') return

    switch (type) {
      case 'edgeWear':
        applyEdgeWear(ctx, w, h, params.intensity, params.density || 1)
        break
      case 'inkInconsistent':
        applyInkInconsistent(ctx, params)
        break
      case 'cracking':
        applyCracking(ctx, w, h, params.count || 20, params.length || 30)
        break
      case 'partialLoss':
        applyPartialLoss(ctx, w, h, params.intensity)
        break
      case 'smudge':
        applySmudge(ctx, w, h, params.intensity, params.radius || 5)
        break
      case 'discoloration':
        applyDiscoloration(ctx, w, h, params.intensity)
        break
      case 'ghosting':
        applyGhosting(ctx, offscreen,  params)
        break
      case 'dryStamp':
        applyDryStamp(ctx, w, h, params.intensity)
        break
      case 'physicalDamage':
        applyPhysicalDamage(ctx, w, h, params.count || 5, params.size || 8)
        break
    }
  })
}

// ========== 各种老化效果实现 ==========
function applyEdgeWear(cctx, offscreen, w, h, intensity) {
  const centerX = w / 2
  const centerY = h / 2
  const radius = 90
  const points = Math.floor(300 * intensity)
  for (let i = 0; i < points; i++) {
    const angle = Math.random() * Math.PI * 2
    const r = radius - Math.random() * 8 * intensity
    const x = centerX + Math.cos(angle) * r
    const y = centerY + Math.sin(angle) * r
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y, 1.5 + intensity * 2, 0, Math.PI * 2)
    ctx.fill()
  }
}



function applyCracking(ctx, offscreen, w, h, intensity) {
  const lines = Math.floor(20 * intensity)
  for (let i = 0; i < lines; i++) {
    const startX = w / 2 + (Math.random() - 0.5) * 100
    const startY = h / 2 + (Math.random() - 0.5) * 100
    const len = 10 + 30 * intensity
    const angle = Math.random() * Math.PI * 2
    const endX = startX + Math.cos(angle) * len
    const endY = startY + Math.sin(angle) * len

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1 + intensity * 2
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
  }
}

function applyPartialLoss(ctx, offscreen, w, h, intensity) {
  const holes = Math.floor(8 * intensity)
  for (let i = 0; i < holes; i++) {
    const x = w / 2 + (Math.random() - 0.5) * 80
    const y = h / 2 + (Math.random() - 0.5) * 80
    const r = 5 + 15 * intensity
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function applySmudge(ctx, offscreen, w, h, intensityr) {
  const dots = Math.floor(150 * intensity)
  for (let i = 0; i < dots; i++) {
    const dx = (Math.random() - 0.5) * 140
    const dy = (Math.random() - 0.5) * 140
    const dist = Math.hypot(dx, dy)
    if (dist > 80 && dist < 110) {
      ctx.fillStyle = `rgba(120, 100, 100, ${0.05 * intensity})`
      ctx.beginPath()
      ctx.arc(w / 2 + dx, h / 2 + dy, 2 + intensity * 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function applyDiscoloration(ctx, offscreen, w, h, intensity) {
  // 整体偏黄/褪色：叠加黄色半透明层
  ctx.fillStyle = `rgba(200, 180, 100, ${intensity * 0.3})`
  ctx.fillRect(0, 0, w, h)
}

function applyBackgroundNoise(ctx, offscreen, w, h, intensity) {
  const dots = Math.floor(w * h * 0.0005 * intensity)
  for (let i = 0; i < dots; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const gray = 200 + Math.random() * 55
    ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${0.3 * intensity})`
    ctx.fillRect(x, y, 1, 1)
  }
}

function applyDryStamp(ctx, offscreen, w, h, intensity) {
  const streaks = Math.floor(40 * intensity)
  for (let i = 0; i < streaks; i++) {
    const x = w / 2 + (Math.random() - 0.5) * 100
    const y = h / 2 + (Math.random() - 0.5) * 100
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 3 + 5 * intensity, y)
    ctx.stroke()
  }
}

function applyPhysicalDamage(ctx, offscreen, w, h, intensity) {
  const holes = Math.floor(5 * intensity)
  for (let i = 0; i < holes; i++) {
    const x = w / 2 + (Math.random() - 0.5) * 100
    const y = h / 2 + (Math.random() - 0.5) * 100
    const shape = Math.random() > 0.5 ? 'circle' : 'rect'
    ctx.fillStyle = '#fff'
    if (shape === 'circle') {
      ctx.beginPath()
      ctx.arc(x, y, 4 + 8 * intensity, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillRect(x - 3 - 4 * intensity, y - 2, 6 + 8 * intensity, 4)
    }
  }
}