import React, { useState } from 'react';
import { 
  compressMediaFile, 
  CompressionOptions, 
  CompressionResult, 
  formatBytes, 
  formatSpeed, 
  formatEta 
} from '../services/mediaCompressor';
import { 
  uploadToCloudinary, 
  isCloudinaryConfigured, 
  getCloudinaryOptimizedUrl, 
  UploadProgressInfo 
} from '../services/cloudinary';
import { 
  Upload, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Gauge, 
  Sparkles, 
  FileVideo, 
  FileImage, 
  Loader2, 
  Zap, 
  Trash2, 
  Copy, 
  Check, 
  Maximize2,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MediaCompressorUploadProps {
  language: 'ar' | 'en';
  onMediaUploaded?: (url: string, result?: CompressionResult) => void;
  initialUrl?: string;
  className?: string;
}

export const MediaCompressorUpload: React.FC<MediaCompressorUploadProps> = ({
  language,
  onMediaUploaded,
  initialUrl = '',
  className = ''
}) => {
  // Compression Settings
  const [preset, setPreset] = useState<'balanced' | 'ultra' | 'high_quality'>('balanced');
  const [quality, setQuality] = useState(0.78);
  const [maxWidth, setMaxWidth] = useState(1920);

  // States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [compressStage, setCompressStage] = useState('');
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0); // bytes/sec
  const [uploadLoaded, setUploadLoaded] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadEta, setUploadEta] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(initialUrl);

  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Handle File Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage('');
    setCompressionResult(null);

    // Auto trigger compression upon selection
    await processCompressAndUpload(file);
  };

  // Process Compression & Upload Flow
  const processCompressAndUpload = async (fileToProcess: File) => {
    setIsCompressing(true);
    setCompressProgress(0);
    setCompressStage(language === 'ar' ? 'جاري تجهيز وسائط الرفع...' : 'Preparing media for upload...');
    setErrorMessage('');

    try {
      // Step 1: Compress Media
      const compOptions: CompressionOptions = {
        preset,
        quality,
        maxWidth,
        format: fileToProcess.type.startsWith('image/') ? 'image/jpeg' : undefined
      };

      const result = await compressMediaFile(fileToProcess, compOptions, (pct, stage) => {
        setCompressProgress(pct);
        setCompressStage(stage);
      });

      setCompressionResult(result);
      setIsCompressing(false);

      // Step 2: Upload to Cloudinary if configured
      if (isCloudinaryConfigured()) {
        setIsUploading(true);
        setUploadPercent(0);
        setUploadLoaded(0);
        setUploadTotal(result.compressedSize);

        const uploadRes = await uploadToCloudinary(result.file, (prog) => {
          if (typeof prog === 'number') {
            setUploadPercent(prog);
          } else {
            setUploadPercent(prog.percent);
            setUploadLoaded(prog.loaded);
            setUploadTotal(prog.total);
            setUploadSpeed(prog.speedBytesPerSec);
            setUploadEta(prog.etaSeconds);
          }
        });

        const optimizedUrl = getCloudinaryOptimizedUrl(uploadRes.secureUrl, 1200);
        setUploadedUrl(optimizedUrl);
        onMediaUploaded?.(optimizedUrl, result);
      } else {
        // Local preview fallback
        setUploadedUrl(result.previewUrl);
        onMediaUploaded?.(result.previewUrl, result);
      }
    } catch (err: any) {
      console.error('Compression/Upload Error:', err);
      setErrorMessage(err?.message || (language === 'ar' ? 'حدث خطأ أثناء معالجة أو رفع الملف.' : 'An error occurred during file processing or upload.'));
    } finally {
      setIsCompressing(false);
      setIsUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!uploadedUrl) return;
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setCompressionResult(null);
    setUploadedUrl('');
    setErrorMessage('');
    onMediaUploaded?.('');
  };

  return (
    <div className={`p-5 rounded-2xl border border-zinc-800 bg-zinc-950/90 text-white space-y-4 shadow-xl relative overflow-hidden ${className}`}>
      {/* Glow Top Accent */}
      <div className="absolute top-0 left-0 w-full h-0.5 animated-glow-line" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/30">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#D4AF37] tracking-tight">
              {language === 'ar' ? 'محتوى الوسائط المضغوط ومراقبة الرفع المباشر' : 'Smart Media Compressor & Live Upload Monitor'}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              {language === 'ar' ? 'ضغط الصور والفيديوهات تلقائياً قبل الرفع لتوفير 80% من المساحة والسرعة' : 'Automatically compress images & videos before Cloudinary upload to save 80% bandwidth'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 rounded-full font-mono font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {isCloudinaryConfigured() ? 'Cloudinary CDN Active' : 'Local Reader Ready'}
          </span>
        </div>
      </div>

      {/* Preset Compression Controls Bar */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
            {language === 'ar' ? 'وضع الضغط المسبق:' : 'Compression Preset:'}
          </span>
          <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
            {preset === 'ultra' && (language === 'ar' ? '⚡ أقصى ضغط (توفير عالي)' : '⚡ Ultra Compress')}
            {preset === 'balanced' && (language === 'ar' ? '⚖️ متوازن (موصى به)' : '⚖️ Balanced (Recommended)')}
            {preset === 'high_quality' && (language === 'ar' ? '💎 جودة عالية' : '💎 High Quality')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'balanced', labelAr: 'متوازن (80%)', labelEn: 'Balanced (80%)', descAr: 'جودة ممتازة بحجم مثالي', descEn: 'Best quality & size' },
            { id: 'ultra', labelAr: 'أقصى ضغط', labelEn: 'Ultra Saving', descAr: 'توفير حتى 90% من المساحة', descEn: 'Saves up to 90%' },
            { id: 'high_quality', labelAr: 'جودة عالية', labelEn: 'High Quality', descAr: 'ضغط خفيف مع دقة كاملة', descEn: 'Light compress' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPreset(item.id as any);
                if (item.id === 'ultra') { setQuality(0.60); setMaxWidth(1280); }
                else if (item.id === 'balanced') { setQuality(0.78); setMaxWidth(1920); }
                else { setQuality(0.88); setMaxWidth(2560); }
              }}
              className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                preset === item.id 
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-extrabold shadow-sm' 
                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span className="text-[11px] font-bold">{language === 'ar' ? item.labelAr : item.labelEn}</span>
              <span className="text-[9px] text-zinc-500 font-normal">{language === 'ar' ? item.descAr : item.descEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* File Dropzone Input */}
      {!selectedFile && !uploadedUrl && (
        <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-[#D4AF37] bg-zinc-900/30 hover:bg-zinc-900/60 transition cursor-pointer text-center group relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-3 group-hover:scale-110 transition">
            <Upload className="w-6 h-6 animate-bounce" />
          </div>
          <p className="text-xs font-black text-white group-hover:text-[#D4AF37] transition">
            {language === 'ar' ? 'انقر هنا لإدراج صورة أو فيديو وسنتكفل بالضغط والرفع' : 'Click here to drop image or video for auto-compression & upload'}
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            {language === 'ar' ? 'يدعم الصور (JPG, PNG, WebP) والفيديوهات (MP4, WebM, MOV)' : 'Supports Images (JPG, PNG, WebP) & Videos (MP4, WebM, MOV)'}
          </p>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {/* Compression Progress Indicator */}
      <AnimatePresence>
        {isCompressing && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-amber-300 text-xs"
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>{compressStage || (language === 'ar' ? 'جاري ضغط الملف...' : 'Compressing file...')}</span>
              </span>
              <span className="font-mono text-sm">{compressProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden p-0.5 border border-amber-500/20">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#D4AF37] transition-all duration-300"
                style={{ width: `${compressProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compression Results & Savings Badge */}
      {compressionResult && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-300 flex items-center gap-1.5">
              {compressionResult.type === 'image' ? <FileImage className="w-4 h-4 text-[#D4AF37]" /> : <FileVideo className="w-4 h-4 text-cyan-400" />}
              <span className="truncate max-w-[180px]">{compressionResult.fileName}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/40">
              ⚡ {language === 'ar' ? `وفرت ${compressionResult.savedPercentage}%` : `Saved ${compressionResult.savedPercentage}%`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[9px]">{language === 'ar' ? 'الحجم الأصلي' : 'Original Size'}</span>
              <span className="font-bold text-rose-400 line-through">{formatBytes(compressionResult.originalSize)}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[9px]">{language === 'ar' ? 'بعد الضغط' : 'Compressed'}</span>
              <span className="font-bold text-emerald-400">{formatBytes(compressionResult.compressedSize)}</span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-zinc-500 block text-[9px]">{language === 'ar' ? 'وقت الضغط' : 'Processing Time'}</span>
              <span className="font-bold text-[#D4AF37]">{compressionResult.compressionTimeMs} ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Upload Rate & Speed Bar */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-zinc-900 border border-[#D4AF37]/40 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>{language === 'ar' ? 'جاري رفع الملف إلى Cloudinary CDN...' : 'Uploading file to Cloudinary CDN...'}</span>
              </div>
              <span className="text-sm font-black font-mono text-[#D4AF37]">{uploadPercent}%</span>
            </div>

            {/* Custom Progress Bar with animated sheen */}
            <div className="w-full h-3 rounded-full bg-zinc-950 p-0.5 border border-zinc-800 relative overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-amber-400 to-[#D4AF37] transition-all duration-150 relative"
                style={{ width: `${uploadPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            {/* Live Upload Speed Meter Bar */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-zinc-400">
              <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{language === 'ar' ? 'السرعة:' : 'Speed:'}</span>
                <strong className="text-amber-300">{formatSpeed(uploadSpeed)}</strong>
              </div>

              <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                <span>{formatBytes(uploadLoaded)} / {formatBytes(uploadTotal)}</span>
              </div>

              <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{language === 'ar' ? 'المتبقي:' : 'ETA:'}</span>
                <strong className="text-emerald-300">{formatEta(uploadEta)}</strong>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Completed & URL Preview Output */}
      {uploadedUrl && !isCompressing && !isUploading && (
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'تم ضغط ورفع الوسائط بنجاح إلى السحابة!' : 'Media compressed and uploaded successfully!'}</span>
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-500 hover:text-rose-400 p-1 transition cursor-pointer"
              title={language === 'ar' ? 'حذف واستبدال' : 'Clear & upload another'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Media Preview Thumbnail */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black border border-zinc-700 shrink-0">
              {uploadedUrl.includes('/video/') || uploadedUrl.endsWith('.webm') || uploadedUrl.endsWith('.mp4') ? (
                <video src={uploadedUrl} className="w-full h-full object-cover" muted loop autoPlay />
              ) : (
                <img src={uploadedUrl} alt="Compressed Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
            </div>

            <div className="flex-1 overflow-hidden space-y-1">
              <span className="text-[10px] text-zinc-400 font-mono block truncate">{uploadedUrl}</span>
              
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold transition cursor-pointer border border-zinc-700"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-[#D4AF37]" />}
                <span>{copied ? (language === 'ar' ? 'تم نسخ الرابط!' : 'Copied Link!') : (language === 'ar' ? 'نسخ رابط CDN المباشر' : 'Copy Direct CDN Link')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
