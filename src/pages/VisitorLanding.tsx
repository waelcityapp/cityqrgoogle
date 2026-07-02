import React, { useState } from 'react';
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
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VisitorLandingProps {
  onSwitchToMerchant: () => void;
  onOpenScanner: () => void;
  onSelectScannedQR: (qr: QRCodeItem) => void;
  onOpenInstallModal: () => void;
}

export const VisitorLanding: React.FC<VisitorLandingProps> = ({ 
  onSwitchToMerchant, 
  onOpenScanner,
  onSelectScannedQR,
  onOpenInstallModal
}) => {
  const { qrcodes, language } = useApp();
  const t = translations[language];

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LandmarkCategory | 'all'>('all');
  const [selectedLandmark, setSelectedLandmark] = useState<QRCodeItem | null>(null);

  // Filter items
  const filteredItems = qrcodes.filter((qr) => {
    const matchesSearch = 
      qr.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (qr.addressAr && qr.addressAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (qr.addressEn && qr.addressEn.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || qr.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categoriesList: { id: LandmarkCategory | 'all'; labelAr: string; labelEn: string; icon: any; color: string }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers, color: 'text-[#D4AF37]' },
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
      {/* Dynamic Hero Section with Top Red/Gold Ribbon */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]"></div>
        
        {/* Glowing Ambient Lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B0000]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-black px-4 py-1.5 text-xs text-zinc-400">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase">
              {language === 'ar' ? 'الخدمة الذاتية وتصفح المنتجات الرقمي' : 'Self-Service & Digital Product Browser'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
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

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl font-medium">
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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]"></div>
            
            <AnimatePresence mode="wait">
              {selectedLandmark ? (
                <motion.div
                  key={selectedLandmark.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 flex-1 flex flex-col justify-between h-full"
                >
                  <div className="space-y-5">
                    <div className="flex justify-between items-start mt-2">
                      <div className="px-3 py-1 bg-[#8B0000]/10 text-[#8B0000] text-[10px] font-bold rounded border border-[#8B0000]/30 tracking-wider uppercase">
                        {getCategoryLabel(selectedLandmark.category)}
                      </div>
                      <button 
                        onClick={() => setSelectedLandmark(null)}
                        className="text-zinc-500 hover:text-white text-xs font-bold uppercase transition"
                      >
                        {language === 'ar' ? 'تراجع' : 'Reset'}
                      </button>
                    </div>

                    {/* Premium Large Promo Image Banner */}
                    {selectedLandmark.imageUrl && (
                      <div className="w-full h-44 sm:h-48 rounded-2xl overflow-hidden relative border border-zinc-900/40 bg-zinc-900/60 shadow-inner">
                        <img
                          src={selectedLandmark.imageUrl}
                          alt={language === 'ar' ? selectedLandmark.titleAr : selectedLandmark.titleEn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                        {language === 'ar' ? selectedLandmark.titleAr : selectedLandmark.titleEn}
                      </h3>
                      {selectedLandmark.addressAr && (
                        <p className="text-xs text-[#D4AF37] flex items-center gap-1.5 mt-2 font-mono">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{language === 'ar' ? selectedLandmark.addressAr : selectedLandmark.addressEn}</span>
                        </p>
                      )}
                    </div>

                    <div className="border-t border-zinc-900 pt-4 space-y-3">
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        {language === 'ar' ? (selectedLandmark.descriptionAr || (selectedLandmark as any).descAr) : (selectedLandmark.descriptionEn || (selectedLandmark as any).descEn)}
                      </p>

                      {/* Expiration Date inside Details */}
                      {selectedLandmark.expiresAt && (
                        <div className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl w-max mt-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                          <span>
                            {language === 'ar' 
                              ? `تاريخ انتهاء العرض: ${selectedLandmark.expiresAt}` 
                              : `Offer Expires: ${selectedLandmark.expiresAt}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 rounded-xl border border-zinc-900 font-mono text-[11px]">
                      <div>
                        <span className="block text-zinc-500">VIEWS:</span>
                        <span className="block font-bold text-white text-sm">{selectedLandmark.totalScans}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-500">AVAILABILITY:</span>
                        <span className="block font-bold text-green-500">● {t.activeStatus.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-zinc-900 mt-auto">
                    {/* Simulated Quick Scan trigger */}
                    <button
                      onClick={() => onSelectScannedQR(selectedLandmark)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-600 hover:to-[#D4AF37] text-xs font-bold text-black shadow-lg transition duration-200 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{language === 'ar' ? 'محاكاة مسح الكود لمشاهدة التفاصيل' : 'Simulate Scan to View Details'}</span>
                    </button>

                    {selectedLandmark.targetUrl && (
                      <a
                        href={selectedLandmark.targetUrl}
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
    </motion.div>
  );
};
