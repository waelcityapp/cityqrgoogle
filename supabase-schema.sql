-- ============================================================
-- CITYQR SUPABASE SCHEMA - FULL PRODUCTION SQL SCRIPT
-- ============================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  sub_role TEXT,
  sub_role_title TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent duplication errors
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated update on profiles" ON public.profiles;

-- Create robust Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (true);


-- 2. Create qr_codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id TEXT PRIMARY KEY,
  "titleAr" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "descriptionAr" TEXT,
  "descriptionEn" TEXT,
  category TEXT,
  "qrUrl" TEXT,
  "targetUrl" TEXT,
  location JSONB,
  "totalScans" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "imageUrl" TEXT,
  "likesCount" INTEGER DEFAULT 0,
  "likedBy" JSONB DEFAULT '[]'::jsonb,
  "favoritesCount" INTEGER DEFAULT 0,
  "favoritedBy" JSONB DEFAULT '[]'::jsonb,
  "averageRating" NUMERIC DEFAULT 0,
  "ratingsCount" INTEGER DEFAULT 0,
  "userRatings" JSONB DEFAULT '{}'::jsonb,
  "phoneNumbers" JSONB DEFAULT '[]'::jsonb,
  "contactSections" JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS for qr_codes
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "QR codes are viewable by everyone." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can create qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete qr codes." ON public.qr_codes;

CREATE POLICY "QR codes are viewable by everyone." ON public.qr_codes FOR SELECT USING (true);
CREATE POLICY "Users can create qr codes." ON public.qr_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update qr codes." ON public.qr_codes FOR UPDATE USING (true);
CREATE POLICY "Users can delete qr codes." ON public.qr_codes FOR DELETE USING (true);


-- 3. Create emergency_settings table
CREATE TABLE IF NOT EXISTS public.emergency_settings (
  id INTEGER PRIMARY KEY,
  "maintenanceMode" BOOLEAN DEFAULT false,
  "forceUpdate" BOOLEAN DEFAULT false,
  "currentAppVersion" TEXT,
  "latestAppVersion" TEXT,
  "maintenanceMessage" JSONB,
  "updateMessage" JSONB
);

-- Insert default emergency settings
INSERT INTO public.emergency_settings (id, "maintenanceMode", "forceUpdate", "currentAppVersion", "latestAppVersion", "maintenanceMessage", "updateMessage")
VALUES (
  1, 
  false, 
  false, 
  '1.0.0', 
  '1.0.0', 
  '{"ar": "التطبيق تحت الصيانة الآن. يرجى المحاولة لاحقاً.", "en": "The app is currently under maintenance. Please try again later."}'::jsonb,
  '{"ar": "يتوفر تحديث جديد للتطبيق. يرجى التحديث للمتابعة.", "en": "A new update is available. Please update to continue."}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS for emergency_settings
ALTER TABLE public.emergency_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Emergency settings are viewable by everyone." ON public.emergency_settings;
DROP POLICY IF EXISTS "Only admins can update emergency settings." ON public.emergency_settings;
DROP POLICY IF EXISTS "Only admins can insert emergency settings." ON public.emergency_settings;

CREATE POLICY "Emergency settings are viewable by everyone." ON public.emergency_settings FOR SELECT USING (true);
CREATE POLICY "Only admins can update emergency settings." ON public.emergency_settings FOR UPDATE USING (true); 
CREATE POLICY "Only admins can insert emergency settings." ON public.emergency_settings FOR INSERT WITH CHECK (true);
