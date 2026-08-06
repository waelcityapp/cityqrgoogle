import fs from 'fs';
let content = fs.readFileSync('src/services/supabase.ts', 'utf8');

const oldFunc = `export async function updateUserProfileInSupabase(user: UserProfile): Promise<void> {
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
}`;

const newFunc = `export async function updateUserProfileInSupabase(user: UserProfile): Promise<void> {
  const client = getSupabaseClient() as any;
  if (!client) return;
  try {
    const { error } = await client.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      avatar_url: user.avatarUrl,
      phone_number: user.phoneNumber,
      whatsapp_number: user.whatsappNumber,
      bio: user.bio,
      role: user.role,
      sub_role: user.subRole,
      sub_role_title: user.subRoleTitle,
      updated_at: new Date().toISOString()
    });
    
    if (error) console.error('Supabase profile update error:', error);
  } catch(e) {
    console.error('Failed to update profile in Supabase', e);
  }
}`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('src/services/supabase.ts', content);
console.log('Patched upsert');
