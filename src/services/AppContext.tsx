import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Theme, EmergencyConfig, QRCodeItem, UserProfile } from '../types';
import { 
  getEmergencyConfigFromDB, 
  updateEmergencyConfigInDB, 
  getQRCodesFromDB, 
  insertQRCodeToDB, 
  incrementQRScanCountInDB,
  toggleQRLikeInDB,
  toggleQRFavoriteInDB,
  submitQRRatingInDB,
  isSupabaseConfigured,
  signUpWithSupabase,
  signInWithSupabase,
  signOutFromSupabase,
  getStoredUserProfile
} from './supabase';
import { CountryProfile, detectUserCountry, WORLD_COUNTRIES } from './international';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userCountry: CountryProfile;
  setUserCountry: (country: CountryProfile) => void;
  emergencyConfig: EmergencyConfig;
  updateEmergencyConfig: (config: EmergencyConfig) => Promise<void>;
  qrcodes: QRCodeItem[];
  addQRCode: (item: any) => Promise<QRCodeItem>;
  incrementScans: (qrId: string) => Promise<void>;
  toggleLike: (qrId: string) => Promise<void>;
  toggleFavorite: (qrId: string) => Promise<void>;
  submitRating: (qrId: string, rating: number) => Promise<void>;
  isOnline: boolean;
  supabaseActive: boolean;
  appVersion: string;
  currentUser: UserProfile | null;
  loginUser: (email: string, password: string) => Promise<{ user: UserProfile; error?: string }>;
  registerUser: (email: string, password: string, fullName: string, role: 'user' | 'merchant') => Promise<{ user: UserProfile; error?: string }>;
  logoutUser: () => Promise<void>;
  switchUserRole: (role: 'user' | 'merchant') => void;
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

  // 3.5 International User Country & Currency State
  const [userCountry, setUserCountryState] = useState<CountryProfile>(() => {
    try {
      const savedCode = localStorage.getItem('cityqr_country_code');
      if (savedCode) {
        const found = WORLD_COUNTRIES.find(c => c.code === savedCode);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Could not read saved country', e);
    }
    return detectUserCountry();
  });

  const setUserCountry = (country: CountryProfile) => {
    setUserCountryState(country);
    try {
      localStorage.setItem('cityqr_country_code', country.code);
    } catch (e) {
      console.warn('Could not save country', e);
    }
  };

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

  // 5. User Authentication State & Supabase Integration
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUserProfile());

  const loginUser = async (email: string, password: string) => {
    const result = await signInWithSupabase(email, password);
    if (result.user && !result.error) {
      setCurrentUser(result.user);
    }
    return { user: result.user, error: result.error };
  };

  const registerUser = async (email: string, password: string, fullName: string, role: 'user' | 'merchant') => {
    const result = await signUpWithSupabase(email, password, fullName, role);
    if (result.user && !result.error) {
      setCurrentUser(result.user);
    }
    return { user: result.user, error: result.error };
  };

  const logoutUser = async () => {
    await signOutFromSupabase();
    setCurrentUser(null);
  };

  const switchUserRole = (newRole: 'user' | 'merchant') => {
    if (currentUser) {
      const updated: UserProfile = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      try {
        localStorage.setItem('cityqr_current_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save switched role:', e);
      }
    }
  };

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

  const toggleLike = async (qrId: string) => {
    const userId = currentUser ? currentUser.id : 'guest-user';
    await toggleQRLikeInDB(qrId, userId);
    setQrcodes((prev) =>
      prev.map((code) => {
        if (code.id === qrId) {
          const likedBy = code.likedBy || [];
          const isLiked = likedBy.includes(userId);
          const newLikedBy = isLiked
            ? likedBy.filter((id) => id !== userId)
            : [...likedBy, userId];
          const newLikesCount = Math.max(0, (code.likesCount || 0) + (isLiked ? -1 : 1));
          return { ...code, likedBy: newLikedBy, likesCount: newLikesCount };
        }
        return code;
      })
    );
  };

  const toggleFavorite = async (qrId: string) => {
    const userId = currentUser ? currentUser.id : 'guest-user';
    await toggleQRFavoriteInDB(qrId, userId);
    setQrcodes((prev) =>
      prev.map((code) => {
        if (code.id === qrId) {
          const favoritedBy = code.favoritedBy || [];
          const isFavorited = favoritedBy.includes(userId);
          const newFavoritedBy = isFavorited
            ? favoritedBy.filter((id) => id !== userId)
            : [...favoritedBy, userId];
          const newFavoritesCount = Math.max(0, (code.favoritesCount || 0) + (isFavorited ? -1 : 1));
          return { ...code, favoritedBy: newFavoritedBy, favoritesCount: newFavoritesCount };
        }
        return code;
      })
    );
  };

  const submitRating = async (qrId: string, rating: number) => {
    const userId = currentUser ? currentUser.id : 'guest-user';
    await submitQRRatingInDB(qrId, userId, rating);
    setQrcodes((prev) =>
      prev.map((code) => {
        if (code.id === qrId) {
          const userRatings = { ...(code.userRatings || {}), [userId]: rating };
          const allRatings = Object.values(userRatings) as number[];
          const ratingsCount = allRatings.length;
          const sum = allRatings.reduce((acc, r) => acc + r, 0);
          const averageRating = ratingsCount > 0 ? Number((sum / ratingsCount).toFixed(1)) : 0;
          return { ...code, userRatings, averageRating, ratingsCount };
        }
        return code;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        userCountry,
        setUserCountry,
        emergencyConfig,
        updateEmergencyConfig,
        qrcodes,
        addQRCode,
        incrementScans,
        toggleLike,
        toggleFavorite,
        submitRating,
        isOnline,
        supabaseActive: isSupabaseConfigured,
        appVersion,
        currentUser,
        loginUser,
        registerUser,
        logoutUser,
        switchUserRole
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
