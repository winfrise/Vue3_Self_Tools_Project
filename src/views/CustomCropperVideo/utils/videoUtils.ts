// src/utils/videoUtils.ts
export const extractFrame = async (
  videoUrl: string,
  time: number
): Promise<string> => {
  const video = document.createElement('video');
  video.src = videoUrl;
  await video.load();
  video.currentTime = time;
  await new Promise(r => video.onseeked = r);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg');
};