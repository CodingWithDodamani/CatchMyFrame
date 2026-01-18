
export type CaptureQuality = 'high' | 'low';
export type AutoCaptureMode = 'off' | 'interval' | 'timeRange' | 'pixelDetect' | 'aiDetect';

export type SharpeningLevel = 'off' | 'low' | 'medium' | 'high';

export interface FilterConfig {
  brightness: number; // 100 is default
  contrast: number;   // 100 is default
  saturation: number; // 100 is default
  blur: number;       // 0 is default
  grayscale: number;  // 0 is default
  sepia: number;      // 0 is default
  sharpening: SharpeningLevel;
  dpi?: number;       // Optional DPI setting per frame
}

export interface CapturedFrame {
  id: string;
  dataUrl: string;
  fileExtension: 'png' | 'jpeg';
  filename: string;
  timestamp: number;
  filters?: FilterConfig; // Store edit state per frame
}

declare global {
  var JSZip: any;
  var jspdf: any;
}

