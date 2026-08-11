-- ====================================================================
-- إعداد قاعدة بيانات Supabase ونظام الملفات الشخصية (Profiles & Roles)
-- ====================================================================
-- انسخ هذا الكود بالكامل وضعه في محرر الـ SQL Editor في لوحة تحكم Supabase واضغط Run
-- ====================================================================

-- 1. إنشاء جدول الملفات الشخصية (profiles) إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'user',
    sub_role TEXT DEFAULT '',
    sub_role_title TEXT DEFAULT '',
    full_name TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. تفعيل الحماية (Row Level Security) على جدول profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure existing installations have every editable profile field.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. إضافة سياسات الأمان (Policies) لتمكين القراءة والإضافة والتعديل للمستخدمين
-- السماح لجميع المستخدمين بقراءة الملفات الشخصية
CREATE POLICY "Allow public read access to profiles"
    ON public.profiles FOR SELECT
    USING (true);

-- السماح للمستخدم بإضافة ملفه الشخصي عند التسجيل
CREATE POLICY "Allow users to insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- السماح للمستخدم بتحديث بياناته الشخصية
CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 4. إنشاء دالة (Function) لنقل بيانات المستخدم تلقائياً من auth.users إلى public.profiles عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, sub_role, sub_role_title, full_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'sub_role', ''),
        COALESCE(NEW.raw_user_meta_data->>'sub_role_title', ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم CityQR'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        sub_role = EXCLUDED.sub_role,
        sub_role_title = EXCLUDED.sub_role_title,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. إنشاء المشغل (Trigger) لتنفيذ الدالة تلقائياً عند أي عملية تسجيل جديدة
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. (اختياري) مزامنة المستخدمين المسجلين سابقاً في auth.users إلى جدول profiles
INSERT INTO public.profiles (id, email, role, sub_role, sub_role_title, full_name, created_at, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'user') as role,
    COALESCE(raw_user_meta_data->>'sub_role', '') as sub_role,
    COALESCE(raw_user_meta_data->>'sub_role_title', '') as sub_role_title,
    COALESCE(raw_user_meta_data->>'full_name', 'مستخدم CityQR') as full_name,
    created_at,
    NOW()
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    sub_role = EXCLUDED.sub_role,
    sub_role_title = EXCLUDED.sub_role_title,
    full_name = EXCLUDED.full_name;
