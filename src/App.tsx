/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './services/AppContext';
import { translations } from './services/translations';
import { Dashboard } from './pages/Dashboard';
import { QRGenerator } from './pages/QRGenerator';
import { QRScanner } from './pages/QRScanner';
import { EmergencyControl } from './pages/EmergencyControl';
import { VisitorLanding } from './pages/VisitorLanding';
import { AccountAuth } from './pages/AccountAuth';
import { QRCodeItem } from './types';
import { 
  QrCode, 
  LayoutDashboard, 
  Compass, 
  ShieldAlert, 
  Globe, 
  Sun, 
  Moon, 
  Tv, 
  Download, 
  Smartphone,
  CheckCircle,
  Wifi,
  WifiOff,
  Wrench,
  Sparkles,
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Facebook,
  Twitter,
  Mail,
  User,
  Bell,
  Menu,
  DollarSign,
  PhoneCall,
  Shield,
  Activity,
  MapPin,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WORLD_COUNTRIES, CountryProfile } from './services/international';

function CityQRAppContent() {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    userCountry,
    setUserCountry,
    emergencyConfig, 
    updateEmergencyConfig,
    isOnline,
    appVersion,
    currentUser
  } = useApp();
  
  const t = translations[language];

  // Current active navigation tab (default is the visitor landing page!)
  const [activeTab, setActiveTab] = useState('landing');
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  
  // Scanned QR result state (global so scanner/dashboard can trigger/close it)
  const [scannedQR, setScannedQR] = useState<QRCodeItem | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Social Sharing Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const shareUrl = "https://cityqrgoogle.vercel.app/";

  // Notifications Bell & Quick Menu states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const mockNotifications = [
    {
      id: 1,
      titleAr: 'عرض خاص جديد! 💥',
      titleEn: 'New Special Offer! 💥',
      descAr: 'تم إضافة خصم 30% في مطعم هافور (مدينة نصر) هذا الأسبوع.',
      descEn: '30% discount added at Havur Restaurant (Nasr City) this week.',
      timeAr: 'منذ 10 دقائق',
      timeEn: '10 mins ago'
    },
    {
      id: 2,
      titleAr: 'تحديث معالم المدينة 🏛️',
      titleEn: 'City Landmarks Updated 🏛️',
      descAr: 'اكتشف الدليل التفاعلي الجديد لمعالم وجولات المدينة الذكية.',
      descEn: 'Discover the new interactive guide for smart city tours and landmarks.',
      timeAr: 'منذ ساعتين',
      timeEn: '2 hours ago'
    },
    {
      id: 3,
      titleAr: 'تنبيه أمني وخدمي 🚨',
      titleEn: 'Security & Service Alert 🚨',
      descAr: 'نظام الاستجابة السريع والطوارئ يعمل بكفاءة 100% في جميع أنحاء المدينة.',
      descEn: 'Emergency response system is running at 100% efficiency across the city.',
      timeAr: 'أمس',
      timeEn: 'Yesterday'
    }
  ];

  // Admin Message Modal & Visitor Alert State
  const [isAdminMessageModalOpen, setIsAdminMessageModalOpen] = useState(false);
  const [isVisitorAlertOpen, setIsVisitorAlertOpen] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState('');
  const [adminMessageSuccess, setAdminMessageSuccess] = useState<{ refNum: string; dateStr: string } | null>(null);
  const [adminMessageError, setAdminMessageError] = useState('');
  const [currentMessageRef, setCurrentMessageRef] = useState('');
  const [currentMessageDate, setCurrentMessageDate] = useState('');
  const [adminMessageView, setAdminMessageView] = useState<'new' | 'history'>('new');

  const getMonthlySentMessagesCount = () => {
    if (!currentUser) return 0;
    try {
      const stored = localStorage.getItem('cityqr_admin_messages');
      if (!stored) return 0;
      const msgs = JSON.parse(stored);
      if (!Array.isArray(msgs)) return 0;
      const now = new Date();
      const curMonth = now.getMonth();
      const curYear = now.getFullYear();
      return msgs.filter((m: any) => {
        if (m.senderId !== currentUser.id) return false;
        const mDate = new Date(m.isoDate || m.date || 0);
        return mDate.getMonth() === curMonth && mDate.getFullYear() === curYear;
      }).length;
    } catch (e) {
      return 0;
    }
  };

  const getMySentMessages = () => {
    if (!currentUser) return [];
    try {
      const stored = localStorage.getItem('cityqr_admin_messages');
      if (!stored) return [];
      const msgs = JSON.parse(stored);
      if (!Array.isArray(msgs)) return [];
      return msgs.filter((m: any) => m.senderId === currentUser.id);
    } catch (e) {
      return [];
    }
  };

  const handleOpenAdminMessage = () => {
    if (!currentUser || currentUser.role === 'visitor' || currentUser.id === 'guest-user') {
      setIsVisitorAlertOpen(true);
    } else {
      const randomRef = 'REF-' + Math.floor(100000 + Math.random() * 900000);
      const now = new Date();
      const dateFormatted = language === 'ar' 
        ? now.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' - ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        : now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' - ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setCurrentMessageRef(randomRef);
      setCurrentMessageDate(dateFormatted);
      setAdminMessageText('');
      setAdminMessageError('');
      setAdminMessageSuccess(null);
      setAdminMessageView('new');
      setIsAdminMessageModalOpen(true);
    }
  };

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMessageText.trim()) {
      setAdminMessageError(language === 'ar' ? 'يرجى كتابة نص الرسالة قبل الإرسال.' : 'Please enter message content before sending.');
      return;
    }
    if (adminMessageText.length > 500) {
      setAdminMessageError(language === 'ar' ? 'الرسالة تتجاوز الحد الأقصى (500 حرف).' : 'Message exceeds the maximum limit (500 characters).');
      return;
    }
    const countThisMonth = getMonthlySentMessagesCount();
    if (countThisMonth >= 4) {
      setAdminMessageError(language === 'ar' ? 'لقد استنفدت الحد الأقصى المسموح به (4 رسائل في الشهر).' : 'You have reached the monthly limit (4 messages per month).');
      return;
    }

    try {
      const stored = localStorage.getItem('cityqr_admin_messages') || '[]';
      const msgs = JSON.parse(stored);
      const newMsg = {
        id: currentMessageRef,
        refNumber: currentMessageRef,
        senderId: currentUser?.id || 'unknown',
        senderName: currentUser?.name || currentUser?.email || 'User',
        senderEmail: currentUser?.email || '',
        date: currentMessageDate,
        isoDate: new Date().toISOString(),
        content: adminMessageText.trim(),
        status: 'pending'
      };
      msgs.unshift(newMsg);
      localStorage.setItem('cityqr_admin_messages', JSON.stringify(msgs));
      setAdminMessageSuccess({ refNum: currentMessageRef, dateStr: currentMessageDate });
      setAdminMessageError('');
    } catch (err) {
      setAdminMessageError(language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة.' : 'An error occurred while sending the message.');
    }
  };

  const getGeneralShareText = (includeUrl: boolean = true) => {
    const imgUrl = "https://cityqrgoogle.vercel.app/app_icon-512.png?v=4";
    if (language === 'ar') {
      let text = `🌟🏛️ [ تطبيق CityQR - دليل مدينتك التفاعلي والعروض الحصرية ] 🏛️🌟\n\n📢 اكتشف أقوى العروض والخصومات الذكية، المعالم السياحية، والخدمات المباشرة في مدينتك!\n\n🖼️ أيقونة وصورة التطبيق:\n${imgUrl}`;
      if (includeUrl) {
        text += `\n\n🔗 رابط الدخول لمنصة CityQR:\n${shareUrl}`;
      }
      text += `\n\n📲 تصفح التطبيق الآن واستفد من جميع الميزات والخصومات!`;
      return text;
    } else {
      let text = `🌟🏛️ [ CityQR App - Your Smart City Guide & Offers ] 🏛️🌟\n\n📢 Discover top smart offers, exclusive discounts, landmarks, and live services in your city!\n\n🖼️ App Icon & Preview:\n${imgUrl}`;
      if (includeUrl) {
        text += `\n\n🔗 Access CityQR Platform:\n${shareUrl}`;
      }
      text += `\n\n📲 Explore the app now to access all smart city features!`;
      return text;
    }
  };

  useEffect(() => {
    // Listen for PWA installation trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setShowInstallBanner(false);
      setTimeout(() => setInstalledSuccessfully(false), 5000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Check version discrepancy for Forced Update screen (simulate comparing semantic versions)
  const isUpdateRequired = emergencyConfig.forceUpdate && 
    emergencyConfig.latestAppVersion !== appVersion;

  // Handle Simulated PWA updates
  const handleSimulatedUpdate = async () => {
    // Sync client version to the server version in emergency settings
    const updatedConfig = {
      ...emergencyConfig,
      currentAppVersion: emergencyConfig.latestAppVersion
    };
    await updateEmergencyConfig(updatedConfig);
    
    // Reload page to simulate software update installation
    window.location.reload();
  };

  // 1. EMERGENCY: Maintenance Mode Block Page
  if (emergencyConfig.maintenanceMode) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#000000] text-zinc-900 dark:text-gray-100 flex flex-col justify-between p-6 antialiased select-none font-sans transition-colors duration-300">
        {/* Language selector accessible in maintenance mode */}
        <div className="flex justify-end">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Lock Screen Frame */}
        <div className="max-w-md mx-auto w-full text-center space-y-6 my-auto py-12 px-6 rounded-2xl border-2 border-[#8B0000] bg-zinc-950/50 glow-red">
          <div className="w-16 h-16 bg-[#8B0000]/10 border border-[#8B0000]/30 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
            <Wrench className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xl font-extrabold text-[#8B0000] tracking-wider uppercase">City</span>
            <span className="text-xl font-bold text-[#D4AF37] font-mono tracking-wider uppercase">QR</span>
            <div className="h-0.5 w-12 bg-[#8B0000] mx-auto mt-1" />
          </div>

          <div className="space-y-3">
            <h1 className="text-xl md:text-2xl font-black text-[#D4AF37]">
              {t.maintenanceActive}
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              {language === 'ar' 
                ? emergencyConfig.maintenanceMessage.ar || t.maintenanceDesc
                : emergencyConfig.maintenanceMessage.en || t.maintenanceDesc}
            </p>
          </div>

          <div className="border-t border-zinc-900 pt-4">
            <span className="text-[10px] text-zinc-600 font-mono block">
              SYSTEM STATUS: UNDER MAINTENANCE | v{appVersion}
            </span>
          </div>
        </div>

        <div className="text-center text-[11px] text-zinc-600">
          &copy; {new Date().getFullYear()} CityQR. All rights reserved.
        </div>
      </div>
    );
  }

  // 2. EMERGENCY: Forced Update Required Block Page
  if (isUpdateRequired) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#000000] text-zinc-900 dark:text-gray-100 flex flex-col justify-between p-6 antialiased select-none font-sans transition-colors duration-300">
        {/* Language selector accessible in update mode */}
        <div className="flex justify-end">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[#D4AF37]" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* Lock Screen Frame */}
        <div className="max-w-md mx-auto w-full text-center space-y-6 my-auto py-12 px-6 rounded-2xl border-2 border-[#D4AF37] bg-zinc-950/50 glow-gold">
          <div className="w-16 h-16 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#D4AF37] animate-bounce">
            <Download className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xl font-extrabold text-[#8B0000] tracking-wider uppercase">City</span>
            <span className="text-xl font-bold text-[#D4AF37] font-mono tracking-wider uppercase">QR</span>
            <div className="h-0.5 w-12 bg-[#8B0000] mx-auto mt-1" />
          </div>

          <div className="space-y-3">
            <h1 className="text-xl md:text-2xl font-black text-white">
              {t.forceUpdateActive}
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              {language === 'ar' 
                ? emergencyConfig.updateMessage.ar || t.forceUpdateDesc
                : emergencyConfig.updateMessage.en || t.forceUpdateDesc}
            </p>
            
            <div className="text-[11px] bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-zinc-500 font-mono space-y-1">
              <div>Your Version: <span className="text-red-400">{appVersion}</span></div>
              <div>Required Version: <span className="text-green-400">{emergencyConfig.latestAppVersion}</span></div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSimulatedUpdate}
              className="w-full text-center py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-600 hover:to-[#D4AF37] text-xs font-bold text-black shadow-lg transition duration-200 cursor-pointer"
            >
              {t.updateBtn}
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-zinc-600">
          &copy; {new Date().getFullYear()} CityQR. All rights reserved.
        </div>
      </div>
    );
  }

  // 3. Regular Application View
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#000000] text-zinc-900 dark:text-gray-100 font-sans flex flex-col justify-between transition-colors duration-300 pb-16 sm:pb-20">
      
      {/* Dynamic PWA installation Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-gradient-to-r from-[#8B0000] to-zinc-950 border-b border-[#D4AF37]/30 text-white p-3.5 text-xs font-semibold flex items-center justify-between gap-4 sticky top-0 z-50 shadow-xl"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-[#D4AF37] text-black">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="block font-bold text-sm">CityQR PWA App</span>
                <span className="block text-[10px] text-zinc-300">
                  {language === 'ar' 
                    ? 'ثبت التطبيق على شاشتك الرئيسية للوصول السريع والعمل بدون إنترنت!' 
                    : 'Install app on your home screen for quick offline-enabled access!'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-[#D4AF37] text-black px-4 py-1.5 rounded-md text-[11px] font-black hover:bg-white transition cursor-pointer"
              >
                {t.installApp}
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success PWA Installation Notice */}
      <AnimatePresence>
        {installedSuccessfully && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:w-80 z-50 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{t.appInstalled}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3.5">
        
        {/* Custom CityQR Header Bar (Sticky on scroll as requested) */}
        <header className="sticky top-2 z-40 min-h-[5rem] sm:min-h-[5.5rem] border border-zinc-200 dark:border-[#D4AF37]/25 flex flex-col sm:flex-row items-center justify-between px-5 sm:px-8 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl gap-3.5 py-3 sm:py-3.5 shadow-md dark:shadow-xl dark:shadow-black/60 transition-all duration-200">
          
          {/* Logo Brand with Bold Typography theme elements and Version badge */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-3 relative py-1" dir="ltr">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-tighter leading-none flex items-center drop-shadow-md py-0.5">
                  <span className="text-[#8B0000] dark:text-red-500 drop-shadow-[0_2px_15px_rgba(139,0,0,0.4)]">City</span>
                  <span className="text-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">QR</span>
                </div>
                
                {/* Glowing Version Pill Badge inline */}
                <span className="px-3 py-1 sm:px-3.5 sm:py-1 bg-gradient-to-r from-[#D4AF37]/15 via-amber-500/15 to-[#D4AF37]/15 dark:from-[#D4AF37]/20 dark:via-amber-500/20 dark:to-[#D4AF37]/20 text-[#D4AF37] dark:text-amber-300 text-[11px] sm:text-xs font-black rounded-full border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.25)] tracking-widest uppercase flex items-center gap-1.5 self-center animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  V1.0 BETA
                </span>
              </div>

              {/* ☀️ Gentle solar glow under the app name CityQR */}
              <div className="absolute -bottom-2 left-4 w-48 h-8 bg-gradient-to-t from-amber-400/35 via-[#D4AF37]/30 to-transparent rounded-full blur-xl pointer-events-none animate-pulse" />
            </div>

            {/* 4 Header Action Buttons (Icon-Only Toolbar for maximum logo space) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 py-0.5">
              {/* 1. Share App */}
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/15 dark:hover:bg-[#D4AF37]/25 text-[#D4AF37] hover:text-white transition duration-200 cursor-pointer shadow-sm shrink-0 flex items-center justify-center group"
                title={language === 'ar' ? 'مشاركة التطبيق عبر وسائل التواصل الاجتماعي' : 'Share app via social media'}
              >
                <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D4AF37] group-hover:scale-110 transition" />
              </button>

              {/* 2. Contact App */}
              <button
                onClick={handleOpenAdminMessage}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/20 via-amber-500/20 to-[#D4AF37]/20 hover:from-[#D4AF37]/30 hover:to-amber-500/30 text-amber-300 dark:text-amber-300 transition duration-300 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)] shrink-0 flex items-center justify-center animate-pulse group"
                title={language === 'ar' ? 'مراسلة التطبيق (استفسار / مقترح / شكوى)' : 'Contact App (Inquiry / Suggestion / Complaint)'}
              >
                <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D4AF37] group-hover:scale-110 transition" />
              </button>

              {/* 3. Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#8B0000]/40 bg-[#8B0000]/10 hover:bg-[#8B0000]/20 text-[#8B0000] dark:text-red-400 transition duration-200 cursor-pointer shadow-sm shrink-0 relative flex items-center justify-center group"
                  title={language === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}
                >
                  <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#8B0000] dark:text-red-400 animate-bounce" />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow">3</span>
                </button>
              </div>

              {/* 4. Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37]/10 to-amber-500/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition duration-200 cursor-pointer shadow-sm shrink-0 flex items-center justify-center group"
                  title={language === 'ar' ? 'القائمة السريعة: مصر، العملة، الطوارئ والواجهة' : 'Quick Menu: Country, Currency, Emergency & Interface'}
                >
                  <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D4AF37] group-hover:scale-110 transition" />
                </button>
              </div>
            </div>
          </div>

          {/* Controls Panel - Horizontally scrollable left & right */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none flex-nowrap justify-start sm:justify-end w-full sm:w-auto px-1">
            
            {/* Install App Button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:text-white transition cursor-pointer font-bold shadow-sm shrink-0 whitespace-nowrap"
              title={language === 'ar' ? 'ثبت التطبيق على هاتفك' : 'Install app on your phone'}
            >
              <Smartphone className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span>{language === 'ar' ? 'ثبت التطبيق' : 'Install App'}</span>
            </button>

            {/* Connection pills */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 whitespace-nowrap ${
              isOnline 
                ? 'bg-green-500/5 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' 
                : 'bg-red-500/5 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isOnline ? t.onlineMode : t.offlineMode}</span>
            </div>

            {/* International Country & Currency Selector Pill (Flag & Currency only) */}
            <button
              onClick={() => setIsCountryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37]/10 to-[#8B0000]/10 dark:from-[#D4AF37]/15 dark:to-[#8B0000]/15 text-xs text-black dark:text-white hover:border-[#D4AF37] hover:scale-105 transition duration-150 cursor-pointer font-bold shadow-sm shrink-0 whitespace-nowrap"
              title={language === 'ar' ? 'تغيير الدولة والعملة وأرقام الطوارئ' : 'Change Country, Currency & Emergency Info'}
            >
              <span className="text-base leading-none">{userCountry?.flag || '🇪🇬'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4AF37] text-black font-extrabold">{userCountry?.currencyCode || 'EGP'}</span>
            </button>

            {/* Language switch */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer font-semibold shadow-sm dark:shadow-none shrink-0 whitespace-nowrap"
              title={language === 'ar' ? 'English' : 'تغيير اللغة للعربية'}
            >
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            {/* Theme Toggle Button List (Theme switcher) */}
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-0.5 shrink-0 whitespace-nowrap">
              {(['dark', 'light', 'system'] as const).map((tMode) => (
                <button
                  key={tMode}
                  onClick={() => setTheme(tMode)}
                  className={`p-1.5 rounded-md transition cursor-pointer ${
                    theme === tMode 
                      ? 'bg-[#8B0000] text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                  title={tMode === 'dark' ? t.themeDark : tMode === 'light' ? t.themeLight : t.themeSystem}
                >
                  {tMode === 'dark' && <Moon className="w-4 h-4" />}
                  {tMode === 'light' && <Sun className="w-4 h-4" />}
                  {tMode === 'system' && <Tv className="w-4 h-4" />}
                </button>
              ))}
            </div>

          </div>
        </header>

        {/* Tab Navigation Menu (Hidden on mobile where bottom nav is active) */}
        <nav className="hidden md:flex justify-start border-b border-zinc-200 dark:border-zinc-900 pb-px max-w-full overflow-x-auto gap-1 scrollbar-none">
          {[
            { id: 'landing', label: t.visitorPortal, icon: Compass },
            { id: 'scanner', label: t.scanner, icon: QrCode },
            { id: 'emergency', label: t.emergency, icon: ShieldAlert },
            { id: 'account', label: currentUser ? (language === 'ar' ? 'حسابي' : 'My Account') : (language === 'ar' ? 'إنشاء حساب' : 'Create Account'), icon: User, hasNotification: !currentUser, isAvatar: !!currentUser },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer shrink-0 relative ${
                  isSelected 
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-zinc-100/60 dark:bg-zinc-950/40 rounded-t-lg' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-800'
                }`}
              >
                <div className="relative flex items-center">
                  {item.isAvatar ? (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.email || currentUser?.fullName || 'user')}`}
                      alt="User Avatar"
                      className="w-5 h-5 rounded-full border border-[#D4AF37] object-cover bg-amber-500/10 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#8B0000]' : 'text-zinc-500'}`} />
                  )}
                  {item.hasNotification && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 animate-pulse shadow">
                      1
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Active Content Module with transitions */}
        <main className="py-1 min-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'landing' && (
              <VisitorLanding 
                key="landing"
                onSwitchToMerchant={() => setActiveTab('dashboard')}
                onOpenScanner={() => setActiveTab('scanner')}
                onSelectScannedQR={(qr) => {
                  setScannedQR(qr);
                  setActiveTab('scanner');
                }}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
                onNavigateToAccount={() => { setAuthInitialMode('signin'); setActiveTab('account'); }}
              />
            )}
            {activeTab === 'account' && (
              <AccountAuth 
                key="account"
                onNavigate={setActiveTab}
                initialMode={authInitialMode}
              />
            )}
            {activeTab === 'dashboard' && (
              <Dashboard 
                key="dashboard"
                onNavigate={setActiveTab}
                onSelectScannedQR={setScannedQR}
              />
            )}
            {activeTab === 'generator' && (
              <QRGenerator key="generator" onNavigate={setActiveTab} />
            )}
            {activeTab === 'scanner' && (
              <QRScanner 
                key="scanner"
                scannedQR={scannedQR}
                onCloseScannedQR={() => setScannedQR(null)}
                onSelectScannedQR={setScannedQR}
              />
            )}
            {activeTab === 'emergency' && (
              <EmergencyControl key="emergency" />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Custom Monospace Status Bar Footer */}
      <footer className="h-10 bg-black border-t border-zinc-900 px-4 sm:px-8 flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-12 mb-16 sm:mb-20 select-none">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span>PLATFORM: VITE/REACT18</span>
          <span>DB: INDEXEDDB</span>
          <span>REGION: ME-CENTRAL-1</span>
        </div>
        <div className="flex gap-4 items-center shrink-0">
          <span className="hidden sm:flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isOnline ? 'SERVER ONLINE' : 'OFFLINE MODE'}
          </span>
          <span className="text-[#D4AF37] font-bold">CITYQR SECURE SHELL</span>
        </div>
      </footer>

      {/* Bottom Navigation Bar (Fixed at bottom for native mobile app experience, hidden on desktop) */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 shadow-2xl px-2 py-1.5 justify-around items-center">
        {[
          { id: 'landing', label: t.visitorPortal, icon: Compass },
          { id: 'scanner', label: t.scanner, icon: QrCode },
          { id: 'emergency', label: t.emergency, icon: ShieldAlert },
          { id: 'account', label: currentUser ? (language === 'ar' ? 'حسابي' : 'My Account') : (language === 'ar' ? 'إنشاء حساب' : 'Create Account'), icon: User, hasNotification: !currentUser, isAvatar: !!currentUser },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition duration-200 cursor-pointer flex-1 max-w-[80px] relative ${
                isSelected 
                  ? 'text-[#D4AF37] font-extrabold' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all relative ${
                isSelected 
                  ? 'bg-[#8B0000]/15 dark:bg-[#D4AF37]/15 scale-110 shadow-sm' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}>
                {item.isAvatar ? (
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.email || currentUser?.fullName || 'user')}`}
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full border border-[#D4AF37] object-cover bg-amber-500/10 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#8B0000] dark:text-[#D4AF37]' : 'text-zinc-500'}`} />
                )}
                {item.hasNotification && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900 animate-pulse shadow">
                    1
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none truncate max-w-full font-bold">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* PWA Custom Instructions Modal */}
      <AnimatePresence>
        {isInstallModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-[#D4AF37]/30 bg-white dark:bg-zinc-950 p-6 shadow-2xl text-zinc-950 dark:text-zinc-100 z-10"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                  <h3 className="text-base font-black tracking-tight text-zinc-900 dark:text-[#D4AF37]">
                    {language === 'ar' ? 'تثبيت التطبيق على جوالك' : 'Install App on Your Phone'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsInstallModalOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 text-xs">
                {/* Visual App Icon Showcase */}
                <div className="flex flex-col items-center justify-center py-4 px-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900/80 text-center gap-2">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-xl shadow-black/40">
                    <img 
                      src="/app_icon-512.png" 
                      alt="CityQR App Icon" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-[#D4AF37]">CityQR</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{language === 'ar' ? 'منصة الاستجابة السريعة للمدن الذكية' : 'Smart City QR Platform'}</span>
                </div>

                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {language === 'ar' 
                    ? 'قم بتثبيت تطبيق CityQR على شاشتك الرئيسية للوصول السريع، التصفح بملء الشاشة، والقدرة على العمل تماماً بدون اتصال بالإنترنت (Offline Mode)!' 
                    : 'Install CityQR on your home screen for rapid access, full-screen display, and offline-ready operations!'}
                </p>

                {/* Platform Selection */}
                <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-100 dark:border-zinc-900 py-3 my-1">
                  <div className="p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-center space-y-0.5">
                    <span className="block font-bold text-zinc-800 dark:text-white text-xs">Apple iOS</span>
                    <span className="block text-[10px] text-zinc-400">{language === 'ar' ? 'أجهزة آيفون / آيباد' : 'iPhone / iPad'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-center space-y-0.5">
                    <span className="block font-bold text-zinc-800 dark:text-white text-xs">Android / Chrome</span>
                    <span className="block text-[10px] text-zinc-400">{language === 'ar' ? 'جالكسي، شاومي وغيرهم' : 'Samsung, Pixel, etc.'}</span>
                  </div>
                </div>

                {/* Steps Section */}
                <div className="space-y-3 pt-1">
                  <span className="block font-bold text-xs text-zinc-800 dark:text-zinc-200">
                    {language === 'ar' ? 'طريقة التثبيت:' : 'Installation Instructions:'}
                  </span>

                  {/* iOS Steps */}
                  <div className="space-y-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <span className="block font-bold text-amber-600 dark:text-[#D4AF37] text-[11px] mb-1">
                      🍎 {language === 'ar' ? 'لأجهزة iPhone و iPad (متصفح Safari):' : 'For iPhone & iPad (Safari Browser):'}
                    </span>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-300">
                      <li>
                        {language === 'ar' ? 'تأكد من فتح الرابط في متصفح ' : 'Open this site in '}
                        <span className="font-bold">Safari</span>
                      </li>
                      <li>
                        {language === 'ar' ? 'اضغط على زر المشاركة ' : 'Tap the Share button '}
                        <span className="inline-flex items-center justify-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">📤</span>
                        {language === 'ar' ? ' في الأسفل.' : ' in the menu bar.'}
                      </li>
                      <li>
                        {language === 'ar' ? 'اختر ' : 'Select '}
                        <span className="font-bold text-zinc-800 dark:text-white">"{language === 'ar' ? 'إضافة إلى الشاشة الرئيسية' : 'Add to Home Screen'}"</span>
                      </li>
                    </ol>
                  </div>

                  {/* Android / Desktop Steps */}
                  <div className="space-y-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <span className="block font-bold text-blue-600 dark:text-blue-400 text-[11px] mb-1">
                      🤖 {language === 'ar' ? 'لأجهزة Android ومتصفح Chrome:' : 'For Android & Chrome Browser:'}
                    </span>
                    <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-300">
                      <li>
                        {language === 'ar' ? 'اضغط على زر ' : 'Click '}
                        <span className="font-bold">"{language === 'ar' ? 'تثبيت التطبيق الآن' : 'Install Now'}"</span>
                        {language === 'ar' ? ' بالأسفل إذا كان نشطاً.' : ' below if it is active.'}
                      </li>
                      <li>
                        {language === 'ar' ? 'أو اضغط على زر النقاط الثلاث ' : 'Or click the three dots '}
                        <span className="font-bold">⋮</span>
                        {language === 'ar' ? ' في أعلى المتصفح.' : ' menu in the top corner.'}
                      </li>
                      <li>
                        {language === 'ar' ? 'اختر ' : 'Select '}
                        <span className="font-bold text-zinc-800 dark:text-white">"{language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}"</span>
                        {language === 'ar' ? ' أو ' : ' or '}
                        <span className="font-bold text-zinc-800 dark:text-white">"{language === 'ar' ? 'إضافة إلى الشاشة الرئيسية' : 'Add to Home Screen'}"</span>
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Direct Action Button (if deferredPrompt is active) */}
                {deferredPrompt ? (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setIsInstallModalOpen(false);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-600 hover:to-[#D4AF37] text-xs font-bold text-black shadow-lg transition duration-200 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تثبيت التطبيق الآن مباشرة' : 'Install App Now'}</span>
                  </button>
                ) : (
                  <div className="w-full mt-4 p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 text-center text-[10px] text-zinc-400 font-mono">
                    💡 {language === 'ar' 
                      ? 'التطبيق متوافق تماماً كـ PWA مع جميع الجوالات وأنظمة التشغيل الحديثة!' 
                      : 'Fully compatible progressive web app. Installable on all modern systems.'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Media Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-[#D4AF37]/30 bg-white dark:bg-zinc-950 p-6 shadow-2xl text-zinc-950 dark:text-zinc-100 z-10"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 animated-glow-line"></div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-base font-black tracking-tight text-zinc-900 dark:text-[#D4AF37]">
                    {language === 'ar' ? 'مشاركة تطبيق CityQR' : 'Share CityQR App'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {language === 'ar' 
                    ? 'شارك منصة CityQR الذكية لمساعدة الآخرين على اكتشاف العروض، الخصومات الحالية والخدمات بسهولة!' 
                    : 'Share the CityQR smart platform to help others easily discover active offers, current discounts, and services!'}
                </p>

                {/* Direct copyable Link Field */}
                <div className="space-y-1.5">
                  <span className="block font-bold text-zinc-700 dark:text-zinc-300">
                    {language === 'ar' ? 'رابط المشاركة:' : 'Share URL Link:'}
                  </span>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-transparent px-2 font-mono text-zinc-700 dark:text-zinc-300 select-all outline-none text-[11px]"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-amber-600 text-black text-[11px] font-bold transition duration-150 cursor-pointer shadow"
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

                {/* Social media sharing channels grid */}
                <div className="space-y-2 pt-1">
                  <span className="block font-bold text-zinc-700 dark:text-zinc-300">
                    {language === 'ar' ? 'انقر للمشاركة مباشرة عبر وسائل التواصل:' : 'Click to share directly on social media:'}
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        getGeneralShareText(true)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-600 dark:text-green-400 font-bold transition duration-150"
                    >
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                    </a>

                    {/* Telegram */}
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
                        getGeneralShareText(false)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold transition duration-150"
                    >
                      <Send className="w-4 h-4 text-sky-500" />
                      <span>{language === 'ar' ? 'تليجرام' : 'Telegram'}</span>
                    </a>

                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-600/20 bg-blue-600/5 hover:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold transition duration-150"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>{language === 'ar' ? 'فيسبوك' : 'Facebook'}</span>
                    </a>

                    {/* Twitter/X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        getGeneralShareText(false)
                      )}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-500/20 bg-zinc-500/5 hover:bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 font-bold transition duration-150"
                    >
                      <Twitter className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <span>{language === 'ar' ? 'إكس (تويتر)' : 'X / Twitter'}</span>
                    </a>

                    {/* Email */}
                    <a
                      href={`mailto:?subject=${encodeURIComponent(
                        language === 'ar' ? 'منصة CityQR الذكية' : 'CityQR Smart Platform'
                      )}&body=${encodeURIComponent(
                        getGeneralShareText(true)
                      )}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-bold transition duration-150 col-span-2 justify-center"
                    >
                      <Mail className="w-4 h-4 text-red-500" />
                      <span>{language === 'ar' ? 'المشاركة عبر البريد الإلكتروني' : 'Share via Email'}</span>
                    </a>
                  </div>
                </div>

                {/* Web Share API Native trigger if supported */}
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: language === 'ar' ? 'منصة CityQR الذكية' : 'CityQR Smart Platform',
                          text: getGeneralShareText(false),
                          url: shareUrl
                        });
                      } catch (err) {
                        console.log('Error sharing via Web Share API', err);
                      }
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#D4AF37] text-xs font-bold text-white shadow-lg hover:brightness-110 transition duration-200 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{language === 'ar' ? 'مشاركة عبر تطبيقات النظام المدمجة' : 'Share via System Dialog'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* International Country & Currency Selection Modal */}
      <AnimatePresence>
        {isCountryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl border border-[#D4AF37]/30 shadow-2xl p-6 md:p-8 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Top Banner Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 animated-glow-line" />

              {/* Close Button */}
              <button
                onClick={() => setIsCountryModalOpen(false)}
                className="absolute top-5 right-5 md:right-7 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-2xl">
                  🌍
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                    {language === 'ar' ? 'اختيار الدولة والعملة وأرقام الطوارئ' : 'Select Country, Currency & Emergency Info'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {language === 'ar' ? 'تطبيق CityQR يتكيف تلقائياً مع عملة بلدك وأرقام الطوارئ المحلية أينما كنت حول العالم' : 'CityQR automatically adapts to your local currency and emergency numbers anywhere around the globe'}
                  </p>
                </div>
              </div>

              {/* Current Selected Country Info Card */}
              {userCountry && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/15 to-[#8B0000]/10 border border-[#D4AF37]/40 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{userCountry.flag}</span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                        {language === 'ar' ? 'الوجهة الحالية المختارة' : 'Currently Selected Destination'}
                      </span>
                      <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                        {language === 'ar' ? userCountry.nameAr : userCountry.nameEn} ({userCountry.code})
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mt-1">
                        {language === 'ar' ? userCountry.touristTipAr : userCountry.touristTipEn}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-center">
                      <span className="block text-[10px] text-zinc-400">{language === 'ar' ? 'العملة الرسمية' : 'Official Currency'}</span>
                      <span className="font-bold text-xs text-[#D4AF37]">{userCountry.currencyCode} ({userCountry.currencySymbol})</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-center">
                      <span className="block text-[10px] text-zinc-400">{language === 'ar' ? 'شرطة / إسعاف' : 'Police / Ambulance'}</span>
                      <span className="font-bold text-xs text-red-500 font-mono">{userCountry.policeNumber} / {userCountry.ambulanceNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of Countries */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {WORLD_COUNTRIES.map((country) => {
                  const isSelected = userCountry?.code === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => {
                        setUserCountry(country);
                        setIsCountryModalOpen(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-start transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#8B0000] text-white border-[#D4AF37] shadow-lg scale-[1.02]'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <span className="text-3xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm truncate">
                            {language === 'ar' ? country.nameAr : country.nameEn}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px] opacity-80">
                          <span>{country.currencyCode} ({country.currencySymbol})</span>
                          <span className="font-mono text-red-400 dark:text-red-300">🆘 {country.policeNumber}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsCountryModalOpen(false)}
                  className="px-6 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-white font-bold text-xs hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔒 Visitor Alert Modal for Admin Messaging */}
      <AnimatePresence>
        {isVisitorAlertOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsVisitorAlertOpen(false)}>
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
                  💡 {language === 'ar' ? 'تنبيه الزائر - مراسلة التطبيق' : 'Visitor Alert - Contact App Feature'}
                </span>
                <h3 className="text-lg font-black text-white">
                  {language === 'ar' 
                    ? 'خاصية مراسلة التطبيق'
                    : 'Contact App Feature'}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed px-2">
                  {language === 'ar'
                    ? 'أنت تتصفح حالياً كـ (زائر). لتتمكن من إرسال رسائل أو استفسارات أو مقترحات مباشرة عبر (مراسلة التطبيق) والحصول على رقم مرجعي وتاريخ لمتابعة الرد، يرجى تسجيل الدخول بحساب مستخدم مسجل مجاناً.'
                    : 'You are currently browsing as a Visitor. To send messages, inquiries, or suggestions directly via Contact App and receive a reference tracking number, please sign in to a free User Account.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVisitorAlertOpen(false);
                    setActiveTab('account');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تسجيل دخول كمستخدم الآن' : 'Login as User Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVisitorAlertOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer shrink-0"
                >
                  {language === 'ar' ? 'متابعة كزائر' : 'Continue as Visitor'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔔 Notifications Center Modal (Root level for perfect viewport centering) */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-[#D4AF37]/80 rounded-3xl shadow-[0_0_40px_rgba(212,175,55,0.2)] p-5 z-50 text-start overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#8B0000]/10 text-[#8B0000] dark:text-[#D4AF37]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="font-black text-sm sm:text-base text-zinc-900 dark:text-white">
                    {language === 'ar' ? 'التنبيهات والإشعارات' : 'Notifications'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#8B0000]/15 text-[#8B0000] dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    {language === 'ar' ? '3 جديدة' : '3 New'}
                  </span>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 hover:border-[#D4AF37]/60 transition shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        {language === 'ar' ? n.titleAr : n.titleEn}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono whitespace-nowrap">
                        {language === 'ar' ? n.timeAr : n.timeEn}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {language === 'ar' ? n.descAr : n.descEn}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs hover:bg-amber-400 transition cursor-pointer shadow-md"
                >
                  {language === 'ar' ? 'إغلاق الإشعارات' : 'Close Notifications'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚡ Quick Access Center Modal (Root level for perfect viewport centering) */}
      <AnimatePresence>
        {isQuickMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setIsQuickMenuOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-[#D4AF37]/80 rounded-3xl shadow-[0_0_40px_rgba(212,175,55,0.2)] p-5 z-50 text-start space-y-4 overflow-y-auto max-h-[85vh] flex flex-col"
            >
              {/* Title Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-black text-xs text-zinc-900 dark:text-white">
                    {language === 'ar' ? 'القائمة السريعة: الدولة والطوارئ' : 'Quick Access: Country & Emergency'}
                  </span>
                </div>
                <button
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Country Selection (Egypt & Others) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'الدولة المختارة (جمهورية مصر)' : 'Country Selection'}</span>
                </label>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{userCountry?.flag || '🇪🇬'}</span>
                    <div>
                      <span className="block font-extrabold text-xs text-zinc-900 dark:text-white">
                        {language === 'ar' ? userCountry?.nameAr || 'جمهورية مصر العربية' : userCountry?.nameEn || 'Egypt'}
                      </span>
                      <span className="block text-[10px] text-[#D4AF37] font-mono">
                        {userCountry?.currencyCode || 'EGP'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const eg = WORLD_COUNTRIES.find(c => c.code === 'EG');
                        if (eg) setUserCountry(eg);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold transition cursor-pointer"
                    >
                      {language === 'ar' ? 'مصر 🇪🇬' : 'Egypt 🇪🇬'}
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        setIsCountryModalOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-white text-[10px] font-bold transition cursor-pointer"
                    >
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Change Currency to Dollar & Currencies */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span>{language === 'ar' ? 'تغيير العملة السريعة' : 'Quick Currency Switch'}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      const us = WORLD_COUNTRIES.find(c => c.code === 'US');
                      if (us) setUserCountry(us);
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      userCountry?.currencyCode === 'USD'
                        ? 'bg-green-500/20 border-green-500 text-green-400 font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/50 hover:border-green-500/50 text-xs text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="block text-xs font-black text-green-500">$ USD</span>
                    <span className="text-[9px] text-zinc-400">{language === 'ar' ? 'الدولار' : 'Dollar'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const eg = WORLD_COUNTRIES.find(c => c.code === 'EG');
                      if (eg) setUserCountry(eg);
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      userCountry?.currencyCode === 'EGP'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/50 hover:border-[#D4AF37]/50 text-xs text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="block text-xs font-black text-[#D4AF37]">ج.م EGP</span>
                    <span className="text-[9px] text-zinc-400">{language === 'ar' ? 'الجنيه' : 'Pound'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const sa = WORLD_COUNTRIES.find(c => c.code === 'SA');
                      if (sa) setUserCountry(sa);
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      userCountry?.currencyCode === 'SAR'
                        ? 'bg-[#8B0000]/20 border-[#8B0000] text-red-400 font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/50 hover:border-[#8B0000]/50 text-xs text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="block text-xs font-black text-red-400">ر.س SAR</span>
                    <span className="text-[9px] text-zinc-400">{language === 'ar' ? 'الريال' : 'Riyal'}</span>
                  </button>
                </div>
              </div>

              {/* 3. Police & Ambulance Emergency */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-red-500" />
                  <span>{language === 'ar' ? 'أرقام الشرطة والإسعاف (طوارئ سريعة)' : 'Police & Ambulance (Emergency)'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${userCountry?.policeNumber || '122'}`}
                    className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-between text-red-400 font-bold transition group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-red-500 animate-pulse" />
                      <span className="text-xs">{language === 'ar' ? 'الشرطة' : 'Police'}</span>
                    </div>
                    <span className="font-mono text-sm font-black bg-red-500/20 px-2 py-0.5 rounded-md text-white group-hover:scale-105 transition">
                      {userCountry?.policeNumber || '122'}
                    </span>
                  </a>
                  <a
                    href={`tel:${userCountry?.ambulanceNumber || '123'}`}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center justify-between text-rose-400 font-bold transition group"
                  >
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span className="text-xs">{language === 'ar' ? 'الإسعاف' : 'Ambulance'}</span>
                    </div>
                    <span className="font-mono text-sm font-black bg-rose-500/20 px-2 py-0.5 rounded-md text-white group-hover:scale-105 transition">
                      {userCountry?.ambulanceNumber || '123'}
                    </span>
                  </a>
                </div>
              </div>

              {/* 4. Active Interface (Language & Theme) */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Tv className="w-3 h-3 text-[#D4AF37]" />
                  <span>{language === 'ar' ? 'الواجهة النشطة (اللغة والمظهر)' : 'Active Interface (Lang & Theme)'}</span>
                </label>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                    className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{language === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
                  </button>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
                    className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{theme === 'dark' ? (language === 'ar' ? 'ليلي Dark' : 'Dark') : (language === 'ar' ? 'نهاري Light' : 'Light')}</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs hover:bg-amber-400 transition cursor-pointer shadow-md"
                >
                  {language === 'ar' ? 'إغلاق القائمة' : 'Close Menu'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✉️ Send Message to App Admin Modal */}
      <AnimatePresence>
        {isAdminMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdminMessageModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-[#D4AF37]/80 rounded-3xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.2)] text-start space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Mail className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {language === 'ar' ? 'يمكنك إرسال رسالة عبر (مراسلة التطبيق)' : 'Send Message via Contact App'}
                    </h3>
                    <span className="text-[11px] text-zinc-400 block font-normal">
                      {language === 'ar' ? 'استفسار، مقترح، شكوى أو طلب دعم فني مباشر' : 'Direct inquiry, suggestion, complaint or tech support'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminMessageModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View switch: New Message vs My Messages History */}
              <div className="flex border border-zinc-800 rounded-xl p-1 bg-zinc-950/80">
                <button
                  type="button"
                  onClick={() => setAdminMessageView('new')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminMessageView === 'new'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إرسال رسالة جديدة' : 'New Message'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMessageView('history')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminMessageView === 'history'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? `سجل رسائلي (${getMySentMessages().length})` : `My Messages (${getMySentMessages().length})`}</span>
                </button>
              </div>

              {adminMessageView === 'history' ? (
                <div className="space-y-3 py-2">
                  {getMySentMessages().length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs font-mono space-y-2 border border-dashed border-zinc-800 rounded-2xl">
                      <MessageCircle className="w-8 h-8 mx-auto opacity-40" />
                      <p>{language === 'ar' ? 'لم تقم بإرسال أي رسائل عبر (مراسلة التطبيق) بعد.' : 'You have not sent any messages via Contact App yet.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                      {getMySentMessages().map((msg: any) => (
                        <div key={msg.id} className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 font-mono text-xs">
                            <span className="text-amber-400 font-bold">{msg.refNumber}</span>
                            <span className="text-zinc-400 text-[10px]">{msg.date}</span>
                          </div>
                          <p className="text-xs text-zinc-200 leading-relaxed font-sans">{msg.content}</p>
                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            <span className="text-zinc-400">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                              {language === 'ar' ? '⏳ قيد المراجعة من الإدارة' : '⏳ Under Review by Admin'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminMessageView('new')}
                      className="px-5 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/30 text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'ar' ? '+ كتابة رسالة جديدة' : '+ Compose New Message'}
                    </button>
                  </div>
                </div>
              ) : adminMessageSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 text-green-400 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">
                      {language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Message Sent Successfully!'}
                    </h4>
                    <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                      {language === 'ar' 
                        ? 'سيقوم فريق إدارة التطبيق بمراجعة رسالتك والرد عليك قريباً. يرجى الاحتفاظ بالرقم المرجعي وتاريخ الرسالة للمتابعة.'
                        : 'Our administration team will review your message and reply soon. Please keep your reference number for tracking.'}
                    </p>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 max-w-sm mx-auto text-start space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center pb-1.5 border-b border-zinc-800">
                      <span className="text-zinc-400 font-sans font-bold">{language === 'ar' ? '📌 الرقم المرجعي:' : '📌 Reference No:'}</span>
                      <span className="text-amber-400 font-bold">{adminMessageSuccess.refNum}</span>
                    </div>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-zinc-400 font-sans font-bold">{language === 'ar' ? '🕒 تاريخ الرسالة:' : '🕒 Date & Time:'}</span>
                      <span className="text-zinc-300 text-[11px]">{adminMessageSuccess.dateStr}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminMessageView('history')}
                      className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition cursor-pointer"
                    >
                      {language === 'ar' ? '📋 عرض سجل رسائلي' : '📋 View My Messages'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdminMessageModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black font-black text-xs transition shadow-lg cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{language === 'ar' ? 'حسناً، إغلاق' : 'OK, Close'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendAdminMessage} className="space-y-3.5">
                  {/* Reference Number & Timestamp Display */}
                  <div className="bg-zinc-900/90 border border-amber-500/30 rounded-2xl p-3 space-y-2 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                      <span className="text-zinc-300 font-sans font-bold flex items-center gap-1">
                        <span>📌 {language === 'ar' ? 'الرقم المرجعي للرسالة:' : 'Reference Number:'}</span>
                      </span>
                      <span className="text-amber-400 font-extrabold text-sm tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{currentMessageRef}</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-zinc-300 font-sans font-bold flex items-center gap-1">
                        <span>🕒 {language === 'ar' ? 'تاريخ الرسالة:' : 'Message Date:'}</span>
                      </span>
                      <span className="text-zinc-200 text-[11px]">{currentMessageDate}</span>
                    </div>
                  </div>

                  {/* Explanatory Note exactly as requested */}
                  <p className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 leading-normal">
                    💡 {language === 'ar' 
                      ? 'حتى تستطيع إدارة التطبيق مراجعة تاريخ الرسالة من المرسل والرقم المرجعي للرسالة ومتابعة الرد الدقيق، يرجى الاحتفاظ بهذه البيانات.'
                      : 'So that the app administration can review the message date from the sender and the message reference number for accurate follow-up.'}
                  </p>

                  {/* Monthly Limit Badge */}
                  <div className="flex items-center justify-between bg-[#8B0000]/15 border border-[#8B0000]/40 rounded-xl px-3 py-2 text-xs text-red-300 font-bold">
                    <span>⚠️ {language === 'ar' ? 'مسموح لك بأربع رسائل في الشهر فقط' : 'You are allowed only 4 messages per month'}</span>
                    <span className="font-mono bg-red-500/30 px-2 py-0.5 rounded text-[11px] text-white">
                      {language === 'ar' ? `${getMonthlySentMessagesCount()} من 4` : `${getMonthlySentMessagesCount()} of 4`}
                    </span>
                  </div>

                  {/* Error display if any */}
                  {adminMessageError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                      <Shield className="w-4 h-4 shrink-0" />
                      <span>{adminMessageError}</span>
                    </div>
                  )}

                  {/* Message Input Textarea (Max 500 characters) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                      <span>{language === 'ar' ? 'نص الرسالة (فيما لا يزيد عن 500 حرف):' : 'Message content (max 500 chars):'}</span>
                      <span className={`font-mono text-[11px] ${adminMessageText.length > 450 ? 'text-rose-400 font-bold' : 'text-zinc-400'}`}>
                        {adminMessageText.length} / 500
                      </span>
                    </label>
                    <textarea
                      value={adminMessageText}
                      onChange={(e) => setAdminMessageText(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder={language === 'ar' ? 'اكتب رسالتك هنا بوضوح (استفسار، شكوى، مقترح، أو طلب مساعدة)...' : 'Write your message clearly here (inquiry, complaint, suggestion, or assistance request)...'}
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-3.5 text-white text-xs leading-relaxed outline-none focus:border-amber-500 transition resize-none placeholder-zinc-500 font-sans"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAdminMessageModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition cursor-pointer"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={getMonthlySentMessagesCount() >= 4}
                      className={`px-6 py-2.5 rounded-xl font-black text-xs transition shadow-lg flex items-center gap-2 ${
                        getMonthlySentMessagesCount() >= 4
                          ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black cursor-pointer'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'إرسال الرسالة الآن' : 'Send Message Now'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CityQRAppContent />
    </AppProvider>
  );
}
