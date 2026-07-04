import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Store, 
  Shield, 
  Check, 
  KeyRound, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  LogOut, 
  RefreshCw, 
  Layers, 
  Zap, 
  ExternalLink, 
  QrCode, 
  LayoutDashboard, 
  Compass,
  UserCheck,
  Building2
} from 'lucide-react';
import { useApp } from '../services/AppContext';

// Sub-roles definition for User accounts
const USER_SUB_ROLES = [
  {
    id: 'tourist',
    icon: Compass,
    titleAr: 'زائر / سائح واستكشاف',
    titleEn: 'Tourist / Explorer',
    descAr: 'استكشاف المعالم والفعاليات ومسح رموز QR للحصول على العروض الترويجية والخرائط.',
    descEn: 'Explore landmarks, scan tourist QRs, and discover exclusive maps and promotions.'
  },
  {
    id: 'citizen',
    icon: Shield,
    titleAr: 'مواطن / مقيم محلي',
    titleEn: 'Citizen / Resident',
    descAr: 'الوصول السريع للخدمات المحلية والبلدية وأرقام الطوارئ والمرافق العامة المباشرة.',
    descEn: 'Instant access to local government portals, municipal services, and emergency numbers.'
  },
  {
    id: 'vip_deal_hunter',
    icon: Sparkles,
    titleAr: 'باحث عن عروض VIP',
    titleEn: 'VIP Deal Hunter',
    descAr: 'الوصول الحصري لخصومات الشركاء التجاريين وكوبونات المتاجر والمطاعم المعتمدة.',
    descEn: 'Exclusive access to partner discounts, verified store coupons, and VIP rewards.'
  },
  {
    id: 'volunteer',
    icon: UserCheck,
    titleAr: 'متطوع ميداني ومراقب',
    titleEn: 'Field Volunteer & Verifier',
    descAr: 'المساعدة في التحقق من صحة مواقع المعالم وتحديث بيانات المرافق العامة والملاحة.',
    descEn: 'Help verify landmark accuracy, report public facility status, and assist community navigation.'
  }
];

// Sub-roles definition for Merchant accounts
const MERCHANT_SUB_ROLES = [
  {
    id: 'restaurant',
    icon: Store,
    titleAr: 'مطعم / كافيه ومشروبات',
    titleEn: 'Restaurant / Cafe',
    descAr: 'قائمة طعام رقمية QR متطورة، عروض يومية حصرية، وأرقام حجز واتساب مباشر.',
    descEn: 'Advanced digital QR menu, daily promotional deals, and direct WA reservation buttons.'
  },
  {
    id: 'hotel',
    icon: Building2,
    titleAr: 'فندق / منتجع سياحي',
    titleEn: 'Hotel / Resort',
    descAr: 'عرض غرف وأجنحة النزلاء، الخدمات الترفيهية، وحجوزات مكتب الاستقبال المباشر.',
    descEn: 'Showcase rooms & suites, amenity guides, and instant front desk booking portals.'
  },
  {
    id: 'retail',
    icon: Layers,
    titleAr: 'متجر تجزئة / مول تجاري',
    titleEn: 'Retail Store / Mall',
    descAr: 'نشر الخصومات الموسمية، كتالوج المنتجات التفاعلي، وأقسام خدمة العملاء والشكاوى.',
    descEn: 'Publish seasonal discounts, interactive product catalog, and customer service departments.'
  },
  {
    id: 'medical',
    icon: Shield,
    titleAr: 'خدمة طبية / عيادة / مستشفى',
    titleEn: 'Medical / Clinic / Hospital',
    descAr: 'أرقام الطوارئ المباشرة، مواعيد الأطباء، وحجز الاستشارات والفحوصات الفورية.',
    descEn: 'Direct emergency numbers, clinic working hours, and instant consultation bookings.'
  },
  {
    id: 'entertainment',
    icon: Zap,
    titleAr: 'خدمة سياحية / ترفيه وفعاليات',
    titleEn: 'Tour Operator / Entertainment',
    descAr: 'تنظيم الرحلات السياحية، حجز تذاكر الفعاليات، وجولات الإرشاد التفاعلي بالموقع.',
    descEn: 'Organize guided tours, event ticketing, and interactive on-site audio/visual guides.'
  }
];

