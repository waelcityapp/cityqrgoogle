import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Retrieve credentials safely from Vite environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL1 || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY1 || '';

// Check if credentials exist for real Supabase connection
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// Local Fallback Database Engine (for preview stability when environment variables are empty)
const LOCAL_STORAGE_KEY_QR_CODES = 'cityqr_local_qrcodes';
const LOCAL_STORAGE_KEY_EMERGENCY = 'cityqr_local_emergency';

const INITIAL_QR_CODES = [
  {
    id: 'qr-1',
    titleAr: 'مطعم هافور البرياني والمنسف',
    titleEn: 'Havur Biryani & Mansaf Restaurant',
    descriptionAr: 'خصم حقيقي 25% على جميع الوجبات العائلية الكبرى والمنسف الأردني الفاخر بمناسبة الافتتاح وتذوق الطعم الأصيل!',
    descriptionEn: '25% OFF on all family meals and premium Jordanian Mansaf on our grand opening. Taste the authentic flavor!',
    category: 'monument', // Matches Restaurant & Café
    qrUrl: 'https://cityqr.local/merchant/havur-restaurant',
    targetUrl: 'https://example.com/havur-menu',
    location: {
      lat: 30.0561,
      lng: 31.3301,
      addressAr: 'القاهرة - مدينة نصر',
      addressEn: 'Cairo - Nasr City'
    },
    totalScans: 342,
    createdAt: new Date().toISOString(),
    isActive: true,
    expiresAt: '2026-08-15',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    likesCount: 42,
    likedBy: ['user-demo-1'],
    favoritesCount: 18,
    favoritedBy: ['user-demo-1', 'user-demo-2'],
    averageRating: 4.8,
    ratingsCount: 19,
    userRatings: { 'user-demo-1': 5, 'user-demo-2': 5, 'user-demo-3': 4 }
  },
  {
    id: 'qr-2',
    titleAr: 'مركز فيتنس ماكس الرياضي',
    titleEn: 'Fitness Max Gym & Sports Center',
    descriptionAr: 'اشتراك سنوي مميز يشمل الدخول للمسبح والساونا والحصص الجماعية مع باقة خصم حصرية تصل إلى 40% لفترة محدودة.',
    descriptionEn: 'Premium annual membership including pool access, sauna, and group classes with an exclusive 40% discount for a limited time.',
    category: 'transport', // Maps to Gym & Fitness Center
    qrUrl: 'https://cityqr.local/merchant/fitness-max',
    targetUrl: 'https://example.com/fitness-max-membership',
    location: {
      lat: 30.0511,
      lng: 31.2001,
      addressAr: 'الجيزة - المهندسين',
      addressEn: 'Giza - Mohandessin'
    },
    totalScans: 1205,
    createdAt: new Date().toISOString(),
    isActive: true,
    expiresAt: '2026-09-01',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    likesCount: 128,
    likedBy: ['user-demo-2'],
    favoritesCount: 45,
    favoritedBy: ['user-demo-2'],
    averageRating: 4.9,
    ratingsCount: 54,
    userRatings: { 'user-demo-2': 5 }
  },
  {
    id: 'qr-3',
    titleAr: 'مختبرات ألفا للتحاليل الطبية',
    titleEn: 'Alfa Medical Diagnostics Lab',
    descriptionAr: 'باقة الفحص الشامل المتقدم لـ 40 تحليلاً حيوياً للاطمئنان على صحتك وصحة عائلتك فقط بـ 299 ريال شامل الاستشارة والتقرير المعتمد.',
    descriptionEn: 'Comprehensive advanced health check package of 40 vital tests for only 299 SAR, including doctor consultation and certified reports.',
    category: 'facility', // Maps to Medical Labs & Diagnostics
    qrUrl: 'https://cityqr.local/merchant/alfa-lab',
    targetUrl: 'https://example.com/alfa-lab-packages',
    location: {
      lat: 31.2156,
      lng: 29.9553,
      addressAr: 'الإسكندرية - سموحة',
      addressEn: 'Alexandria - Smouha'
    },
    totalScans: 89,
    createdAt: new Date().toISOString(),
    isActive: true,
    expiresAt: '2026-07-31',
    imageUrl: 'https://images.unsplash.com/photo-1579153138244-3749a4e2aeae?auto=format&fit=crop&w=600&q=80',
    likesCount: 15,
    likedBy: [],
    favoritesCount: 7,
    favoritedBy: [],
    averageRating: 4.6,
    ratingsCount: 8,
    userRatings: {}
  }
];

