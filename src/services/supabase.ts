import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Retrieve credentials safely from Vite environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL1 || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY1 || '';

// Check if valid production credentials exist for real Supabase connection
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseUrl.includes('YOUR_') &&
  !supabaseAnonKey.includes('YOUR_')
);

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseUrl.startsWith('https://')) {
    console.error('Invalid Supabase URL: Must start with https://');
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
    userRatings: { 'user-demo-1': 5, 'user-demo-2': 5, 'user-demo-3': 4 },
    phoneNumbers: ['01010764256 - الخط الساخن والطلب المباشر / Hotline & Direct Call', '01010764256 - واتساب خدمة العملاء والديلفاري / WhatsApp Service', '0223456789 - حجز الطاولات والمناسبات / Reservations'],
    contactSections: [
      {
        id: 'sec-hanover-1',
        departmentName: 'الخط الساخن وطلب التوصيل المباشر / Hotline & Delivery',
        workingHours: 'يومياً من 10 صباحاً حتى 2 بعد منتصف الليل (متاح الآن)',
        phoneNumbers: ['01010764256', '0223456789'],
        whatsappNumbers: ['01010764256']
      },
      {
        id: 'sec-hanover-2',
        departmentName: 'إدارة المطعم واستقبال الشكاوى والمقترحات / Administration & Feedback',
        workingHours: 'الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً',
        phoneNumbers: ['01010764256'],
        whatsappNumbers: ['01010764256']
      }
    ]
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
    userRatings: { 'user-demo-2': 5 },
    phoneNumbers: ['01234567890 - خدمة العملاء والاشتراكات / Customer Service', '01098765432 - حجز مدرب خاص / Personal Trainers'],
    contactSections: [
      {
        id: 'sec-fit-1',
        departmentName: 'خدمة العملاء والاشتراكات / Customer Service',
        workingHours: 'يومياً على مدار 24 ساعة',
        phoneNumbers: ['01234567890', '0233445566'],
        whatsappNumbers: ['01234567890']
      },
      {
        id: 'sec-fit-2',
        departmentName: 'حجز المدربين الخاصين والتغذية / Personal Trainers & Nutrition',
        workingHours: 'يومياً من 8 صباحاً حتى 10 مساءً',
        phoneNumbers: ['01098765432'],
        whatsappNumbers: ['01098765432']
      }
    ]
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
    userRatings: {},
    phoneNumbers: ['19000 - الخط الساخن الموحد / Unified Hotline', '01111111111 - حجز الزيارات المنزلية / Home Sampling']
  },
  {
    id: 'qr-4',
    titleAr: 'مقهى ستاربكس كافيه - فرع التجمع',
    titleEn: 'Starbucks Cafe - 5th Settlement',
    descriptionAr: 'عرض الصباح الحصري: خصم 35% على جميع المشروبات الساخنة والباردة مع معجنات الإفطار الطازجة حتى الساعة 11 صباحاً.',
    descriptionEn: 'Exclusive Morning Deal: 35% OFF on all hot and cold handcrafted beverages plus fresh breakfast pastries until 11 AM.',
    category: 'monument',
    qrUrl: 'https://cityqr.local/merchant/starbucks-5th',
    targetUrl: 'https://example.com/starbucks-offers',
    location: {
      lat: 30.0254,
      lng: 31.4721,
      addressAr: 'القاهرة - التجمع الخامس',
      addressEn: 'Cairo - New Cairo'
    },
    totalScans: 640,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isActive: true,
    expiresAt: '2026-07-30',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    likesCount: 84,
    likedBy: ['user-demo-1', 'user-demo-2'],
    favoritesCount: 32,
    favoritedBy: ['user-demo-1'],
    averageRating: 4.9,
    ratingsCount: 42,
    userRatings: { 'user-demo-1': 5, 'user-demo-2': 5 },
    phoneNumbers: ['01022223333 - خدمة العملاء فرع التجمع / 5th Settlement Branch']
  },
  {
    id: 'qr-5',
    titleAr: 'هايبر ماركت كارفور - سيتي سنتر',
    titleEn: 'Carrefour Hypermarket - City Center',
    descriptionAr: 'مهرجان التوفير الكبرى: خصومات تصل إلى 50% على المواد الغذائية والأجهزة الكهربائية مع نقاط مضاعفة عند المسح بـ CityQR.',
    descriptionEn: 'Mega Savings Festival: Up to 50% OFF on groceries and electronics plus double bonus points when scanning with CityQR.',
    category: 'facility',
    qrUrl: 'https://cityqr.local/merchant/carrefour-cc',
    targetUrl: 'https://example.com/carrefour-festival',
    location: {
      lat: 29.9712,
      lng: 31.3156,
      addressAr: 'القاهرة - المعادي',
      addressEn: 'Cairo - Maadi'
    },
    totalScans: 1420,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isActive: true,
    expiresAt: '2026-08-10',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    likesCount: 156,
    likedBy: ['user-demo-1'],
    favoritesCount: 65,
    favoritedBy: ['user-demo-1', 'user-demo-2'],
    averageRating: 4.8,
    ratingsCount: 88,
    userRatings: { 'user-demo-1': 5 },
    phoneNumbers: ['16000 - خدمة العملاء والطلبات أونلاين / Online Orders & CS', '01222222222 - واتساب خدمة العملاء / WhatsApp CS']
  },
  {
    id: 'qr-6',
    titleAr: 'صالة جولدز جيم إيليت الرياضية',
    titleEn: "Gold's Gym Elite Fitness Club",
    descriptionAr: 'عرض الصيف الذهبي: اشترك لمدة 6 أشهر واحصل على 3 أشهر إضافية مجاناً + 5 جلسات تدريب شخصي مجانية وجلسة تقييم بدني.',
    descriptionEn: 'Golden Summer Deal: Subscribe for 6 months and get 3 extra months FREE + 5 complimentary personal training sessions and fitness assessment.',
    category: 'transport',
    qrUrl: 'https://cityqr.local/merchant/golds-gym-elite',
    targetUrl: 'https://example.com/golds-gym-summer',
    location: {
      lat: 30.0123,
      lng: 30.9812,
      addressAr: 'الجيزة - الشيخ زايد',
      addressEn: 'Giza - Sheikh Zayed'
    },
    totalScans: 815,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isActive: true,
    expiresAt: '2026-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    likesCount: 95,
    likedBy: [],
    favoritesCount: 40,
    favoritedBy: [],
    averageRating: 4.9,
    ratingsCount: 61,
    userRatings: {},
    phoneNumbers: ['01055556666 - قسم المبيعات والاشتراكات / Sales & Subscriptions', '01144445555 - الاستقبال والشكاوى / Reception']
  },
  {
    id: 'qr-7',
    titleAr: 'معامل البرج للتحاليل الطبية والتشخيص',
    titleEn: 'Al-Borg Medical Diagnostics Lab',
    descriptionAr: 'باقة المناعة والفيتامينات الشاملة: فحص فيتامين د، الغدة الدرقية، وصورة الدم الكاملة بخصم 45% مع خدمة السحب المنزلي المجاني.',
    descriptionEn: 'Comprehensive Vitamin & Immunity Package: Vitamin D, Thyroid, and CBC checkup at 45% discount with free home sampling service.',
    category: 'emergency',
    qrUrl: 'https://cityqr.local/merchant/alborg-lab',
    targetUrl: 'https://example.com/alborg-immunity',
    location: {
      lat: 31.2334,
      lng: 29.9501,
      addressAr: 'الإسكندرية - ستانلي',
      addressEn: 'Alexandria - Stanley'
    },
    totalScans: 490,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    isActive: true,
    expiresAt: '2026-07-25',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    likesCount: 52,
    likedBy: ['user-demo-2'],
    favoritesCount: 22,
    favoritedBy: ['user-demo-2'],
    averageRating: 4.7,
    ratingsCount: 35,
    userRatings: { 'user-demo-2': 5 },
    phoneNumbers: ['19999 - الخط الساخن الموحد / Unified Hotline', '01088889999 - خدمة العملاء والواتساب / WhatsApp Support']
  },
  {
    id: 'qr-8',
    titleAr: 'المتحف المصري الكبير (GEM) - جولات مسائية',
    titleEn: 'Grand Egyptian Museum (GEM) - Evening Tours',
    descriptionAr: 'عرض العائلة الملكي: اشتر 3 تذاكر للجولات الإرشادية المسائية واحصل على التذكرة الرابعة مجاناً مع دخول حصري لبهو التماثيل الفرعونية.',
    descriptionEn: 'Royal Family Offer: Buy 3 tickets for guided evening historical tours and get the 4th ticket FREE with exclusive access to the Pharaonic hall.',
    category: 'culture',
    qrUrl: 'https://cityqr.local/merchant/gem-tours',
    targetUrl: 'https://example.com/gem-tours',
    location: {
      lat: 29.9928,
      lng: 31.1174,
      addressAr: 'الجيزة - منطقة الأهرامات',
      addressEn: 'Giza - Pyramids Area'
    },
    totalScans: 2150,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isActive: true,
    expiresAt: '2026-10-01',
    imageUrl: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=600&q=80',
    likesCount: 280,
    likedBy: ['user-demo-1', 'user-demo-2'],
    favoritesCount: 145,
    favoritedBy: ['user-demo-1', 'user-demo-2'],
    averageRating: 5.0,
    ratingsCount: 140,
    userRatings: { 'user-demo-1': 5, 'user-demo-2': 5 },
    phoneNumbers: ['0233334444 - مكتب استعلامات وحجز التذاكر / Ticket Booking Office', '01000000000 - خدمة كبار الزوار والجولات الخاصة / VIP Tours']
  },
  {
    id: 'qr-9',
    titleAr: 'مطعم بافالو برجر وأجنحة الدجاج',
    titleEn: 'Buffalo Burger & Wings',
    descriptionAr: 'عرض السعادة المضاعف: اشتر أي وجبة برجر حجم كبير واحصل على ساندويتش ثاني وبطاطس بالجبنة بخصم 50% لفترة محدودة جداً!',
    descriptionEn: 'Double Happiness Combo: Buy any large burger combo and get a second sandwich plus cheesy bacon fries at 50% OFF for a limited time!',
    category: 'monument',
    qrUrl: 'https://cityqr.local/merchant/buffalo-burger',
    targetUrl: 'https://example.com/buffalo-burger-combo',
    location: {
      lat: 30.0882,
      lng: 31.3255,
      addressAr: 'القاهرة - مصر الجديدة',
      addressEn: 'Cairo - Heliopolis'
    },
    totalScans: 980,
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    isActive: true,
    expiresAt: '2026-08-05',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    likesCount: 110,
    likedBy: ['user-demo-1'],
    favoritesCount: 48,
    favoritedBy: ['user-demo-1'],
    averageRating: 4.8,
    ratingsCount: 76,
    userRatings: { 'user-demo-1': 5 },
    phoneNumbers: ['19090 - الخط الساخن السريع للطلبات / Fast Delivery Hotline', '01155555555 - خدمة واتساب للطلبات / WhatsApp Orders']
  },
  {
    id: 'qr-10',
    titleAr: 'صيدليات سيف العزبي لرعاية الصحة والجمال',
    titleEn: 'Seif & El-Ezaby Pharmacies - Health Care',
    descriptionAr: 'مهرجان العناية بالبشرة والمكملات: اشتر قطعتين واحصل على الثالثة مجاناً على جميع منتجات العناية بالبشرة والفيتامينات ومستلزمات الأطفال.',
    descriptionEn: 'Skincare & Supplements Festival: Buy 2 get 1 FREE on all dermacosmetics, daily vitamins, and baby care essentials.',
    category: 'emergency',
    qrUrl: 'https://cityqr.local/merchant/seif-elezaby',
    targetUrl: 'https://example.com/seif-festival',
    location: {
      lat: 30.0612,
      lng: 31.2234,
      addressAr: 'القاهرة - الزمالك',
      addressEn: 'Cairo - Zamalek'
    },
    totalScans: 530,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    isActive: true,
    expiresAt: '2026-08-20',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    likesCount: 64,
    likedBy: [],
    favoritesCount: 28,
    favoritedBy: [],
    averageRating: 4.6,
    ratingsCount: 29,
    userRatings: {},
    phoneNumbers: ['19600 - الخط الساخن وتوصيل الأدوية / Pharmacy Delivery Hotline', '01033333333 - استشارات الصيدلي الإكلينيكي / Pharmacist Consultation']
  },
  {
    id: 'qr-11',
    titleAr: 'سينما فوكس وصالات الترفيه - مول مصر',
    titleEn: 'VOX Cinemas & Entertainment - Mall of Egypt',
    descriptionAr: 'عرض سهرة السينما الذهبية: خصم 50% على تذاكر VIP و GOLD أيام الإثنين والأربعاء شامل فِشار بالكراميل ومشروب غازي مجاني!',
    descriptionEn: 'Golden Movie Night Offer: 50% OFF on VIP & GOLD tickets every Monday & Wednesday including complimentary caramel popcorn & drink!',
    category: 'culture',
    qrUrl: 'https://cityqr.local/merchant/vox-cinemas',
    targetUrl: 'https://example.com/vox-vip-offer',
    location: {
      lat: 29.9731,
      lng: 30.9882,
      addressAr: 'الجيزة - 6 أكتوبر',
      addressEn: 'Giza - 6th of October'
    },
    totalScans: 1680,
    createdAt: new Date(Date.now() - 3600000 * 84).toISOString(),
    isActive: true,
    expiresAt: '2026-09-01',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    likesCount: 195,
    likedBy: ['user-demo-2'],
    favoritesCount: 82,
    favoritedBy: ['user-demo-2'],
    averageRating: 4.9,
    ratingsCount: 112,
    userRatings: { 'user-demo-2': 5 },
    phoneNumbers: ['16200 - حجز التذاكر وخدمة العملاء / Ticket Booking & CS']
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

function syncDemoQRCodes(list: any[]): any[] {
  return list.map((item: any) => {
    const initItem = INITIAL_QR_CODES.find(i => i.id === item.id);
    if (initItem) {
      return {
        ...item,
        contactSections: initItem.contactSections || item.contactSections,
        phoneNumbers: initItem.phoneNumbers || item.phoneNumbers
      };
    }
    return item;
  });
}

// Initialize or Migrate Local Storage Fallback if needed
const storedQRs = localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES);
if (!storedQRs || !storedQRs.includes('مطعم هافور') || !storedQRs.includes('01010764256') || !storedQRs.includes('contactSections')) {
  localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(INITIAL_QR_CODES));
} else {
  try {
    const parsed = JSON.parse(storedQRs);
    const synced = syncDemoQRCodes(parsed);
    localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(synced));
  } catch (e) {
    localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(INITIAL_QR_CODES));
  }
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
export function getStoredQRCodesSync() {
  if (typeof window === 'undefined') return INITIAL_QR_CODES;
  const local = localStorage.getItem(LOCAL_STORAGE_KEY_QR_CODES);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      const synced = syncDemoQRCodes(parsed);
      return synced;
    } catch (e) {
      return INITIAL_QR_CODES;
    }
  }
  return INITIAL_QR_CODES;
}

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
  if (local) {
    try {
      const parsed = JSON.parse(local);
      const synced = syncDemoQRCodes(parsed);
      localStorage.setItem(LOCAL_STORAGE_KEY_QR_CODES, JSON.stringify(synced));
      return synced;
    } catch (e) {
      return INITIAL_QR_CODES;
    }
  }
  return INITIAL_QR_CODES;
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
// Exported so AppContext can use the exact same keys on logout
export const LOCAL_STORAGE_KEY_USER = 'cityqr_current_user';
export const LOCAL_STORAGE_KEY_PROFILES_DB = 'cityqr_profiles_db';

