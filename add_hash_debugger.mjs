import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const returnMatch = `        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 shadow-xl relative z-10 backdrop-blur-xl">`;

const replaceReturn = `        {typeof window !== 'undefined' && window.location.hash.includes('access_token') && (
          <div className="mb-4 p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-300 font-mono text-xs overflow-hidden break-words text-left">
            <strong>DEBUG: Auth Hash Detected!</strong><br/>
            Waiting for Supabase to parse it.<br/>
            If you are stuck here, Supabase failed to parse the token. Try clearing browser cache.<br/>
            Hash length: {window.location.hash.length}
          </div>
        )}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 shadow-xl relative z-10 backdrop-blur-xl">`;

if (content.includes(returnMatch)) {
  content = content.replace(returnMatch, replaceReturn);
  fs.writeFileSync('src/pages/AccountAuth.tsx', content);
  console.log('Added hash debugger to login form');
} else {
  console.log('Could not find match');
}
