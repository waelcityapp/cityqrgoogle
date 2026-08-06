import fs from 'fs';
let content = fs.readFileSync('src/services/AppContext.tsx', 'utf8');

const injectionCode = `
    // Auto-inject hash if present
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const hash = window.location.hash;
      const tokenMatch = hash.match(/access_token=([^&]+)/);
      const refreshMatch = hash.match(/refresh_token=([^&]+)/);
      if (tokenMatch) {
         const client = getSupabaseClient();
         if (client) {
            client.auth.setSession({ 
              access_token: tokenMatch[1], 
              refresh_token: refreshMatch ? refreshMatch[1] : '' 
            }).then(() => {
              window.location.hash = '';
            }).catch(e => console.error('Auto inject failed', e));
         }
      }
    }
`;

if (!content.includes('Auto-inject hash if present')) {
  content = content.replace(
    "const client = getSupabaseClient();",
    "const client = getSupabaseClient();\n" + injectionCode
  );
  fs.writeFileSync('src/services/AppContext.tsx', content);
  console.log('Added auto-inject');
}
