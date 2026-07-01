import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../services/AppContext';
import { translations } from '../services/translations';
import { QRCodeItem } from '../types';
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
  Play
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setHasCameraAccess(true);
    } catch (err: any) {
      console.warn('Camera permission denied or not available:', err);
      setHasCameraAccess(false);
      setCameraError(t.noCameraAccess);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

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

  // Simulate scanning of QR code
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
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-[#D4AF37]">
          {t.scanner}
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {t.scanQrInstruction}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Camera Scan Viewport */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative aspect-video md:aspect-square max-w-md mx-auto rounded-2xl border-4 border-[#8B0000] bg-zinc-950 overflow-hidden glow-red flex flex-col items-center justify-center">
            
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
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-bounce shadow-[0_0_12px_#D4AF37] z-10" style={{ animationDuration: '3s' }} />
                
                {/* Target reticle borders */}
                <div className="absolute inset-10 border-2 border-dashed border-[#D4AF37]/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-[#D4AF37] font-mono tracking-widest uppercase bg-black/70 px-2 py-0.5 rounded">
                    SCANNING LIVE
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                  <CameraOff className="w-10 h-10" />
                </div>
                
                {cameraError ? (
                  <div className="text-xs text-red-500 max-w-xs flex items-center gap-1 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    {language === 'ar' 
                      ? 'يمكنك تشغيل الكاميرا الخلفية لهاتفك للبدء بمسح الملصقات الذكية.' 
                      : 'Activate your back camera to start scanning physical landmark tags.'}
                  </p>
                )}

                <button
                  onClick={startCamera}
                  className="rounded-lg bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-xs font-semibold px-5 py-2.5 text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  {language === 'ar' ? 'تشغيل الكاميرا' : 'Start Camera'}
                </button>
              </div>
            )}

            {/* Toggle button when active */}
            {cameraActive && (
              <button
                onClick={stopCamera}
                className="absolute bottom-4 right-4 rounded-lg bg-black/80 border border-zinc-700 px-3 py-1.5 text-[10px] text-zinc-300 hover:bg-black/100 hover:text-white transition cursor-pointer"
              >
                {language === 'ar' ? 'إيقاف الكاميرا' : 'Stop Camera'}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Simulation Trigger list */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4 relative overflow-hidden">
            {/* Top colored line indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]"></div>
            
            <h3 className="text-xs font-black tracking-tighter text-[#D4AF37] flex items-center gap-2 mt-2">
              <Play className="w-4 h-4 text-[#8B0000]" />
              {t.simulateScan}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              {t.simulateScanDesc}
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {qrcodes.map((qr) => (
                <button
                  key={qr.id}
                  onClick={() => handleSimulateScan(qr)}
                  className="w-full text-right p-3 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-[#8B0000]/40 transition text-xs flex justify-between items-center gap-2 cursor-pointer group"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
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
                  className="p-1 rounded-full bg-zinc-900 text-zinc-500 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs md:text-sm">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">
                    {language === 'ar' ? scannedQR.titleAr : scannedQR.titleEn}
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-xs">
                    {language === 'ar' ? scannedQR.descriptionAr : scannedQR.descriptionEn}
                  </p>
                </div>

                {scannedQR.location && (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
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

                <div className="pt-2">
                  <a
                    href={scannedQR.targetUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-xs font-semibold py-3 text-white transition duration-200 shadow-lg text-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t.openLinkBtn}
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
