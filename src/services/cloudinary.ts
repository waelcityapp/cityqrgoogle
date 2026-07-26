// Cloudinary Media Upload & Optimization Service for CityQR

const LOCAL_STORAGE_KEY_CLOUDINARY = 'cityqr_cloudinary_config';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  const envCloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || '';
  const envPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  const envApiKey = (import.meta as any).env?.VITE_CLOUDINARY_API_KEY || '';

  if (envCloudName && envPreset) {
    return {
      cloudName: envCloudName,
      uploadPreset: envPreset,
      apiKey: envApiKey,
    };
  }

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CLOUDINARY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudName && parsed.uploadPreset) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse stored Cloudinary config:', err);
  }

  return {
    cloudName: envCloudName,
    uploadPreset: envPreset,
    apiKey: envApiKey,
  };
}

export function saveCloudinaryConfig(config: CloudinaryConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_CLOUDINARY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save Cloudinary config to localStorage:', err);
  }
}

export function isCloudinaryConfigured(): boolean {
  const config = getCloudinaryConfig();
  return !!(config.cloudName && config.uploadPreset);
}

export interface UploadProgressInfo {
  percent: number;
  loaded: number;
  total: number;
  speedBytesPerSec: number;
  etaSeconds: number;
}

/**
 * Uploads an image or video file directly to Cloudinary using unsigned upload preset
 */
export async function uploadToCloudinary(
  fileOrBase64: File | Blob | string,
  onProgress?: (progress: UploadProgressInfo | number) => void
): Promise<{ url: string; secureUrl: string; publicId: string; format: string; resourceType: string }> {
  const config = getCloudinaryConfig();
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  const formData = new FormData();
  if (typeof fileOrBase64 === 'string') {
    formData.append('file', fileOrBase64);
  } else {
    formData.append('file', fileOrBase64);
  }

  formData.append('upload_preset', config.uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    const startTime = performance.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const now = performance.now();
          const percent = Math.round((e.loaded / e.total) * 100);
          
          // Calculate transfer speed
          const elapsedSecOverall = (now - startTime) / 1000;
          const speedBytesPerSec = elapsedSecOverall > 0 ? e.loaded / elapsedSecOverall : 0;
          
          const remainingBytes = Math.max(0, e.total - e.loaded);
          const etaSeconds = speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : 0;

          // Call progress callback
          onProgress({
            percent,
            loaded: e.loaded,
            total: e.total,
            speedBytesPerSec,
            etaSeconds
          });

          lastLoaded = e.loaded;
          lastTime = now;
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.url,
            secureUrl: res.secure_url,
            publicId: res.public_id,
            format: res.format,
            resourceType: res.resource_type,
          });
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Cloudinary upload failed with status ${xhr.status}`));
        } catch (_) {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
    xhr.send(formData);
  });
}

/**
 * Returns an optimized Cloudinary URL with auto format and quality
 */
export function getCloudinaryOptimizedUrl(
  url: string,
  width?: number,
  height?: number,
  crop = 'fill'
): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  const transformations = ['f_auto', 'q_auto'];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  const transformString = transformations.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
}