const DEFAULT_EMERGENCY_CONFIG = {
  maintenanceMode: false,
  forceUpdate: false,
  currentAppVersion: '1.0.0',
  latestAppVersion: '1.0.0',
  maintenanceMessage: {
    ar: 'المنصة حالياً خاضعة لأعمال الصيانة الدورية لتطوير مستوى الخدمة. سنعود قريباً!',
    en: 'The platform is currently undergoing scheduled maintenance to improve our services. We will be back shortly!'
  },
  updateMessage: {
    ar: 'يتوفر تحديث جديد وهام للمنصة. يرجى التحديث لتجنب انقطاع الخدمة.',
    en: 'An important update is available for the platform. Please update to avoid service disruption.'
  }
};

// Initialize or Migrate Local Storage Fallback if needed
const storedQRs = localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES);
if (!storedQRs || !storedQRs.includes('مطعم هافور') || !storedQRs.includes('imageUrl') || !storedQRs.includes('favoritesCount') || !storedQRs.includes('مدينة نصر')) {
  localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(INITIAL_QR_CODES));
}
if (!localStorage.getItem(LOCAL_STORAGE_KEY_EMERGENCY)) {
  localStorage.setItem(LOCAL_STORAGE_KEY_EMERGENCY, JSON.stringify(DEFAULT_EMERGENCY_CONFIG));
}

// Emergency Database Operations Helper
export async function getEmergencyConfigFromDB() {
  const client = getSupabaseClient() as any;
  if (client) {
    try {
      const { data, error } = await client.from('emergency_settings').select('*').single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase reading failed, using local storage fallback:', e);
    }
  }
  
  // Return from localStorage
  const local = localStorage.getItem(LOCAL_STORAGE_KEY_EMERGENCY);
  return local ? JSON.parse(local) : DEFAULT_EMERGENCY_CONFIG;
}

export async function updateEmergencyConfigInDB(config: typeof DEFAULT_EMERGENCY_CONFIG) {
  const client = getSupabaseClient() as any;
  if (client) {
    try {
      const { error } = await client.from('emergency_settings').upsert({ id: 1, ...config });
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase writing failed, saving to local storage fallback:', e);
    }
  }

  localStorage.setItem(LOCAL_STORAGE_KEY_EMERGENCY, JSON.stringify(config));
  return true;
}

// QR Code Operations Helper
export async function getQRCodesFromDB() {
  const client = getSupabaseClient() as any;
  if (client) {
    try {
      const { data, error } = await client.from('qr_codes').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase reading QR codes failed, using local storage fallback:', e);
    }
  }

  const local = localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES);
  return local ? JSON.parse(local) : INITIAL_QR_CODES;
}

export async function insertQRCodeToDB(qrItem: any) {
  const client = getSupabaseClient() as any;
  if (client) {
    try {
      const { data, error } = await client.from('qr_codes').insert(qrItem).select();
      if (!error && data) return data[0];
    } catch (e) {
      console.warn('Supabase insert failed, saving to local storage fallback:', e);
    }
  }

  const currentList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES) || '[]');
  const newItem = { id: `qr-${Date.now()}`, ...qrItem, totalScans: 0, createdAt: new Date().toISOString(), isActive: true };
  currentList.unshift(newItem);
  localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(currentList));
  return newItem;
}

export async function incrementQRScanCountInDB(qrId: string) {
  const client = getSupabaseClient() as any;
  if (client) {
    try {
      const { error } = await client.rpc('increment_scans', { qr_id: qrId });
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase RPC failed, using local fallback:', e);
    }
  }

  const currentList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES) || '[]');
  const updatedList = currentList.map((item: any) => {
    if (item.id === qrId) {
      return { ...item, totalScans: item.totalScans + 1 };
    }
    return item;
  });
  localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(updatedList));
  return true;
}

export async function toggleQRLikeInDB(qrId: string, userId: string) {
  const currentList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES) || '[]');
  const updatedList = currentList.map((item: any) => {
    if (item.id === qrId) {
      const likedBy = item.likedBy || [];
      const isLiked = likedBy.includes(userId);
      const newLikedBy = isLiked
        ? likedBy.filter((id: string) => id !== userId)
        : [...likedBy, userId];
      const newLikesCount = Math.max(0, (item.likesCount || 0) + (isLiked ? -1 : 1));
      return { ...item, likedBy: newLikedBy, likesCount: newLikesCount };
    }
    return item;
  });
  localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(updatedList));
  return true;
}

