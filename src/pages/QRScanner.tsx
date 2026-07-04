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
  Smartphone,
  Download,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  ThumbsUp,
  Phone,
  MessageCircle,
  Clock
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
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  
  // Test QR Modal State for pre-deployment camera & system verification
  const [showTestQRModal, setShowTestQRModal] = useState(false);
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTestUrlCopied, setIsTestUrlCopied] = useState(false);

  // Compute current test QR item and its real QR image URL
  const currentTestItem = qrcodes[selectedTestIndex] || qrcodes[0] || null;
  const testQRDataString = currentTestItem ? (currentTestItem.targetUrl || currentTestItem.id) : 'https://cityqr.app/test';
  const testQRImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=000000&bgcolor=ffffff&data=${encodeURIComponent(testQRDataString)}`;

  // Download QR code image so user can test "Scan Photo / File" from their gallery
  const handleDownloadTestQR = async () => {
    if (!testQRImageUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(testQRImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CityQR_TestBarcode_${currentTestItem?.id || 'demo'}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(testQRImageUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };
  
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
  const scanVideoFrame = useCallback(async () => {
    if (!isScanningRef.current) return;
    
    if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
      // Keep checking while mobile camera stream is initializing/mounting
      animationFrameRef.current = requestAnimationFrame(() => {
        setTimeout(scanVideoFrame, 150);
      });
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      // Try hardware BarcodeDetector first on supported browsers (Android Chrome)
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'] });
          const barcodes = await detector.detect(video);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            handleDecodedQR(barcodes[0].rawValue.trim());
            return;
          }
        } catch (bdErr) {
          // Fallback to jsQR below
        }
      }

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
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: targetFacingMode } 
          });
        } catch (errFinal) {
          // Final mobile fallback: open any available camera stream on device
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
        }
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
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;
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

  // Ensure video element receives stream and plays reliably on mobile devices
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [cameraActive, facingMode]);

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

        <div className="pt-3 flex justify-center">
          <button
            onClick={() => setShowTestQRModal(true)}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#8B0000] hover:scale-105 text-zinc-950 font-black text-xs md:text-sm shadow-xl transition-all duration-200 cursor-pointer border-2 border-white/20 glow-gold"
          >
            <QrCode className="w-5 h-5 text-zinc-950 animate-bounce" />
            <span>{language === 'ar' ? 'توليد وعرض باركود تجريبي للفحص (اختبار النظام قبل النشر على Vercel)' : 'Generate & View System Test QR Code (Test Before Vercel Deploy)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Camera Scan Viewport */}
        <div className="md:col-span-2 space-y-4">
          <div className={`relative aspect-video md:aspect-square max-w-md mx-auto rounded-3xl border-4 bg-zinc-950 overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${cameraActive ? 'border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.5)] ring-4 ring-[#D4AF37]/30' : 'border-[#8B0000] glow-red'}`}>
            
            {/* Always rendered video element so videoRef is NEVER null when camera starts! */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />

            {cameraActive ? (
              <>
                {/* Laser scan line animation with glowing gold aura */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-bounce shadow-[0_0_18px_#D4AF37] z-10" style={{ animationDuration: '2.2s' }} />
                
                {/* Target reticle borders with pulsing glowing indicator */}
                <div className="absolute inset-6 md:inset-8 border-2 border-dashed border-[#D4AF37]/80 rounded-3xl pointer-events-none flex flex-col items-center justify-between p-3 animate-[pulse_1.8s_ease-in-out_infinite] shadow-[inset_0_0_25px_rgba(212,175,55,0.2)]">
                  {/* Glowing corners with radar accent */}
                  <div className="flex justify-between w-full">
                    <div className="w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl shadow-[0_0_12px_#D4AF37]"></div>
                    <div className="w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl shadow-[0_0_12px_#D4AF37]"></div>
                  </div>
                  
                  {/* Active heartbeat status badge */}
                  <div className="flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md px-4 py-2 rounded-full border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.6)] transform hover:scale-105 transition">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-[#D4AF37] font-black font-mono tracking-widest uppercase">
                      {language === 'ar' ? 'جاري البحث عن رمز QR...' : 'SCANNING FOR QR CODE...'}
                    </span>
                  </div>

                  <div className="flex justify-between w-full">
                    <div className="w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl shadow-[0_0_12px_#D4AF37]"></div>
                    <div className="w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl shadow-[0_0_12px_#D4AF37]"></div>
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

                <div className="flex flex-col gap-2.5 w-full max-w-xs pt-1">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
                    <button
                      onClick={() => startCamera()}
                      className="w-full sm:w-auto flex-1 rounded-xl bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-xs font-bold px-4 py-3 text-white transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 border border-red-600/30"
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

                  <button
                    onClick={() => setShowTestQRModal(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:brightness-110 text-xs font-black px-4 py-2.5 text-zinc-950 transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 border border-white/20"
                  >
                    <QrCode className="w-4 h-4 text-zinc-950" />
                    <span>{language === 'ar' ? 'عرض باركود تجريبي جاهز للفحص والاختبار' : 'Show System Test QR Code'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Simulation Trigger list */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 relative overflow-hidden shadow-xl">
            {/* Top colored line indicator */}
            <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
            
            <h3 className="text-xs font-black tracking-tighter text-[#D4AF37] flex items-center gap-2 mt-2">
              <Play className="w-4 h-4 text-[#8B0000]" />
              {t.simulateScan}
            </h3>
            
            <button
              onClick={() => setShowTestQRModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:brightness-110 text-zinc-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              <QrCode className="w-4 h-4 text-zinc-950" />
              <span>{language === 'ar' ? 'عرض صورة باركود ثابت (لاختبار الكاميرا والألبوم)' : 'View Static Test QR Code (Test Camera/File)'}</span>
            </button>

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

                {/* Likes, Favorites & Rating Badge on Scanned QR */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-blue-400 font-mono font-bold" title={language === 'ar' ? 'الإعجابات' : 'Likes'}>
                      <ThumbsUp className="w-4 h-4 fill-blue-400" />
                      <span>{scannedQR.likesCount || 0} {language === 'ar' ? 'إعجاب' : 'Likes'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-500 font-mono font-bold" title={language === 'ar' ? 'في المفضلة' : 'Favorites'}>
                      <Heart className="w-4 h-4 fill-rose-500" />
                      <span>{scannedQR.favoritesCount || 0} {language === 'ar' ? 'مفضلة' : 'Favs'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>★ {scannedQR.averageRating || '0.0'} ({scannedQR.ratingsCount || 0})</span>
                  </div>
                </div>

                {/* Inline Live Contact Sections & Direct Calling Box in Scanner Modal */}
                <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-zinc-900/90 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <h4 className="font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{language === 'ar' ? 'أرقام الاتصال المباشر وخدمة العملاء (مثال حي)' : 'Direct Contact & Customer Service'}</span>
                    </h4>
                  </div>

                  {scannedQR.contactSections && scannedQR.contactSections.length > 0 ? (
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {scannedQR.contactSections.map((sec, secIdx) => (
                        <div key={sec.id || secIdx} className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-2.5">
                          <div className="border-b border-zinc-800/80 pb-1.5">
                            <span className="font-bold text-xs text-white block">{sec.departmentName || (language === 'ar' ? `القسم #${secIdx + 1}` : `Department #${secIdx + 1}`)}</span>
                            {sec.workingHours && (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span>{sec.workingHours}</span>
                              </span>
                            )}
                          </div>

                          {/* Voice Phones */}
                          {sec.phoneNumbers && sec.phoneNumbers.filter(Boolean).length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-zinc-400 block">{language === 'ar' ? '📞 الاتصال الهاتفي المباشر:' : '📞 Voice Call:'}</span>
                              {sec.phoneNumbers.filter(Boolean).map((num, pIdx) => {
                                const cleanDigits = num.replace(/[^0-9+]/g, '');
                                return (
                                  <div key={pIdx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                                    <span className="font-mono font-bold text-zinc-200 dir-ltr">{num}</span>
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={`tel:${cleanDigits}`}
                                        className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 transition"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>{language === 'ar' ? 'اتصل' : 'Call'}</span>
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(num);
                                          setCopiedPhone(`${scannedQR.id}-sc-p-${pIdx}`);
                                          setTimeout(() => setCopiedPhone(null), 2000);
                                        }}
                                        className="px-2 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold transition flex items-center gap-1"
                                      >
                                        {copiedPhone === `${scannedQR.id}-sc-p-${pIdx}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* WhatsApp Numbers */}
                          {sec.whatsappNumbers && sec.whatsappNumbers.filter(Boolean).length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold text-green-400 block">{language === 'ar' ? '💬 محادثة عبر واتساب:' : '💬 WhatsApp Chat:'}</span>
                              {sec.whatsappNumbers.filter(Boolean).map((wa, wIdx) => {
                                const cleanDigits = wa.replace(/[^0-9+]/g, '');
                                return (
                                  <div key={wIdx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                                    <span className="font-mono font-bold text-zinc-200 dir-ltr">{wa}</span>
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={`https://wa.me/20${cleanDigits.replace(/^0+/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 rounded bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition"
                                      >
                                        <MessageCircle className="w-3 h-3" />
                                        <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(wa);
                                          setCopiedPhone(`${scannedQR.id}-sc-w-${wIdx}`);
                                          setTimeout(() => setCopiedPhone(null), 2000);
                                        }}
                                        className="px-2 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold transition flex items-center gap-1"
                                      >
                                        {copiedPhone === `${scannedQR.id}-sc-w-${wIdx}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(scannedQR.phoneNumbers && scannedQR.phoneNumbers.length > 0 ? scannedQR.phoneNumbers : ['19000 - خدمة العملاء / Hotline']).map((numStr, idx) => {
                        const parts = numStr.split('-');
                        const rawNum = parts[0].trim();
                        const cleanDigits = rawNum.replace(/[^0-9+]/g, '') || '19000';
                        const label = parts.length > 1 ? parts.slice(1).join('-').trim() : (language === 'ar' ? 'الرقم المباشر' : 'Direct Number');
                        return (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/50 border border-zinc-800 text-xs">
                            <div>
                              <span className="font-mono font-bold text-white block dir-ltr">{rawNum}</span>
                              <span className="text-[10px] text-zinc-400">{label}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <a href={`tel:${cleanDigits}`} className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{language === 'ar' ? 'اتصل' : 'Call'}</span>
                              </a>
                              <a href={`https://wa.me/20${cleanDigits.replace(/^0+/, '')}`} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{language === 'ar' ? 'واتساب' : 'WA'}</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

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

      {/* Test QR Code Modal for Camera & System Verification */}
      <AnimatePresence>
        {showTestQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-zinc-950 border-2 border-[#D4AF37] rounded-3xl overflow-hidden shadow-2xl glow-gold my-8"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-900 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#D4AF37]">
                    {language === 'ar' ? 'صورة باركود تجريبي ثابت (فحص النظام)' : 'System Test QR Code'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowTestQRModal(false)}
                  className="p-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs md:text-sm">
                {/* Info Note */}
                <div className="p-3.5 rounded-2xl bg-[#8B0000]/15 border border-[#8B0000]/40 text-zinc-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#D4AF37] block mb-1">
                      {language === 'ar' ? 'جاهز للاختبار قبل الرفع على Vercel' : 'Ready for verification before Vercel deploy'}
                    </span>
                    {language === 'ar' 
                      ? 'هذا باركود حقيقي ومسجل في قاعدة بيانات CityQR. يمكنك تحميل الصورة وتجربتها في (مسح من ألبوم الصور)، أو توجيه كاميرا هاتف آخر للشاشة لاختبار سرعة الكاميرا.'
                      : 'This is a real pre-registered QR code in CityQR. Download it to test "Scan Photo / File", or point another phone camera at this screen.'}
                  </div>
                </div>

                {/* Switcher for Pre-registered Items */}
                {qrcodes.length > 0 && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-zinc-900 border border-zinc-800">
                    <button
                      onClick={() => setSelectedTestIndex((prev) => (prev - 1 + qrcodes.length) % qrcodes.length)}
                      title={language === 'ar' ? 'الرمز السابق' : 'Previous QR'}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    <div className="text-center truncate px-2 flex-1">
                      <span className="text-[10px] font-bold text-[#D4AF37] block uppercase tracking-wider">
                        {language === 'ar' ? `رمز مسجل (${selectedTestIndex + 1} من ${qrcodes.length})` : `Registered Item (${selectedTestIndex + 1} of ${qrcodes.length})`}
                      </span>
                      <span className="text-xs font-extrabold text-white truncate block">
                        {currentTestItem ? (language === 'ar' ? currentTestItem.titleAr : currentTestItem.titleEn) : 'CityQR Demo Tag'}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedTestIndex((prev) => (prev + 1) % qrcodes.length)}
                      title={language === 'ar' ? 'الرمز التالي' : 'Next QR'}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* The QR Code Visual Box (White high contrast) */}
                <div className="p-4 rounded-3xl bg-white border-4 border-[#D4AF37] shadow-inner flex flex-col items-center justify-center text-center">
                  <img
                    src={testQRImageUrl}
                    alt="System Test QR Code"
                    className="w-56 h-56 md:w-64 md:h-64 object-contain mx-auto transition-transform hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="mt-2 text-[11px] font-extrabold text-zinc-800 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full border border-zinc-300">
                    {language === 'ar' ? 'باركود فحص مباشر 100% واضح' : '100% Clear Test Barcode'}
                  </div>
                </div>

                {/* Target Data String Display */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 block">
                    {language === 'ar' ? 'الرابط المسجل داخل الباركود:' : 'Embedded Target URL:'}
                  </span>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] truncate select-all">
                    {testQRDataString}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Download Button */}
                  <button
                    onClick={handleDownloadTestQR}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:brightness-110 text-zinc-950 font-black text-xs py-3.5 transition duration-200 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-zinc-950" />
                    <span>
                      {isDownloading 
                        ? (language === 'ar' ? 'جاري التحميل...' : 'Downloading...') 
                        : (language === 'ar' ? 'تحميل صورة الباركود' : 'Download QR Image')}
                    </span>
                  </button>

                  {/* Simulate Instant Scan Button */}
                  <button
                    onClick={() => {
                      if (currentTestItem) {
                        handleSimulateScan(currentTestItem);
                      }
                      setShowTestQRModal(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-white font-black text-xs py-3.5 transition duration-200 cursor-pointer shadow-lg border border-red-600/30"
                  >
                    <Play className="w-4 h-4 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'تجربة قراءة هذا الرمز فوراً' : 'Simulate Scan Now'}</span>
                  </button>
                </div>

                {/* Copy Target URL Button */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(testQRDataString);
                    setIsTestUrlCopied(true);
                    setTimeout(() => setIsTestUrlCopied(false), 2000);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold py-2.5 transition duration-200 cursor-pointer"
                >
                  {isTestUrlCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                  <span>{isTestUrlCopied ? (language === 'ar' ? 'تم نسخ الرابط بنجاح!' : 'URL Copied!') : (language === 'ar' ? 'نسخ الرابط المسجل' : 'Copy Embedded URL')}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

