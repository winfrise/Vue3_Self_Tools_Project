// src/utils/generateTimestampFilename.ts

/**
 * 生成基于当前时间的文件名，包含日期、时间和毫秒部分（0-999）
 * 格式：yyyy年MM月dd日HH时mm分[毫秒部分].ext
 * 示例：2026年01月17日17时30分[123].mp4
 */
export const generateTimestampFilename = (extension = 'mp4'): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const milliseconds = now.getMilliseconds() // 0 ～ 999

  return `${year}年${month}月${day}日${hours}时${minutes}分${milliseconds}.${extension}`
}