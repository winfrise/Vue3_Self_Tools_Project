// src/types/video.d.ts
export interface Segment {
  id: string;
  startTime: number; // 秒
  endTime: number;   // 秒
  duration: number;  // 持续时间（秒）
  frames: number;    // 帧数
  size: string;      // 大约大小
  enableCrop?: boolean;
  cropWidth?: number; // 原始视频像素宽度
  cropHeight?: number; // 原始视频像素高度
  cropX?: number; // 原始视频像素X偏移
  cropY?: number; // 原始视频像素Y偏移
}

export interface VideoInfo {
  file: File;
  filename: string,
  url: string;
  duration: number;
  width: number;
  height: number;
}

export interface VideoDisplayInfo {
  videoY: number,
  videoX: number,
  displayWidth: number,
  displayHeight: number,
  containerWidth: number,
  containerHeight: number
}