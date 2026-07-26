/**
 * Advanced Client-Side Image and Video Compression Service
 * CityQR Platform - Media Compression Engine
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.75)
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
  targetVideoBitrateMbps?: number; // e.g. 1.5 Mbps for 720p, 0.8 Mbps for 480p
  preset?: 'ultra' | 'balanced' | 'high_quality' | 'custom';
}

export interface CompressionResult {
  file: File | Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercentage: number;
  width?: number;
  height?: number;
  type: 'image' | 'video';
  format: string;
  compressionTimeMs: number;
  previewUrl: string;
}

/**
 * Main compression entry point for any Image or Video file
 */
export async function compressMediaFile(
  file: File,
  options: CompressionOptions = {},
  onCompressProgress?: (progress: number, stage: string) => void
): Promise<CompressionResult> {
  const startTime = performance.now();
  const fileType = file.type.toLowerCase();

  if (fileType.startsWith('image/')) {
    return await compressImageFile(file, options, onCompressProgress, startTime);
  } else if (fileType.startsWith('video/')) {
    return await compressVideoFile(file, options, onCompressProgress, startTime);
  } else {
    // Unsupported for compression, return as-is
    const url = URL.createObjectURL(file);
    return {
      file,
      fileName: file.name,
      originalSize: file.size,
      compressedSize: file.size,
      savedBytes: 0,
      savedPercentage: 0,
      type: 'image',
      format: file.type,
      compressionTimeMs: 0,
      previewUrl: url
    };
  }
}

/**
 * Image Compression using HTML5 Canvas & Blob conversion
 */