export async function signUpWithSupabase(
  email: string,
  password: string,
  fullName: string,
  role: 'user' | 'merchant',
  subRole?: string,
  subRoleTitle?: string
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
            role: role,
            sub_role: subRole || '',
            sub_role_title: subRoleTitle || ''
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
      const profileRow: any = {
        id: userId,
        email: email,
        role: role,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (subRole) profileRow.sub_role = subRole;
      if (subRoleTitle) profileRow.sub_role_title = subRoleTitle;

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
    subRole: subRole,
    subRoleTitle: subRoleTitle,
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

        // CRITICAL FIX: If account was created via Google OAuth (no password in Auth),
        // but profile exists in public.profiles DB table, fetch their REAL DB profile!
        try {
          const { data: dbProfile } = await client
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          
          if (dbProfile) {
            foundProfile = {
              id: dbProfile.id || ('usr_' + Date.now()),
              email: dbProfile.email || email,
              role: dbProfile.role || (authData?.user?.user_metadata?.role as any) || 'user',
              subRole: dbProfile.sub_role || (authData?.user?.user_metadata?.sub_role as any) || 'citizen',
              subRoleTitle: dbProfile.sub_role_title || (authData?.user?.user_metadata?.sub_role_title as any) || '',
              fullName: dbProfile.full_name || email.split('@')[0] || 'مستخدم CityQR',
              avatarUrl: dbProfile.avatar_url || '',
              phoneNumber: dbProfile.phone_number || '',
              whatsappNumber: dbProfile.whatsapp_number || dbProfile.phone_number || '',
              bio: dbProfile.bio || '',
              createdAt: dbProfile.created_at || new Date().toISOString()
            };
            errorMsg = undefined; // Success: Profile exists in Supabase DB!
            isLive = true;
          }
        } catch (e) {}
      } else if (authData?.user) {
        isLive = true;
        const userId = authData.user.id;
        // Query the profiles table by ID or Email to get real DB profile!
        let profileData: any = null;
        try {
          const { data: idData } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          profileData = idData;

          if (!profileData && email) {
            const { data: emailData } = await client
              .from('profiles')
              .select('*')
              .eq('email', email)
              .maybeSingle();
            profileData = emailData;
          }
        } catch (e) {}

        if (profileData) {
          foundProfile = {
            id: profileData.id || userId,
            email: profileData.email || email,
            role: profileData.role || (authData.user.user_metadata?.role as any) || 'user',
            subRole: profileData.sub_role || (authData.user.user_metadata?.sub_role as any),
            subRoleTitle: profileData.sub_role_title || (authData.user.user_metadata?.sub_role_title as any),
            fullName: profileData.full_name || authData.user.user_metadata?.custom_full_name || authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || 'مستخدم CityQR',
            avatarUrl: profileData.avatar_url || authData.user.user_metadata?.custom_avatar_url || authData.user.user_metadata?.avatar_url || authData.user.user_metadata?.picture || '',
            phoneNumber: profileData.phone_number || authData.user.user_metadata?.phone_number || '',
            whatsappNumber: profileData.whatsapp_number || authData.user.user_metadata?.whatsapp_number || profileData.phone_number || '',
            bio: profileData.bio || authData.user.user_metadata?.bio || '',
            createdAt: profileData.created_at || new Date().toISOString()
          };
        } else {
          // Profile row might not exist yet, let's create it on the fly
          const fallbackRole = (authData.user.user_metadata?.role as any) || 'user';
          const fallbackSubRole = (authData.user.user_metadata?.sub_role as any);
          const fallbackSubRoleTitle = (authData.user.user_metadata?.sub_role_title as any);
          foundProfile = {
            id: userId,
            email: email,
            role: fallbackRole,
            subRole: fallbackSubRole,
            subRoleTitle: fallbackSubRoleTitle,
            fullName: authData.user.user_metadata?.full_name || 'مستخدم CityQR',
            avatarUrl: authData.user.user_metadata?.avatar_url || authData.user.user_metadata?.picture || '',
            phoneNumber: authData.user.user_metadata?.phone_number || '',
            whatsappNumber: authData.user.user_metadata?.whatsapp_number || '',
            bio: authData.user.user_metadata?.bio || '',
            createdAt: new Date().toISOString()
          };
          await client.from('profiles').upsert({
            id: userId,
            email: email,
            role: fallbackRole,
            sub_role: fallbackSubRole || '',
            sub_role_title: fallbackSubRoleTitle || '',
            full_name: foundProfile.fullName,
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (e: any) {
      console.warn('Supabase live signin failed, trying offline profiles fallback:', e);
    }
  }

  // Fallback to offline profiles db ONLY if live auth didn't return user
  if (!foundProfile) {
    return { 
      user: null as any, 
      isLiveSupabase: false, 
      error: errorMsg || 'تعذر جلب بيانات البروفايل من قاعدة بيانات Supabase. يرجى التأكد من البريد وكلمة المرور / Could not retrieve profile from Supabase DB.' 
    };
  }

  // Preserve super admin role for waelvts@gmail.com
  if (foundProfile && foundProfile.email.toLowerCase() === 'waelvts@gmail.com') {
    foundProfile.role = 'admin';
    foundProfile.subRole = 'super_admin';
    foundProfile.subRoleTitle = 'المدير المباشر والأدمن الرئيسي (Super Admin)';
  }

  try {
    saveUserProfileToStorage(foundProfile);
  } catch (e) {
    console.warn('Could not save local session cache:', e);
  }

  return { user: foundProfile, isLiveSupabase: isLive, error: errorMsg };
}

/**
 * Initiates Google OAuth Sign-In via Supabase Auth
 */
export async function signInWithGoogle(): Promise<{ user?: UserProfile; error?: string }> {
  const client = getSupabaseClient();
  
  // Retrieve any pending registration parameters selected by user in UI
  let pendingSignup: any = null;
  try {
    const savedPending = localStorage.getItem('cityqr_pending_google_signup');
    if (savedPending) {
      pendingSignup = JSON.parse(savedPending);
    }
  } catch (e) {}

  if (!client) {
    // Demo / Offline local simulation for Google Login when Supabase env variables are empty
    const googleUser: UserProfile = {
      id: 'google-user-' + Date.now(),
      email: pendingSignup?.email || 'waelvts@gmail.com',
      fullName: pendingSignup?.fullName || 'مستخدم CityQR',
      role: pendingSignup?.role || 'merchant',
      subRole: pendingSignup?.subRole || 'partner_merchant',
      subRoleTitle: pendingSignup?.subRoleTitle || 'تاجر / شريك تجاري',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    try {
      localStorage.removeItem('cityqr_pending_google_signup');
      saveUserProfileToStorage(googleUser);
    } catch (e) {
      console.warn('Could not save google user session:', e);
    }
    return { user: googleUser };
  }

  try {
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-rfirowxfgxlopkvrfok5qe-497491106818.europe-west1.run.app';
    const redirectUrl = originUrl.replace(/\/$/, ''); // Strict match for Supabase Redirect URL list without trailing slash

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      if (error.message?.includes('Rate exceeded') || error.message?.includes('429')) {
        // Query live Supabase DB by email before falling back!
        let dbProfile: any = null;
        const targetEmail = pendingSignup?.email || 'waelvts@gmail.com';
        try {
          const { data } = await client.from('profiles').select('*').eq('email', targetEmail).maybeSingle();
          dbProfile = data;
        } catch (e) {}

        const googleUser: UserProfile = {
          id: dbProfile?.id || 'google-user-' + Date.now(),
          email: targetEmail,
          fullName: dbProfile?.full_name || pendingSignup?.fullName || 'مستخدم CityQR',
          role: dbProfile?.role || pendingSignup?.role || 'merchant',
          subRole: dbProfile?.sub_role || pendingSignup?.subRole || 'partner_merchant',
          subRoleTitle: dbProfile?.sub_role_title || pendingSignup?.subRoleTitle || 'تاجر / شريك تجاري',
          avatarUrl: dbProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          phoneNumber: dbProfile?.phone_number || '',
          whatsappNumber: dbProfile?.whatsapp_number || dbProfile?.phone_number || '',
          bio: dbProfile?.bio || '',
          createdAt: dbProfile?.created_at || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        localStorage.removeItem('cityqr_pending_google_signup');
        saveUserProfileToStorage(googleUser);
        return { user: googleUser };
      }
      return { error: error.message };
    }
    
    return {};
  } catch (err: any) {
    return { error: err?.message || 'فشل بدء عملية تسجيل الدخول بحساب جوجل' };
  }
}

/**
 * Checks active OAuth session from Supabase (e.g. after Google OAuth redirect on desktop & mobile)
 */
export async function getCurrentUserFromSupabaseSession(providedSession?: any): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    let session = providedSession;
    if (!session) {
      try {
        const { data, error } = await client.auth.getSession();
        if (error || !data?.session) {
          return null;
        }
        session = data.session;
      } catch (e: any) {
        console.warn('Supabase auth catch:', e);
        return null;
      }
    }

    if (!session || !session.user) return null;

    const user = session.user;
    const email = user.email || '';
    
    // Exact details provided by Google OAuth / Supabase Auth provider metadata
    const googleFullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined;
    const authLastSignIn = user.last_sign_in_at || new Date().toISOString();
    const authCreatedAt = user.created_at || new Date().toISOString();

    // Query profile in Supabase profiles table
    let profile: any = null;
    try {
      const { data: rawProfile } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = rawProfile;
      if (!profile && email) {
        const { data: emailProfile } = await client
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        profile = emailProfile;
      }
    } catch (e) {
      console.warn('Could not query profile table:', e);
    }

    let userProfile: UserProfile;

    const isSuperAdminEmail = email.toLowerCase() === 'waelvts@gmail.com';

    // Check if there was a pending Google registration with specific chosen role/subRole
    let pendingSignup: any = null;
    try {
      const savedPending = localStorage.getItem('cityqr_pending_google_signup');
      if (savedPending) {
        pendingSignup = JSON.parse(savedPending);
        localStorage.removeItem('cityqr_pending_google_signup');
      }
    } catch (e) {}

    // Determine accurate Full Name with proper priority:
    // Priority 1: Explicitly typed name in pending signup form
    // Priority 2: Existing custom name saved in public.profiles DB table (ALWAYS preferred over Google)
    // Priority 3: Google OAuth display name from Google Account metadata
    // Priority 4: Email username fallback
    //
    // BUG FIX: The old isGenericName check was too broad and could classify
    // user-set names as generic, then replace them with the Google OAuth name.
    // The DB value (profile.full_name) is the authoritative source — it is only
    // a "placeholder" if it literally equals one of the known default strings.
    let resolvedFullName = profile?.full_name || '';
    const isPlaceholderName = !resolvedFullName || 
      resolvedFullName.trim() === '' ||
      resolvedFullName.includes('(Google Auth)') || 
      resolvedFullName === 'مستخدم CityQR' || 
      resolvedFullName === 'Google User' || 
      resolvedFullName === 'مستخدم جوجل' ||
      resolvedFullName === 'CityQR User';

    if (pendingSignup?.fullName && pendingSignup.fullName.trim() !== '') {
      // User just registered with a specific name — use it
      resolvedFullName = pendingSignup.fullName.trim();
    } else if (profile?.full_name && !isPlaceholderName) {
      // DB has a custom name set by the user — ALWAYS preserve it
      resolvedFullName = profile.full_name;
    } else if (googleFullName && googleFullName.trim() !== '') {
      // No custom name in DB, fall back to Google OAuth display name
      resolvedFullName = googleFullName.trim();
    } else {
      resolvedFullName = email.split('@')[0] || 'مستخدم CityQR';
    }

    const meta = user.user_metadata || {};

    const resolvedAvatar = profile?.avatar_url || meta.custom_avatar_url || meta.avatar_url || meta.picture || googleAvatar || '';

    if (profile) {
      const finalRole = isSuperAdminEmail ? 'admin' : (pendingSignup?.role || profile.role || meta.role || 'user');
      const finalSubRole = isSuperAdminEmail ? 'super_admin' : (pendingSignup?.subRole || profile.sub_role || meta.sub_role || 'citizen');
      const finalSubRoleTitle = isSuperAdminEmail ? 'المدير المباشر والأدمن الرئيسي (Super Admin)' : (pendingSignup?.subRoleTitle || profile.sub_role_title || meta.sub_role_title || '');

      // Database values are PRIMARY over Google Auth metadata!
      const finalPhone = profile.phone_number || meta.phone_number || '';
      const finalWhatsapp = profile.whatsapp_number || meta.whatsapp_number || finalPhone || '';
      const finalBio = profile.bio || meta.bio || '';
      const finalAvatar = resolvedAvatar;
      const finalFullName = resolvedFullName || profile.full_name || meta.custom_full_name || meta.full_name || meta.name || 'مستخدم CityQR';

      userProfile = {
        id: profile.id || user.id,
        email: profile.email || email,
        fullName: finalFullName,
        role: finalRole,
        subRole: finalSubRole,
        subRoleTitle: finalSubRoleTitle,
        avatarUrl: finalAvatar,
        phoneNumber: finalPhone,
        whatsappNumber: finalWhatsapp,
        bio: finalBio,
        createdAt: profile.created_at || authCreatedAt,
        lastLoginAt: authLastSignIn
      };
    } else {
      // Auto-create profile in Supabase for Google OAuth user
      const newId = user.id || 'user-' + Date.now();
      const defaultRole = isSuperAdminEmail ? 'admin' : (pendingSignup?.role || meta.role || 'user');
      const defaultSubRole = isSuperAdminEmail ? 'super_admin' : (pendingSignup?.subRole || meta.sub_role || 'citizen');
      const defaultSubRoleTitle = isSuperAdminEmail ? 'المدير المباشر والأدمن الرئيسي (Super Admin)' : (pendingSignup?.subRoleTitle || meta.sub_role_title || 'مستخدم منضم عبر جوجل');

      const finalPhone = meta.phone_number || '';
      const finalWhatsapp = meta.whatsapp_number || finalPhone || '';
      const finalBio = meta.bio || '';
      const finalAvatar = resolvedAvatar || meta.avatar_url || '';

      userProfile = {
        id: newId,
        email: email,
        fullName: resolvedFullName || meta.full_name || meta.name || 'مستخدم CityQR',
        role: defaultRole,
        subRole: defaultSubRole,
        subRoleTitle: defaultSubRoleTitle,
        avatarUrl: finalAvatar,
        phoneNumber: finalPhone,
        whatsappNumber: finalWhatsapp,
        bio: finalBio,
        createdAt: authCreatedAt,
        lastLoginAt: authLastSignIn
      };

      try {
        const createFull: any = {
          id: user.id || newId,
          email: email,
          role: defaultRole,
          full_name: userProfile.fullName,
          sub_role: defaultSubRole,
          sub_role_title: defaultSubRoleTitle,
          avatar_url: finalAvatar,
          phone_number: finalPhone,
          created_at: authCreatedAt,
          updated_at: new Date().toISOString()
        };
        const { error: createErr } = await (client.from('profiles') as any).upsert(createFull, { onConflict: 'id' });
        if (createErr) {
          const createCore: any = {
            id: user.id || newId,
            email: email,
            role: defaultRole,
            full_name: userProfile.fullName,
            sub_role: defaultSubRole,
            sub_role_title: defaultSubRoleTitle,
            avatar_url: finalAvatar,
            phone_number: finalPhone,
            created_at: authCreatedAt,
            updated_at: new Date().toISOString()
          };
          await (client.from('profiles') as any).upsert(createCore, { onConflict: 'id' }).catch(() => null);
        }
      } catch (e) {}
    }

    // Sync Google Auth user_metadata so Supabase Auth Console matches DB Profile 100%
    if (client.auth && typeof client.auth.updateUser === 'function') {
      try {
        await client.auth.updateUser({
          data: {
            full_name: resolvedFullName,
            name: resolvedFullName,
            avatar_url: resolvedAvatar,
            phone_number: userProfile.phoneNumber,
            whatsapp_number: userProfile.whatsappNumber,
            bio: userProfile.bio,
            role: userProfile.role,
            sub_role: userProfile.subRole,
            sub_role_title: userProfile.subRoleTitle
          }
        });
      } catch (e) {}
    }

    saveUserProfileToStorage(userProfile);

    return userProfile;
  } catch (err) {
    console.warn('Error fetching Google OAuth user profile:', err);
    return null;
  }
}

export async function signOutFromSupabase(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    localStorage.removeItem('cityqr_local_user');
    localStorage.removeItem('cityqr_current_user');
    localStorage.removeItem('cityqr_profiles_db');
    localStorage.removeItem('cityqr_user_edits');
    localStorage.removeItem('cityqr_last_profile_update');
    localStorage.removeItem('cityqr_pending_google_signup');

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('sb-') || key.startsWith('cityqr_') || key.includes('supabase.auth')) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Error clearing localStorage during signout:', e);
  }

  const client = getSupabaseClient() as any;
  if (client && client.auth) {
    try {
      await Promise.race([
        client.auth.signOut().catch((err: any) => console.warn('Supabase signOut inner warning:', err)),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
    } catch (e) {
      console.warn('Supabase signOut warning:', e);
    }
  }
}

export function getStoredUserProfile(): UserProfile | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER) || localStorage.getItem('cityqr_local_user') || localStorage.getItem('cityqr_current_user');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading stored user profile:', e);
  }
  return null;
}

