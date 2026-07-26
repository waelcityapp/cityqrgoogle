import React, { useState, useEffect, useRef } from 'react';
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
  Building2,
  Crown,
  Award,
  Briefcase,
  Wallet,
  Share2,
  Copy,
  Coins,
  TrendingUp,
  ArrowUpRight,
  Gift,
  DollarSign,
  BadgePercent,
  Bell,
  Star,
  Camera,
  Edit3,
  Phone,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../services/AppContext';

// Sub-roles definition for User accounts with Affiliate Rights & Subscription Plans
const USER_SUB_ROLES = [
  {
    id: 'citizen',
    icon: Star,
    titleAr: 'مستخدم مميز (Standard / Premium)',
    titleEn: 'Premium User',
    descAr: 'الوصول لجميع الخدمات الأساسية والمرافق العامة والعروض الترويجية في مدينتك مجاناً.',
    descEn: 'Full free access to essential city services, public utilities, and promotional offers.',
    priceAr: 'مجاني',
    priceEn: 'Free',
    commission: 0,
    isPremium: false
  },
  {
    id: 'vip_deal_hunter',
    icon: Sparkles,
    titleAr: 'عضوية VIP (صائد العروض والمكافآت)',
    titleEn: 'VIP Deal Hunter Member',
    descAr: 'خصومات الشركاء التجاريين + حق التسويق بالعمولة (15%) عبر رابطك الخاص + محفظة أرباح.',
    descEn: 'VIP partner discounts + Affiliate marketing rights (15% commission) + Digital earnings wallet.',
    priceAr: '150 ج.م / شهر',
    priceEn: '$10 / mo',
    commission: 15,
    isPremium: true
  },
  {
    id: 'first_class',
    icon: Award,
    titleAr: 'عضوية الدرجة الأولى (First Class VIP)',
    titleEn: 'First Class VIP Member',
    descAr: 'مزايا VIP المضاعفة + حق التسويق بالعمولة (25%) على اشتراكات وتجديد التجار + أولوية الدعم.',
    descEn: 'Double VIP perks + Affiliate marketing rights (25% commission on merchant signups & renewals).',
    priceAr: '350 ج.م / شهر',
    priceEn: '$25 / mo',
    commission: 25,
    isPremium: true
  },
  {
    id: 'business_class',
    icon: Crown,
    titleAr: 'عضوية رجال الأعمال (Business Class Elite)',
    titleEn: 'Business Class Elite Member',
    descAr: 'أعلى باقات النخبة + حق التسويق بالعمولة (40%) على الاشتراكات والتجديد + سحب فوري + شعار مخصص.',
    descEn: 'Elite tier + Highest affiliate commission (40%) + Instant payout + Custom QR branding.',
    priceAr: '750 ج.م / شهر',
    priceEn: '$50 / mo',
    commission: 40,
    isPremium: true
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
  const { language, currentUser, loginUser, loginWithGoogle, registerUser, logoutUser, switchUserRole, updateUserProfile, supabaseActive } = useApp();

  // Profile Editor state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [editPhoneNumber, setEditPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [editRole, setEditRole] = useState<'user' | 'merchant'>(currentUser?.role === 'merchant' ? 'merchant' : 'user');
  const [editSubRole, setEditSubRole] = useState<string>(currentUser?.subRole || 'citizen');
  const [editSubRoleTitle, setEditSubRoleTitle] = useState<string>(currentUser?.subRoleTitle || '');
  const [editContactPreferences, setEditContactPreferences] = useState({
    email: currentUser?.contactPreferences?.email ?? true,
    sms: currentUser?.contactPreferences?.sms ?? false,
    whatsapp: currentUser?.contactPreferences?.whatsapp ?? false,
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Sync editor state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditFullName(currentUser.fullName || '');
      setEditAvatarUrl(currentUser.avatarUrl || '');
      setEditPhoneNumber(currentUser.phoneNumber || '');
      setEditRole(currentUser.role === 'merchant' ? 'merchant' : 'user');
      setEditSubRole(currentUser.subRole || 'citizen');
      setEditSubRoleTitle(currentUser.subRoleTitle || '');
      setEditContactPreferences({
        email: currentUser.contactPreferences?.email ?? true,
        sms: currentUser.contactPreferences?.sms ?? false,
        whatsapp: currentUser.contactPreferences?.whatsapp ?? false,
      });
    }
  }, [currentUser]);

  const AVATAR_PRESETS = [
    { id: '1', name: 'المدير العام', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
    { id: '2', name: 'رجل أعمال VIP', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { id: '3', name: 'سيدة أعمال', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
    { id: '4', name: 'شريك تجاري', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
    { id: '5', name: 'عضو النخبة', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    { id: '6', name: 'مواطن مميز', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
    { id: '7', name: 'رمز كرتوني 1', url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.email || 'cityuser1')}` },
    { id: '8', name: 'رمز كرتوني 2', url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.email || 'cityuser2')}` },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const subList = editRole === 'merchant' ? MERCHANT_SUB_ROLES : USER_SUB_ROLES;
    const matchedSub = subList.find(s => s.id === editSubRole) || subList[0];
    const finalSubTitle = editSubRoleTitle || (language === 'ar' ? matchedSub?.titleAr : matchedSub?.titleEn);

    updateUserProfile({
      fullName: editFullName.trim(),
      avatarUrl: editAvatarUrl.trim(),
      phoneNumber: editPhoneNumber.trim(),
      role: editRole,
      subRole: editSubRole,
      subRoleTitle: finalSubTitle,
      contactPreferences: editContactPreferences
    });

    setProfileSuccessMsg(language === 'ar' ? '🎉 تم حفظ وتحديث بيانات ملفك الشخصي بنجاح!' : '🎉 Profile updated successfully!');
    setTimeout(() => {
      setProfileSuccessMsg(null);
      setIsEditingProfile(false);
    }, 1800);
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await loginWithGoogle();
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.user) {
        setSuccessMsg(language === 'ar' ? '🎉 تم تسجيل الدخول بنجاح بحساب جوجل!' : '🎉 Signed in successfully with Google!');
        if (onNavigate) {
          setTimeout(() => onNavigate('dashboard'), 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (language === 'ar' ? 'فشل بدء عملية تسجيل الدخول بحساب جوجل' : 'Failed to start Google sign-in'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const authContainerRef = useRef<HTMLDivElement>(null);

  const scrollToContainer = () => {};

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>(initialMode || 'signin');
  const [selectedRole, setSelectedRole] = useState<'user' | 'merchant'>('user');
  const [selectedSubRole, setSelectedSubRole] = useState<string>('citizen');
  const [hasSelectedRegistrationType, setHasSelectedRegistrationType] = useState<boolean>(false);
  const [hasSelectedMainRole, setHasSelectedMainRole] = useState<boolean>(false);
  
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

  // Affiliate & Wallet Simulation State
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('cityqr_wallet_balance');
    return saved ? parseFloat(saved) : 1450.00;
  });
  const [walletHistory, setWalletHistory] = useState<Array<{ id: string; titleAr: string; titleEn: string; amount: number; date: string; type: string }>>(() => {
    const saved = localStorage.getItem('cityqr_wallet_history');
    return saved ? JSON.parse(saved) : [
      { id: '1', titleAr: 'عمولة اشتراك مطعم وكافيه البحر (15%)', titleEn: 'Commission: Sea Breeze Restaurant Signup (15%)', amount: 350, date: '2026-07-04', type: 'commission' },
      { id: '2', titleAr: 'عمولة تجديد اشتراك فندق كمبينسكي (25%)', titleEn: 'Commission: Kempinski Hotel Renewal (25%)', amount: 500, date: '2026-07-03', type: 'renewal' },
      { id: '3', titleAr: 'مكافأة ترحيبية لعضوية النخبة', titleEn: 'Elite Tier Welcome Bonus', amount: 600, date: '2026-07-01', type: 'bonus' }
    ];
  });
  const [copiedRef, setCopiedRef] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'vodafone' | 'instapay' | 'bank'>('vodafone');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const [personalNotifs, setPersonalNotifs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cityqr_app_notifications') || localStorage.getItem('cityqr_broadcast_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 101,
        titleAr: '🔥 خصم 50% حصري لأعضاء VIP والدرجة الأولى في مطعم هافور!',
        titleEn: '🔥 Exclusive 50% VIP & First Class Discount at Havur Restaurant!',
        descAr: 'تم تفعيل كود خصم خاص لأعضاء باقات النخبة المشتركين. استمتع بوجبتك الآن!',
        descEn: 'Special promo code activated for subscribed elite tier members. Enjoy your meal now!',
        timeAr: 'منذ ساعتين',
        timeEn: '2 hours ago',
        targetTiers: ['vip_deal_hunter', 'first_class'],
        priority: 'golden'
      }
    ];
  });

  useEffect(() => {
    const checkStorage = () => {
      try {
        const saved = localStorage.getItem('cityqr_app_notifications') || localStorage.getItem('cityqr_broadcast_notifications');
        if (saved) setPersonalNotifs(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', checkStorage);
    return () => window.removeEventListener('storage', checkStorage);
  }, []);

  const myTargetedNotifs = currentUser ? personalNotifs.filter(n => {
    const userRole = currentUser.subRole || currentUser.role || 'citizen';
    return n.targetTiers?.includes('all') || n.targetTiers?.includes(userRole);
  }) : [];

  const handleSimulateCommission = (titleAr: string, titleEn: string, amount: number) => {
    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    localStorage.setItem('cityqr_wallet_balance', newBalance.toString());
    
    const newTx = {
      id: Date.now().toString(),
      titleAr,
      titleEn,
      amount,
      date: new Date().toISOString().split('T')[0],
      type: 'commission'
    };
    const updatedHistory = [newTx, ...walletHistory];
    setWalletHistory(updatedHistory);
    localStorage.setItem('cityqr_wallet_history', JSON.stringify(updatedHistory));
    setSuccessMsg(language === 'ar' ? `🎉 تم احتساب عمولة تسويق جديدة بقيمة +${amount} ج.م لمحفظتك بنجاح!` : `🎉 Added +${amount} EGP affiliate commission to your wallet!`);
  };

  const handleRequestPayout = () => {
    if (!payoutAccount || walletBalance <= 0) return;
    const payoutAmount = walletBalance;
    setWalletBalance(0);
    localStorage.setItem('cityqr_wallet_balance', '0');
    const newTx = {
      id: Date.now().toString(),
      titleAr: `طلب سحب رصيد عبر ${payoutMethod === 'vodafone' ? 'فودافون كاش' : payoutMethod === 'instapay' ? 'انستاباي' : 'تحويل بنكي'} (${payoutAccount})`,
      titleEn: `Payout Request via ${payoutMethod.toUpperCase()} (${payoutAccount})`,
      amount: -payoutAmount,
      date: new Date().toISOString().split('T')[0],
      type: 'payout'
    };
    const updatedHistory = [newTx, ...walletHistory];
    setWalletHistory(updatedHistory);
    localStorage.setItem('cityqr_wallet_history', JSON.stringify(updatedHistory));
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setPayoutModalOpen(false);
      setPayoutAccount('');
    }, 3000);
  };

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
              ? 'تم إنشاء الحساب بنجاح وتفعيل عضويتك في منصة CityQR!'
              : 'Account successfully created and your membership is now active!'
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
              ? 'تم تسجيل الدخول بنجاح! مرحباً بك في حسابك المخصص.'
              : 'Logged in successfully! Welcome to your account.'
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

  const matchedSubObj = (selectedRole === 'merchant' ? MERCHANT_SUB_ROLES : USER_SUB_ROLES).find(s => s.id === selectedSubRole);
  const subTitleAr = matchedSubObj ? matchedSubObj.titleAr : '';
  const subTitleEn = matchedSubObj ? matchedSubObj.titleEn : '';
  const formTitleAr = selectedRole === 'merchant' 
    ? `إنشاء حساب تاجر (${subTitleAr})` 
    : `إنشاء حساب مستخدم (${subTitleAr})`;
  const formTitleEn = selectedRole === 'merchant'
    ? `Create Merchant Account (${subTitleEn})`
    : `Create User Account (${subTitleEn})`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-4 px-2 sm:px-4 pb-32">
      

      {/* LOGGED IN VIEW: User Profile & Custom Permissions Dashboard */}
      {currentUser ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
                    {/* Main User Profile Card - REBUILT */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#D4AF37]/50 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="absolute top-0 left-0 w-full h-1 animated-glow-line"></div>
            
            {/* UPPER SECTION: Avatar, Info, & Big Action Buttons side by side */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-zinc-800/80 pb-8">
              
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 rounded-full border-4 border-[#D4AF37] p-1 bg-gradient-to-tr from-[#D4AF37] via-amber-500 to-[#8B0000] shadow-[0_0_30px_rgba(212,175,55,0.4)] overflow-hidden">
                    <img
                      src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email || currentUser.fullName || 'user')}`}
                      alt={currentUser.fullName || 'User Avatar'}
                      className="w-full h-full rounded-full object-cover bg-zinc-900"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="text-center sm:text-start space-y-3">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border bg-[#D4AF37] text-zinc-950 border-[#D4AF37] shadow-lg">
                      {currentUser.role === 'merchant' || currentUser.role === 'admin'
                        ? (language === 'ar' ? 'حساب تاجر / شريك تجاري' : 'MERCHANT PARTNER')
                        : (language === 'ar' ? 'حساب عميل / مستخدم' : 'CUSTOMER USER')}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono font-bold bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                      ID: {currentUser.id.substring(0, 8)}...
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {currentUser.fullName || currentUser.email.split('@')[0]}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-mono text-zinc-300">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#D4AF37]" />
                      <span>{currentUser.email}</span>
                    </span>
                    {currentUser.phoneNumber && (
                      <span className="flex items-center gap-2 text-amber-300">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>{currentUser.phoneNumber}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Edit Profile & Sign Out - Very Prominent */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-black text-sm transition-all duration-300 shadow-xl cursor-pointer border-2 ${
                    isEditingProfile 
                      ? 'bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500' 
                      : 'bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black border-[#D4AF37] hover:scale-105'
                  }`}
                >
                  <Edit3 className="w-5 h-5 stroke-[2.5]" />
                  <span>{isEditingProfile ? (language === 'ar' ? 'إلغاء التعديل ✖' : 'Cancel Edit ✖') : (language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile')}</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border-2 border-red-500/40 hover:border-red-500 font-black text-sm transition-all duration-300 shadow-xl cursor-pointer"
                >
                  <LogOut className="w-5 h-5 stroke-[2.5]" />
                  <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </div>

            </div>

            {profileSuccessMsg && (
              <div className="p-5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-300 text-sm font-black flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fade-in">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* PROFILE EDITOR PANEL */}
            {isEditingProfile && (
              <div className="p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37]/50 bg-zinc-950 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] animate-fade-in space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                  <h3 className="text-xl font-black text-[#D4AF37] flex items-center gap-3">
                    <Edit3 className="w-6 h-6" />
                    <span>{language === 'ar' ? 'تعديل بيانات الحساب' : 'Edit Account Details'}</span>
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono border border-amber-500/30">
                    {language === 'ar' ? 'تحديث البيانات' : 'Update Profile'}
                  </span>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="space-y-3">
                      <label className="text-sm font-black text-zinc-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'الاسم الكامل:' : 'Full Name:'}</span>
                      </label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل اسمك الكامل...' : 'Enter your full name...'}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white text-sm outline-none focus:border-[#D4AF37] transition font-bold shadow-inner"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-black text-zinc-200 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}</span>
                      </label>
                      <input
                        type="tel"
                        value={editPhoneNumber}
                        onChange={(e) => setEditPhoneNumber(e.target.value)}
                        placeholder={language === 'ar' ? '+201xxxxxxxxx...' : 'Enter phone number...'}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white text-sm outline-none focus:border-[#D4AF37] transition font-bold font-mono shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-zinc-200 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#D4AF37]" />
                      <span>{language === 'ar' ? 'صورة الحساب (Avatar URL):' : 'Avatar URL:'}</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder={language === 'ar' ? 'أو ألصق رابط صورة هنا...' : 'Or paste image URL here...'}
                        className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white text-sm outline-none focus:border-[#D4AF37] transition font-mono shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const demoPhotos = [
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
                            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
                          ];
                          setEditAvatarUrl(demoPhotos[Math.floor(Math.random() * demoPhotos.length)]);
                        }}
                        className="px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-black text-sm whitespace-nowrap cursor-pointer transition flex items-center justify-center gap-2 shrink-0 border-2 border-zinc-700 hover:border-zinc-500 shadow-lg"
                      >
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span>{language === 'ar' ? 'صورة عشوائية' : 'Random Photo'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800 space-y-5">
                    <label className="text-sm font-black text-[#D4AF37] flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      <span>{language === 'ar' ? 'تفضيلات التواصل والإشعارات:' : 'Contact Preferences:'}</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900 cursor-pointer hover:border-[#D4AF37] transition group shadow-inner">
                        <input
                          type="checkbox"
                          checked={editContactPreferences.email}
                          onChange={(e) => setEditContactPreferences({ ...editContactPreferences, email: e.target.checked })}
                          className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm font-black text-zinc-300 group-hover:text-white">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </span>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900 cursor-pointer hover:border-[#D4AF37] transition group shadow-inner">
                        <input
                          type="checkbox"
                          checked={editContactPreferences.sms}
                          onChange={(e) => setEditContactPreferences({ ...editContactPreferences, sms: e.target.checked })}
                          className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm font-black text-zinc-300 group-hover:text-white">
                          {language === 'ar' ? 'رسائل SMS' : 'SMS'}
                        </span>
                      </label>
                      <label className="flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-800 bg-zinc-900 cursor-pointer hover:border-[#D4AF37] transition group shadow-inner">
                        <input
                          type="checkbox"
                          checked={editContactPreferences.whatsapp}
                          onChange={(e) => setEditContactPreferences({ ...editContactPreferences, whatsapp: e.target.checked })}
                          className="w-5 h-5 rounded text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-zinc-900 bg-zinc-800 border-zinc-700 cursor-pointer"
                        />
                        <span className="text-sm font-black text-zinc-300 group-hover:text-white">
                          {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-black text-sm transition cursor-pointer border-2 border-zinc-800 hover:border-zinc-700"
                    >
                      {language === 'ar' ? 'إلغاء والتراجع' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer flex items-center justify-center gap-3 hover:scale-105"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{language === 'ar' ? 'حفظ التغيرات بنجاح' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
{/* 📬 PERSONAL MEMBER NOTIFICATIONS INBOX (صندوق إشعارات الحساب الشخصي الموجهة حسب الفئة) */}
          <div className="rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-black p-6 sm:p-8 shadow-[0_0_35px_rgba(245,158,11,0.2)] relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-950 shadow-lg shrink-0 relative">
                  <Bell className="w-6 h-6 stroke-[2.5]" />
                  {myTargetedNotifs.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-zinc-950 animate-bounce">
                      {myTargetedNotifs.length}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {language === 'ar' ? 'صندوق الإشعارات والعروض الخاصة بعضويتك' : 'My Personal VIP Member Inbox'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                      {currentUser.subRoleTitle || currentUser.subRole || (language === 'ar' ? 'عضوية قياسية' : 'Standard Member')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {language === 'ar'
                      ? 'هنا تصلك الإشعارات والرسائل الترويجية الموجهة حصرياً لحسابك ولفئة عضويتك المحددة.'
                      : 'Exclusive notifications and promotional alerts targeted specifically to your account and tier.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-amber-400">
                  📬 {myTargetedNotifs.length} {language === 'ar' ? 'رسالة جديدة' : 'New Alert(s)'}
                </span>
              </div>
            </div>

            {myTargetedNotifs.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {myTargetedNotifs.map((n) => (
                  <div key={n.id} className="p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/30 hover:border-amber-500/60 transition shadow-md flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <h4 className="font-black text-sm text-white">
                          {language === 'ar' ? n.titleAr : n.titleEn}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {n.priority === 'golden' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ✨ {language === 'ar' ? 'عرض ذهبي' : 'Golden Offer'}
                          </span>
                        )}
                        {n.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40">
                            🚨 {language === 'ar' ? 'تنبيه هام' : 'Urgent Alert'}
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-500 font-mono">{language === 'ar' ? n.timeAr : n.timeEn}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-300 leading-relaxed pl-4 border-l-2 border-amber-500/40 py-0.5">
                      {language === 'ar' ? n.descAr : n.descEn}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono">
                      <span>🎯 {language === 'ar' ? 'موجه إلى فئة:' : 'Targeted Tier:'} <strong className="text-amber-400">{currentUser.subRoleTitle || currentUser.subRole || 'VIP'}</strong></span>
                      <span className="text-emerald-400 font-bold">✓ {language === 'ar' ? 'تم التسليم لحسابك الشخصي' : 'Delivered to your personal inbox'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-zinc-300">
                  {language === 'ar' ? 'لا توجد رسائل أو إشعارات جديدة موجهة لحسابك حالياً' : 'No new notifications targeted to your account at this time'}
                </p>
                <p className="text-xs text-zinc-500">
                  {language === 'ar' ? 'ستظهر هنا الخصومات والعروض الترويجية الحصرية فور بثها لفئة عضويتك المحددة.' : 'Exclusive promotional offers and discounts will appear here once broadcasted to your membership tier.'}
                </p>
              </div>
            )}
          </div>

          {/* 🌟 VIP AFFILIATE MARKETING & DIGITAL WALLET SYSTEM */}
          <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-950 shadow-lg shrink-0">
                  <Wallet className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">
                      {language === 'ar' ? 'نظام التسويق بالعمولة والمحفظة الرقمية (VIP Affiliate & Wallet)' : 'VIP Affiliate Marketing & Digital Wallet'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                      {language === 'ar' ? 'نظام الأرباح النشط' : 'LIVE EARNINGS'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {language === 'ar'
                      ? 'اربح عمولات مستمرة عند اشتراك أو تجديد أي تاجر أو منشأة تجارية عبر رابط الترويج الخاص بك.'
                      : 'Earn continuous recurring commissions whenever a merchant subscribes or renews through your link.'}
                  </p>
                </div>
              </div>

              {/* Monthly Subscription Badge */}
              <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-3 px-4 flex items-center gap-3 shrink-0">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-left rtl:text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-extrabold block">
                    {language === 'ar' ? 'حالة الاشتراك الشهري' : 'Monthly Plan Status'}
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    {currentUser.subRole === 'business_class' ? (language === 'ar' ? ' رجال الأعمال (750 ج.م/شهر)' : ' Business Class ($50/mo)')
                      : currentUser.subRole === 'first_class' ? (language === 'ar' ? ' الدرجة الأولى (350 ج.م/شهر)' : ' First Class ($25/mo)')
                      : currentUser.subRole === 'vip_deal_hunter' ? (language === 'ar' ? ' عضوية VIP (150 ج.م/شهر)' : ' VIP Member ($10/mo)')
                      : (language === 'ar' ? ' باقة مجانية (ارتقِ لـ VIP للكسب)' : ' Free Tier (Upgrade to Earn)')}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Balance */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/30 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
                  <span>{language === 'ar' ? 'الرصيد المتاح للسحب' : 'Available Wallet Balance'}</span>
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight my-1">
                  {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-sans text-amber-400">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                </div>
                <button
                  onClick={() => setPayoutModalOpen(true)}
                  disabled={walletBalance <= 0}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-md"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{language === 'ar' ? 'طلب سحب الأرباح' : 'Request Payout'}</span>
                </button>
              </div>

              {/* Commission Rate */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
                  <span>{language === 'ar' ? 'نسبة العمولة الخاصة بك' : 'Your Commission Rate'}</span>
                  <BadgePercent className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono my-1">
                  {currentUser.subRole === 'business_class' ? '40%' : currentUser.subRole === 'first_class' ? '25%' : currentUser.subRole === 'vip_deal_hunter' ? '15%' : '15%'}
                  <span className="text-xs font-sans text-zinc-400 ml-1.5 font-bold">
                    {language === 'ar' ? 'على كل اشتراك/تجديد' : 'per signup/renewal'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  {language === 'ar' ? 'عمولة دائمة تتجدد تلقائياً عند قيام التاجر بسداد الاشتراك الشهري أو السنوي.' : 'Recurring commission applied automatically on every merchant renewal.'}
                </p>
              </div>

              {/* Total Referrals */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-bold mb-2">
                  <span>{language === 'ar' ? 'المتاجر والمنشآت المشتركة' : 'Active Referred Merchants'}</span>
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono my-1">
                  {walletHistory.filter(h => h.type === 'commission' || h.type === 'renewal').length + 12}
                  <span className="text-xs font-sans text-sky-400 ml-1.5 font-bold">{language === 'ar' ? 'منشأة تجارية' : 'Merchants'}</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  {language === 'ar' ? 'يتم احتساب الأرباح فور تفعيل حساب التاجر بنظام الدفع الإلكتروني.' : 'Earnings credited instantly upon merchant payment confirmation.'}
                </p>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'رابط التسويق الترويجي الخاص بك (Affiliate Referral Link):' : 'Your Unique Marketing Referral Link:'}</span>
                </label>
                <div className="font-mono text-xs text-amber-300 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-amber-500/20 break-all">
                  https://cityqr.app/join?ref={currentUser.subRole || 'VIP'}-{currentUser.id.substring(0, 6).toUpperCase()}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://cityqr.app/join?ref=${currentUser.subRole || 'VIP'}-${currentUser.id.substring(0, 6).toUpperCase()}`);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2500);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-zinc-700"
                >
                  {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRef ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الرابط' : 'Copy Link')}</span>
                </button>
                <button
                  onClick={() => {
                    const shareText = language === 'ar' ? `سجل الآن في منصة CityQR عبر رابطي الترويجي للحصول على عروض ومزايا حصرية: https://cityqr.app/join?ref=${currentUser.subRole || 'VIP'}-${currentUser.id.substring(0, 6).toUpperCase()}` : `Join CityQR using my referral link for exclusive rewards: https://cityqr.app/join?ref=${currentUser.subRole || 'VIP'}-${currentUser.id.substring(0, 6).toUpperCase()}`;
                    if (navigator.share) {
                      navigator.share({ title: 'CityQR Affiliate Referral', text: shareText });
                    } else {
                      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{language === 'ar' ? 'مشاركة (واتساب / سوشيال)' : 'Share via WA'}</span>
                </button>
              </div>
            </div>


            {/* Recent Transactions Table */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-zinc-500" />
                <span>{language === 'ar' ? 'سجل العمليات والعمولات المكتسبة في محفظتك:' : 'Recent Wallet Transactions & Commissions:'}</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {walletHistory.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        tx.type === 'payout' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {tx.type === 'payout' ? <ArrowUpRight className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200">{language === 'ar' ? tx.titleAr : tx.titleEn}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-black text-sm shrink-0 ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payout Modal */}
          <AnimatePresence>
            {payoutModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setPayoutModalOpen(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-zinc-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                        <Coins className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-lg text-white">
                        {language === 'ar' ? 'سحب رصيد العمولات' : 'Withdraw Affiliate Earnings'}
                      </h3>
                    </div>
                    <button onClick={() => setPayoutModalOpen(false)} className="text-zinc-400 hover:text-white text-sm font-bold">✕</button>
                  </div>

                  {payoutSuccess ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40 animate-bounce">
                        <Check className="w-8 h-8 stroke-[3]" />
                      </div>
                      <h4 className="font-black text-lg text-white">
                        {language === 'ar' ? 'تم إرسال طلب السحب بنجاح!' : 'Payout Request Submitted Successfully!'}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                        {language === 'ar'
                          ? 'سيتم تحويل المبلغ إلى حسابك المسجل خلال 15 دقيقة تقريباً. ستصلك رسالة تأكيد SMS.'
                          : 'The transfer will be credited to your account within ~15 minutes. An SMS confirmation will follow.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-bold">{language === 'ar' ? 'المبلغ المطلوب سحبه:' : 'Amount to withdraw:'}</span>
                        <span className="font-mono font-black text-xl text-amber-400">{walletBalance.toFixed(2)} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-300 block">{language === 'ar' ? 'اختر وسيلة استلام الأرباح:' : 'Select Payout Method:'}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'vodafone', label: language === 'ar' ? 'فودافون كاش' : 'Vodafone Cash' },
                            { id: 'instapay', label: language === 'ar' ? 'انستاباي (InstaPay)' : 'InstaPay' },
                            { id: 'bank', label: language === 'ar' ? 'تحويل بنكي' : 'Bank Wire' }
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPayoutMethod(m.id as any)}
                              className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                                payoutMethod === m.id ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300 block">
                          {payoutMethod === 'vodafone'
                            ? (language === 'ar' ? 'رقم محفظة فودافون كاش / اتصالات:' : 'Vodafone Cash / Mobile Wallet Number:')
                            : payoutMethod === 'instapay'
                            ? (language === 'ar' ? 'عنوان انستاباي (InstaPay IPA / Mobile):' : 'InstaPay IPA Address / Mobile Number:')
                            : (language === 'ar' ? 'رقم الحساب البنكي (IBAN):' : 'Bank Account IBAN / Account Number:')}
                        </label>
                        <input
                          type="text"
                          value={payoutAccount}
                          onChange={(e) => setPayoutAccount(e.target.value)}
                          placeholder={payoutMethod === 'vodafone' ? '010XXXXXXXX' : payoutMethod === 'instapay' ? 'name@instapay' : 'EGXX XXXX XXXX...'}
                          className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="pt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setPayoutModalOpen(false)}
                          className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestPayout}
                          disabled={!payoutAccount}
                          className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {language === 'ar' ? 'تأكيد وسحب الرصيد الآن' : 'Confirm & Withdraw Now'}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
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
                onClick={() => { setAuthMode('signup'); setErrorMsg(null); setSuccessMsg(null); setHasSelectedMainRole(false); setHasSelectedRegistrationType(false); scrollToContainer(); }}
                className={`flex-1 py-3 px-6 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-[#8B0000] to-red-700 text-white shadow-lg border border-red-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>{language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMsg(null); setSuccessMsg(null); scrollToContainer(); }}
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

          <div
            ref={authContainerRef}
            className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl relative min-h-[520px] transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 animated-glow-line"></div>
            <form onSubmit={handleSubmit} className="space-y-8 flex-1 flex flex-col justify-between">
              {/* STEP 1 & 2: UNIFIED ROLE AND TIER SELECTION (STABLE LAYOUT FOR SIGNUP) */}
              {authMode === 'signup' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Step 1: Account Type */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-black text-zinc-200 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-zinc-950 flex items-center justify-center text-xs font-black">1</span>
                        <span>{language === 'ar' ? 'اختر نوع الحساب:' : 'Select Account Type:'}</span>
                      </label>
                      <span className="text-[11px] font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                        {selectedRole === 'user' ? (language === 'ar' ? '👤 عميل / مستخدم' : '👤 Customer / User') : (language === 'ar' ? '🏪 تاجر / شريك' : '🏪 Merchant Partner')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('user');
                          if (!USER_SUB_ROLES.some(s => s.id === selectedSubRole)) {
                            setSelectedSubRole('citizen');
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3.5 cursor-pointer text-start ${
                          selectedRole === 'user'
                            ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${selectedRole === 'user' ? 'bg-emerald-500 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'}`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="font-black text-xs sm:text-sm truncate">
                            {language === 'ar' ? 'حساب عميل / مستخدم' : 'Customer / User Account'}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {language === 'ar' ? 'مسح QR، القوائم والخصومات الحصرية' : 'Scan QRs, access menus & exclusive promos'}
                          </div>
                        </div>
                        <div className="ml-auto rtl:mr-auto shrink-0">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRole === 'user' ? 'border-emerald-500 bg-emerald-500 text-zinc-950' : 'border-zinc-700'}`}>
                            {selectedRole === 'user' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('merchant');
                          if (!MERCHANT_SUB_ROLES.some(s => s.id === selectedSubRole)) {
                            setSelectedSubRole('restaurant');
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3.5 cursor-pointer text-start ${
                          selectedRole === 'merchant'
                            ? 'border-[#D4AF37] bg-[#8B0000]/25 text-white shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${selectedRole === 'merchant' ? 'bg-[#D4AF37] text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'}`}>
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="font-black text-xs sm:text-sm truncate">
                            {language === 'ar' ? 'حساب تاجر / شريك تجاري' : 'Merchant Partner Account'}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {language === 'ar' ? 'إدارة الأصناف، إنشاء QR ومتابعة الإحصائيات' : 'Manage items, generate QR & view live stats'}
                          </div>
                        </div>
                        <div className="ml-auto rtl:mr-auto shrink-0">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedRole === 'merchant' ? 'border-[#D4AF37] bg-[#D4AF37] text-zinc-950' : 'border-zinc-700'}`}>
                            {selectedRole === 'merchant' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Tier Selection Grid */}
                  <div className="space-y-3 pt-5 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-black text-zinc-200 flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full text-zinc-950 flex items-center justify-center text-xs font-black ${selectedRole === 'merchant' ? 'bg-[#D4AF37]' : 'bg-emerald-500'}`}>2</span>
                        <span>
                          {language === 'ar'
                            ? `اختر تصنيف ${selectedRole === 'merchant' ? 'النشاط التجاري' : 'عضوية المستخدم'}:`
                            : `Select ${selectedRole === 'merchant' ? 'Business Sector' : 'Membership Tier'}:`}
                        </span>
                      </label>
                      <span className="text-[11px] font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                        {selectedRole === 'merchant'
                          ? (language === 'ar' ? '🏪 5 أنشطة متاحة' : '🏪 5 Sectors')
                          : (language === 'ar' ? '👤 4 باقات متاحة' : '👤 4 Tiers')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(selectedRole === 'merchant' ? MERCHANT_SUB_ROLES : USER_SUB_ROLES).map((sub) => {
                        const Icon = sub.icon;
                        const isSelected = selectedSubRole === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedSubRole(sub.id)}
                            className={`p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? selectedRole === 'merchant'
                                  ? 'border-[#D4AF37] bg-[#8B0000]/25 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                  : 'border-emerald-500 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-1.5">
                                <div className={`p-2 rounded-xl shrink-0 ${
                                  isSelected
                                    ? selectedRole === 'merchant' ? 'bg-[#D4AF37] text-zinc-950 font-black' : 'bg-emerald-500 text-zinc-950 font-black'
                                    : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {(sub as any).priceAr && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-black ${
                                      (sub as any).isPremium ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                                    }`}>
                                      {language === 'ar' ? (sub as any).priceAr : (sub as any).priceEn}
                                    </span>
                                  )}
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? selectedRole === 'merchant' ? 'border-[#D4AF37] bg-[#D4AF37] text-zinc-950' : 'border-emerald-500 bg-emerald-500 text-zinc-950'
                                      : 'border-zinc-700'
                                  }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                </div>
                              </div>
                              <h4 className="font-black text-xs text-white leading-snug">
                                {language === 'ar' ? sub.titleAr : sub.titleEn}
                              </h4>
                              {(sub as any).commission > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                                  <BadgePercent className="w-3 h-3" />
                                  <span>{language === 'ar' ? `عمولة: ${(sub as any).commission}%` : `Affiliate: ${(sub as any).commission}%`}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed mt-2 pt-2 border-t border-zinc-800/60 line-clamp-2">
                              {language === 'ar' ? sub.descAr : sub.descEn}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            {/* STEP 2 handled in unified layout above */}

            {/* ACCOUNT CREDENTIALS FORM */}
            <AnimatePresence mode="wait">
              {true && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-zinc-950 flex items-center justify-center text-xs font-black">
                        {authMode === 'signup' ? '3' : '1'}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white">
                        {authMode === 'signup'
                          ? (language === 'ar' ? 'أدخل بيانات الحساب الجديد:' : 'Enter Account Credentials:')
                          : (language === 'ar' ? 'أدخل بيانات الدخول للمتابعة إلى حسابك' : 'Enter Credentials to Access Your Account')}
                      </h3>
                    </div>
                    {authMode === 'signup' && (
                      <div className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          {language === 'ar'
                            ? `الفئة: ${(selectedRole === 'merchant' ? MERCHANT_SUB_ROLES : USER_SUB_ROLES).find(s => s.id === selectedSubRole)?.titleAr}`
                            : `Tier: ${(selectedRole === 'merchant' ? MERCHANT_SUB_ROLES : USER_SUB_ROLES).find(s => s.id === selectedSubRole)?.titleEn}`}
                        </span>
                      </div>
                    )}
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
                      <span>{language === 'ar' ? 'جاري معالجة البيانات...' : 'Processing...'}</span>
                    </>
                  ) : authMode === 'signup' ? (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>{language === 'ar' ? 'إنشاء الحساب الآن' : 'Create Account Now'}</span>
                      <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-5 h-5" />
                      <span>{language === 'ar' ? 'تسجيل الدخول الآن' : 'Sign In Now'}</span>
                      <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="w-full max-w-lg my-2 flex items-center gap-3">
                  <div className="h-px bg-zinc-800 flex-1" />
                  <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">
                    {language === 'ar' ? 'أو التسجيل السريع' : 'Or Quick Sign In'}
                  </span>
                  <div className="h-px bg-zinc-800 flex-1" />
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || loading}
                  className="w-full max-w-lg py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border border-zinc-700/80 hover:border-zinc-500 disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>
                    {language === 'ar'
                      ? 'الدخول المباشر بحساب جوجل (Google)'
                      : 'Continue with Google Account'}
                  </span>
                </button>

                <p className="text-[11px] text-zinc-400 font-mono text-center max-w-md">
                  {authMode === 'signup'
                    ? (language === 'ar'
                        ? '* بيانتك مشفرة ومحمية بالكامل لضمان سرية حسابك وتجربتك المخصصة في المنصة.'
                        : '* Your account credentials and selected tier are securely encrypted.')
                    : (language === 'ar'
                        ? '* يتم التحقق من بياناتك وتوجيهك مباشرة للوحة التحكم الخاصة بفئتك.'
                        : '* Verifies credentials to direct you to your dedicated dashboard.')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};
