import fs from 'fs';
let content = fs.readFileSync('src/services/supabase.ts', 'utf8');

const replacement = `
    const { data, error } = await client.auth.signInWithOAuth({
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
      const height = 600;
      const left = typeof window !== 'undefined' ? window.screenX + (window.outerWidth - width) / 2 : 0;
      const top = typeof window !== 'undefined' ? window.screenY + (window.outerHeight - height) / 2 : 0;
      
      window.open(data.url, 'supabase-oauth', \`width=\${width},height=\${height},left=\${left},top=\${top}\`);
      
      // Return a temporary user so the UI knows we are waiting, or return no error and let the auth listener handle it.
      return { error: undefined };
    }
    return {};
`;

// wait, this is tricky to replace via script. I will edit the file instead.
