import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { translations } from '../services/translations';
import { ShieldAlert, RefreshCw, Save, CheckCircle, Smartphone } from 'lucide-react';
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#8B0000]"></div>
        
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
    </motion.div>
  );
};