export async function toggleQRFavoriteInDB(qrId: string, userId: string) {
  const currentList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES) || '[]');
  const updatedList = currentList.map((item: any) => {
    if (item.id === qrId) {
      const favoritedBy = item.favoritedBy || [];
      const isFavorited = favoritedBy.includes(userId);
      const newFavoritedBy = isFavorited
        ? favoritedBy.filter((id: string) => id !== userId)
        : [...favoritedBy, userId];
      const newFavoritesCount = Math.max(0, (item.favoritesCount || 0) + (isFavorited ? -1 : 1));
      return { ...item, favoritedBy: newFavoritedBy, favoritesCount: newFavoritesCount };
    }
    return item;
  });
  localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(updatedList));
  return true;
}

export async function submitQRRatingInDB(qrId: string, userId: string, rating: number) {
  const currentList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES) || '[]');
  const updatedList = currentList.map((item: any) => {
    if (item.id === qrId) {
      const userRatings = { ...(item.userRatings || {}), [userId]: rating };
      const allRatings = Object.values(userRatings) as number[];
      const ratingsCount = allRatings.length;
      const sum = allRatings.reduce((acc, r) => acc + r, 0);
      const averageRating = ratingsCount > 0 ? Number((sum / ratingsCount).toFixed(1)) : 0;
      return { ...item, userRatings, averageRating, ratingsCount };
    }
    return item;
  });
  localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(updatedList));
  return true;
}

// Authentication & Profiles Database Management
const LOCAL_STORAGE_KEY_USER = 'cityqr_current_user';
const LOCAL_STORAGE_KEY_PROFILES_DB = 'cityqr_profiles_db';

export async function signUpWithSupabase(
  email: string,
  password: string,
  fullName: string,
  role: 'user' | 'merchant'
): Promise<{ user: UserProfile; isLiveSupabase: boolean; error?: string }> {
  ensureDemoProfilesInStorage();
  try {
    const existingProfiles: UserProfile[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES_DB) || '[]'
    );
    if (existingProfiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
      return {
        user: null as any,
        isLiveSupabase: false,
        error: 'هذا البريد الإلكتروني مسجل بالفعل في قاعدة البيانات. يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد / This email is already registered. Please login instead.'
      };
    }
  } catch (e) {
    console.warn('Error checking existing profiles:', e);
  }

  const client = getSupabaseClient() as any;
  let isLive = false;
  let userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let errorMsg: string | undefined;

  if (client) {
    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (authError) {
        console.warn('Supabase Auth signUp error:', authError.message);
        errorMsg = authError.message;
      } else if (authData?.user) {
        userId = authData.user.id;
        isLive = true;
      }

      // 2. Add / Upsert the user profile with 'role' in the 'profiles' table in Supabase!
      // This guarantees custom permissions later per instructions:
      // "يتم إضافة حقل 'role' للمستخدم في جدول 'profiles' بناءً على الاختيار (user أو merchant)"
      const profileRow = {
        id: userId,
        email: email,
        role: role,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await client
        .from('profiles')
        .upsert(profileRow, { onConflict: 'id' });

      if (profileError) {
        console.warn('Supabase profiles table upsert warning:', profileError.message);
      } else {
        isLive = true;
      }
    } catch (e: any) {
      console.warn('Supabase live connection error during signup, falling back to local DB:', e);
      errorMsg = e?.message || 'Offline fallback mode active';
    }
  }

  // 3. Create standardized UserProfile object
  const newProfile: UserProfile = {
    id: userId,
    email,
    password,
    role: role,
    fullName: fullName,
    fullNameAr: fullName,
    fullNameEn: fullName,
    createdAt: new Date().toISOString()
  };

  // 4. Always save to LocalStorage Fallback & Session so preview testing is immediate and guaranteed!
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(newProfile));
    
    // Save to simulated profiles table in localStorage
    const existingProfiles: UserProfile[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES_DB) || '[]'
    );
    const updatedProfiles = [newProfile, ...existingProfiles.filter(p => p.email.toLowerCase() !== email.toLowerCase())];
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILES_DB, JSON.stringify(updatedProfiles));
  } catch (e) {
    console.warn('Failed to save user session locally:', e);
  }

  return { user: newProfile, isLiveSupabase: isLive, error: errorMsg };
}

