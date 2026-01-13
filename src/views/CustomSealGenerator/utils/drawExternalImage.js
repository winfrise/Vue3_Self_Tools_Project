// utils/drawExternalImage.ts
export function useDrawExternalImage(ctx, config = {}) {
    const { imageUrl, offsetX = 0, offsetY = 0, x, y, width, height, scale = 1 } = config

    if (!imageUrl) {
        return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // 避免跨域问题（如果需要）
    img.src = imageUrl;

    img.onload = () => {
        const imgWidth = width * scale;
        const imgHeight = width * scale;

        // 在计算出的位置绘制图片
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
    }
}