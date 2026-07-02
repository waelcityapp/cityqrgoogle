import { createClient } from '@supabase/supabase-js';

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
      lat: 24.7136,
      lng: 46.6753,
      addressAr: 'حي السليمانية، الرياض',
      addressEn: 'Sulaimaniyah, Riyadh'
    },
    totalScans: 342,
    createdAt: new Date().toISOString(),
    isActive: true,
    expiresAt: '2026-08-15',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80'
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
      lat: 24.7236,
      lng: 46.6853,
      addressAr: 'طريق الملك عبد العزيز، الرياض',
      addressEn: 'King Abdulaziz Road, Riyadh'
    },
    totalScans: 1205,
    createdAt: new Date().toISOString(),
    isActive: true,
    expiresAt: '2026-09-01',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
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
      lat: 24.7336,
      lng: 46.6953,
      addressAr: 'حي الورود، الرياض',
      addressEn: 'Al Wurud, Riyadh'
    },
    totalScans: 89,
    createdAt: new Date().toISOString(),
    isActive: true,
    expiresAt: '2026-07-31',
    imageUrl: 'https://images.unsplash.com/photo-1579153138244-3749a4e2aeae?auto=format&fit=crop&w=600&q=80'
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
if (!storedQRs || !storedQRs.includes('مطعم هافور') || !storedQRs.includes('imageUrl')) {
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
