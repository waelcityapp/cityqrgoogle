import fs from 'fs';
let supabase = fs.readFileSync('src/services/supabase.ts', 'utf8');

if (!supabase.includes('updateUserProfileInSupabase')) {
  supabase += `\nexport async function updateUserProfileInSupabase(user: UserProfile): Promise<void> {
  const client = getSupabaseClient() as any;
  if (!client) return;
  try {
    const { error } = await client.from('profiles').update({
      full_name: user.fullName,
      avatar_url: user.avatarUrl,
      phone_number: user.phoneNumber,
      whatsapp_number: user.whatsappNumber,
      bio: user.bio,
      role: user.role,
      sub_role: user.subRole,
      sub_role_title: user.subRoleTitle,
      updated_at: new Date().toISOString()
    }).eq('id', user.id);
    
    if (error) console.error('Supabase profile update error:', error);
  } catch(e) {
    console.error('Failed to update profile in Supabase', e);
  }
}\n`;
  fs.writeFileSync('src/services/supabase.ts', supabase);
}

let context = fs.readFileSync('src/services/AppContext.tsx', 'utf8');

if (!context.includes('updateUserProfileInSupabase')) {
  context = context.replace(
    "import { getSupabaseClient } from '../services/supabase';",
    "import { getSupabaseClient, updateUserProfileInSupabase } from '../services/supabase';"
  );
  
  context = context.replace(
    `  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (currentUser) {
      const updated: UserProfile = { ...currentUser, ...updates };
      setCurrentUser(updated);
      saveUserProfileToStorage(updated);
    }
  };`,
    `  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (currentUser) {
      const updated: UserProfile = { ...currentUser, ...updates };
      setCurrentUser(updated);
      saveUserProfileToStorage(updated);
      updateUserProfileInSupabase(updated);
    }
  };`
  );
  fs.writeFileSync('src/services/AppContext.tsx', context);
}

console.log('Patched profile updates');
