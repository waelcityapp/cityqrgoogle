import fs from 'fs';
let content = fs.readFileSync('src/services/supabase.ts', 'utf8');

const oldCode = `    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      return { error: error.message };
    }
    
    if (data?.url) {
      const width = 500;
      const height = 650;
      const left = typeof window !== 'undefined' ? window.screenX + (window.outerWidth - width) / 2 : 0;
      const top = typeof window !== 'undefined' ? window.screenY + (window.outerHeight - height) / 2 : 0;
      
      if (typeof window !== 'undefined') {
        window.open(data.url, 'supabase-oauth', \`width=\${width},height=\${height},left=\${left},top=\${top}\`);
      }
    }
    
    return {};`;

const newCode = `    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      return { error: error.message };
    }
    
    return {};`;

if (content.includes('skipBrowserRedirect: true')) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync('src/services/supabase.ts', content);
  console.log('Fixed supabase.ts');
} else {
  console.log('Code not found');
}
