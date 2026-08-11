-- CityQR production security migration.
-- Review and run once in the Supabase SQL editor with an owner/service role.

BEGIN;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- New auth users always start without administrative privileges. Existing roles
-- are intentionally left unchanged when an auth event is replayed.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    sub_role,
    sub_role_title,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    '',
    '',
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'CityQR User'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Remove the permissive policies used by earlier project versions.
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be read by their owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be inserted by their owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be updated by their owner" ON public.profiles;

CREATE POLICY "Profiles can be read by their owner"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles can be inserted by their owner"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role IN ('user', 'merchant')
  );

CREATE POLICY "Profiles can be updated by their owner"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IN ('user', 'merchant', 'admin')
  );

-- Profile editing may change personal details, never authorization fields.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), 'service_role') <> 'service_role'
     AND (
       NEW.role IS DISTINCT FROM OLD.role
       OR NEW.sub_role IS DISTINCT FROM OLD.sub_role
       OR NEW.sub_role_title IS DISTINCT FROM OLD.sub_role_title
     ) THEN
    RAISE EXCEPTION 'Profile role changes are not allowed'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

-- Remove public write access from administrative data. These writes must use a
-- trusted backend/service-role path rather than the browser's anonymous key.
DROP POLICY IF EXISTS "Users can create qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can update qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Users can delete qr codes." ON public.qr_codes;
DROP POLICY IF EXISTS "Only admins can update emergency settings." ON public.emergency_settings;
DROP POLICY IF EXISTS "Only admins can insert emergency settings." ON public.emergency_settings;

COMMIT;
