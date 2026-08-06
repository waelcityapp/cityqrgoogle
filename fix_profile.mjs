import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

// Add a diagnostic banner at the top of AccountAuth to show currentUser state
const returnMatch = `  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-4 px-2 sm:px-4 pb-32">`;

const replaceReturn = `  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-4 px-2 sm:px-4 pb-32">
      {/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}
      {typeof window !== 'undefined' && window.location.hash.includes('access_token') && !currentUser && (
        <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs">
          Loading your session... If this takes too long, please try refreshing the page.
          <br/>Hash detected. Waiting for Supabase to authenticate...
        </div>
      )}`;

content = content.replace(returnMatch, replaceReturn);
fs.writeFileSync('src/pages/AccountAuth.tsx', content);
console.log('Added diagnostic banner');
