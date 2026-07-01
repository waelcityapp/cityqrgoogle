import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Theme, EmergencyConfig, QRCodeItem } from '../types';
import { 
  getEmergencyConfigFromDB, 
  updateEmergencyConfigInDB, 
  getQRCodesFromDB, 
  insertQRCodeToDB, 
  incrementQRScanCountInDB,
  isSupabaseConfigured
} from './supabase';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  emergencyConfig: EmergencyConfig;
  updateEmergencyConfig: (config: EmergencyConfig) => Promise<void>;
  qrcodes: QRCodeItem[];
  addQRCode: (item: any) => Promise<QRCodeItem>;
  incrementScans: (qrId: string) => Promise<void>;
  isOnline: boolean;
  supabaseActive: boolean;
  appVersion: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appVersion = '1.0.0'; // Built-in client version

  // 1. Language State
  const [language, setLanguageState] = useState<Language>(() => {
    const localLang = localStorage.getItem('cityqr_language') as Language;
    if (localLang === 'ar' || localLang === 'en') return localLang;
    // Auto detect from browser language
    const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
    return browserLang;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cityqr_language', lang);
  };

  // Sync Language with HTML Attributes
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', language);
    htmlElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  // 2. Theme State
  const [theme, setThemeState] = useState<Theme>(() => {
    const localTheme = localStorage.getItem('cityqr_theme') as Theme;
    return localTheme || 'dark'; // Default to dark per CityQR instructions
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('cityqr_theme', newTheme);
  };

  // Sync Theme with HTML Class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen to system theme changes if theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 3. Online/Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // 4. Emergency Config & QRCodes State
  const [emergencyConfig, setEmergencyConfig] = useState<EmergencyConfig>({
    maintenanceMode: false,
    forceUpdate: false,
    currentAppVersion: appVersion,
    latestAppVersion: appVersion,
    maintenanceMessage: { ar: '', en: '' },
    updateMessage: { ar: '', en: '' }
  });

  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);

  // Fetch initial data
  const loadInitialData = async () => {
    try {
      const emergency = await getEmergencyConfigFromDB();
      setEmergencyConfig(emergency);

      const qrs = await getQRCodesFromDB();
      setQrcodes(qrs);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Actions
  const updateEmergencyConfig = async (newConfig: EmergencyConfig) => {
    await updateEmergencyConfigInDB(newConfig);
    setEmergencyConfig(newConfig);
  };

  const addQRCode = async (item: any) => {
    const created = await insertQRCodeToDB(item);
    setQrcodes((prev) => [created, ...prev]);
    return created;
  };

  const incrementScans = async (qrId: string) => {
    await incrementQRScanCountInDB(qrId);
    setQrcodes((prev) =>
      prev.map((code) =>
        code.id === qrId ? { ...code, totalScans: code.totalScans + 1 } : code
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        emergencyConfig,
        updateEmergencyConfig,
        qrcodes,
        addQRCode,
        incrementScans,
        isOnline,
        supabaseActive: isSupabaseConfigured,
        appVersion
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