async function compressImageFile(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: number, stage: string) => void,
  startTime: number = performance.now()
): Promise<CompressionResult> {
  onProgress?.(10, 'جاري قراءة الصورة وتجهيز الضغط...');

  let presetQuality = 0.78;
  let presetMaxDim = 1920;

  if (options.preset === 'ultra') {
    presetQuality = 0.60;
    presetMaxDim = 1280;
  } else if (options.preset === 'high_quality') {
    presetQuality = 0.88;
    presetMaxDim = 2560;
  } else if (options.preset === 'balanced') {
    presetQuality = 0.75;
    presetMaxDim = 1600;
  }

  const quality = options.quality ?? presetQuality;
  const maxW = options.maxWidth ?? presetMaxDim;
  const maxH = options.maxHeight ?? presetMaxDim;
  const targetFormat = options.format || 'image/jpeg';

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      onProgress?.(40, 'جاري إعادة ضبط الأبعاد والجودة...');

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Scale maintaining aspect ratio
      if (width > maxW || height > maxH) {
        if (width / height > maxW / maxH) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        } else {
          width = Math.round((width * maxH) / height);
          maxH;
          height = Math.round((img.naturalHeight * width) / img.naturalWidth);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not get canvas context for image compression'));
        return;
      }

      // Fill white background for JPEGs (handles transparent PNG conversion)
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      // Smooth image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      onProgress?.(80, 'جاري معالجة الترميز وحفظ الملف المضغوط...');

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          const compressedSize = blob.size;
          const originalSize = file.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const savedPercentage = originalSize > 0 
            ? Number(((savedBytes / originalSize) * 100).toFixed(1)) 
            : 0;

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + (targetFormat === 'image/webp' ? '.webp' : '.jpg'), {
            type: targetFormat,
            lastModified: Date.now()
          });

          const previewUrl = URL.createObjectURL(compressedFile);
          const endTime = performance.now();

          onProgress?.(100, 'تم اكتشاف وضغط الصورة بنجاح!');

          resolve({
            file: compressedFile,
            fileName: compressedFile.name,
            originalSize,
            compressedSize,
            savedBytes,
            savedPercentage,
            width,
            height,
            type: 'image',
            format: targetFormat,
            compressionTimeMs: Math.round(endTime - startTime),
            previewUrl
          });
        },
        targetFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('فشل تحميل الصورة لمعالجتها وضغطها.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Video Compression using HTML5 Video + MediaRecorder re-encoding
 */
async function compressVideoFile(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: number, stage: string) => void,
  startTime: number = performance.now()
): Promise<CompressionResult> {
  onProgress?.(10, 'جاري التحقق من كوديك الفيديو وأبعاد الملف...');

  let presetBitrateMbps = 1.2; // 1.2 Mbps default
  let maxResolution = 720; // 720p default

  if (options.preset === 'ultra') {
    presetBitrateMbps = 0.7; // 700 Kbps (high compression)
    maxResolution = 480;
  } else if (options.preset === 'high_quality') {
    presetBitrateMbps = 2.5; // 2.5 Mbps
    maxResolution = 1080;
  } else if (options.preset === 'balanced') {
    presetBitrateMbps = 1.2;
    maxResolution = 720;
  }

  const targetBitrateBps = (options.targetVideoBitrateMbps || presetBitrateMbps) * 1_000_000;

  // Check MediaRecorder browser support
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    onProgress?.(100, 'التمس الميديا العادي (لا يتوفر محرك إعادة ترميز الفيديو في متصفحك)');
    const url = URL.createObjectURL(file);
    return {
      file,
      fileName: file.name,
      originalSize: file.size,
      compressedSize: file.size,
      savedBytes: 0,
      savedPercentage: 0,
      type: 'video',
      format: file.type || 'video/mp4',
      compressionTimeMs: 0,
      previewUrl: url
    };
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = false;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        let width = video.videoWidth;
        let height = video.videoHeight;

        // Calculate aspect ratio resize
        if (Math.min(width, height) > maxResolution) {
          const scale = maxResolution / Math.min(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
          // Ensure even dimensions for video encoders
          width = width % 2 === 0 ? width : width - 1;
          height = height % 2 === 0 ? height : height - 1;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get video canvas context');
        }

        const stream = canvas.captureStream(30); // 30 fps
        
        // Pick best supported video mimeType
        const possibleMimeTypes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4'
        ];
        
        let selectedMimeType = '';
        for (const mime of possibleMimeTypes) {
          if (MediaRecorder.isTypeSupported(mime)) {
            selectedMimeType = mime;
            break;
          }
        }

        const recorderOptions: MediaRecorderOptions = {
          videoBitsPerSecond: targetBitrateBps
        };
        if (selectedMimeType) {
          recorderOptions.mimeType = selectedMimeType;
        }

        const mediaRecorder = new MediaRecorder(stream, recorderOptions);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: selectedMimeType || 'video/webm' });
          URL.revokeObjectURL(objectUrl);

          const compressedSize = videoBlob.size;
          const originalSize = file.size;
          const savedBytes = Math.max(0, originalSize - compressedSize);
          const savedPercentage = originalSize > 0 
            ? Number(((savedBytes / originalSize) * 100).toFixed(1)) 
            : 0;

          const compressedFile = new File(
            [videoBlob], 
            file.name.replace(/\.[^/.]+$/, "") + '_compressed.webm', 
            { type: selectedMimeType || 'video/webm' }
          );

          const previewUrl = URL.createObjectURL(compressedFile);
          const endTime = performance.now();

          onProgress?.(100, 'تم ضغط الفيديو بنجاح!');

          resolve({
            file: compressedFile,
            fileName: compressedFile.name,
            originalSize,
            compressedSize,
            savedBytes,
            savedPercentage,
            width,
            height,
            type: 'video',
            format: selectedMimeType || 'video/webm',
            compressionTimeMs: Math.round(endTime - startTime),
            previewUrl
          });
        };

        let animFrameId: number;
        
        const renderFrame = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, width, height);
            
            if (duration > 0) {
              const currentPercent = Math.min(99, Math.round((video.currentTime / duration) * 100));
              onProgress?.(currentPercent, `جاري إعادة ترميز الفيديو (${currentPercent}%)...`);
            }

            animFrameId = requestAnimationFrame(renderFrame);
          }
        };

        video.onended = () => {
          cancelAnimationFrame(animFrameId);
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 200);
        };

        mediaRecorder.start(100);
        await video.play();
        renderFrame();

      } catch (err: any) {
        URL.revokeObjectURL(objectUrl);
        // Fallback: return uncompressed video if re-encoding fails
        const url = URL.createObjectURL(file);
        resolve({
          file,
          fileName: file.name,
          originalSize: file.size,
          compressedSize: file.size,
          savedBytes: 0,
          savedPercentage: 0,
          type: 'video',
          format: file.type || 'video/mp4',
          compressionTimeMs: 0,
          previewUrl: url
        });
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('فشل فتح ملف الفيديو لمعالجته.'));
    };
  });
}

/**
 * Format bytes into human readable string (e.g. 1.45 MB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format upload transfer speed (e.g. 1.25 MB/s)
 */
export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec <= 0) return '0 KB/s';
  if (bytesPerSec < 1024 * 1024) {
    return (bytesPerSec / 1024).toFixed(1) + ' KB/s';
  }
  return (bytesPerSec / (1024 * 1024)).toFixed(2) + ' MB/s';
}

/**
 * Format remaining estimated time in seconds (e.g. 14s or 1m 20s)
 */
export function formatEta(seconds: number): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) return '--';
  if (seconds < 60) return `${Math.ceil(seconds)} ثانية`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `${mins} دقيقة ${secs > 0 ? secs + ' ث' : ''}`;
}
