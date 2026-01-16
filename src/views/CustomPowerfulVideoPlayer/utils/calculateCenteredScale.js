/**
 * 计算元素在容器中居中显示且不变形的缩放比例及留白
 * @param {number} containerWidth - 容器的宽度
 * @param {number} containerHeight - 容器的高度
 * @param {number} elementWidth - 元素的原始宽度
 * @param {number} elementHeight - 元素的原始高度
 * @returns {{
 *   scale: number,       // 缩放比例 (0-1之间表示缩小，>1表示放大)
 *   left: number,        // 左侧留白（px）
 *   right: number,       // 右侧留白（px） - 通常等于left
 *   top: number,         // 上侧留白（px）
 *   bottom: number,      // 下侧留白（px） - 通常等于top
 *   displayWidth: number, // 显示宽度（px）
 *   displayHeight: number // 显示高度（px）
 * }}
 */
export function calculateCenteredScale(containerWidth, containerHeight, elementWidth, elementHeight) {
    // 计算按宽度缩放的比例
    const scaleX = containerWidth / elementWidth;
    // 计算按高度缩放的比例
    const scaleY = containerHeight / elementHeight;
    
    // 取较小的比例，确保元素不会超出容器
    const scale = Math.min(scaleX, scaleY);
    
    // 计算显示尺寸
    const displayWidth = elementWidth * scale;
    const displayHeight = elementHeight * scale;
    
    // 计算留白（居中时，左右留白相等，上下留白相等）
    const left = (containerWidth - displayWidth) / 2;
    const top = (containerHeight - displayHeight) / 2;
    
    // 确保留白值不为负（当元素比容器大时，但scale已经保证了元素不会超出，所以理论上不会为负）
    const right = left;
    const bottom = top;
    
    return {
        scale,
        left,
        right,
        top,
        bottom,
        displayWidth,
        displayHeight
    };
}
