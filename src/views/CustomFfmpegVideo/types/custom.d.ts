export interface VideoInfo {
    duration: number,
    videoWidth: number,
    videoHeight: number,
    url: string,
    filename: string,
    ext: string
}

export interface VideoMetadata {
  duration: number
  videoWidth: number
  videoHeight: number
}

export interface VideoDisplayInfo {
  displayX: number,
  displayY: number,
  displayWidth: number,
  displayHeight: number,
  containerWidth: number,
  containerHeight: number,
  scaleRatio: number,
  videoWidth: number,
  videoHeight: number,
}

export interface SelectionOptions {
  aspectRatio: number | undefined
}

export interface Selection {
  cropX: number,
  cropY: number,
  cropWidth: number,
  cropHeight: number,
}

export interface Segment {
  id: string;
  startTime: number; // 秒
  endTime: number;   // 秒
  enableCrop?: boolean;
  cropWidth?: number; // 原始视频像素宽度
  cropHeight?: number; // 原始视频像素高度
  cropX?: number; // 原始视频像素X偏移
  cropY?: number; // 原始视频像素Y偏移
}