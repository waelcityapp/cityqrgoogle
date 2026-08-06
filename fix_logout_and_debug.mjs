import fs from 'fs';
let context = fs.readFileSync('src/services/AppContext.tsx', 'utf8');

context = context.replace(
  "  const logoutUser = async () => {\n    setCurrentUser(null);\n    try { await signOutFromSupabase(); } catch(e) { console.error('Signout err', e) }\n  };",
  `  const logoutUser = async () => {
    setCurrentUser(null);
    localStorage.removeItem('cityqr_current_user');
    localStorage.removeItem('cityqr_local_user');
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
    
    try { await signOutFromSupabase(); } catch(e) { console.error('Signout err', e) }
    
    window.location.hash = '';
    window.location.reload();
  };`
);
fs.writeFileSync('src/services/AppContext.tsx', context);

let auth = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');
auth = auth.replace(
  "const { data, error } = await client.auth.getSession();",
  `const sessionPromise = client.auth.getSession();
                const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ error: { message: 'Timeout after 5s' }, data: { session: null } }), 5000));
                const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;`
);

fs.writeFileSync('src/pages/AccountAuth.tsx', auth);
console.log('Fixed');
