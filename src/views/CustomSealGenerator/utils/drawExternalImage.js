// utils/drawExternalImage.ts
export function useDrawExternalImage(ctx, config = {}) {
    const { imageUrl, offsetX = 0, offsetY = 0, x, y, width, height, scale = 1, size } = config

    const centerX = x
    const centerY = y

    if (!imageUrl) {
        return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // 避免跨域问题（如果需要）
    img.src = imageUrl;


    img.onload = () => {
        ctx.clearRect(0, 0, size, size)
        
        const imgWidth = width * scale;
        const imgHeight = width * scale;

        ctx.translate(centerX, centerY)
        
        // 在计算出的位置绘制图片
        ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);
    }
}