interface AccountAuthProps {
  onNavigate?: (tabId: string) => void;
  initialMode?: 'signup' | 'signin';
}

export const AccountAuth: React.FC<AccountAuthProps> = ({ onNavigate, initialMode }) => {
  const { language, currentUser, loginUser, registerUser, logoutUser, switchUserRole, supabaseActive } = useApp();

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>(initialMode || 'signin');
  const [selectedRole, setSelectedRole] = useState<'user' | 'merchant'>('user');
  const [selectedSubRole, setSelectedSubRole] = useState<string>('tourist');
  
  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password');
      return;
    }

    if (authMode === 'signup' && !fullName) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'signup') {
        const subList = selectedRole === 'merchant' ? MERCHANT_SUB_ROLES : USER_SUB_ROLES;
        const matchedSub = subList.find(s => s.id === selectedSubRole) || subList[0];
        const subTitle = language === 'ar' ? matchedSub?.titleAr : matchedSub?.titleEn;
        
        const result = await registerUser(email, password, fullName, selectedRole, selectedSubRole, subTitle);
        if (result.error || !result.user) {
          setErrorMsg(result.error || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
        } else {
          setSuccessMsg(
            language === 'ar'
              ? `تم إنشاء الحساب بنجاح وربطه مع قاعدة بيانات Supabase! تم إضافة ملف التعريف في جدول 'profiles' بصلاحية: [${selectedRole === 'merchant' ? 'تاجر / شريك تجاري' : 'مستخدم / عميل'}]`
              : `Account successfully created and linked to Supabase! Added to 'profiles' table with role: [${selectedRole.toUpperCase()}]`
          );
          // Clear sensitive fields
          setPassword('');
        }
      } else {
        const result = await loginUser(email, password);
        if (result.error || !result.user) {
          setErrorMsg(result.error || (language === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
        } else {
          setSuccessMsg(
            language === 'ar'
              ? 'تم تسجيل الدخول بنجاح! تم استرجاع صلاحياتك المخصصة من قاعدة البيانات.'
              : 'Logged in successfully! Retrieved your custom permissions from the database.'
          );
          setPassword('');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'merchant' | 'user') => {
    if (type === 'merchant') {
      setEmail('merchant@cityqr.com');
      setPassword('merchant123456');
      setFullName('شركة هافور التجارية');
      setSelectedRole('merchant');
      setSelectedSubRole('restaurant');
    } else {
      setEmail('citizen@cityqr.com');
      setPassword('user123456');
      setFullName('أحمد العتيبي');
      setSelectedRole('user');
      setSelectedSubRole('tourist');
    }
    setErrorMsg(null);
    setSuccessMsg(
      language === 'ar'
        ? `تم تعبئة بيانات تجريبية لحساب (${type === 'merchant' ? 'تاجر' : 'عميل'}). يمكنك الضغط على تنفيذ الآن.`
        : `Filled demo credentials for (${type.toUpperCase()}). You can click submit now.`
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-4 px-2 sm:px-4">
      
      {/* Top Header & Supabase Indicator Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
        
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B0000]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold font-mono">
              <Database className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'ربط الصلاحيات مع Supabase Profiles' : 'Supabase Profiles Role Sync'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#D4AF37]" />
              <span>{language === 'ar' ? 'بوابة الحسابات والصلاحيات المخصصة' : 'Accounts & Dedicated Role Permissions'}</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'قم بإنشاء حساب جديد أو تسجيل الدخول لربط الصلاحيات مع قاعدة بيانات Supabase. يتم حفظ حقل role في جدول profiles لتحديد إمكانية الوصول للوحة التاجر أو عميل المسح.'
                : 'Create an account or log in to link role permissions with Supabase database. The role field is stored in the profiles table to manage access to Merchant Dashboard vs Customer Scanner.'}
            </p>
          </div>

          {/* Connection badge */}
          <div className="flex flex-col items-start md:items-end gap-2 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 shrink-0">
            <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest">
              {language === 'ar' ? 'حالة المزامنة السحابية' : 'CLOUD DATABASE SYNC'}
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${supabaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-bold text-zinc-200">
                {supabaseActive 
                  ? (language === 'ar' ? 'متصل بجدول profiles في Supabase' : 'Connected to Supabase profiles')
                  : (language === 'ar' ? 'وضع التخزين المحلي الاحتياطي (Offline)' : 'Offline Local Fallback Mode')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOGGED IN VIEW: User Profile & Custom Permissions Dashboard */}
      {currentUser ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main User Card */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37]/40 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-2xl border-2 ${
                  currentUser.role === 'merchant' || currentUser.role === 'admin'
                    ? 'bg-[#8B0000]/20 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                    : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                }`}>
                  {currentUser.role === 'merchant' || currentUser.role === 'admin' ? (
                    <Store className="w-10 h-10" />
                  ) : (
                    <UserCheck className="w-10 h-10" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                      currentUser.role === 'merchant' || currentUser.role === 'admin'
                        ? 'bg-[#D4AF37] text-zinc-950 border-[#D4AF37]'
                        : 'bg-emerald-500 text-zinc-950 border-emerald-500'
                    }`}>
                      {currentUser.role === 'merchant' || currentUser.role === 'admin'
                        ? (language === 'ar' ? 'حساب تاجر / شريك تجاري' : 'MERCHANT PARTNER ROLE')
                        : (language === 'ar' ? 'حساب عميل / مستخدم' : 'CUSTOMER / USER ROLE')}
                    </span>
                    {(currentUser.subRoleTitle || currentUser.subRole) && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-zinc-800 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{currentUser.subRoleTitle || (language === 'ar' ? `تصنيف: ${currentUser.subRole}` : `Tier: ${currentUser.subRole}`)}</span>
                      </span>
                    )}
                    <span className="text-xs text-zinc-500 font-mono">
                      ID: {currentUser.id.substring(0, 14)}...
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {currentUser.fullName || currentUser.email.split('@')[0]}
                  </h2>
                  <p className="text-sm font-mono text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>

              {/* Logout & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={logoutUser}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-500/30 font-bold text-xs transition shadow-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </div>
            </div>

            {/* Supabase Profiles Sync Confirmation Badge */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-200">
                    {language === 'ar' 
                      ? `تم ربط الحساب بنجاح في جدول profiles مع الصلاحية المخصصة:`
                      : `Account successfully linked in 'profiles' table with role:`}
                  </p>
                  <p className="text-zinc-400 font-mono mt-0.5">
                    table: <code className="text-[#D4AF37]">profiles</code> | field: <code className="text-emerald-400">role = '{currentUser.role}'</code> | status: <code className="text-emerald-400">SYNCED</code>
                  </p>
                </div>
              </div>

              {/* Quick Role Switcher for testing */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] text-zinc-400 whitespace-nowrap font-bold">
                  {language === 'ar' ? 'تبديل الصلاحية للاختبار:' : 'Switch Role for Test:'}
                </span>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto">
                  <button
                    onClick={() => switchUserRole('user')}
                    className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentUser.role === 'user' 
                        ? 'bg-emerald-500 text-zinc-950 shadow-md' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => switchUserRole('merchant')}
                    className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      currentUser.role === 'merchant' || currentUser.role === 'admin'
                        ? 'bg-[#D4AF37] text-zinc-950 shadow-md' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Merchant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Permissions & Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant Dashboard Access Card */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
              currentUser.role === 'merchant' || currentUser.role === 'admin'
                ? 'border-[#D4AF37]/60 bg-gradient-to-br from-zinc-900 to-black shadow-[0_0_30px_rgba(212,175,55,0.15)]'
                : 'border-zinc-800/80 bg-zinc-950/60 opacity-60 hover:opacity-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8B0000]/20 border border-[#D4AF37]/30 text-[#D4AF37]">
                  <Store className="w-6 h-6" />
                </div>
                {currentUser.role === 'merchant' || currentUser.role === 'admin' ? (
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'صلاحية نشطة ومتاحة' : 'Active Permission'}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
                    {language === 'ar' ? 'يتطلب صلاحية تاجر' : 'Requires Merchant Role'}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-white mb-2">
                {language === 'ar' ? 'صلاحيات التاجر والشركاء (Merchant Capabilities)' : 'Merchant Partner Capabilities'}
              </h3>
              
              <ul className="space-y-2 mb-6 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{language === 'ar' ? 'إضافة وإدارة قائمة المنتجات والخدمات والمرافق' : 'Add & manage items, products, and services'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{language === 'ar' ? 'توليد رموز QR مخصصة للتحميل والطباعة فوراً' : 'Generate custom printable QR codes instantly'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>{language === 'ar' ? 'متابعة إحصائيات المسح وزيارات العملاء مباشرة' : 'Monitor real-time scan analytics & visitor traffic'}</span>
                </li>
              </ul>

              <div className="flex pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => onNavigate?.('dashboard')}
                  disabled={currentUser.role !== 'merchant' && currentUser.role !== 'admin'}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{language === 'ar' ? 'دخول بوابة التاجر والشركاء (لوحة التحكم)' : 'Open Merchant & Partner Portal'}</span>
                </button>
              </div>
            </div>

            {/* Customer Scanner Access Card */}
            <div className={`p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
              currentUser.role === 'user' || currentUser.role === 'citizen' || currentUser.role === 'visitor'
                ? 'border-emerald-500/60 bg-gradient-to-br from-zinc-900 to-black shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : 'border-zinc-800/80 bg-zinc-950/60 opacity-60 hover:opacity-100'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <User className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'صلاحية نشطة ومتاحة' : 'Active Permission'}</span>
                </span>
              </div>

              <h3 className="text-lg font-black text-white mb-2">
                {language === 'ar' ? 'صلاحيات العميل والمستخدم (Customer Capabilities)' : 'Customer & Visitor Capabilities'}
              </h3>
              
              <ul className="space-y-2 mb-6 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'ar' ? 'مسح رموز الاستجابة السريعة (QR) بالكاميرا أو الصور' : 'Scan QR codes via live camera or uploaded photos'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'ar' ? 'استعراض تفاصيل العروض الحصرية والخصومات' : 'Explore exclusive offers, discounts, and store menus'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'ar' ? 'الوصول السريع لبوابة الزوار والملاحة التفاعلية' : 'Instant navigation to visitor portal & landmarks'}</span>
                </li>
              </ul>

              <div className="flex pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => onNavigate?.('landing')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white font-black text-xs shadow-lg transition cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>{language === 'ar' ? 'الانتقال إلى بوابة الزوار والعروض' : 'Go to Visitor Portal & Offers'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* LOGGED OUT VIEW: Account Registration / Login Form with Role Selection */
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Mode Switcher Pills */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl max-w-md w-full">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-3 px-6 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-[#8B0000] to-red-700 text-white shadow-lg border border-red-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'إنشاء حساب وتحديد الصلاحية' : 'Sign Up & Select Role'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-3 px-6 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-600 text-zinc-950 shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-800/80">
            <span className="text-xs text-zinc-400 font-bold">
              {language === 'ar' ? '💡 تجربة سريعة (بيانات جاهزة للاختبار):' : '💡 Quick Demo Credentials:'}
            </span>
            <button
              type="button"
              onClick={() => handleFillDemo('merchant')}
              className="px-3 py-1.5 rounded-lg bg-[#8B0000]/20 hover:bg-[#8B0000]/40 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'بيانات تاجر (Merchant Demo)' : 'Merchant Demo'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'بيانات عميل (User Demo)' : 'User Demo'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ROLE SELECTION CARDS (Only displayed during Sign Up) */}
            <AnimatePresence mode="wait">
              {authMode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-zinc-950 flex items-center justify-center text-xs font-black">1</span>
                      <span>{language === 'ar' ? 'اختر نوع الحساب والصلاحيات المطلوبة في Supabase:' : 'Select Account Role for Supabase Profiles:'}</span>
                    </h3>
                    <span className="text-xs text-[#D4AF37] font-mono font-bold bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#D4AF37]/20">
                      table: profiles | field: role
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* OPTION 1: USER / CUSTOMER ROLE */}
                    <div
                      onClick={() => {
                        setSelectedRole('user');
                        if (!USER_SUB_ROLES.some(s => s.id === selectedSubRole)) {
                          setSelectedSubRole('tourist');
                        }
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                        selectedRole === 'user'
                          ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/30'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl ${selectedRole === 'user' ? 'bg-emerald-500 text-zinc-950 font-black shadow-md' : 'bg-zinc-800 text-zinc-400'}`}>
                          <User className="w-6 h-6" />
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedRole === 'user' ? 'border-emerald-500 bg-emerald-500 text-zinc-950' : 'border-zinc-700'
                        }`}>
                          {selectedRole === 'user' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-base">
                            {language === 'ar' ? 'حساب عميل / مستخدم' : 'Customer / User Account'}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            role: 'user'
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {language === 'ar' 
                            ? 'مخصص للزوار والعملاء لمسح الرموز والاستفادة من القوائم والخصومات الحصرية.' 
                            : 'For visitors and customers to scan QRs, view menus, and save favorite promotions.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{language === 'ar' ? 'صلاحية مسح رموز QR وعرض القوائم والأسعار' : 'Scan QRs & access live menus/prices'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{language === 'ar' ? 'إمكانية تقييم المتاجر وكتابة الملاحظات' : 'Rate merchants & submit verified feedback'}</span>
                        </div>
                      </div>
                    </div>

                    {/* OPTION 2: MERCHANT / PARTNER ROLE */}
                    <div
                      onClick={() => {
                        setSelectedRole('merchant');
                        if (!MERCHANT_SUB_ROLES.some(s => s.id === selectedSubRole)) {
                          setSelectedSubRole('restaurant');
                        }
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                        selectedRole === 'merchant'
                          ? 'border-[#D4AF37] bg-[#8B0000]/15 shadow-[0_0_25px_rgba(212,175,55,0.25)] ring-2 ring-[#D4AF37]/30'
                          : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl ${selectedRole === 'merchant' ? 'bg-[#D4AF37] text-zinc-950 font-black shadow-md' : 'bg-zinc-800 text-zinc-400'}`}>
                          <Store className="w-6 h-6" />
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedRole === 'merchant' ? 'border-[#D4AF37] bg-[#D4AF37] text-zinc-950' : 'border-zinc-700'
                        }`}>
                          {selectedRole === 'merchant' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-base">
                            {language === 'ar' ? 'حساب تاجر / شريك تجاري' : 'Merchant Partner Account'}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/30">
                            role: 'merchant'
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {language === 'ar' 
                            ? 'مخصص لأصحاب المتاجر والمطاعم والشركات لإدارة المنتجات، إنشاء الرموز، ومتابعة الإحصائيات.' 
                            : 'For business owners to manage items, generate QR codes, and monitor live scan stats.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{language === 'ar' ? 'صلاحية كاملة لإدارة الأصناف وإنشاء رموز QR' : 'Full rights to add items & generate QR codes'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{language === 'ar' ? 'متابعة إحصائيات المسح وتحليلات الزوار لحظياً' : 'Live analytics & customer scan dashboards'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: SUB-ROLE / TIER SELECTION */}
                  <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-xs font-black">2</span>
                        <span>
                          {language === 'ar'
                            ? `اختر تصنيف ${selectedRole === 'merchant' ? 'نشاط التاجر / الشريك التجاري' : 'حساب العميل / المستخدم'} المخصص:`
                            : `Select Specific Tier for ${selectedRole === 'merchant' ? 'Merchant Partner' : 'Customer / User'}:`}
                        </span>
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                        {selectedRole === 'merchant'
                          ? (language === 'ar' ? '🏪 أنشطة وأعمال تجارية' : '🏪 Business Sectors')
                          : (language === 'ar' ? '👤 اهتمامات وصلاحيات الأفراد' : '👤 Individual Tiers')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {(selectedRole === 'merchant' ? MERCHANT_SUB_ROLES : USER_SUB_ROLES).map((sub) => {
                        const Icon = sub.icon;
                        const isSelected = selectedSubRole === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedSubRole(sub.id)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? selectedRole === 'merchant'
                                  ? 'border-[#D4AF37] bg-[#8B0000]/25 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                                  : 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                                : 'border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/40'
                            }`}
                          >
                            <div className="space-y-2 mb-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className={`p-2.5 rounded-xl ${
                                  isSelected
                                    ? selectedRole === 'merchant' ? 'bg-[#D4AF37] text-zinc-950 font-black shadow-md' : 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? selectedRole === 'merchant' ? 'border-[#D4AF37] bg-[#D4AF37] text-zinc-950' : 'border-emerald-500 bg-emerald-500 text-zinc-950'
                                    : 'border-zinc-700'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                              <h4 className="font-black text-xs sm:text-sm text-white">
                                {language === 'ar' ? sub.titleAr : sub.titleEn}
                              </h4>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed pt-2 border-t border-zinc-800/60">
                              {language === 'ar' ? sub.descAr : sub.descEn}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACCOUNT CREDENTIALS FORM */}
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-950 space-y-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
              
              <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/80">
                <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-zinc-950 flex items-center justify-center text-xs font-black">
                  {authMode === 'signup' ? '3' : '1'}
                </span>
                <h3 className="text-sm font-black text-white">
                  {authMode === 'signup' 
                    ? (language === 'ar' ? 'بيانات الحساب وتسجيل الملف في Supabase' : 'Account Information & Profile Sync')
                    : (language === 'ar' ? 'أدخل بيانات الدخول للتحقق من الصلاحيات' : 'Enter Credentials to Verify Permissions')}
                </h3>
              </div>

              {/* Success Banner */}
              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-lg animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>{successMsg}</div>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-lg animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name field (only for signup) */}
                {authMode === 'signup' && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{language === 'ar' ? 'الاسم الكامل أو اسم المتجر / الشركة' : 'Full Name or Store / Company Name'}</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: شركة هافور المحدودة / أحمد العتيبي' : 'e.g. Havur Company Ltd / John Doe'}
                      className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition font-medium"
                      required={authMode === 'signup'}
                    />
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@cityqr.com"
                    dir="ltr"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition font-mono font-medium"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition font-mono font-medium"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex flex-col items-center space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-lg py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#8B0000] hover:scale-[1.01] text-zinc-950 font-black text-sm md:text-base shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 border-2 border-white/20 glow-gold"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{language === 'ar' ? 'جاري الاتصال بقاعدة بيانات Supabase...' : 'Connecting to Supabase Database...'}</span>
                    </>
                  ) : authMode === 'signup' ? (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>
                        {language === 'ar'
                          ? `إنشاء الحساب وربط صلاحية (${selectedRole === 'merchant' ? 'تاجر / شريك' : 'عميل / مستخدم'}) في Supabase`
                          : `Create Account & Sync Role (${selectedRole.toUpperCase()}) in Supabase`}
                      </span>
                      <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5" />
                      <span>{language === 'ar' ? 'تسجيل الدخول والتحقق من جدول الصلاحيات' : 'Sign In & Verify Role Permissions'}</span>
                      <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-zinc-400 font-mono text-center max-w-md">
                  {authMode === 'signup'
                    ? (language === 'ar'
                        ? `* سيتم إضافة حقل role='${selectedRole}' للمستخدم في جدول profiles في قاعدة Supabase لضمان الصلاحيات المخصصة.`
                        : `* A row with role='${selectedRole}' will be upserted in the Supabase 'profiles' table to ensure customized permissions.`)
                    : (language === 'ar'
                        ? '* يتم الاستعلام عن حقل role من جدول profiles عند الدخول لتوجيه التاجر أو العميل للوحة المناسبة.'
                        : '* Queries role field from profiles table upon login to direct Merchant or Customer correctly.')}
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};
