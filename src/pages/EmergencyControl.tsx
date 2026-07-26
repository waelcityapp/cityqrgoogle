import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { translations } from '../services/translations';
import { ShieldAlert, RefreshCw, Save, CheckCircle, Smartphone, Bell, Send, Users, Sparkles, Award, Crown, Check, AlertTriangle, Layers, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export const EmergencyControl: React.FC = () => {
  const { language, emergencyConfig, updateEmergencyConfig } = useApp();
  const t = translations[language];

  // Forms State
  const [maintenanceMode, setMaintenanceMode] = useState(emergencyConfig.maintenanceMode);
  const [forceUpdate, setForceUpdate] = useState(emergencyConfig.forceUpdate);
  const [latestAppVersion, setLatestAppVersion] = useState(emergencyConfig.latestAppVersion);
  
  const [maintenanceAr, setMaintenanceAr] = useState(emergencyConfig.maintenanceMessage.ar);
  const [maintenanceEn, setMaintenanceEn] = useState(emergencyConfig.maintenanceMessage.en);
  
  const [updateAr, setUpdateAr] = useState(emergencyConfig.updateMessage.ar);
  const [updateEn, setUpdateEn] = useState(emergencyConfig.updateMessage.en);

  const [saved, setSaved] = useState(false);

  // Targeted Notification Broadcast State
  const [targetTiers, setTargetTiers] = useState<string[]>(['vip_deal_hunter', 'first_class']);
  const [notifTitleAr, setNotifTitleAr] = useState('');
  const [notifTitleEn, setNotifTitleEn] = useState('');
  const [notifBodyAr, setNotifBodyAr] = useState('');
  const [notifBodyEn, setNotifBodyEn] = useState('');
  const [notifPriority, setNotifPriority] = useState<'normal' | 'golden' | 'urgent'>('golden');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cityqr_broadcast_notifications');
      return saved ? JSON.parse(saved) : [
        {
          id: 101,
          titleAr: '🔥 خصم 50% حصري لأعضاء VIP والدرجة الأولى في مطعم هافور!',
          titleEn: '🔥 Exclusive 50% VIP & First Class Discount at Havur Restaurant!',
          descAr: 'تم تفعيل كود خصم خاص لأعضاء باقات النخبة المشتركين. استمتع بوجبتك الآن!',
          descEn: 'Special promo code activated for subscribed elite tier members. Enjoy your meal now!',
          timeAr: 'منذ ساعتين',
          timeEn: '2 hours ago',
          targetTiers: ['vip_deal_hunter', 'first_class'],
          priority: 'golden',
          recipientCount: 1420
        }
      ];
    } catch (e) { return []; }
  });

  const toggleTier = (tierId: string) => {
    if (tierId === 'all') {
      if (targetTiers.includes('all')) {
        setTargetTiers([]);
      } else {
        setTargetTiers(['all']);
      }
      return;
    }
    let newTiers = targetTiers.filter(t => t !== 'all');
    if (newTiers.includes(tierId)) {
      newTiers = newTiers.filter(t => t !== tierId);
    } else {
      newTiers = [...newTiers, tierId];
    }
    setTargetTiers(newTiers);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitleAr.trim() || !notifBodyAr.trim() || targetTiers.length === 0) return;

    const recipientCount = targetTiers.includes('all') ? 4850 : targetTiers.reduce((acc, t) => {
      if (t === 'business_class') return acc + 320;
      if (t === 'first_class') return acc + 540;
      if (t === 'vip_deal_hunter') return acc + 880;
      if (t === 'merchant') return acc + 410;
      return acc + 1200;
    }, 0);

    const newNotif = {
      id: Date.now(),
      titleAr: notifTitleAr.trim(),
      titleEn: notifTitleEn.trim() || notifTitleAr.trim(),
      descAr: notifBodyAr.trim(),
      descEn: notifBodyEn.trim() || notifBodyAr.trim(),
      timeAr: 'الآن',
      timeEn: 'Just now',
      targetTiers: targetTiers.includes('all') ? ['all'] : [...targetTiers],
      priority: notifPriority,
      recipientCount
    };

    const updated = [newNotif, ...broadcastHistory];
    setBroadcastHistory(updated);
    localStorage.setItem('cityqr_broadcast_notifications', JSON.stringify(updated));

    try {
      const existingAppNotifs = JSON.parse(localStorage.getItem('cityqr_app_notifications') || '[]');
      existingAppNotifs.unshift(newNotif);
      localStorage.setItem('cityqr_app_notifications', JSON.stringify(existingAppNotifs));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    setNotifTitleAr('');
    setNotifTitleEn('');
    setNotifBodyAr('');
    setNotifBodyEn('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newConfig = {
      maintenanceMode,
      forceUpdate,
      currentAppVersion: emergencyConfig.currentAppVersion,
      latestAppVersion,
      maintenanceMessage: {
        ar: maintenanceAr,
        en: maintenanceEn
      },
      updateMessage: {
        ar: updateAr,
        en: updateEn
      }
    };

    await updateEmergencyConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 relative overflow-hidden">
        {/* Top colored line indicator */}
        <div className="absolute top-0 left-0 w-full h-0.5 animated-glow-line"></div>
        
        <div className="flex items-start gap-4 mb-6 mt-2">
          <div className="p-3 rounded-lg bg-[#8B0000]/10 text-red-500 border border-[#8B0000]/20">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter text-[#D4AF37]">
              {t.maintenancePanelTitle}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {t.maintenancePanelDesc}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs md:text-sm">
          {/* Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Maintenance Toggle */}
            <div className={`p-4 rounded-xl border transition ${
              maintenanceMode ? 'border-[#8B0000]/50 bg-[#8B0000]/5' : 'border-zinc-800 bg-zinc-950/30'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#8B0000] accent-[#8B0000] focus:ring-[#8B0000] cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="font-bold text-white block">{t.maintenanceToggle}</span>
                  <span className="text-[10px] text-zinc-500 block leading-relaxed">
                    {language === 'ar' 
                      ? 'سيمنع هذا الخيار جميع المستخدمين العاديين من تصفح المنصة وعرض صفحة مغلقة للصيانة.' 
                      : 'This option blocks all regular users from viewing the platform and shows a locked maintenance page.'}
                  </span>
                </div>
              </label>
            </div>

            {/* Force Update Toggle */}
            <div className={`p-4 rounded-xl border transition ${
              forceUpdate ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-zinc-800 bg-zinc-950/30'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={forceUpdate}
                  onChange={(e) => setForceUpdate(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#D4AF37] accent-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                />
                <div className="space-y-1">
                  <span className="font-bold text-white block">{t.forceUpdateToggle}</span>
                  <span className="text-[10px] text-zinc-500 block leading-relaxed">
                    {language === 'ar' 
                      ? 'سيجبر المستخدمين على التحديث في حال كانت نسختهم أقدم من النسخة المسجلة في السيرفر.' 
                      : 'This forces a mandatory update overlay if the user app version is older than the server version.'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Versions setup */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/30 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="block text-zinc-500 font-semibold text-xs flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#8B0000]" />
                {t.appVersionLabel} (Client)
              </span>
              <span className="block text-lg font-bold text-zinc-300 font-mono bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
                {emergencyConfig.currentAppVersion}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-500 font-semibold text-xs flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                {t.latestVersionLabel} (Server Simulation)
              </label>
              <input
                type="text"
                value={latestAppVersion}
                onChange={(e) => setLatestAppVersion(e.target.value)}
                placeholder="e.g. 1.0.1"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white font-mono outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Maintenance Custom Messages */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
              {language === 'ar' ? 'رسالة الصيانة المخصصة' : 'Custom Maintenance Message'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-semibold">باللغة العربية (Arabic)</label>
                <textarea
                  value={maintenanceAr}
                  onChange={(e) => setMaintenanceAr(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5" dir="ltr">
                <label className="block text-zinc-400 font-semibold text-right">English</label>
                <textarea
                  value={maintenanceEn}
                  onChange={(e) => setMaintenanceEn(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Update Custom Messages */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
              {language === 'ar' ? 'رسالة التحديث المخصصة' : 'Custom Update Message'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-semibold">باللغة العربية (Arabic)</label>
                <textarea
                  value={updateAr}
                  onChange={(e) => setUpdateAr(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5" dir="ltr">
                <label className="block text-zinc-400 font-semibold text-right">English</label>
                <textarea
                  value={updateEn}
                  onChange={(e) => setUpdateEn(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t border-zinc-900">
            <button
              type="submit"
              className="flex-1 text-center py-3 rounded-lg bg-gradient-to-r from-[#8B0000] to-red-700 hover:from-red-700 hover:to-[#8B0000] text-sm font-semibold text-white shadow-lg transition duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t.saveConfigBtn}
            </button>
          </div>
        </form>
      </div>

      {/* Success alert */}
      {saved && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2 justify-center">
          <CheckCircle className="w-5 h-5 animate-bounce" />
          <span>{t.saveSuccess}</span>
        </div>
      )}

      {/* 🚀 TARGETED NOTIFICATION BROADCAST SYSTEM (نظام بث الإشعارات الموجه حسب فئات المستخدمين) */}
      <div className="mt-8 bg-zinc-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-950 shadow-lg shrink-0">
              <Send className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {language === 'ar' ? 'نظام بث الإشعارات الموجه حسب الفئات' : 'Targeted Notification Broadcast Engine'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  {language === 'ar' ? 'بث مباشر 🚀' : 'LIVE BROADCAST'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {language === 'ar'
                  ? 'اختر بدقة فئات ومستويات المستخدمين الذين سيصلهم هذا الإشعار (مثال: فئة VIP + الدرجة الأولى فقط).'
                  : 'Select specific user tiers to receive this notification (e.g., VIP + First Class only).'}
              </p>
            </div>
          </div>
        </div>

        {/* STEP 1: TARGET USER TIERS SELECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? '1. حدد الفئات المستهدفة لاستلام الإشعار:' : '1. Select Target Recipient Tiers:'}</span>
            </label>
            <span className="text-xs font-mono text-amber-300 bg-zinc-950 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
              👥 {language === 'ar' ? '~' : '~'}{targetTiers.includes('all') ? 4850 : targetTiers.reduce((acc, t) => t === 'business_class' ? acc + 320 : t === 'first_class' ? acc + 540 : t === 'vip_deal_hunter' ? acc + 880 : t === 'merchant' ? acc + 410 : acc + 1200, 0).toLocaleString()} {language === 'ar' ? 'مستخدم مستهدف' : 'Target Recipients'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { id: 'all', labelAr: '🌐 جميع المستخدمين', labelEn: '🌐 All Users', color: 'border-blue-500 bg-blue-500/15 text-blue-300' },
              { id: 'vip_deal_hunter', labelAr: '✨ عضوية VIP', labelEn: '✨ VIP Member', color: 'border-amber-500 bg-amber-500/15 text-amber-300' },
              { id: 'first_class', labelAr: '🏆 الدرجة الأولى', labelEn: '🏆 First Class', color: 'border-purple-500 bg-purple-500/15 text-purple-300' },
              { id: 'business_class', labelAr: '👑 رجال الأعمال', labelEn: '👑 Business Class', color: 'border-emerald-500 bg-emerald-500/15 text-emerald-300' },
              { id: 'merchant', labelAr: '🏪 التجار والشركاء', labelEn: '🏪 Merchants', color: 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' },
              { id: 'citizen', labelAr: '⭐ مستخدم مميز', labelEn: '⭐ Premium User', color: 'border-cyan-500 bg-cyan-500/15 text-cyan-300' }
            ].map((tier) => {
              const isSelected = tier.id === 'all' ? targetTiers.includes('all') : targetTiers.includes(tier.id);
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => toggleTier(tier.id)}
                  className={`p-3 rounded-xl border-2 text-xs font-black transition flex items-center justify-between gap-1.5 cursor-pointer ${
                    isSelected ? `${tier.color} shadow-md scale-[1.02]` : 'border-zinc-800 bg-zinc-950/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <span className="truncate">{language === 'ar' ? tier.labelAr : tier.labelEn}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-white bg-white text-zinc-950' : 'border-zinc-700'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: NOTIFICATION CONTENT FORM */}
        <form onSubmit={handleSendBroadcast} className="space-y-4 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? '2. صياغة عنوان ونص الإشعار الترويجي أو التنبيهي:' : '2. Compose Notification Title & Body:'}</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'normal', label: language === 'ar' ? 'عادي 🔔' : 'Normal 🔔' },
                { id: 'golden', label: language === 'ar' ? 'عرض ذهبي ✨' : 'Golden ✨' },
                { id: 'urgent', label: language === 'ar' ? 'تنبيه هام 🚨' : 'Urgent 🚨' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setNotifPriority(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition border ${
                    notifPriority === p.id ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <input
                type="text"
                value={notifTitleAr}
                onChange={(e) => setNotifTitleAr(e.target.value)}
                placeholder={language === 'ar' ? 'عنوان الإشعار (مثال: 🔥 خصم 50% حصري لأعضاء VIP والدرجة الأولى)...' : 'Title in Arabic...'}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
                required
              />
              <textarea
                value={notifBodyAr}
                onChange={(e) => setNotifBodyAr(e.target.value)}
                rows={2}
                placeholder={language === 'ar' ? 'نص الإشعار التفصيلي الموجه للفئات المحددة...' : 'Message body in Arabic...'}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-2" dir="ltr">
              <input
                type="text"
                value={notifTitleEn}
                onChange={(e) => setNotifTitleEn(e.target.value)}
                placeholder="Title in English (e.g. 🔥 50% Exclusive VIP & First Class Discount)..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-xs focus:outline-none focus:border-amber-500 text-left"
              />
              <textarea
                value={notifBodyEn}
                onChange={(e) => setNotifBodyEn(e.target.value)}
                rows={2}
                placeholder="Detailed message body for targeted recipients..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500 text-left"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            {broadcastSuccess ? (
              <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex items-center justify-center gap-2 animate-pulse">
                <CheckCircle className="w-4 h-4" />
                <span>{language === 'ar' ? '🎉 تم بث الإشعار بنجاح إلى جميع المستخدمين في الفئات المحددة!' : '🎉 Targeted notification broadcasted successfully!'}</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!notifTitleAr.trim() || !notifBodyAr.trim() || targetTiers.length === 0}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 hover:brightness-110 text-zinc-950 font-black text-xs shadow-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {language === 'ar'
                    ? `إرسال الإشعار الموجه الآن (~${targetTiers.includes('all') ? 4850 : targetTiers.reduce((acc, t) => t === 'business_class' ? acc + 320 : t === 'first_class' ? acc + 540 : t === 'vip_deal_hunter' ? acc + 880 : t === 'merchant' ? acc + 410 : acc + 1200, 0)} مستخدم)`
                    : `Broadcast Targeted Notification (~${targetTiers.includes('all') ? 4850 : targetTiers.reduce((acc, t) => t === 'business_class' ? acc + 320 : t === 'first_class' ? acc + 540 : t === 'vip_deal_hunter' ? acc + 880 : t === 'merchant' ? acc + 410 : acc + 1200, 0)} users)`}
                </span>
              </button>
            )}
          </div>
        </form>

        {/* STEP 3: RECENT BROADCAST HISTORY TABLE */}
        <div className="space-y-2 pt-4 border-t border-zinc-800/80">
          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>{language === 'ar' ? `سجل الإشعارات الموجهة المرسلة (${broadcastHistory.length}):` : `Broadcast History Log (${broadcastHistory.length}):`}</span>
          </h4>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {broadcastHistory.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-white">{language === 'ar' ? item.titleAr : item.titleEn}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{item.timeAr}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{language === 'ar' ? item.descAr : item.descEn}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-wrap gap-1">
                    {(item.targetTiers || []).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                        {t === 'all' ? (language === 'ar' ? '🌐 جميع الفئات' : '🌐 All Tiers') : t === 'vip_deal_hunter' ? '✨ VIP' : t === 'first_class' ? '🏆 First Class' : t === 'business_class' ? '👑 Business' : t === 'merchant' ? (language === 'ar' ? '🏪 تاجر' : '🏪 Merchant') : t === 'citizen' || t === 'tourist' ? (language === 'ar' ? '⭐ مستخدم مميز' : '⭐ Premium User') : t}
                      </span>
                    ))}
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 font-mono font-black text-[10px] text-zinc-300">
                    👥 ~{(item.recipientCount || 1200).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
