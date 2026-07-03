import React, { useState, useEffect } from 'react';
import { useApp } from '../services/AppContext';
import { translations } from '../services/translations';
import { QRCodeItem, LandmarkCategory } from '../types';
import { 
  Search, 
  MapPin, 
  Compass, 
  QrCode, 
  ExternalLink, 
  ArrowRight, 
  Sparkles, 
  Layers,
  HelpCircle,
  Eye,
  Activity,
  UserCheck,
  Building,
  Utensils,
  ShoppingBag,
  Scissors,
  HeartPulse,
  Grid,
  Smartphone,
  Globe,
  Heart,
  Star,
  Lock,
  User,
  ThumbsUp,
  Share2,
  X,
  Copy,
  Check,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  ChevronDown,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { smartMatchQRItem } from '../services/searchUtils';
import { OfferCardDescription } from '../components/OfferCardDescription';

interface VisitorLandingProps {
  onSwitchToMerchant: () => void;
  onOpenScanner: () => void;
  onSelectScannedQR: (qr: QRCodeItem) => void;
  onOpenInstallModal: () => void;
  onNavigateToAccount?: () => void;
}

export const VisitorLanding: React.FC<VisitorLandingProps> = ({ 
  onSwitchToMerchant, 
  onOpenScanner,
  onSelectScannedQR,
  onOpenInstallModal,
  onNavigateToAccount
}) => {
  const { qrcodes, language, currentUser, toggleLike, toggleFavorite, submitRating } = useApp();
  const t = translations[language];

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LandmarkCategory | 'all' | 'favorites' | 'expiring'>('all');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | 'all'>('all');
  const [showDistanceMenu, setShowDistanceMenu] = useState<boolean>(false);
  const [sortByDistance, setSortByDistance] = useState<boolean>(false);
  const [hasInteractedWithDistance, setHasInteractedWithDistance] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [selectedLandmark, setSelectedLandmark] = useState<QRCodeItem | null>(null);
  const [sharingOffer, setSharingOffer] = useState<QRCodeItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [visitorTipModal, setVisitorTipModal] = useState<{ isOpen: boolean; actionNameAr?: string; actionNameEn?: string }>({ isOpen: false });
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, searchQuery, maxDistanceKm, sortByDistance]);

  useEffect(() => {
    const handleScroll = () => {
      // Find Offer #6 (index 5) or fallback to the last available card in the DOM
      const targetCard = document.getElementById('offer-card-5') || document.querySelector('[id^="offer-card-"]:last-of-type');
      if (targetCard) {
        const rect = targetCard.getBoundingClientRect();
        // Show floating buttons only after reaching/passing the end of Offer #6
        if (window.scrollY > 300 && rect.bottom <= window.innerHeight + 80) {
          setShowBackToTop(true);
        } else {
          setShowBackToTop(false);
        }
      } else if (window.scrollY > 900) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, selectedCategory, searchQuery, maxDistanceKm, sortByDistance]);

  const handleProtectedAction = (actionAr: string, actionEn: string, callback: () => void) => {
    if (!currentUser) {
      setVisitorTipModal({ isOpen: true, actionNameAr: actionAr, actionNameEn: actionEn });
      return;
    }
    callback();
  };

  // Auto-open offer if present in URL parameter (?offer=id)
  useEffect(() => {
    if (typeof window !== 'undefined' && qrcodes.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const offerId = params.get('offer');
      if (offerId && !selectedLandmark && !sharingOffer) {
        const found = qrcodes.find(q => q.id === offerId);
        if (found) {
          setSelectedLandmark(found);
        }
      }
    }
  }, [qrcodes]);

  // Dynamically update document title & Open Graph image/meta when viewing or sharing an offer
  useEffect(() => {
    const activeItem = sharingOffer || selectedLandmark;
    if (typeof document !== 'undefined') {
      if (activeItem) {
        const titleText = language === 'ar' ? activeItem.titleAr : activeItem.titleEn;
        const descText = language === 'ar' ? (activeItem.descriptionAr || (activeItem as any).descAr || '') : (activeItem.descriptionEn || (activeItem as any).descEn || '');
        document.title = `${titleText} | CityQR`;
        
        const setMeta = (property: string, content: string) => {
          let meta = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
          if (meta) {
            meta.setAttribute('content', content);
          }
        };
        setMeta('og:title', `${titleText} | CityQR`);
        setMeta('og:description', descText);
        if (activeItem.imageUrl) {
          setMeta('og:image', activeItem.imageUrl);
          setMeta('og:image:secure_url', activeItem.imageUrl);
          setMeta('twitter:image', activeItem.imageUrl);
        }
      } else {
        document.title = 'CityQR - منصة الاستجابة السريعة للمدن الذكية والأماكن والعروض';
      }
    }
  }, [sharingOffer, selectedLandmark, language]);

  const getOfferShareText = (qr: QRCodeItem, includeUrl: boolean = true) => {
    const title = language === 'ar' ? qr.titleAr : qr.titleEn;
    const desc = language === 'ar' ? (qr.descriptionAr || (qr as any).descAr || '') : (qr.descriptionEn || (qr as any).descEn || '');
    const offerUrl = `https://cityqrgoogle.vercel.app/?offer=${qr.id}`;
    const imgUrl = qr.imageUrl || "https://cityqrgoogle.vercel.app/app_icon-512.png?v=4";

    if (language === 'ar') {
      let text = `🌟🏛️ [ تطبيق CityQR - دليل مدينتك التفاعلي والعروض الحصرية ] 🏛️🌟\n\n📢 إعلان / عرض مميز:\n✨ "${title}"\n\n📝 تفاصيل العرض:\n${desc}\n\n🖼️ صورة الإعلان المصغرة:\n${imgUrl}`;
      if (includeUrl && offerUrl) {
        text += `\n\n🔗 رابط الوصول المباشر للعرض على التطبيق:\n${offerUrl}`;
      }
      text += `\n\n📲 تصفح تطبيق CityQR لاكتشاف جميع الخصومات والخدمات الحصرية في مدينتك!`;
      return text;
    } else {
      let text = `🌟🏛️ [ CityQR App - Your Smart City Guide & Offers ] 🏛️🌟\n\n📢 Special Offer / Ad:\n✨ "${title}"\n\n📝 Details:\n${desc}\n\n🖼️ Ad Image Thumbnail:\n${imgUrl}`;
      if (includeUrl && offerUrl) {
        text += `\n\n🔗 Direct Access Link on the App:\n${offerUrl}`;
      }
      text += `\n\n📲 Explore CityQR to discover all active discounts & services in your city!`;
      return text;
    }
  };

  const currentSelected = selectedLandmark ? (qrcodes.find(q => q.id === selectedLandmark.id) || selectedLandmark) : null;

  // GPS Detection Handler
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus(language === 'ar' ? 'الـ GPS غير مدعوم في متصفحك' : 'GPS not supported');
      return;
    }
    setGpsStatus(language === 'ar' ? 'جاري تحديد موقعك...' : 'Locating...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsStatus(language === 'ar' ? '✅ تم تحديد موقعك الحالي بالدقة' : '✅ Location detected accurately');
      },
      () => {
        // Fallback to Cairo center if permission denied or error
        setUserCoords({ lat: 30.0444, lng: 31.2357 });
        setGpsStatus(language === 'ar' ? '⚠️ تم استخدام الموقع الافتراضي (القاهرة)' : '⚠️ Using default center (Cairo)');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Distance calculator helper (Haversine formula)
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return Math.round(R * c * 10) / 10;
  };

  // Get item distance in km
  const getItemDistance = (qr: QRCodeItem): number | null => {
    const itemLat = qr.location?.lat ?? (qr as any).lat;
    const itemLng = qr.location?.lng ?? (qr as any).lng;
    if (typeof itemLat !== 'number' || typeof itemLng !== 'number') return null;
    const refLat = userCoords?.lat ?? 30.0444; // Default to Cairo center
    const refLng = userCoords?.lng ?? 31.2357;
    return calculateDistanceKm(refLat, refLng, itemLat, itemLng);
  };

  // Filter items
  const filteredItems = qrcodes.filter((qr) => {
    const matchesSearch = smartMatchQRItem(qr, searchQuery);
    
    const matchesCategory = 
      selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'favorites' 
        ? (qr.favoritedBy || []).includes(currentUser?.id || '') 
        : selectedCategory === 'expiring'
        ? (!!qr.expiresAt || (qr.titleAr && (qr.titleAr.includes('عرض') || qr.titleAr.includes('خصم') || qr.titleAr.includes('خاص'))) || qr.isActive)
        : qr.category === selectedCategory;

    const dist = getItemDistance(qr);
    const matchesDistance =
      maxDistanceKm === 'all' 
        ? true 
        : (dist !== null && dist <= maxDistanceKm);

    return matchesSearch && matchesCategory && matchesDistance;
  }).sort((a, b) => {
    if (selectedCategory === 'expiring') {
      if (a.expiresAt && b.expiresAt) {
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      if (a.expiresAt) return -1;
      if (b.expiresAt) return 1;
    }
    if (sortByDistance) {
      const distA = getItemDistance(a) ?? 9999;
      const distB = getItemDistance(b) ?? 9999;
      return distA - distB;
    }
    return 0;
  });

  const displayedItems = filteredItems.slice(0, visibleCount);

  const categoriesList: { id: LandmarkCategory | 'all' | 'favorites' | 'expiring'; labelAr: string; labelEn: string; icon: any; color: string }[] = [
    { id: 'all', labelAr: '🌟 الكل', labelEn: 'All', icon: Layers, color: 'text-[#D4AF37]' },
    { id: 'expiring', labelAr: '⏳ قارب على الانتهاء', labelEn: '⏳ Expiring Soon', icon: Clock, color: 'text-rose-500 font-extrabold animate-pulse' },
    { id: 'monument', labelAr: '🍽️ مطاعم ومقاهي', labelEn: 'Restaurants & Cafés', icon: Utensils, color: 'text-amber-500' },
    { id: 'culture', labelAr: '🏛️ سياحة ومعالم', labelEn: 'Tourism & Landmarks', icon: Globe, color: 'text-purple-500' },
    { id: 'facility', labelAr: '🛠️ خدمات ومرافق', labelEn: 'Services & Facilities', icon: Grid, color: 'text-cyan-500' },
    { id: 'transport', labelAr: '🏋️ لياقة ومواصلات', labelEn: 'Gyms & Transport', icon: Activity, color: 'text-green-500' },
    { id: 'emergency', labelAr: '🏥 عيادات وطوارئ', labelEn: 'Medical & Clinics', icon: HeartPulse, color: 'text-[#8B0000]' },
  ];

  const getCategoryLabel = (cat: LandmarkCategory) => {
    switch (cat) {
      case 'monument': return language === 'ar' ? '🍽️ مطعم / مقهى' : 'Restaurant & Café';
      case 'transport': return language === 'ar' ? '🏋️ لياقة ومواصلات' : 'Gym & Transport';
      case 'facility': return language === 'ar' ? '🛠️ خدمة / مرفق عام' : 'Service & Facility';
      case 'emergency': return language === 'ar' ? '🏥 عيادة / مركز طبي' : 'Medical Center & Clinic';
      case 'culture': return language === 'ar' ? '🏛️ سياحة ومعلم' : 'Tourism & Landmark';
      default: return cat;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-6"
    >
      {/* 🏆 Official CityDeals Promoted Banner - Compact (Half Size) */}
      <a
        href="https://cityappnew.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-2xl bg-gradient-to-r from-[#0A0A0A] via-[#14141E] to-[#0A0A0A] p-2.5 sm:p-3 border border-[#EF4444]/80 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:border-[#EF4444] transition-all duration-300 group/banner relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#EF4444] animate-pulse"></div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/50 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.4)] group-hover/banner:scale-105 transition-transform">
              🏆
            </div>
            <div className="flex flex-col text-start overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400 font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)] shrink-0 flex items-center gap-1">
                  <span>📢</span>
                  <span>{language === 'ar' ? 'إعلان ترويجي خارجي' : 'Sponsored Ad'}</span>
                </span>
                <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-lg bg-[#0A0A0A] border border-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.4)] shrink-0" dir="ltr">
                  <span className="text-white font-black text-sm sm:text-base tracking-tight drop-shadow">City</span>
                  <span className="bg-gradient-to-r from-[#EF4444] via-[#F97316] to-[#F59E0B] bg-clip-text text-transparent font-black text-sm sm:text-base tracking-tight">Deals</span>
                  <span className="bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 font-black text-[8px] sm:text-[9px] px-1 py-0.2 rounded-full shadow ml-1">EG</span>
                </span>
                <span className="bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/60 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  {language === 'ar' ? '🚧 قريباً تحت الإنشاء' : '🚧 Coming Soon - Under Construction'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-extrabold text-zinc-300 group-hover/banner:text-white transition-colors leading-snug line-clamp-1">
                {language === 'ar'
                  ? 'أكبر تطبيق متخصص في العروض والخصومات وكسب النقاط في مدينتك! (انتظرونا قريباً جداً)'
                  : 'The largest app for deals, discounts & earning points! (Coming Soon)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <span className="w-full sm:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#EF4444] text-white font-black text-[11px] sm:text-xs shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center justify-center gap-1.5 shrink-0 group-hover/banner:scale-105 transition-transform">
              <span>{language === 'ar' ? 'تصفح التطبيق' : 'Explore App'}</span>
              <span className={language === 'ar' ? 'rotate-180' : ''}>➜</span>
            </span>
          </div>
        </div>
      </a>

      {/* Dynamic Hero Section with Top Red/Gold Ribbon and Shopping Background */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 p-5 sm:p-8 shadow-[0_15px_50px_-10px_rgba(0,0,0,0.8)] dark:shadow-[0_4px_25px_-2px_rgba(255,255,255,0.1),0_0_15px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_8px_32px_-2px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.08)] min-h-[250px] sm:min-h-[270px] flex flex-col justify-center group/hero hover:border-[#D4AF37]/30 transition-all duration-700">
        {/* Beautiful Shopping Woman Background Image - Always Visible */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-r from-zinc-950 to-zinc-900">
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80" 
            alt="Young woman shopping" 
            className="w-full h-full object-cover object-center opacity-85 sm:opacity-95 scale-105 group-hover/hero:scale-110 transition-all duration-1000"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback shopping image if primary url has any network hiccup
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          {/* Subtle Directional Gradients that keep text super readable while leaving the shopper woman clearly visible on top/right */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-zinc-950/10 sm:via-zinc-950/50 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent sm:hidden" />
        </div>

        <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line z-20"></div>
        
        {/* Glowing Ambient Lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B0000]/15 rounded-full blur-3xl z-0 pointer-events-none group-hover/hero:bg-[#8B0000]/25 transition duration-700" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl z-0 pointer-events-none group-hover/hero:bg-[#D4AF37]/25 transition duration-700" />

        <div className="max-w-3xl space-y-2.5 sm:space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-black/80 backdrop-blur-md px-3.5 py-1 text-xs text-zinc-200 shadow-[0_0_20px_rgba(212,175,55,0.15)] group-hover/hero:border-[#D4AF37] transition duration-300">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-bold">
              {language === 'ar' ? 'الخدمة الذاتية وتصفح المنتجات الرقمي' : 'Self-Service & Digital Product Browser'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight drop-shadow-lg text-white">
            {language === 'ar' ? (
              <>
                تصفح المنتجات والخدمات <br />
                <span className="text-[#8B0000] drop-shadow-[0_2px_15px_rgba(139,0,0,0.3)]">بكل سهولة</span>
                <span className="text-[#D4AF37] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]"> وعبر خطوة واحدة</span>
              </>
            ) : (
              <>
                Browse Products & Services <br />
                <span className="text-[#8B0000] drop-shadow-[0_2px_15px_rgba(139,0,0,0.3)]">Instantly</span>
                <span className="text-[#D4AF37] drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]"> with One Scan</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-normal max-w-xl font-medium drop-shadow-md">
            {language === 'ar' 
              ? 'تطبيقك المثالي لتصفح قوائم الطعام (Menu)، تفاصيل وأسعار أصناف الملابس، خدمات صالونات التجميل، والعيادات الطبية داخل المنشأة فوراً عبر مسح كود الـ QR المتواجد أمامك.'
              : 'Your ultimate app to browse menus, retail item prices & sizes, salon packages, and medical department services instantly by scanning the QR code in front of you.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button 
              onClick={onOpenScanner}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] px-7 py-3 text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_5px_20px_rgba(139,0,0,0.4)] hover:shadow-[0_8px_25px_rgba(139,0,0,0.6)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{language === 'ar' ? 'افتح الكاميرا لمسح كود QR' : 'Open Camera to Scan QR'}</span>
            </button>
            
            <button 
              onClick={onOpenInstallModal}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37]/15 to-amber-500/10 hover:from-[#D4AF37]/25 hover:to-amber-500/20 px-5 py-3 text-xs font-extrabold text-[#D4AF37] hover:text-amber-300 uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span>{language === 'ar' ? 'ثبت التطبيق على موبايلك' : 'Install App on Phone'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Floating Icon for Desktop */}
        <div className="absolute bottom-8 right-12 hidden lg:block text-zinc-800/20">
          <QrCode className="w-64 h-64 rotate-12" />
        </div>
      </div>

      {/* 🔍 Unified Smart Search & Explore Hub */}
      <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 p-3.5 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] dark:shadow-[0_4px_25px_-2px_rgba(255,255,255,0.1),0_0_15px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_8px_32px_-2px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.08)] space-y-3 hover:border-[#D4AF37]/30 transition-all duration-500">
          {/* Section Header */}
          <div className="border-b border-zinc-800/80 pb-2.5">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex flex-wrap items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4AF37] shrink-0 animate-spin-slow" />
              <span className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">{language === 'ar' ? 'أقوى العروض والخصومات' : 'Top Deals & Discounts'}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-mono font-extrabold shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
                ⚡ {language === 'ar' ? `${filteredItems.length} عروض متاح` : `${filteredItems.length} Deals Available`}
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-normal font-medium">
              {language === 'ar' ? 'ابحث فوراً باسم العرض أو المطعم، أو حدد الفئة والنطاق الجغرافي الأقرب إليك' : 'Search instantly by offer or restaurant name, or filter by category and nearest distance'}
            </p>
          </div>

          {/* 1. Instant Live Search Bar (At top of Explore Hub for immediate visibility) */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
            <input
              type="text"
              placeholder={language === 'ar' ? '🔍 البحث بالنشاط أو الموقع...' : '🔍 Search by activity or location...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/90 border border-zinc-700/80 focus:border-[#D4AF37] focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] rounded-xl py-2.5 pl-10 pr-9 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none transition-all duration-300 font-bold shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Horizontal Category Filters */}
          <div className="space-y-1.5">
            <div className="flex gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none snap-x">
              {categoriesList.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer snap-start shrink-0 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] border-[#D4AF37] text-black font-black shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-[1.02]' 
                        : cat.id === 'expiring'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:text-rose-300 hover:border-rose-500/50 hover:bg-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                        : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700/80 hover:bg-zinc-900'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : cat.color}`} />
                    <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Geographical Distance & Sorting Row (Buttons on same line with tight spacing) */}
          <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            {/* Button 1: Sort by nearest */}
            <button
              type="button"
              onClick={() => {
                const nextSort = !sortByDistance;
                setSortByDistance(nextSort);
                setHasInteractedWithDistance(true);
                if (nextSort && !userCoords) {
                  handleDetectGPS();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shrink-0 ${
                sortByDistance
                  ? 'bg-green-500/20 text-green-400 border-green-500/40 shadow-sm font-black'
                  : 'bg-black/40 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${sortByDistance ? 'bg-green-400 animate-ping' : 'bg-zinc-600'}`} />
              <span>{language === 'ar' ? '🔄 الأقرب مسافة' : '🔄 Sort by Nearest'}</span>
            </button>

            {/* Button 2: Select Distance (Dropdown up to 5 km max) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowDistanceMenu(!showDistanceMenu);
                  setHasInteractedWithDistance(true);
                  if (!userCoords && maxDistanceKm === 'all') {
                    handleDetectGPS();
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                  maxDistanceKm !== 'all' || showDistanceMenu
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md font-black'
                    : 'bg-black/40 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Globe className={`w-3.5 h-3.5 ${maxDistanceKm !== 'all' || showDistanceMenu ? 'text-black' : 'text-cyan-400'}`} />
                <span>
                  {language === 'ar' ? '📏 حدد المسافة: ' : '📏 Select Distance: '}
                  {maxDistanceKm === 'all'
                    ? (language === 'ar' ? 'الكل' : 'All')
                    : (language === 'ar' ? `${maxDistanceKm} كم` : `${maxDistanceKm} km`)}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDistanceMenu ? 'rotate-180' : ''}`} />
              </button>

              {showDistanceMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDistanceMenu(false)} />
                  <div className="absolute top-full mt-1.5 left-0 z-50 min-w-[200px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1 space-y-0.5">
                    {[
                      { id: 'all' as const, labelAr: 'كل المسافات', labelEn: 'All Distances' },
                      { id: 1 as const, labelAr: 'أقل من 1 كم', labelEn: '< 1 km' },
                      { id: 2 as const, labelAr: 'أقل من 2 كم', labelEn: '< 2 km' },
                      { id: 3 as const, labelAr: 'أقل من 3 كم', labelEn: '< 3 km' },
                      { id: 4 as const, labelAr: 'أقل من 4 كم', labelEn: '< 4 km' },
                      { id: 5 as const, labelAr: 'أقل من 5 كم (الحد الأقصى)', labelEn: '< 5 km (Max)' },
                    ].map((distOption) => {
                      const isSelected = maxDistanceKm === distOption.id;
                      return (
                        <button
                          key={distOption.id}
                          type="button"
                          onClick={() => {
                            setMaxDistanceKm(distOption.id);
                            setShowDistanceMenu(false);
                            setHasInteractedWithDistance(true);
                            if (!userCoords && distOption.id !== 'all') {
                              handleDetectGPS();
                            }
                          }}
                          className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#D4AF37] text-black font-black'
                              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <span>{language === 'ar' ? distOption.labelAr : distOption.labelEn}</span>
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Button 3: Detect Location (ONLY visible if user selected/interacted with distance buttons) */}
            {(hasInteractedWithDistance || sortByDistance || maxDistanceKm !== 'all' || showDistanceMenu) && (
              <div className="flex items-center gap-1.5 animate-fadeIn shrink-0">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8B0000]/20 border border-[#8B0000]/40 hover:bg-[#8B0000]/30 text-white font-bold transition cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                  <span>{language === 'ar' ? '📍 تحديد موقعي' : '📍 Detect Location'}</span>
                </button>

                {gpsStatus && (
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
                    {gpsStatus}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Grid: Directory Feed & Side Interactive QR Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Commercial Directory Card Feed */}
          <div className="lg:col-span-2 space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-zinc-800 bg-zinc-950/40 text-zinc-400 space-y-4">
                <HelpCircle className="w-12 h-12 mx-auto text-[#D4AF37]/60 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {language === 'ar' ? 'لم يتم العثور على أي منتجات أو خدمات مطابقة للبحث.' : 'No matching items or services found.'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {language === 'ar' ? 'جرب البحث بكلمات أخرى أو قم بإلغاء فلتر المسافة والفئة.' : 'Try different keywords or clear distance and category filters.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setMaxDistanceKm('all');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-black text-xs transition cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  <span>{language === 'ar' ? '🔄 مسح جميع الفلاتر وعرض الكل' : '🔄 Clear All Filters'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedItems.map((qr, index) => {
                const distKm = getItemDistance(qr);
                return (
                <motion.div
                  key={qr.id}
                  id={`offer-card-${index}`}
                  layoutId={`card-${qr.id}`}
                  onClick={() => {
                    setSelectedLandmark(qr);
                    setTimeout(() => {
                      document.getElementById('offer-details-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="p-5 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/95 via-zinc-900/60 to-zinc-950 hover:border-[#D4AF37]/50 hover:shadow-[0_12px_35px_rgba(212,175,55,0.12)] dark:shadow-[0_4px_25px_-2px_rgba(255,255,255,0.1),0_0_15px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_8px_32px_-2px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Shimmering top line overlay on hover */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

                  <div>
                    {/* Subtle active state decoration */}
                    {qr.isActive && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B0000]" />
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-zinc-950 border border-[#D4AF37]/30 text-[#D4AF37] uppercase tracking-wider shadow-sm group-hover:border-[#D4AF37] transition duration-300">
                        {getCategoryLabel(qr.category)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 shrink-0 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                        <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                        {qr.totalScans} {t.scansCount}
                      </span>
                    </div>

                    {/* Premium Card Image thumbnail */}
                    {qr.imageUrl && (
                      <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden mt-3 relative border-[1.5px] border-red-500/35 dark:border-red-500/35 bg-zinc-950 group-hover:border-red-500/60 transition duration-300 shadow-inner">
                        <img
                          src={qr.imageUrl}
                          alt={language === 'ar' ? qr.titleAr : qr.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition duration-300" />
                      </div>
                    )}

                    <h4 className="text-base font-bold text-white mt-3 group-hover:text-[#D4AF37] transition line-clamp-1">
                      {language === 'ar' ? qr.titleAr : qr.titleEn}
                    </h4>

                    <OfferCardDescription
                      description={language === 'ar' ? (qr.descriptionAr || (qr as any).descAr || '') : (qr.descriptionEn || (qr as any).descEn || '')}
                      language={language}
                    />

                    {/* Expiration Date Badge */}
                    {qr.expiresAt && (
                      <div className="flex items-center gap-1.5 text-rose-500 text-[10px] mt-1.5 font-semibold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md w-max">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                        <span>
                          {language === 'ar' 
                            ? `ينتهي العرض: ${qr.expiresAt}` 
                            : `Expires: ${qr.expiresAt}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 text-zinc-500 text-[10px] mt-2 font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="truncate">
                          {language === 'ar' 
                            ? (qr.location?.addressAr || (qr as any).addressAr || 'موقع/رقم كاونتر المنشأة') 
                            : (qr.location?.addressEn || (qr as any).addressEn || 'Establishment Location/Counter')}
                        </span>
                      </div>
                      {distKm !== null && (
                        <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold shrink-0">
                          📍 {language === 'ar' ? `يبعد ${distKm} كم` : `${distKm} km`}
                        </span>
                      )}
                    </div>

                    {/* Simulated action overlay indicator & Total rating */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold text-zinc-400 transition uppercase">
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg text-amber-400 font-mono text-xs font-bold shrink-0" title={language === 'ar' ? 'إجمالي تقييم العرض' : 'Overall offer rating'}>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{qr.averageRating || '0.0'}</span>
                        <span className="text-zinc-400 font-sans text-[10px] font-normal">({qr.ratingsCount || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400 group-hover:text-[#D4AF37] transition">
                        <span>{language === 'ar' ? 'زيارة صفحة المعلن' : 'Visit Advertiser Page'}</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
                      </div>
                    </div>

                    {/* Like, Favorite & Rate Footer Bar */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="mt-2.5 pt-2 border-t border-zinc-900/80 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {/* Like button (Thumbs Up - Facebook style) */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleProtectedAction('الإعجاب بالعروض (👍)', 'Like Deals (👍)', () => toggleLike(qr.id)); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                            currentUser && (qr.likedBy || []).includes(currentUser.id)
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                              : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                          title={language === 'ar' ? 'إعجاب بالعرض (👍)' : 'Like Offer'}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${ currentUser && (qr.likedBy || []).includes(currentUser.id) ? 'fill-blue-400 text-blue-400' : '' }`} />
                          <span className="font-mono text-xs">{qr.likesCount || 0}</span>
                        </button>

                        {/* Add to Favorites button (Heart) */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleProtectedAction('حفظ العروض بالمفضلة (❤️)', 'Save to Favorites (❤️)', () => toggleFavorite(qr.id)); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                            currentUser && (qr.favoritedBy || []).includes(currentUser.id)
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                              : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                          title={language === 'ar' ? 'أضف إلى المفضلة (❤️)' : 'Add to Favorites'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${ currentUser && (qr.favoritedBy || []).includes(currentUser.id) ? 'fill-rose-400 text-rose-400' : '' }`} />
                          <span className="font-mono text-xs">{qr.favoritesCount || 0}</span>
                        </button>

                        {/* 1-5 Star Rating */}
                        <div className="flex items-center gap-0.5 bg-zinc-900/90 px-2 py-1 rounded-lg border border-zinc-800" title={language === 'ar' ? 'تقييم العرض' : 'Rate Offer'}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const myRating = currentUser ? ((qr.userRatings || {})[currentUser.id] || 0) : 0;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleProtectedAction('تقييم العرض (★)', 'Rate Offer (★)', () => submitRating(qr.id, star)); }}
                                className="text-zinc-600 hover:text-amber-400 transition cursor-pointer p-0.5"
                                title={language === 'ar' ? `تقييم ${star} نجوم` : `Rate ${star} stars`}
                              >
                                <Star 
                                  className={`w-3.5 h-3.5 ${ star <= myRating ? 'text-amber-400 fill-amber-400' : '' }`} 
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Share Offer Button - Available to both Visitors & Registered Users */}
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 pt-3 border-t border-zinc-900/80 flex items-center justify-between"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharingOffer(qr);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/10 to-[#8B0000]/15 hover:from-[#D4AF37]/30 hover:to-[#8B0000]/30 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-white transition duration-300 cursor-pointer font-extrabold text-xs shadow-sm hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] group/btn"
                        title={language === 'ar' ? 'مشاركة هذا العرض مع الأصدقاء والعائلة عبر وسائل التواصل' : 'Share this offer with friends & family via social media'}
                      >
                        <Share2 className="w-4 h-4 text-[#D4AF37] group-hover/btn:scale-110 transition-transform shrink-0" />
                        <span>{language === 'ar' ? 'مشاركة العرض' : 'Share Offer'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}

          {/* Pagination Controls & Back to Top */}
          {filteredItems.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-6 border-t border-zinc-800/80">
              {filteredItems.length > visibleCount ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <ChevronDown className="w-5 h-5 text-black group-hover:translate-y-0.5 transition-transform" />
                  <span>
                    {language === 'ar'
                      ? `👇 عرض المزيد من العروض (${filteredItems.length - visibleCount} متبقي)`
                      : `👇 Load More Deals (${filteredItems.length - visibleCount} remaining)`}
                  </span>
                </button>
              ) : (
                <div className="text-xs text-zinc-500 font-medium px-4 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800">
                  {language === 'ar' ? '✨ تم عرض جميع العروض المتاحة حالياً' : '✨ All available deals displayed'}
                </div>
              )}

              {/* Distinctive Rectangular CityDeals Promo Button */}
              <a
                href="https://cityappnew.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-3xl bg-gradient-to-r from-[#0A0A0A] via-[#14141E] to-[#0A0A0A] hover:from-[#14141E] hover:to-[#1a1a2e] text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] border-2 border-[#EF4444]/70 hover:border-[#EF4444] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-4 cursor-pointer group"
              >
                <span className="flex h-3.5 w-3.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-85"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#EF4444] shadow-[0_0_10px_#EF4444]"></span>
                </span>
                <div className="flex flex-col text-start gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400 font-black text-xs px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)] shrink-0 flex items-center gap-1">
                      <span>📢</span>
                      <span>{language === 'ar' ? 'إعلان ترويجي خارجي' : 'Sponsored Ad'}</span>
                    </span>
                    <span className="text-lg">🚀</span>
                    <span className="inline-flex items-center gap-0.5 px-3 py-1 rounded-xl bg-[#0A0A0A] border-2 border-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.5)]" dir="ltr">
                      <span className="text-white font-black text-base sm:text-lg tracking-tight drop-shadow">City</span>
                      <span className="bg-gradient-to-r from-[#EF4444] via-[#F97316] to-[#F59E0B] bg-clip-text text-transparent font-black text-base sm:text-lg tracking-tight">Deals</span>
                      <span className="bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow ml-1">EG</span>
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/60 font-black text-xs px-2.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                      {language === 'ar' ? '🚧 قريباً تحت الإنشاء' : '🚧 Under Construction'}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-zinc-200 group-hover:text-white transition-colors leading-relaxed">
                    {language === 'ar'
                      ? '🚧 قريباً تحت الإنشاء - أكبر تطبيق متخصص في العروض والخصومات وكسب النقاط'
                      : '🚧 Coming Soon Under Construction - Largest App for Deals & Discounts'}
                  </span>
                </div>
                <span className={`text-lg font-black text-[#EF4444] shrink-0 transition-transform ${language === 'ar' ? 'group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5'}`}>
                  {language === 'ar' ? '←' : '→'}
                </span>
              </a>
              
              {displayedItems.length >= 4 && (
                <button
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] font-bold text-sm active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  title={language === 'ar' ? 'العودة لأعلى الصفحة' : 'Back to Top'}
                >
                  <span className="text-lg">👆</span>
                  <span>{language === 'ar' ? 'العودة للأعلى' : 'Back to Top'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Selected Landmark Interactive Details Sidebar */}
        <div id="offer-details-panel" className={`space-y-4 ${!currentSelected ? 'hidden lg:block' : 'block'}`}>
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 relative overflow-hidden h-full flex flex-col justify-between min-h-[400px] dark:shadow-[0_4px_25px_-2px_rgba(255,255,255,0.1),0_0_15px_rgba(255,255,255,0.05)] dark:hover:shadow-[0_8px_32px_-2px_rgba(255,255,255,0.18),0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300">
            {/* Top colored line indicator */}
            <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
            
            {/* Panel Header */}
            <div className="border-b border-zinc-800/80 pb-3 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                <h3 className="text-xs font-black text-white tracking-tight uppercase">
                  {language === 'ar' ? '🔎 لوحة تفاصيل العرض ومحاكاة الـ QR' : '🔎 Offer Details & QR Simulator'}
                </h3>
              </div>
              <span className="text-[9px] text-[#D4AF37] font-mono font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">PANEL</span>
            </div>

            <AnimatePresence mode="wait">
              {currentSelected ? (
                <motion.div
                  key={currentSelected.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 flex-1 flex flex-col justify-between h-full"
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-start mt-2">
                      <div className="px-3 py-1 bg-[#8B0000]/10 text-[#8B0000] text-[10px] font-bold rounded border border-[#8B0000]/30 tracking-wider uppercase">
                        {getCategoryLabel(currentSelected.category)}
                      </div>
                      <button 
                        onClick={() => setSelectedLandmark(null)}
                        className="text-zinc-500 hover:text-white text-xs font-bold uppercase transition cursor-pointer"
                      >
                        {language === 'ar' ? 'تراجع' : 'Reset'}
                      </button>
                    </div>

                    {/* Premium Large Promo Image Banner */}
                    {currentSelected.imageUrl && (
                      <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden relative border-[1.5px] border-red-500/35 dark:border-red-500/35 bg-zinc-900/60 shadow-inner">
                        <img
                          src={currentSelected.imageUrl}
                          alt={language === 'ar' ? currentSelected.titleAr : currentSelected.titleEn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                        {language === 'ar' ? currentSelected.titleAr : currentSelected.titleEn}
                      </h3>
                      {currentSelected.addressAr && (
                        <p className="text-xs text-[#D4AF37] flex items-center gap-1.5 mt-2 font-mono">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{language === 'ar' ? currentSelected.addressAr : currentSelected.addressEn}</span>
                        </p>
                      )}
                    </div>

                    <div className="border-t border-zinc-900 pt-3 space-y-2">
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        {language === 'ar' ? (currentSelected.descriptionAr || (currentSelected as any).descAr) : (currentSelected.descriptionEn || (currentSelected as any).descEn)}
                      </p>

                      {/* Expiration Date inside Details */}
                      {currentSelected.expiresAt && (
                        <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg w-max mt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span>
                            {language === 'ar' 
                              ? `تاريخ انتهاء العرض: ${currentSelected.expiresAt}` 
                              : `Offer Expires: ${currentSelected.expiresAt}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Like & Rating Sidebar Box */}
                    <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2.5 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-bold">
                          {language === 'ar' ? 'التفاعل وتقييم العرض:' : 'Interaction & Rating:'}
                        </span>
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded text-amber-400 font-mono font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span>{currentSelected.averageRating || '0.0'}</span>
                          <span className="text-zinc-400 font-sans text-[10px]">({currentSelected.ratingsCount || 0})</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleProtectedAction('الإعجاب بالعروض (👍)', 'Like Deals (👍)', () => toggleLike(currentSelected.id))}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                              currentUser && (currentSelected.likedBy || []).includes(currentUser.id)
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            title={language === 'ar' ? 'إعجاب (👍)' : 'Like'}
                          >
                            <ThumbsUp className={`w-4 h-4 ${ currentUser && (currentSelected.likedBy || []).includes(currentUser.id) ? 'fill-blue-400 text-blue-400' : '' }`} />
                            <span className="text-xs">{language === 'ar' ? 'إعجاب (' : 'Like ('}{currentSelected.likesCount || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleProtectedAction('حفظ العروض بالمفضلة (❤️)', 'Save to Favorites (❤️)', () => toggleFavorite(currentSelected.id))}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                              currentUser && (currentSelected.favoritedBy || []).includes(currentUser.id)
                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            title={language === 'ar' ? 'أضف للمفضلة (❤️)' : 'Favorite'}
                          >
                            <Heart className={`w-4 h-4 ${ currentUser && (currentSelected.favoritedBy || []).includes(currentUser.id) ? 'fill-rose-400 text-rose-400' : '' }`} />
                            <span className="text-xs">{language === 'ar' ? 'مفضل (' : 'Fav ('}{currentSelected.favoritesCount || 0})</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const myRating = currentUser ? ((currentSelected.userRatings || {})[currentUser.id] || 0) : 0;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleProtectedAction('تقييم العرض (★)', 'Rate Offer (★)', () => submitRating(currentSelected.id, star))}
                                className="text-zinc-600 hover:text-amber-400 transition cursor-pointer p-0.5"
                                title={language === 'ar' ? `تقييم ${star} نجوم` : `Rate ${star} stars`}
                              >
                                <Star className={`w-4 h-4 ${ star <= myRating ? 'text-amber-400 fill-amber-400' : '' }`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 rounded-xl border border-zinc-900 font-mono text-[11px]">
                      <div>
                        <span className="block text-zinc-500">VIEWS:</span>
                        <span className="block font-bold text-white text-sm">{currentSelected.totalScans}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500">AVAILABILITY:</span>
                        <span className="block font-bold text-green-500">● {t.activeStatus.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-zinc-900 mt-auto">
                    {/* Share Offer button in sidebar details */}
                    <button
                      type="button"
                      onClick={() => setSharingOffer(currentSelected)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-[#8B0000]/20 hover:from-[#D4AF37]/30 hover:to-[#8B0000]/30 border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white transition duration-200 cursor-pointer font-bold text-xs shadow-sm"
                    >
                      <Share2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{language === 'ar' ? 'مشاركة العرض مع الأصدقاء' : 'Share Offer with Friends'}</span>
                    </button>

                    {/* Simulated Quick Scan trigger */}
                    <button
                      onClick={() => onSelectScannedQR(currentSelected)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-600 hover:to-[#D4AF37] text-xs font-bold text-black shadow-lg transition duration-200 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{language === 'ar' ? 'محاكاة مسح الكود لمشاهدة التفاصيل' : 'Simulate Scan to View Details'}</span>
                    </button>

                    {currentSelected.targetUrl && (
                      <a
                        href={currentSelected.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-800 bg-black hover:bg-zinc-900 text-xs font-bold text-zinc-300 transition cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-[#8B0000]" />
                        <span>{t.openLinkBtn}</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center space-y-4 my-auto py-12 flex-1"
                >
                  <div className="w-16 h-16 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-inner">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-white tracking-tight">
                      {language === 'ar' ? '🔎 انقر على أي عرض لعرض التفاصيل' : '🔎 Click Any Deal to View Details'}
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-[240px] mx-auto leading-relaxed font-medium">
                      {language === 'ar' 
                        ? 'هذه اللوحة مخصصة لعرض الوصف الكامل، الأسعار، تقييمات العملاء، ومحاكاة مسح كود QR الفوري للعرض المختار دون الحاجة لكاميرا.' 
                        : 'This panel displays full details, prices, customer ratings, and instant QR scanning simulation for any selected deal without needing a camera.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Share Offer Modal Overlay */}
      {sharingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-[#D4AF37]/30 bg-white dark:bg-zinc-950 p-6 shadow-2xl text-zinc-950 dark:text-zinc-100 z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                  <Share2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black tracking-tight text-zinc-900 dark:text-[#D4AF37]">
                  {language === 'ar' ? 'مشاركة العرض أو الخدمة' : 'Share Offer or Service'}
                </h3>
              </div>
              <button
                onClick={() => setSharingOffer(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Offer Summary Preview Box */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center gap-3 mb-5">
              {sharingOffer.imageUrl && (
                <img 
                  src={sharingOffer.imageUrl} 
                  alt="" 
                  className="w-14 h-14 rounded-lg object-cover shrink-0 border-[1.5px] border-red-500/35 dark:border-red-500/35" 
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                  {language === 'ar' ? sharingOffer.titleAr : sharingOffer.titleEn}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {language === 'ar' ? (sharingOffer.descriptionAr || (sharingOffer as any).descAr) : (sharingOffer.descriptionEn || (sharingOffer as any).descEn)}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 text-xs">
              {/* Native Web Share Button (if available) */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: language === 'ar' ? sharingOffer.titleAr : sharingOffer.titleEn,
                        text: getOfferShareText(sharingOffer, false),
                        url: `https://cityqrgoogle.vercel.app/?offer=${sharingOffer.id}`,
                      });
                    } catch (e) {
                      console.log('Share canceled or failed', e);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-extrabold shadow-md transition duration-150 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-black animate-pulse shrink-0" />
                  <span>{language === 'ar' ? '⚡ مشاركة فورية عبر تطبيقات هاتفك (واتساب، ماسنجر...)' : '⚡ Quick Share via Phone System Menu'}</span>
                </button>
              )}

              {/* Direct copyable Link Field */}
              <div className="space-y-1.5">
                <span className="block font-bold text-zinc-700 dark:text-zinc-300">
                  {language === 'ar' ? 'رابط المشاركة المباشر:' : 'Direct Share Link:'}
                </span>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                  <input
                    type="text"
                    readOnly
                    value={`https://cityqrgoogle.vercel.app/?offer=${sharingOffer.id}`}
                    className="flex-1 bg-transparent px-2 font-mono text-zinc-700 dark:text-zinc-300 select-all outline-none text-[11px]"
                  />
                  <button
                    onClick={() => {
                      const urlToCopy = `https://cityqrgoogle.vercel.app/?offer=${sharingOffer.id}`;
                      navigator.clipboard.writeText(urlToCopy);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-amber-600 text-black text-[11px] font-bold transition duration-150 cursor-pointer shadow shrink-0"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social media channels grid */}
              <div className="space-y-2 pt-1">
                <span className="block font-bold text-zinc-700 dark:text-zinc-300">
                  {language === 'ar' ? 'أو المشاركة مباشرة عبر وسائل التواصل:' : 'Or share directly on social media:'}
                </span>
                
                <div className="grid grid-cols-2 gap-2.5">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      getOfferShareText(sharingOffer, true)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-600 dark:text-green-400 font-bold transition duration-150"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(
                      `https://cityqrgoogle.vercel.app/?offer=${sharingOffer.id}`
                    )}&text=${encodeURIComponent(getOfferShareText(sharingOffer, false))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold transition duration-150"
                  >
                    <Send className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{language === 'ar' ? 'تليجرام' : 'Telegram'}</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      `https://cityqrgoogle.vercel.app/?offer=${sharingOffer.id}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-600/20 bg-blue-600/5 hover:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold transition duration-150"
                  >
                    <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{language === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
                  </a>

                  {/* Twitter/X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      getOfferShareText(sharingOffer, false)
                    )}&url=${encodeURIComponent(
                      `https://cityqrgoogle.vercel.app/?offer=${sharingOffer.id}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-500/20 bg-zinc-500/5 hover:bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 font-bold transition duration-150"
                  >
                    <Twitter className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                    <span>{language === 'ar' ? 'إكس (تويتر)' : 'X / Twitter'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Footer Close */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setSharingOffer(null)}
                className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition duration-150 cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔒 Visitor Permission Alert Modal */}
      <AnimatePresence>
        {visitorTipModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setVisitorTipModal({ isOpen: false })}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-[#D4AF37]/80 rounded-3xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.2)] text-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8 text-[#D4AF37] animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                  💡 {language === 'ar' ? 'تنبيه الزائر - صلاحية التفاعل' : 'Visitor Tip - Permission Required'}
                </span>
                <h3 className="text-lg font-black text-white">
                  {language === 'ar' 
                    ? `خاصية ${visitorTipModal.actionNameAr || 'التفاعل'}`
                    : `${visitorTipModal.actionNameEn || 'Interaction'} Feature`}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed px-2">
                  {language === 'ar'
                    ? 'أنت تتصفح حالياً كـ (زائر). لتتمكن من الإعجاب بالعروض (👍) وحفظها بمفضلاتك (❤️) وتقييمها (★)، يرجى تسجيل الدخول بحساب مستخدم مسجل مجاناً.'
                    : 'You are currently browsing as a Visitor. To Like deals (👍), Save to Favorites (❤️), and Rate offers (★), please sign in to a free User Account.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setVisitorTipModal({ isOpen: false });
                    if (onNavigateToAccount) onNavigateToAccount();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تسجيل دخول كمستخدم الآن' : 'Login as User Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisitorTipModal({ isOpen: false })}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  {language === 'ar' ? 'متابعة كزائر' : 'Continue as Visitor'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons: CityDeals Promo & Back to Top (Show together on scroll) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`fixed bottom-20 md:bottom-8 ${language === 'ar' ? 'left-4 md:left-8' : 'right-4 md:right-8'} z-50 flex items-center gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-none`}
          >
            {/* Distinctive Rectangular CityDeals Promo Button */}
            <a
              href="https://cityappnew.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-[#0A0A0A] via-[#14141E] to-[#0A0A0A] hover:from-[#14141E] hover:to-[#1a1a2e] text-white shadow-[0_5px_30px_rgba(239,68,68,0.5)] border-2 border-[#EF4444]/70 hover:border-[#EF4444] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group shrink overflow-hidden"
              title="CityDeals"
            >
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-85"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EF4444] shadow-[0_0_8px_#EF4444]"></span>
              </span>
              <div className="flex flex-col text-start overflow-hidden gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400 font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-[0_0_8px_rgba(239,68,68,0.6)] shrink-0 flex items-center gap-0.5">
                    <span>📢</span>
                    <span>{language === 'ar' ? 'إعلان ترويجي' : 'Ad'}</span>
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-[#0A0A0A] border-2 border-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.4)] w-fit" dir="ltr">
                    <span className="text-xs mr-0.5">🚀</span>
                    <span className="text-white font-black text-xs tracking-tight drop-shadow">City</span>
                    <span className="bg-gradient-to-r from-[#EF4444] via-[#F97316] to-[#F59E0B] bg-clip-text text-transparent font-black text-xs tracking-tight">Deals</span>
                    <span className="bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 font-black text-[8px] px-1 py-0.2 rounded-full shadow ml-0.5">EG</span>
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-300 group-hover:text-white leading-tight line-clamp-1 transition-colors">
                  {language === 'ar'
                    ? '🚧 قريباً تحت الإنشاء - أكبر تطبيق متخصص في العروض والخصومات'
                    : '🚧 Coming Soon - Under Construction (Deals & Discounts)'}
                </span>
              </div>
            </a>

            {/* Floating Back to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="pointer-events-auto bg-gradient-to-tr from-[#D4AF37] via-amber-400 to-[#D4AF37] text-black px-3.5 py-3 sm:p-3.5 rounded-2xl shadow-[0_5px_25px_rgba(212,175,55,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-white/40 flex items-center gap-1 font-black text-xs group shrink-0"
              title={language === 'ar' ? 'العودة للأعلى' : 'Back to Top'}
            >
              <span className="text-base group-hover:-translate-y-1 transition-transform inline-block">👆</span>
              <span className="font-black">{language === 'ar' ? 'للأعلى' : 'Top'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