function ensureDemoProfilesInStorage() {
  try {
    const existing: UserProfile[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES_DB) || '[]'
    );
    let updated = [...existing];
    if (!updated.some(p => p.email.toLowerCase() === 'merchant@cityqr.com')) {
      updated.push({
        id: 'usr_demo_merchant',
        email: 'merchant@cityqr.com',
        password: 'merchant123456',
        role: 'merchant',
        fullName: 'شركة هافور التجارية',
        createdAt: new Date().toISOString()
      });
    }
    if (!updated.some(p => p.email.toLowerCase() === 'citizen@cityqr.com')) {
      updated.push({
        id: 'usr_demo_citizen',
        email: 'citizen@cityqr.com',
        password: 'user123456',
        role: 'user',
        fullName: 'أحمد العتيبي',
        createdAt: new Date().toISOString()
      });
    }
    if (updated.length !== existing.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILES_DB, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Could not seed demo profiles:', e);
  }
}

export async function signInWithSupabase(
  email: string,
  password: string
): Promise<{ user: UserProfile; isLiveSupabase: boolean; error?: string }> {
  const client = getSupabaseClient() as any;
  let isLive = false;
  let foundProfile: UserProfile | null = null;
  let errorMsg: string | undefined;

  if (client) {
    try {
      const { data: authData, error: authError } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.warn('Supabase signIn error:', authError.message);
        errorMsg = authError.message;
      } else if (authData?.user) {
        isLive = true;
        const userId = authData.user.id;
        // Query the profiles table to get their role and custom permissions!
        const { data: profileData, error: profileError } = await client
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileData && !profileError) {
          foundProfile = {
            id: profileData.id || userId,
            email: profileData.email || email,
            role: profileData.role || (authData.user.user_metadata?.role as any) || 'user',
            fullName: profileData.full_name || authData.user.user_metadata?.full_name || 'مستخدم CityQR',
            createdAt: profileData.created_at || new Date().toISOString()
          };
        } else {
          // Profile row might not exist yet, let's create it on the fly
          const fallbackRole = (authData.user.user_metadata?.role as any) || 'user';
          foundProfile = {
            id: userId,
            email: email,
            role: fallbackRole,
            fullName: authData.user.user_metadata?.full_name || 'مستخدم CityQR',
            createdAt: new Date().toISOString()
          };
          await client.from('profiles').upsert({
            id: userId,
            email: email,
            role: fallbackRole,
            full_name: foundProfile.fullName,
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (e: any) {
      console.warn('Supabase live signin failed, trying offline profiles fallback:', e);
    }
  }

  // Fallback to offline profiles db if live auth didn't return user
  if (!foundProfile) {
    ensureDemoProfilesInStorage();
    const existingProfiles: UserProfile[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY_PROFILES_DB) || '[]'
    );
    const match = existingProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (match) {
      // 1. Verify exact password if stored in offline profile
      if (match.password && match.password !== password) {
        return { user: null as any, isLiveSupabase: false, error: 'كلمة المرور غير صحيحة / Incorrect password' };
      }
      // 2. Verify demo merchant account password if email is demo merchant
      if (email.toLowerCase() === 'merchant@cityqr.com' && password !== 'merchant123456') {
        return { user: null as any, isLiveSupabase: false, error: 'كلمة المرور غير صحيحة لحساب التاجر التجريبي. الباسورد الصحيح هو: merchant123456' };
      }
      // 3. Verify demo citizen account password if email is demo citizen
      if (email.toLowerCase() === 'citizen@cityqr.com' && password !== 'user123456') {
        return { user: null as any, isLiveSupabase: false, error: 'كلمة المرور غير صحيحة لحساب العميل التجريبي. الباسورد الصحيح هو: user123456' };
      }
      foundProfile = match;
      errorMsg = undefined; // Clear any cloud error since user authenticated locally
    } else {
      // Reject login if account does not exist. Do not auto-create accounts on login!
      return { user: null as any, isLiveSupabase: false, error: 'هذا البريد الإلكتروني غير مسجل في النظام. يرجى الضغط على "إنشاء حساب جديد" أولاً / Account not found. Please switch to "Create New Account" first.' };
    }
  }

  // Save session
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(foundProfile));
  } catch (e) {
    console.warn('Could not save local session:', e);
  }

  return { user: foundProfile, isLiveSupabase: isLive, error: errorMsg };
}

export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient() as any;
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut warning:', e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
}

export function getStoredUserProfile(): UserProfile | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading stored user profile:', e);
  }
  return null;
}

