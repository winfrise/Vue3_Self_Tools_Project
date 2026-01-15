// 缓存蒙版，避免重复生成
const agingMaskCache = new Map(); // key: "size|aging", value: canvas

/**
 * 生成做旧蒙版（灰度噪点图）
 * @param {number} size - 蒙版尺寸（与印章同宽高）
 * @param {number} aging - 做旧强度 (0～100)
 * @returns {HTMLCanvasElement}
 */
export function createAgingMask(size, aging = 90) {
  const cacheKey = `${size}|${aging}`;
  if (agingMaskCache.has(cacheKey)) {
    return agingMaskCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  // 转换 aging 为阈值（aging 越大，油墨缺失越多）
  const threshold = aging / 100; // 0.9 表示 90% 区域可能有缺失

  for (let i = 0; i < data.length; i += 4) {
    // 生成随机灰度（模拟油墨密度）
    const rand = Math.random();
    let alpha = 255;

    // 核心：按 aging 强度随机“擦除”部分像素
    if (rand < threshold * 0.7) { // 控制缺失比例
      // 更自然的斑驳：中心保留更多，边缘更易缺失
      const x = (i / 4) % size;
      const y = Math.floor((i / 4) / size);
      const dx = x - size / 2;
      const dy = y - size / 2;
      const dist = Math.sqrt(dx * dx + dy * dy) / (size / 2); // 0～1

      // 边缘更容易缺失
      if (dist > 0.6 && Math.random() < 0.6) {
        alpha = Math.floor(255 * (1 - dist * (threshold * 1.5)));
      } else if (Math.random() < 0.3) {
        // 随机内部斑点
        alpha = Math.floor(255 * (0.3 + Math.random() * 0.7));
      }
    }

    data[i] = 255;     // R
    data[i + 1] = 0;   // G
    data[i + 2] = 0;   // B
    data[i + 3] = alpha; // A —— 关键！
  }

  ctx.putImageData(imageData, 0, 0);

  // 缓存（注意：如果 size 或 aging 变化频繁，可加 LRU 清理）
  agingMaskCache.set(cacheKey, canvas);
  return canvas;
}