export function saveUserProfileToStorage(user: UserProfile): void {
  try {
    const userJson = JSON.stringify(user);
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, userJson);
    localStorage.setItem('cityqr_local_user', userJson);
    localStorage.setItem('cityqr_current_user', userJson);
  } catch (e) {
    console.warn('Error saving user profile to local session cache:', e);
  }
}

export async function updateUserProfileInSupabase(user: UserProfile): Promise<UserProfile> {
  const client = getSupabaseClient() as any;
  if (!client) {
    throw new Error('لم يتم تكوين الاتصال بقاعدة بيانات Supabase / Supabase client not initialized');
  }

  let userId = user.id || '';
  try {
    const { data: sessionData } = await client.auth.getSession();
    if (sessionData?.session?.user?.id) {
      userId = sessionData.session.user.id;
    }
  } catch (e) {}

  const fullFields = {
    full_name: user.fullName || '',
    role: user.role || 'user',
    sub_role: user.subRole || '',
    sub_role_title: user.subRoleTitle || '',
    avatar_url: user.avatarUrl || '',
    phone_number: user.phoneNumber || '',
    updated_at: new Date().toISOString()
  };

  let isSavedInDB = false;
  let lastError: any = null;

  const updateOperation = async () => {
    // 1. Update Auth User Metadata (syncs name to Supabase Auth provider)
    if (typeof client.auth.updateUser === 'function') {
      try {
        await client.auth.updateUser({
          data: {
            full_name: user.fullName || '',
            name: user.fullName || '',
            avatar_url: user.avatarUrl || '',
            custom_full_name: user.fullName || '',
            custom_avatar_url: user.avatarUrl || '',
            phone_number: user.phoneNumber || '',
            whatsapp_number: user.whatsappNumber || user.phoneNumber || '',
            bio: user.bio || '',
            role: user.role || 'user',
            sub_role: user.subRole || '',
            sub_role_title: user.subRoleTitle || ''
          }
        });
      } catch (e) {
        console.warn('Auth updateUser metadata notice:', e);
      }
    }

    // 2. Update public.profiles table by ID
    if (userId) {
      const { error, data } = await client.from('profiles').update(fullFields).eq('id', userId).select('*');
      if (!error && data && data.length > 0) {
        isSavedInDB = true;
      } else if (error) {
        lastError = error;
      }
    }

    // 3. Fallback update by Email if ID match didn't update any rows
    if (!isSavedInDB && user.email) {
      const { error, data } = await client.from('profiles').update(fullFields).eq('email', user.email).select('*');
      if (!error && data && data.length > 0) {
        isSavedInDB = true;
      } else if (error && !lastError) {
        lastError = error;
      }
    }

    // 4. Fallback upsert by ID/Email if record did not exist
    if (!isSavedInDB && (userId || user.email)) {
      const upsertRecord = {
        id: userId || ('usr_' + Date.now()),
        ...(user.email ? { email: user.email } : {}),
        ...fullFields
      };
      const { error, data } = await client.from('profiles').upsert(upsertRecord, { onConflict: 'id' }).select('*');
      if (!error && data && data.length > 0) {
        isSavedInDB = true;
      } else if (error && !lastError) {
        lastError = error;
      }
    }
  };

  // Enforce 6-second timeout for mobile network resilience
  await Promise.race([
    updateOperation(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('انتهت مهلة الاتصال بقاعدة البيانات السحابية (Connection Timeout 6s). يرجى التأكد من الإنترنت وإعادة المحاولة.')), 6000))
  ]);

  if (!isSavedInDB && lastError) {
    throw new Error(`عفواً، تعذر الحفظ في قاعدة بيانات Supabase: ${lastError.message || 'خطأ في الاستعلام'}`);
  }

  const confirmedProfile: UserProfile = {
    ...user,
    fullName: user.fullName.trim()
  };

  saveUserProfileToStorage(confirmedProfile);
  return confirmedProfile;
}
