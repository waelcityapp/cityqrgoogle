import fs from 'fs';
let content = fs.readFileSync('src/services/supabase.ts', 'utf8');

const oldCode = `    if (profile) {
      userProfile = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || fullName,
        role: isSuperAdminEmail ? 'admin' : ((profile.role === 'merchant' || profile.role === 'admin' ? profile.role : 'user') as any),
        subRole: isSuperAdminEmail ? 'super_admin' : (profile.sub_role || 'citizen'),
        subRoleTitle: isSuperAdminEmail ? 'المدير المباشر والأدمن الرئيسي (Super Admin)' : (profile.sub_role_title || ''),
        createdAt: profile.created_at || new Date().toISOString()
      };`;
      
const newCode = `    if (profile) {
      userProfile = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || fullName,
        role: isSuperAdminEmail ? 'admin' : ((profile.role === 'merchant' || profile.role === 'admin' ? profile.role : 'user') as any),
        subRole: isSuperAdminEmail ? 'super_admin' : (profile.sub_role || 'citizen'),
        subRoleTitle: isSuperAdminEmail ? 'المدير المباشر والأدمن الرئيسي (Super Admin)' : (profile.sub_role_title || ''),
        avatarUrl: profile.avatar_url,
        phoneNumber: profile.phone_number,
        whatsappNumber: profile.whatsapp_number,
        bio: profile.bio,
        createdAt: profile.created_at || new Date().toISOString()
      };`;
      
content = content.replace(oldCode, newCode);
fs.writeFileSync('src/services/supabase.ts', content);
console.log('Patched profile fetch');
