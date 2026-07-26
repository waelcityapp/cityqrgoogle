import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { translations } from '../services/translations';
import { QRCodeItem, LandmarkCategory } from '../types';
import { getCloudinaryConfig, saveCloudinaryConfig, isCloudinaryConfigured } from '../services/cloudinary';
import { MediaCompressorUpload } from '../components/MediaCompressorUpload';
import { 
  QrCode, 
  MapPin, 
  Eye, 
  Wifi, 
  WifiOff, 
  Database, 
  Activity, 
  Search, 
  SlidersHorizontal,
  Navigation,
  ExternalLink,
  Layers,
  Sparkles,
  HeartPulse,
  Info,
  Heart,
  Star,
  ThumbsUp,
  Cloud,
  Settings,
  CheckCircle,
  X,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OfferCardDescription } from '../components/OfferCardDescription';
import { smartMatchQRItem } from '../services/searchUtils';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onSelectScannedQR: (qr: QRCodeItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectScannedQR }) => {
  const { language, qrcodes, isOnline, supabaseActive, incrementScans } = useApp();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LandmarkCategory | 'all'>('all');

  // Cloudinary Settings & Compression Tool Modal State
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);
  const [showCompressorTool, setShowCompressorTool] = useState(false);
  const currentCConfig = getCloudinaryConfig();
  const [cCloudName, setCCloudName] = useState(currentCConfig.cloudName || '');
  const [cPreset, setCPreset] = useState(currentCConfig.uploadPreset || '');
  const [cApiKey, setCApiKey] = useState(currentCConfig.apiKey || '');
  const [cSavedNotice, setCSavedNotice] = useState('');

  const handleSaveCloudinaryConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudinaryConfig({
      cloudName: cCloudName.trim(),
      uploadPreset: cPreset.trim(),
      apiKey: cApiKey.trim()
    });
    setCSavedNotice(language === 'ar' ? 'تم حفظ إعدادات Cloudinary بنجاح!' : 'Cloudinary configuration saved successfully!');
    setTimeout(() => {
      setCSavedNotice('');
      setIsCloudinaryModalOpen(false);
    }, 1200);
  };

  // Stats
  const totalQrs = qrcodes.length;
  const totalScans = qrcodes.reduce((acc, curr) => acc + curr.totalScans, 0);
  const activeCount = qrcodes.filter(q => q.isActive).length;

  // Engagement Stats for Merchant
  const totalLikes = qrcodes.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);
  const totalFavorites = qrcodes.reduce((acc, curr) => acc + (curr.favoritesCount || 0), 0);
  const totalRatingsCount = qrcodes.reduce((acc, curr) => acc + (curr.ratingsCount || 0), 0);
  const averageOverallRating = qrcodes.length > 0 
    ? Number((qrcodes.reduce((acc, curr) => acc + (curr.averageRating || 0), 0) / (qrcodes.filter(q => (q.ratingsCount || 0) > 0).length || 1)).toFixed(1))
    : 0;

  // Filter QRs
  const filteredQRs = qrcodes.filter(qr => {
    const matchesSearch = smartMatchQRItem(qr, searchQuery);
    const matchesCategory = selectedCategory === 'all' || qr.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat: LandmarkCategory) => {
    switch (cat) {
      case 'monument': return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
      case 'transport': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'emergency': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'facility': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'culture': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getCategoryIcon = (cat: LandmarkCategory) => {
    switch (cat) {
      case 'monument': return <Sparkles className="w-4 h-4" />;
      case 'transport': return <Navigation className="w-4 h-4" />;
      case 'emergency': return <HeartPulse className="w-4 h-4 text-red-500" />;
      case 'facility': return <Info className="w-4 h-4" />;
      case 'culture': return <Layers className="w-4 h-4" />;
    }
  };

  const handleSimulateScan = async (qr: QRCodeItem) => {
    await incrementScans(qr.id);
    onSelectScannedQR(qr);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Brand Hero Welcome with Bold Typography top border line & styling */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 md:p-10 relative">
        {/* Top colored line indicator */}
        <div className="absolute top-0 left-0 w-full h-0.5 animated-glow-line"></div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B0000]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase">v1.0.0 PRODUCTION PWA READY</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
            {t.welcomeTitle}{' '}
            <span className="inline-block" dir="ltr">
              <span className="text-[#8B0000]">City</span>
              <span className="text-[#D4AF37]">QR</span>
            </span>
          </h1>
          
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl font-medium">
            {t.welcomeDesc}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onNavigate('generator')}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 px-8 py-3.5 text-xs md:text-sm font-black text-black uppercase tracking-wider transition hover:brightness-110 cursor-pointer shadow-lg shadow-[#D4AF37]/20"
            >
              <SlidersHorizontal className="w-4 h-4 text-black" />
              <span>{language === 'ar' ? '✨ إنشاء وتوليد رمز QR جديد' : '✨ Create New QR Code (Generator)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Network & Service Indicators styled like Dashboard Cards in Design HTML */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Offline/Online Status */}
        <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-green-500/10"></div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">PWA CONNECTION</p>
          <h3 className="text-2xl font-black text-white mt-2">{isOnline ? t.onlineMode : t.offlineMode}</h3>
          <p className={`text-[10px] font-mono mt-1 flex items-center gap-1 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isOnline ? 'HIGH AVAILABILITY' : 'LOCAL OFF-LINE MODE'}
          </p>
        </div>

        {/* Supabase Status */}
        <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37]/10"></div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">{t.supabaseStatus}</p>
          <h3 className="text-xl font-black text-white mt-2">{supabaseActive ? t.supabaseConnected : t.supabaseFallback}</h3>
          <p className="text-[10px] text-amber-500 font-mono mt-1">
            ● {supabaseActive ? 'SYNCED WITH CLOUD CLUSTER' : 'ACTIVE EMBEDDED INDEXEDDB Fallback'}
          </p>
        </div>

        {/* Cloudinary Status & Config */}
        <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/50 to-blue-500/10"></div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-tighter flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>CLOUDINARY MEDIA CDN</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowCompressorTool(!showCompressorTool)}
                  className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-bold bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-lg border border-amber-500/40 transition cursor-pointer"
                  title={language === 'ar' ? 'أداة ضغط الصور والفيديوهات والرفع المباشر' : 'Media Compressor & Live Upload Tool'}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{language === 'ar' ? 'أداة الضغط' : 'Compressor'}</span>
                </button>
                <button
                  onClick={() => setIsCloudinaryModalOpen(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold bg-cyan-950/50 hover:bg-cyan-900/50 px-2 py-1 rounded-lg border border-cyan-800/50 transition cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إعداد' : 'Config'}</span>
                </button>
              </div>
            </div>
            <h3 className="text-xl font-black text-white mt-2">
              {isCloudinaryConfigured() ? (language === 'ar' ? 'متصل بروابط وسائط Cloudinary' : 'Cloudinary Media CDN Active') : (language === 'ar' ? 'جاهز للربط مع Cloudinary' : 'Ready to Connect Cloudinary')}
            </h3>
            <p className="text-[10px] text-cyan-400 font-mono mt-1">
              ● {isCloudinaryConfigured() ? `CLOUD: ${getCloudinaryConfig().cloudName}` : 'DIRECT IMAGE & VIDEO STORAGE'}
            </p>
          </div>
        </div>
      </div>

      {/* Standalone Media Compressor Tool (Expandable in Dashboard) */}
      <AnimatePresence>
        {showCompressorTool && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <MediaCompressorUpload language={language} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/30"></div>
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">{t.statsTotalQrs}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#D4AF37] font-mono tracking-tighter">{totalQrs}</span>
            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">QR Codes</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${Math.min(totalQrs * 10, 100)}%` }} />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B0000] to-[#8B0000]/30"></div>
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">{t.statsTotalScans}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#8B0000] font-mono tracking-tighter">{totalScans}</span>
            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">{t.scansCount}</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#8B0000] h-full rounded-full" style={{ width: `${Math.min(totalScans * 2, 100)}%` }} />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-500/30"></div>
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">{t.statsActiveFacilities}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-green-500 font-mono tracking-tighter">{activeCount}</span>
            <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">/ {totalQrs}</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${totalQrs > 0 ? (activeCount / totalQrs) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Exclusive Merchant Engagement & Ratings Analytics */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900/60 to-zinc-950 space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ThumbsUp className="w-4 h-4" />
              </span>
              <span>{language === 'ar' ? 'لوحة إحصائيات التفاعل الحصري للمعلن' : 'Exclusive Merchant Engagement & Ratings Dashboard'}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {language === 'ar'
                ? 'إحصائيات إعجابات فيسبوك (👍)، الإضافات للمفضلة (❤️)، وتقييمات العملاء (★) تظهر حصرياً هنا في لوحتك الخاصة لمتابعة أداء إعلاناتك.'
                : 'Facebook-style Likes (👍), Favorites (❤️), and Customer Star Ratings (★) flow privately here to track your offer performance.'}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            {language === 'ar' ? '🔒 سرية للمعلن' : '🔒 Merchant Private'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-blue-500/20 flex items-center justify-between">
            <div>
              <span className="block text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'إجمالي الإعجابات (Like)' : 'Total Likes (👍)'}</span>
              <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">{totalLikes}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <ThumbsUp className="w-5 h-5 fill-blue-400/20" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-rose-500/20 flex items-center justify-between">
            <div>
              <span className="block text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'إضافات للمفضلة (Favs)' : 'Total Favorites (❤️)'}</span>
              <span className="text-2xl font-black text-rose-500 font-mono mt-1 block">{totalFavorites}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="block text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'متوسط تقييمات العملاء' : 'Avg Star Rating (★)'}</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-amber-400 font-mono">{averageOverallRating}</span>
                <span className="text-xs text-zinc-400 font-sans">({totalRatingsCount} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Guidance Section */}
      <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10 text-[#D4AF37] shrink-0">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#D4AF37]">{t.simulateScan}</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">{t.simulateScanDesc}</p>
        </div>
      </div>

      {/* QR Registry & Simulator */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {t.allQRs}
            </h2>
            <p className="text-xs text-zinc-500">
              {filteredQRs.length} / {qrcodes.length} {t.allQRs}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث عن معالم...' : 'Search landmarks...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-4 pr-10 text-xs text-zinc-200 outline-none focus:border-[#D4AF37]/50"
              />
            </div>

            {/* Filter Pill List */}
            <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
              {(['all', 'monument', 'transport', 'facility', 'emergency', 'culture'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#8B0000] text-white border border-[#8B0000]'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cat === 'all' ? (language === 'ar' ? 'الكل' : 'All') : t[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* QR List Grid */}
        <AnimatePresence mode="popLayout">
          {filteredQRs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQRs.map((qr) => (
                <motion.div
                  key={qr.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between space-y-4 hover:border-[#8B0000]/50 transition group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(qr.category)} flex items-center gap-1.5`}>
                        {getCategoryIcon(qr.category)}
                        <span>{t[qr.category]}</span>
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="text-zinc-500 flex items-center gap-1" title={language === 'ar' ? 'المشاهدات' : 'Views'}>
                          <Eye className="w-3.5 h-3.5" />
                          {qr.totalScans}
                        </span>
                        <span className="text-blue-400 flex items-center gap-1" title={language === 'ar' ? 'الإعجابات (👍)' : 'Likes'}>
                          <ThumbsUp className="w-3.5 h-3.5 fill-blue-400/20" />
                          {qr.likesCount || 0}
                        </span>
                        <span className="text-rose-500 flex items-center gap-1" title={language === 'ar' ? 'في المفضلة (❤️)' : 'Favorites'}>
                          <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                          {qr.favoritesCount || 0}
                        </span>
                        <span className="text-amber-400 flex items-center gap-1" title={language === 'ar' ? 'التقييم' : 'Rating'}>
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {qr.averageRating || '0.0'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition">
                        {language === 'ar' ? qr.titleAr : qr.titleEn}
                      </h3>
                      <OfferCardDescription
                        description={language === 'ar' ? (qr.descriptionAr || '') : (qr.descriptionEn || '')}
                        language={language}
                      />
                    </div>

                    {qr.location && (
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#8B0000]" />
                        <span className="truncate">
                          {language === 'ar' ? qr.location.addressAr : qr.location.addressEn}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Simulations & Action Links */}
                  <div className="pt-2 border-t border-zinc-900 flex gap-2">
                    <button
                      onClick={() => handleSimulateScan(qr)}
                      className="flex-1 text-center py-2 px-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-[11px] font-bold hover:bg-[#D4AF37]/20 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      {t.simulateScan}
                    </button>
                    <a
                      href={qr.targetUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#8B0000] hover:border-[#8B0000]/30 transition"
                      title={t.openLinkBtn}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20"
            >
              <QrCode className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">{t.noQrsFound}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cloudinary Settings Modal */}
      <AnimatePresence>
        {isCloudinaryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-black text-white">
                    {language === 'ar' ? 'إعداد حساب Cloudinary' : 'Cloudinary Media CDN Setup'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCloudinaryModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCloudinaryConfig} className="space-y-4 mt-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {language === 'ar'
                    ? 'قم بإدخال اسم السحابة (Cloud Name) و الـ Unsigned Upload Preset لربط رفع الصور والفيديوهات مباشرة لسيرفرات Cloudinary.'
                    : 'Provide your Cloud Name and Unsigned Upload Preset to enable direct image/video uploads to Cloudinary CDN.'}
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Cloud Name (اسم السحابة)
                  </label>
                  <input
                    type="text"
                    required
                    value={cCloudName}
                    onChange={(e) => setCCloudName(e.target.value)}
                    placeholder="e.g. cityqr-cloud"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Upload Preset (Unsigned)
                  </label>
                  <input
                    type="text"
                    required
                    value={cPreset}
                    onChange={(e) => setCPreset(e.target.value)}
                    placeholder="e.g. cityqr_preset"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    API Key (اختياري / Optional)
                  </label>
                  <input
                    type="text"
                    value={cApiKey}
                    onChange={(e) => setCApiKey(e.target.value)}
                    placeholder="e.g. 123456789012345"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-sm text-white font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                {cSavedNotice && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    <span>{cSavedNotice}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCloudinaryModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-black transition shadow-lg shadow-cyan-500/20"
                  >
                    {language === 'ar' ? 'حفظ الإعدادات' : 'Save Config'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
