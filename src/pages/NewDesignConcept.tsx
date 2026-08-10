import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Wallet, 
  CreditCard, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  Sparkles, 
  Bell, 
  Search,
  CheckCircle2,
  Lock,
  Globe2,
  Layers,
  Utensils,
  Building,
  Dumbbell,
  HeartPulse,
  ShoppingBag,
  Ticket,
  Star,
  MapPin,
  ExternalLink,
  PhoneCall,
  Share2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../services/AppContext';

export const NewDesignConcept: React.FC = () => {
  const { currentUser, language, qrcodes } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<'EGP' | 'USD'>('EGP');

  const CATEGORIES = [
    { id: 'all', labelAr: 'جميع الخدمات والعروض', labelEn: 'All Offers & Services', icon: Layers },
    { id: 'monument', labelAr: 'مطاعم وكافيهات', labelEn: 'Restaurants & Cafes', icon: Utensils },
    { id: 'hotel', labelAr: 'فنادق ومنتجعات', labelEn: 'Hotels & Resorts', icon: Building },
    { id: 'transport', labelAr: 'جيم ولياقة بدنية', labelEn: 'Gym & Fitness', icon: Dumbbell },
    { id: 'facility', labelAr: 'عيادات ومراكز طبية', labelEn: 'Medical & Diagnostics', icon: HeartPulse },
    { id: 'retail', labelAr: 'متاجر ومولات تجارية', labelEn: 'Retail & Shopping', icon: ShoppingBag },
    { id: 'entertainment', labelAr: 'ترفيه ورحلات سياحية', labelEn: 'Entertainment & Events', icon: Ticket }
  ];

  const stats = [
    { titleAr: 'رصيد الكاش باك المعلق', titleEn: 'Pending Cashback', valAr: '450.00 ج.م', valEn: '$29.00', change: '+12.4%', icon: Wallet, color: 'text-emerald-400' },
    { titleAr: 'إجمالي الفواتير المسددة', titleEn: 'Total Invoices Paid', valAr: '12,850 ج.م', valEn: '$829.00', change: '+8.1%', icon: CreditCard, color: 'text-cyan-400' },
    { titleAr: 'عمولات التسويق المتاحة', titleEn: 'Affiliate Earnings', valAr: '1,750 ج.م', valEn: '$112.00', change: '+24.0%', icon: TrendingUp, color: 'text-indigo-400' }
  ];

  const sampleOffers = [
    {
      id: 'offer-1',
      titleAr: 'مطعم هافور الفاخر للوجبات الشرقية',
      titleEn: 'Havur Gourmet Oriental Restaurant',
      descAr: 'خصم حقيقي 25% على جميع الوجبات العائلية الكبرى والمنسف الأردني الفاخر بمناسبة الافتتاح وتذوق الطعم الأصيل!',
      descEn: '25% OFF on all family meals and premium oriental cuisine.',
      badgeAr: 'خصم 25% حصري',
      badgeEn: '25% OFF',
      category: 'monument',
      rating: 4.9,
      scans: 342,
      locationAr: 'القاهرة - مدينة نصر',
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'offer-2',
      titleAr: 'مركز فيتنس ماكس الرياضي',
      titleEn: 'Fitness Max Gym & Sports Center',
      descAr: 'اشتراك سنوي مميز يشمل الدخول للمسبح والساونا والحصص الجماعية مع باقة خصم حصرية تصل إلى 40%.',
      descEn: 'Premium annual membership with exclusive 40% discount.',
      badgeAr: 'خصم 40%VIP',
      badgeEn: '40% OFF VIP',
      category: 'transport',
      rating: 4.8,
      scans: 1205,
      locationAr: 'الجيزة - المهندسين',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'offer-3',
      titleAr: 'مختبرات ألفا للتحاليل الطبية',
      titleEn: 'Alfa Medical Diagnostic Labs',
      descAr: 'باقة الفحص الشامل المتقدم لـ 40 تحليلاً حيوياً للاطمئنان على صحتك وصحة عائلتك فقط بـ 299 ج.م.',
      descEn: 'Comprehensive 40 vital health tests package.',
      badgeAr: 'عافية وصحة 30%',
      badgeEn: 'Health Deal',
      category: 'facility',
      rating: 4.7,
      scans: 890,
      locationAr: 'الإسكندرية - سموحة',
      imageUrl: 'https://images.unsplash.com/photo-1579153138244-3749a4e2aeae?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const filteredOffers = sampleOffers.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || item.titleAr.includes(searchQuery) || item.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0C0E12] text-zinc-100 font-sans pb-24">
      
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 bg-[#0C0E12]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/5">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">CityQR</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ENTERPRISE</span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">الجيل الجديد للمعلومات والخدمات الرقمية</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrency(currency === 'EGP' ? 'USD' : 'EGP')}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currency}</span>
            </button>

            <button className="relative p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-[#0C0E12]"></span>
            </button>

            <div className="hidden sm:flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-zinc-200">{currentUser?.fullName || 'وائل لاتين'}</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>حساب شريك موثق</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
                {currentUser?.fullName ? currentUser.fullName[0] : 'W'}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-8">

        {/* Live Search & Filter Bar */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مطعم، شركة، عروض فواتير، أو خدمات في مدينتك..."
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>
            
            <button className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 transition flex items-center justify-center gap-2 cursor-pointer shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              <span>تصفية المسافة والمنطقة</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${isSelected ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 font-black border border-emerald-400' : 'bg-zinc-950/80 hover:bg-zinc-800/80 text-zinc-400 border border-zinc-800'}`}
                >
                  <IconComp className={`w-4 h-4 ${isSelected ? 'text-zinc-950' : 'text-emerald-400'}`} />
                  <span>{language === 'ar' ? cat.labelAr : cat.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Financial Summary Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-zinc-400">{language === 'ar' ? item.titleAr : item.titleEn}</span>
                <div className={`p-2.5 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-zinc-100 tracking-tight">{currency === 'EGP' ? item.valAr : item.valEn}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{item.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ads & Promotional Offers Grid Section */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-zinc-100 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>أحدث الإعلانات والخصومات التجارية الحصرية (Live Ads & Offers)</span>
            </h3>
            <span className="text-xs font-bold text-zinc-400">عرض {filteredOffers.length} من {sampleOffers.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <motion.div 
                key={offer.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  {/* Offer Image Header with Badge */}
                  <div className="relative h-48 overflow-hidden bg-zinc-950">
                    <img 
                      src={offer.imageUrl} 
                      alt={offer.titleAr} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 font-black text-xs border border-emerald-400 shadow-lg shadow-emerald-500/20">
                      {language === 'ar' ? offer.badgeAr : offer.badgeEn}
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                      <span className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-700/60">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{offer.locationAr}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-700/60 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{offer.rating} ({offer.scans})</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3">
                    <h4 className="text-sm font-black text-zinc-100 group-hover:text-emerald-400 transition leading-snug">
                      {language === 'ar' ? offer.titleAr : offer.titleEn}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                      {language === 'ar' ? offer.descAr : offer.descEn}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 flex items-center gap-3">
                  <button className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-200 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-zinc-700/60 hover:border-emerald-400 shadow-md">
                    <QrCode className="w-4 h-4" />
                    <span>مسح QR الفاتورة / العرض</span>
                  </button>
                  <button className="p-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer border border-zinc-700/60">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
