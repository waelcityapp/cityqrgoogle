import fs from 'fs';
let content = fs.readFileSync('src/services/AppContext.tsx', 'utf8');

const sessionCode = `      getCurrentUserFromSupabaseSession().then((user) => {
        if (user) setCurrentUser(user);
      });`;

const newSessionCode = `      // Enhanced session check for mobile redirects
      setTimeout(() => {
        getCurrentUserFromSupabaseSession().then((user) => {
          if (user) setCurrentUser(user);
        });
      }, 500); // Small delay to ensure Supabase parsed the URL hash`;

if (content.includes(sessionCode)) {
  content = content.replace(sessionCode, newSessionCode);
  fs.writeFileSync('src/services/AppContext.tsx', content);
  console.log('Fixed session code');
}
