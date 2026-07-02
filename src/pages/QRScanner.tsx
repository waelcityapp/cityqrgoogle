import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../services/AppContext';
import { translations } from '../services/translations';
import { QRCodeItem } from '../types';
import jsQR from 'jsqr';
import { 
  Camera, 
  CameraOff, 
  MapPin, 
  ExternalLink, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles, 
  HeartPulse, 
  Navigation, 
  Info, 
  Layers, 
  X, 
  Play,
  RefreshCw,
  Zap,
  ZapOff,
  Upload,
  Copy,
  Check,
  QrCode,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRScannerProps {
  scannedQR: QRCodeItem | null;
  onCloseScannedQR: () => void;
  onSelectScannedQR: (qr: QRCodeItem) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ scannedQR, onCloseScannedQR, onSelectScannedQR }) => {
  const { language, qrcodes, incrementScans } = useApp();
  const t = translations[language];

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchActive, setTorchActive] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play a crisp scanner beep sound when a QR code is detected
  const playScannerBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.08); // E6 note
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  };

  // Handle detected QR text
  const handleDecodedQR = useCallback(async (decodedText: string) => {
    if (!isScanningRef.current) return;
    isScanningRef.current = false; // Prevent multiple scans
    
    playScannerBeep();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([100, 50, 100]); } catch (e) {}
    }
    
    // Check if it matches an existing CityQR smart tag in our database
    const matchedQR = qrcodes.find(q => 
      q.qrUrl === decodedText || 
      q.id === decodedText || 
      decodedText.includes(q.id) || 
      decodedText.includes(q.qrUrl) ||
      q.targetUrl === decodedText
    );

    if (matchedQR) {
      await incrementScans(matchedQR.id);
      onSelectScannedQR(matchedQR);
    } else {
      // It is a real-world external QR code or barcode/text
      const isUrl = decodedText.startsWith('http://') || decodedText.startsWith('https://') || decodedText.startsWith('www.');
      const formattedUrl = decodedText.startsWith('www.') ? `https://${decodedText}` : decodedText;
      
      const customQR: QRCodeItem = {
        id: 'external-' + Date.now(),
        titleAr: isUrl ? 'رابط ويب خارجي (تم مسحه)' : 'نص / رمز مستخرج (تم مسحه)',
        titleEn: isUrl ? 'Scanned External Web Link' : 'Scanned Text / Barcode Data',
        descriptionAr: `تم قراءة الرمز بنجاح من كاميرا هاتفك:\n${decodedText}`,
        descriptionEn: `Successfully decoded QR code from camera:\n${decodedText}`,
        category: 'facility',
        qrUrl: decodedText,
        targetUrl: isUrl ? formattedUrl : `https://www.google.com/search?q=${encodeURIComponent(decodedText)}`,
        totalScans: 1,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      onSelectScannedQR(customQR);
    }
  }, [qrcodes, incrementScans, onSelectScannedQR]);

  // Real-time video frame scanning loop
  const scanVideoFrame = useCallback(() => {
    if (!isScanningRef.current || !videoRef.current) return;
    
    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          
          if (code && code.data && code.data.trim().length > 0) {
            handleDecodedQR(code.data.trim());
            return; // Pause loop while displaying result modal
          }
        } catch (err) {
          // Ignore occasional getImageData/decode errors during resizing
        }
      }
    }
    
    // Schedule next frame check (~12 fps for optimal battery & CPU performance)
    animationFrameRef.current = requestAnimationFrame(() => {
      setTimeout(scanVideoFrame, 80);
    });
  }, [handleDecodedQR]);

  // Start Camera Stream
  const startCamera = async (targetFacingMode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError('');
    setIsCopied(false);
    
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: targetFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (errFallback) {
        // Fallback if specific resolution or ideal constraints fail
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: targetFacingMode } 
        });
      }
      
      streamRef.current = stream;
      setFacingMode(targetFacingMode);
      
      // Check for torch / flashlight capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as any;
        setHasTorch(!!capabilities.torch);
      } else {
        setHasTorch(false);
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(() => {});
      }
      
      setCameraActive(true);
      setHasCameraAccess(true);
      setTorchActive(false);
      isScanningRef.current = true;
      
      // Start QR Scanning Loop
      requestAnimationFrame(scanVideoFrame);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCameraAccess(false);
      setCameraError(
        t.noCameraAccess || 
        (language === 'ar' 
          ? 'تعذر الوصول إلى كاميرا الهاتف. يرجى منح الإذن للكاميرا في إعدادات المتصفح أو التأكد من عدم استخدامها من تطبيق آخر.' 
          : 'Unable to access device camera. Please grant camera permissions in your browser settings.')
      );
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchActive(false);
  };

  // Toggle Flashlight / Torch
  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      try {
        const nextState = !torchActive;
        await videoTrack.applyConstraints({
          advanced: [{ torch: nextState } as any]
        });
        setTorchActive(nextState);
      } catch (err) {
        console.warn('Could not toggle torch:', err);
      }
    }
  };

  // Switch between Rear and Front Camera
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  // Scan QR code from an uploaded image or screenshot
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });
          
          if (code && code.data && code.data.trim().length > 0) {
            handleDecodedQR(code.data.trim());
          } else {
            alert(language === 'ar' ? 'لم يتم العثور على رمز QR واضح في هذه الصورة. يرجى تجربة صورة أخرى أو استخدام الكاميرا المباشرة.' : 'No valid QR code found in this image. Please try a clearer picture.');
          }
        } catch (err) {
          alert(language === 'ar' ? 'حدث خطأ أثناء قراءة الصورة.' : 'Error reading image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  // Resume scanning automatically when the result modal is closed
  useEffect(() => {
    if (!scannedQR && cameraActive && !isScanningRef.current) {
      isScanningRef.current = true;
      requestAnimationFrame(scanVideoFrame);
    }
  }, [scannedQR, cameraActive, scanVideoFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'monument': return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
      case 'transport': return <Navigation className="w-5 h-5 text-blue-400" />;
      case 'emergency': return <HeartPulse className="w-5 h-5 text-red-500" />;
      case 'facility': return <Info className="w-5 h-5 text-green-400" />;
      case 'culture': return <Layers className="w-5 h-5 text-purple-400" />;
      default: return <HelpCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  // Simulate scanning of QR code from sidebar
  const handleSimulateScan = async (qr: QRCodeItem) => {
    await incrementScans(qr.id);
    onSelectScannedQR(qr);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold mb-1">
          <Smartphone className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'ماسح ضوئي حقيقي متطور (كاميرا + ألبوم الصور)' : 'Real Universal QR Scanner (Camera + Photo Gallery)'}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[#D4AF37]">
          {t.scanner}
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {language === 'ar'
            ? 'قم بتوجيه كاميرا هاتفك نحو أي ملصق CityQR أو رمز QR خارجي لقراءته فوراً دون الحاجة لأي تطبيق ماسح خارجي.'
            : 'Point your device camera at any CityQR tag or external QR code to scan instantly without needing any external scanner app.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Camera Scan Viewport */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative aspect-video md:aspect-square max-w-md mx-auto rounded-2xl border-4 border-[#8B0000] bg-zinc-950 overflow-hidden glow-red flex flex-col items-center justify-center shadow-2xl">
            
            {cameraActive ? (
              <>
                {/* Active Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Laser scan line animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-bounce shadow-[0_0_12px_#D4AF37] z-10" style={{ animationDuration: '2.5s' }} />
                
                {/* Target reticle borders */}
                <div className="absolute inset-10 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-3">
                  <div className="flex justify-between w-full">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]"></div>
                    <div className="w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]"></div>
                  </div>
                  <span className="text-[10px] text-[#D4AF37] font-mono tracking-widest uppercase bg-black/80 px-3 py-1 rounded-full border border-[#D4AF37]/30 shadow-md">
                    {language === 'ar' ? 'جاري البحث عن رمز QR...' : 'SCANNING LIVE'}
                  </span>
                  <div className="flex justify-between w-full">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]"></div>
                    <div className="w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]"></div>
                  </div>
                </div>

                {/* Floating Camera Controls Top Bar */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={switchCamera}
                      title={language === 'ar' ? 'تبديل الكاميرا (أمامية/خلفية)' : 'Switch Camera'}
                      className="p-2 rounded-xl bg-black/80 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-black transition shadow-lg cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                    >
                      <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'تبديل' : 'Switch'}</span>
                    </button>

                    {hasTorch && (
                      <button
                        onClick={toggleTorch}
                        title={language === 'ar' ? 'تشغيل / إيقاف الفلاش' : 'Toggle Flashlight'}
                        className={`p-2 rounded-xl border transition shadow-lg cursor-pointer flex items-center gap-1.5 text-[10px] font-bold ${
                          torchActive 
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-extrabold' 
                            : 'bg-black/80 border-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {torchActive ? <Zap className="w-4 h-4 fill-black" /> : <ZapOff className="w-4 h-4 text-amber-400" />}
                        <span className="hidden sm:inline">{language === 'ar' ? 'الفلاش' : 'Torch'}</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={stopCamera}
                    title={language === 'ar' ? 'إيقاف الكاميرا' : 'Stop Camera'}
                    className="p-2 rounded-xl bg-red-600/90 hover:bg-red-600 border border-red-500 text-white transition shadow-lg cursor-pointer flex items-center gap-1.5 text-[10px] font-bold"
                  >
                    <X className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إغلاق' : 'Stop'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-5 flex flex-col items-center justify-center w-full">
                <div className="p-5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[#D4AF37] shadow-inner">
                  <QrCode className="w-12 h-12 stroke-[1.5]" />
                </div>
                
                {cameraError ? (
                  <div className="text-xs text-red-400 max-w-xs flex flex-col items-center gap-1.5 bg-red-500/10 p-3.5 rounded-xl border border-red-500/30 text-center">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                    <span className="font-semibold leading-relaxed">{cameraError}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">
                      {language === 'ar' ? 'ماسح الرموز الذكية الحقيقي' : 'Real Universal QR Scanner'}
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      {language === 'ar' 
                        ? 'شغّل كاميرا هاتفك الحقيقية أو اختر صورة من جهازك لمسح أي رمز QR أو باركود فوراً.' 
                        : 'Activate your real phone camera or choose a picture from gallery to scan any QR code instantly.'}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs pt-1">
                  <button
                    onClick={() => startCamera()}
                    className="w-full sm:w-auto flex-1 rounded-xl bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-xs font-bold px-5 py-3 text-white transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 border border-red-600/30"
                  >
                    <Camera className="w-4 h-4 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'تشغيل الكاميرا الحقيقية' : 'Start Real Camera'}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold px-4 py-3 text-zinc-200 transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'مسح من ألبوم الصور' : 'Scan Photo / File'}</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Simulation Trigger list */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 relative overflow-hidden shadow-xl">
            {/* Top colored line indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]"></div>
            
            <h3 className="text-xs font-black tracking-tighter text-[#D4AF37] flex items-center gap-2 mt-2">
              <Play className="w-4 h-4 text-[#8B0000]" />
              {t.simulateScan}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              {language === 'ar'
                ? 'يمكنك أيضاً تجربة القراءة الافتراضية لمعالم CityQR المسجلة في قاعدة البيانات لاختبار النظام:'
                : 'You can also test simulated scanning of registered CityQR tags from the database:'}
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {qrcodes.map((qr) => (
                <button
                  key={qr.id}
                  onClick={() => handleSimulateScan(qr)}
                  className="w-full text-right p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-[#8B0000]/60 hover:bg-zinc-900 transition text-xs flex justify-between items-center gap-2 cursor-pointer group"
                >
                  <span className="font-semibold text-white group-hover:text-[#D4AF37] transition text-right truncate flex-1">
                    {language === 'ar' ? qr.titleAr : qr.titleEn}
                  </span>
                  <span className="shrink-0">
                    {getCategoryIcon(qr.category)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scanned QR Detail Modal Popup */}
      <AnimatePresence>
        {scannedQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-zinc-950 border-2 border-[#D4AF37] rounded-2xl overflow-hidden shadow-2xl glow-gold"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-900 bg-black flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(scannedQR.category)}
                  <h3 className="text-sm font-extrabold text-[#D4AF37]">
                    {t.scanResult}
                  </h3>
                </div>
                <button
                  onClick={onCloseScannedQR}
                  className="p-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs md:text-sm">
                {/* Badge for verification type */}
                <div className="flex items-center gap-1.5">
                  {scannedQR.id.startsWith('external-') ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'رمز QR خارجي مقروء بالكاميرا' : 'Decoded External QR Code'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{language === 'ar' ? 'معلم ذكي معتمد في CityQR' : 'Verified CityQR Landmark'}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">
                    {language === 'ar' ? scannedQR.titleAr : scannedQR.titleEn}
                  </h4>
                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-mono text-xs break-all select-all leading-relaxed">
                    {language === 'ar' ? scannedQR.descriptionAr : scannedQR.descriptionEn}
                  </div>
                </div>

                {scannedQR.location && (
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                      <MapPin className="w-4 h-4 text-[#8B0000]" />
                      <span>{language === 'ar' ? 'الموقع الجغرافي' : 'Location Details'}</span>
                    </div>
                    <p className="text-zinc-400 text-xs">
                      {language === 'ar' ? scannedQR.location.addressAr : scannedQR.location.addressEn}
                    </p>
                    {(scannedQR.location.lat && scannedQR.location.lng) ? (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        GPS: {scannedQR.location.lat.toFixed(4)}, {scannedQR.location.lng.toFixed(4)}
                      </p>
                    ) : null}
                  </div>
                )}

                {/* Action buttons (Copy + Open Link/Search) */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      const textToCopy = scannedQR.qrUrl || scannedQR.targetUrl || (language === 'ar' ? scannedQR.descriptionAr : scannedQR.descriptionEn);
                      navigator.clipboard.writeText(textToCopy);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold py-3 text-white transition duration-200 cursor-pointer shadow"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#D4AF37]" />}
                    <span>{isCopied ? (language === 'ar' ? 'تم النسخ بنجاح!' : 'Copied!') : (language === 'ar' ? 'نسخ محتوى الرمز' : 'Copy Code Data')}</span>
                  </button>

                  <a
                    href={scannedQR.targetUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-xs font-bold py-3 text-white transition duration-200 shadow-lg text-center cursor-pointer border border-red-600/30"
                  >
                    <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
                    <span>
                      {scannedQR.id.startsWith('external-') && !scannedQR.qrUrl.startsWith('http') 
                        ? (language === 'ar' ? 'بحث في جوجل' : 'Search Web') 
                        : t.openLinkBtn}
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

