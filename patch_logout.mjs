import fs from 'fs';
let content = fs.readFileSync('src/services/AppContext.tsx', 'utf8');

content = content.replace(
  "  const logoutUser = async () => {\n    await signOutFromSupabase();\n    setCurrentUser(null);\n  };",
  "  const logoutUser = async () => {\n    setCurrentUser(null);\n    try { await signOutFromSupabase(); } catch(e) { console.error('Signout err', e) }\n  };"
);

fs.writeFileSync('src/services/AppContext.tsx', content);

let content2 = fs.readFileSync('src/services/supabase.ts', 'utf8');
content2 = content2.replace(
`export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient() as any;
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut warning:', e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
}`,
`export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient() as any;
  localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
  localStorage.removeItem('cityqr_local_user');
  
  if (client) {
    try {
      await Promise.race([
        client.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
    } catch (e) {
      console.warn('Supabase signOut warning:', e);
    }
  }
}`
);

fs.writeFileSync('src/services/supabase.ts', content2);
console.log("Patched logout function");
