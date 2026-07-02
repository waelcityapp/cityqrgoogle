import { z } from 'zod';

// Language and Theme Types
export type Language = 'ar' | 'en';
export type Theme = 'dark' | 'light' | 'system';

// Emergency Management Configuration (لوحة التحكم والتحكم بالطوارئ والصيانة والتحديثات)
export interface EmergencyConfig {
  maintenanceMode: boolean;
  forceUpdate: boolean;
  currentAppVersion: string;
  latestAppVersion: string;
  maintenanceMessage: {
    ar: string;
    en: string;
  };
  updateMessage: {
    ar: string;
    en: string;
  };
}

// User Profile Type
export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'merchant' | 'admin' | 'operator' | 'citizen' | 'visitor';
  fullName?: string;
  fullNameAr?: string;
  fullNameEn?: string;
  createdAt: string;
}

// Landmark Category Type
export type LandmarkCategory = 'monument' | 'transport' | 'facility' | 'emergency' | 'culture';

// QR Code Type (رمز الاستجابة السريعة للمعالم والمرافق)
export interface QRCodeItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: LandmarkCategory;
  qrUrl: string; // The URL/content encoded in the QR code
  targetUrl: string; // The URL users are redirected to when they scan it
  location?: {
    lat: number;
    lng: number;
    addressAr: string;
    addressEn: string;
  };
  totalScans: number;
  createdAt: string;
  isActive: boolean;
  expiresAt?: string;
  imageUrl?: string;
  likesCount?: number;
  likedBy?: string[];
  favoritesCount?: number;
  favoritedBy?: string[];
  averageRating?: number;
  ratingsCount?: number;
  userRatings?: { [userId: string]: number };
}

// Zod Validation Schemas
export const QRCodeFormSchema = z.object({
  titleAr: z.string().min(3, { message: 'العنوان بالعربية يجب أن يكون 3 أحرف على الأقل / Arabic title must be at least 3 characters' }),
  titleEn: z.string().min(3, { message: 'العنوان بالإنجليزية يجب أن يكون 3 أحرف على الأقل / English title must be at least 3 characters' }),
  descriptionAr: z.string().min(10, { message: 'الوصف بالعربية يجب أن يكون 10 أحرف على الأقل / Arabic description must be at least 10 characters' }),
  descriptionEn: z.string().min(10, { message: 'الوصف بالإنجليزية يجب أن يكون 10 أحرف على الأقل / English description must be at least 10 characters' }),
  category: z.enum(['monument', 'transport', 'facility', 'emergency', 'culture']),
  targetUrl: z.string().url({ message: 'الرابط الموجه غير صالح / Redirect target URL is invalid' }),
  addressAr: z.string().optional(),
  addressEn: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type QRCodeFormValues = z.infer<typeof QRCodeFormSchema>;

export const AuthSchema = z.object({
  email: z.string().email({ message: 'بريد إلكتروني غير صالح / Invalid email address' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل / Password must be at least 6 characters' }),
});

export type AuthFormValues = z.infer<typeof AuthSchema>;
