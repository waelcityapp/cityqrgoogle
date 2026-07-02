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
  DollarSign,
  PhoneCall,
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
  Twitter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { convertCurrency } from '../services/international';

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
  const { qrcodes, language, userCountry, currentUser, toggleLike, toggleFavorite, submitRating } = useApp();
  const t = translations[language];

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LandmarkCategory | 'all' | 'favorites'>('all');
  const [selectedLandmark, setSelectedLandmark] = useState<QRCodeItem | null>(null);
  const [calcAmountUSD, setCalcAmountUSD] = useState<number>(100);
  const [sharingOffer, setSharingOffer] = useState<QRCodeItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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
    const offerUrl = typeof window !== 'undefined' ? `${window.location.origin}/?offer=${qr.id}` : '';
    const imgUrl = qr.imageUrl || (typeof window !== 'undefined' ? `${window.location.origin}/app_icon-512.png` : '');

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

  // Filter items
  const filteredItems = qrcodes.filter((qr) => {
    const matchesSearch = 
      qr.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (qr.addressAr && qr.addressAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (qr.addressEn && qr.addressEn.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'favorites' 
        ? (qr.favoritedBy || []).includes(currentUser?.id || '') 
        : qr.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categoriesList: { id: LandmarkCategory | 'all' | 'favorites'; labelAr: string; labelEn: string; icon: any; color: string }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers, color: 'text-[#D4AF37]' },
    ...(currentUser ? [{ id: 'favorites' as const, labelAr: 'مفضلاتي ♥', labelEn: 'My Favorites ♥', icon: Heart, color: 'text-rose-500' }] : []),
    { id: 'monument', labelAr: 'مطاعم ومقاهي', labelEn: 'Restaurants & Cafés', icon: Utensils, color: 'text-amber-500' },
    { id: 'transport', labelAr: 'مراكز لياقة وجيم', labelEn: 'Gyms & Fitness', icon: Activity, color: 'text-green-500' },
    { id: 'facility', labelAr: 'مختبرات وتحاليل', labelEn: 'Medical Labs', icon: HeartPulse, color: 'text-cyan-500' },
    { id: 'emergency', labelAr: 'عيادات طبية', labelEn: 'Medical Clinics', icon: HeartPulse, color: 'text-[#8B0000]' },
    { id: 'culture', labelAr: 'أقسام ومرافق', labelEn: 'Sections & Depts', icon: Grid, color: 'text-purple-500' },
  ];

  const getCategoryLabel = (cat: LandmarkCategory) => {
    switch (cat) {
      case 'monument': return language === 'ar' ? 'مطعم / مقهى' : 'Restaurant & Café';
      case 'transport': return language === 'ar' ? 'مركز لياقة وجيم' : 'Gym & Fitness Center';
      case 'facility': return language === 'ar' ? 'مختبر تحاليل طبية' : 'Medical Diagnostics Lab';
      case 'emergency': return language === 'ar' ? 'عيادة / مركز طبي' : 'Medical Center & Clinic';
      case 'culture': return language === 'ar' ? 'قسم / مرفق داخلي' : 'Establishment Section';
      default: return cat;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Dynamic Hero Section with Top Red/Gold Ribbon and Shopping Background */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-12 shadow-2xl min-h-[360px] flex flex-col justify-center">
        {/* Beautiful Shopping Woman Background Image - Always Visible */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-r from-zinc-950 to-zinc-900">
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80" 
            alt="Young woman shopping" 
            className="w-full h-full object-cover object-top opacity-55 sm:opacity-65 scale-105 transition-all duration-700"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback shopping image if primary url has any network hiccup
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          {/* Subtle Directional Gradients that keep text super readable while leaving the shopper woman clearly visible on top/right */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/20 sm:via-zinc-950/75 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent sm:hidden" />
        </div>

        <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line z-20"></div>
        
        {/* Glowing Ambient Lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B0000]/15 rounded-full blur-3xl z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-3xl z-0 pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black/80 backdrop-blur-md px-4 py-1.5 text-xs text-zinc-300 shadow-md">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase">
              {language === 'ar' ? 'الخدمة الذاتية وتصفح المنتجات الرقمي' : 'Self-Service & Digital Product Browser'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none drop-shadow-lg text-white">
            {language === 'ar' ? (
              <>
                تصفح المنتجات والخدمات <br />
                <span className="text-[#8B0000]">بكل سهولة</span>
                <span className="text-[#D4AF37]"> وعبر خطوة واحدة</span>
              </>
            ) : (
              <>
                Browse Products & Services <br />
                <span className="text-[#8B0000]">Instantly</span>
                <span className="text-[#D4AF37]"> with One Scan</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl font-medium drop-shadow-md">
            {language === 'ar' 
              ? 'تطبيقك المثالي لتصفح قوائم الطعام (Menu)، تفاصيل وأسعار أصناف الملابس، خدمات صالونات التجميل، والعيادات الطبية داخل المنشأة فوراً عبر مسح كود الـ QR المتواجد أمامك.'
              : 'Your ultimate app to browse menus, retail item prices & sizes, salon packages, and medical department services instantly by scanning the QR code in front of you.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button 
              onClick={onOpenScanner}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#8B0000] hover:bg-[#8B0000]/90 px-8 py-4 text-sm font-bold text-white uppercase tracking-wider transition cursor-pointer shadow-lg shadow-[#8B0000]/20"
            >
              <QrCode className="w-5 h-5" />
              <span>{language === 'ar' ? 'افتح الكاميرا لمسح كود QR' : 'Open Camera to Scan QR'}</span>
            </button>
            
            <button 
              onClick={onOpenInstallModal}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-6 py-4 text-xs font-bold text-[#D4AF37] uppercase tracking-wider transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span>{language === 'ar' ? 'ثبت التطبيق على موبايلك' : 'Install App on Phone'}</span>
            </button>

            <button 
              onClick={onSwitchToMerchant}
              className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-black/60 hover:bg-zinc-900/60 px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.partnerPortal}</span>
            </button>
          </div>
        </div>

        {/* Decorative Floating Icon for Desktop */}
        <div className="absolute bottom-8 right-12 hidden lg:block text-zinc-800/20">
          <QrCode className="w-64 h-64 rotate-12" />
        </div>
      </div>

      {/* International Visitor & Destination Hub Card */}
      {userCountry && (
        <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 via-white dark:via-zinc-900 to-[#8B0000]/10 p-6 md:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Country & Destination Intro */}
            <div className="flex items-start sm:items-center gap-4 max-w-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {userCountry.flag}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8B0000] text-white text-[10px] font-black tracking-wider uppercase">
                    {language === 'ar' ? 'الوجهة النشطة' : 'ACTIVE REGION'}
                  </span>
                  <span className="text-xs font-bold text-[#D4AF37]">
                    {language === 'ar' ? 'دليل الزائر والسائح' : 'Traveler Guide'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
                  {language === 'ar' ? userCountry.nameAr : userCountry.nameEn}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  {language === 'ar' ? userCountry.touristTipAr : userCountry.touristTipEn}
                </p>
              </div>
            </div>

            {/* Currency Converter & Emergency Panel */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/80 dark:bg-zinc-950/80 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md">
              
              {/* Currency Converter */}
              <div className="flex flex-col justify-center border-b sm:border-b-0 sm:border-l sm:border-r border-zinc-200 dark:border-zinc-800 pb-3 sm:pb-0 sm:px-4">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'محول العملات الفوري' : 'Quick Currency Conversion'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">$</span>
                    <input
                      type="number"
                      value={calcAmountUSD}
                      onChange={(e) => setCalcAmountUSD(Math.max(0, Number(e.target.value) || 0))}
                      className="w-20 pl-6 pr-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-black text-center"
                      placeholder="USD"
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-400">=</span>
                  <div className="px-3 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs font-black text-[#8B0000] dark:text-[#D4AF37] min-w-[80px] text-center">
                    {convertCurrency(calcAmountUSD, userCountry.rateVsUSD)} {userCountry.currencySymbol}
                  </div>
                </div>
              </div>

              {/* Emergency Numbers */}
              <div className="flex flex-col justify-center sm:pl-2">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 mb-1">
                  <PhoneCall className="w-3 h-3 text-red-500" />
                  <span>{language === 'ar' ? 'أرقام الطوارئ المحلية' : 'Local Emergency Numbers'}</span>
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{language === 'ar' ? 'الشرطة:' : 'Police:'}</span>
                    <span className="text-sm font-black text-red-600 dark:text-red-400 font-mono">{userCountry.policeNumber}</span>
                  </div>
                  <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{language === 'ar' ? 'الإسعاف:' : 'Ambulance:'}</span>
                    <span className="text-sm font-black text-red-600 dark:text-red-400 font-mono">{userCountry.ambulanceNumber}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Categories Horizontal Filter Tab Bar */}
      <div className="space-y-4">
        <h2 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#8B0000]" />
          <span>{language === 'ar' ? 'تصفح حسب فئة النشاط' : 'Explore by Business Category'}</span>
        </h2>

        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
          {categoriesList.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-xs font-bold whitespace-nowrap transition cursor-pointer snap-start ${
                  isSelected 
                    ? 'bg-zinc-950 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-300 hover:border-zinc-800'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${cat.color}`} />
                <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Directory & Side Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Commercial Directory Card Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              {language === 'ar' ? 'أقوى العروض وأعلى الخصومات' : 'Hot Deals & Top Discounts'}
              <span className="text-[#D4AF37] text-sm ml-2 font-mono font-bold">({filteredItems.length})</span>
            </h3>

            {/* Dynamic search input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'بحث باسم الصنف أو الخدمة...' : 'Search items or services...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] transition font-medium"
              />
            </div>
          </div>

          {/* Visitor vs Registered User account difference indicator */}
          <div className="p-4 rounded-xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/15 via-zinc-950 to-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 font-bold shadow-inner">
                {currentUser ? <User className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <span>{language === 'ar' ? 'الفرق بين الزائر وصاحب حساب مستخدم مسجل' : 'Visitor vs. Registered User Account Benefit'}</span>
                  {currentUser ? (
                    <span className="px-2 py-0.5 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 rounded-md font-mono font-bold">
                      {language === 'ar' ? '✔ حسابك مفعل للتفاعل' : '✔ Active User Account'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md font-mono font-bold">
                      {language === 'ar' ? '🔒 وضع الزائر' : '🔒 Visitor Mode'}
                    </span>
                  )}
                </h4>
                <p className="text-zinc-300 text-[11px] mt-1 leading-relaxed">
                  {language === 'ar'
                    ? 'صاحب الحساب كـ (مستخدم مسجل) تظهر له علامة الإعجاب (👍) وعدد المعجبين، وعلامة الإضافة للمفضلة (❤️) للعودة للعروض لاحقاً، بالإضافة لتقييم الإعلان (★). جميع إحصائيات الإعجاب والتقييمات تذهب مباشرة للوحة تحكم المعلن!'
                    : 'Registered user accounts get Facebook-style Like (👍) counters, Add to Favorites (❤️) saving, and 1-5 Star (★) rating rights. All Likes and Ratings flow directly to the merchant\'s private analytics dashboard!'}
                </p>
              </div>
            </div>
            {!currentUser && (
              <button
                type="button"
                onClick={() => { if (onNavigateToAccount) onNavigateToAccount(); }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-extrabold text-xs shrink-0 transition shadow-md cursor-pointer"
              >
                {language === 'ar' ? 'سجل دخول كمستخدم الآن' : 'Login as User Now'}
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-zinc-900 bg-zinc-950/20 text-zinc-500 space-y-3">
              <HelpCircle className="w-10 h-10 mx-auto text-zinc-700" />
              <p className="text-sm font-semibold">
                {language === 'ar' ? 'لم يتم العثور على أي منتجات أو خدمات مطابقة للبحث.' : 'No matching items or services found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((qr) => (
                <motion.div
                  key={qr.id}
                  layoutId={`card-${qr.id}`}
                  onClick={() => setSelectedLandmark(qr)}
                  className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition cursor-pointer relative overflow-hidden group flex flex-col justify-between"
                >
                  <div>
                    {/* Subtle active state decoration */}
                    {qr.isActive && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B0000]" />
                    )}

                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase tracking-wider">
                        {getCategoryLabel(qr.category)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 shrink-0">
                        <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                        {qr.totalScans} {t.scansCount}
                      </span>
                    </div>

                    {/* Premium Card Image thumbnail */}
                    {qr.imageUrl && (
                      <div className="w-full h-36 rounded-xl overflow-hidden mt-3 relative border border-zinc-900/40 bg-zinc-900">
                        <img
                          src={qr.imageUrl}
                          alt={language === 'ar' ? qr.titleAr : qr.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
                      </div>
                    )}

                    <h4 className="text-base font-bold text-white mt-3 group-hover:text-[#D4AF37] transition line-clamp-1">
                      {language === 'ar' ? qr.titleAr : qr.titleEn}
                    </h4>

                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                      {language === 'ar' ? (qr.descriptionAr || (qr as any).descAr) : (qr.descriptionEn || (qr as any).descEn)}
                    </p>

                    {/* Expiration Date Badge */}
                    {qr.expiresAt && (
                      <div className="flex items-center gap-1.5 text-rose-500 text-[10px] mt-3 font-semibold bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg w-max">
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
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] mt-4 font-mono">
                      <MapPin className="w-3 h-3 text-[#D4AF37]" />
                      <span className="truncate">
                        {language === 'ar' 
                          ? qr.addressAr || 'موقع/رقم كاونتر المنشأة' 
                          : qr.addressEn || 'Establishment Location/Counter'}
                      </span>
                    </div>

                    {/* Simulated action overlay indicator */}
                    <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold text-zinc-400 group-hover:text-[#D4AF37] transition uppercase">
                      <span>{language === 'ar' ? 'زيارة صفحة المعلن' : 'Visit Advertiser Page'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition" />
                    </div>

                    {/* Like, Favorite & Rate Footer Bar (Visitor vs Account User) */}
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="mt-3 pt-3 border-t border-zinc-900/80 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      {currentUser ? (
                        <div className="flex items-center gap-2">
                          {/* Like button (Thumbs Up - Facebook style) */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleLike(qr.id); }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                              (qr.likedBy || []).includes(currentUser.id)
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                            title={language === 'ar' ? 'إعجاب بالعرض (👍)' : 'Like Offer'}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${ (qr.likedBy || []).includes(currentUser.id) ? 'fill-blue-400 text-blue-400' : '' }`} />
                            <span className="font-mono text-xs">{qr.likesCount || 0}</span>
                          </button>

                          {/* Add to Favorites button (Heart) */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(qr.id); }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border ${
                              (qr.favoritedBy || []).includes(currentUser.id)
                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                            title={language === 'ar' ? 'أضف إلى المفضلة (❤️)' : 'Add to Favorites'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${ (qr.favoritedBy || []).includes(currentUser.id) ? 'fill-rose-400 text-rose-400' : '' }`} />
                            <span className="font-mono text-xs">{qr.favoritesCount || 0}</span>
                          </button>

                          {/* 1-5 Star Rating */}
                          <div className="flex items-center gap-0.5 bg-zinc-900/90 px-2 py-1 rounded-lg border border-zinc-800" title={language === 'ar' ? 'تقييم العرض' : 'Rate Offer'}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const myRating = (qr.userRatings || {})[currentUser.id] || 0;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); submitRating(qr.id, star); }}
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
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-blue-400" title={language === 'ar' ? 'عدد الإعجابات (👍)' : 'Likes Count'}>
                            <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                            <span className="font-mono text-xs">{qr.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/60 text-rose-400" title={language === 'ar' ? 'عدد الإضافات للمفضلة (❤️)' : 'Favorites Count'}>
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            <span className="font-mono text-xs">{qr.favoritesCount || 0}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if (onNavigateToAccount) onNavigateToAccount(); }}
                            className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:underline cursor-pointer bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-1 rounded-lg font-bold"
                            title={language === 'ar' ? 'سجل دخول كمستخدم للتفاعل' : 'Login to interact'}
                          >
                            <Lock className="w-3 h-3 text-[#D4AF37]" />
                            <span>{language === 'ar' ? 'دخول للتفاعل' : 'Login'}</span>
                          </button>
                        </div>
                      )}

                      {/* End of line: Total rating average of others */}
                      <div className="ml-auto rtl:mr-auto rtl:ml-0 flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg text-amber-400 font-mono text-xs font-bold shrink-0" title={language === 'ar' ? 'إجمالي تقييم الآخرين' : 'Overall rating average of others'}>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{qr.averageRating || '0.0'}</span>
                        <span className="text-zinc-400 font-sans text-[10px] font-normal">({qr.ratingsCount || 0})</span>
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
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/10 to-[#8B0000]/15 hover:from-[#D4AF37]/25 hover:to-[#8B0000]/25 border border-[#D4AF37]/40 text-[#D4AF37] hover:text-white transition duration-200 cursor-pointer font-bold text-xs shadow-sm group/btn"
                        title={language === 'ar' ? 'مشاركة هذا العرض مع الأصدقاء والعائلة عبر وسائل التواصل' : 'Share this offer with friends & family via social media'}
                      >
                        <Share2 className="w-4 h-4 text-[#D4AF37] group-hover/btn:scale-110 transition-transform shrink-0" />
                        <span>{language === 'ar' ? 'مشاركة العرض' : 'Share Offer'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Landmark Interactive Details Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 relative overflow-hidden h-full flex flex-col justify-between min-h-[400px]">
            {/* Top colored line indicator */}
            <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
            
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
                        className="text-zinc-500 hover:text-white text-xs font-bold uppercase transition"
                      >
                        {language === 'ar' ? 'تراجع' : 'Reset'}
                      </button>
                    </div>

                    {/* Premium Large Promo Image Banner */}
                    {currentSelected.imageUrl && (
                      <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden relative border border-zinc-900/40 bg-zinc-900/60 shadow-inner">
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

                    <div className="border-t border-zinc-900 pt-4 space-y-3">
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        {language === 'ar' ? (currentSelected.descriptionAr || (currentSelected as any).descAr) : (currentSelected.descriptionEn || (currentSelected as any).descEn)}
                      </p>

                      {/* Expiration Date inside Details */}
                      {currentSelected.expiresAt && (
                        <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl w-max mt-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span>
                            {language === 'ar' 
                              ? `تاريخ انتهاء العرض: ${currentSelected.expiresAt}` 
                              : `Offer Expires: ${currentSelected.expiresAt}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Like & Rating Sidebar Box */}
                    <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
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

                      {currentUser ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleLike(currentSelected.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                                (currentSelected.likedBy || []).includes(currentUser.id)
                                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                              }`}
                              title={language === 'ar' ? 'إعجاب (👍)' : 'Like'}
                            >
                              <ThumbsUp className={`w-4 h-4 ${ (currentSelected.likedBy || []).includes(currentUser.id) ? 'fill-blue-400 text-blue-400' : '' }`} />
                              <span className="text-xs">{language === 'ar' ? 'إعجاب (' : 'Like ('}{currentSelected.likesCount || 0})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleFavorite(currentSelected.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer border ${
                                (currentSelected.favoritedBy || []).includes(currentUser.id)
                                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                              }`}
                              title={language === 'ar' ? 'أضف للمفضلة (❤️)' : 'Favorite'}
                            >
                              <Heart className={`w-4 h-4 ${ (currentSelected.favoritedBy || []).includes(currentUser.id) ? 'fill-rose-400 text-rose-400' : '' }`} />
                              <span className="text-xs">{language === 'ar' ? 'مفضل (' : 'Fav ('}{currentSelected.favoritesCount || 0})</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const myRating = (currentSelected.userRatings || {})[currentUser.id] || 0;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => submitRating(currentSelected.id, star)}
                                  className="text-zinc-600 hover:text-amber-400 transition cursor-pointer p-0.5"
                                  title={language === 'ar' ? `تقييم ${star} نجوم` : `Rate ${star} stars`}
                                >
                                  <Star className={`w-4 h-4 ${ star <= myRating ? 'text-amber-400 fill-amber-400' : '' }`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-blue-400">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{currentSelected.likesCount || 0} {language === 'ar' ? 'إعجاب' : 'Likes'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-rose-400">
                              <Heart className="w-3.5 h-3.5" />
                              <span>{currentSelected.favoritesCount || 0} {language === 'ar' ? 'بالمفضلة' : 'Favorites'}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { if (onNavigateToAccount) onNavigateToAccount(); }}
                            className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline cursor-pointer font-bold"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'سجل دخول كـ (مستخدم) للتفاعل' : 'Login as User to Like & Rate'}</span>
                          </button>
                        </div>
                      )}
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
                  <div className="w-16 h-16 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {language === 'ar' ? 'اختر صنفاً أو خدمة' : 'Select an Item or Service'}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1 leading-relaxed">
                      {language === 'ar' 
                        ? 'انقر على أي منتج أو خدمة من القائمة الجانبية لعرض الأسعار والوصف ومحاكاة عملية مسح الكود.' 
                        : 'Click any product or service on the left to view prices, details, and simulate scanning.'}
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
                  className="w-14 h-14 rounded-lg object-cover shrink-0 border border-zinc-300 dark:border-zinc-700" 
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
                        url: typeof window !== 'undefined' ? `${window.location.origin}/?offer=${sharingOffer.id}` : '',
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
                    value={typeof window !== 'undefined' ? `${window.location.origin}/?offer=${sharingOffer.id}` : ''}
                    className="flex-1 bg-transparent px-2 font-mono text-zinc-700 dark:text-zinc-300 select-all outline-none text-[11px]"
                  />
                  <button
                    onClick={() => {
                      const urlToCopy = typeof window !== 'undefined' ? `${window.location.origin}/?offer=${sharingOffer.id}` : '';
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
                      typeof window !== 'undefined' ? `${window.location.origin}/?offer=${sharingOffer.id}` : ''
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
                      typeof window !== 'undefined' ? `${window.location.origin}/?offer=${sharingOffer.id}` : ''
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
                      typeof window !== 'undefined' ? `${window.location.origin}/?offer=${sharingOffer.id}` : ''
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
    </motion.div>
  );
};
