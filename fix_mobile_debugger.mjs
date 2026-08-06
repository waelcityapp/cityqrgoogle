import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const oldDebugger = `      {/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}
      {typeof window !== 'undefined' && window.location.hash.includes('access_token') && !currentUser && (
        <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs">
          Loading your session... If this takes too long, please try refreshing the page.
          <br/>Hash detected. Waiting for Supabase to authenticate...
        </div>
      )}`;

const newDebugger = `      {/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}
      {typeof window !== 'undefined' && window.location.hash.includes('access_token') && !currentUser && (
        <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs flex flex-col gap-2">
          <span>Loading your session... If this takes too long, please try refreshing the page.</span>
          <span>Hash detected. Waiting for Supabase to authenticate...</span>
          <button 
            onClick={async () => {
              try {
                const { getSupabaseClient } = await import('../services/supabase');
                const client = getSupabaseClient();
                if (!client) {
                  alert('No supabase client configured!');
                  return;
                }
                const { data, error } = await client.auth.getSession();
                alert('Session Data: ' + (data.session ? 'Exists' : 'Null') + ' | Error: ' + (error?.message || 'None'));
              } catch(e) {
                alert('Exception: ' + e.message);
              }
            }}
            className="px-3 py-2 bg-amber-500/40 hover:bg-amber-500/60 rounded-lg text-white font-bold w-fit"
          >
            Check Session State (Tap Me)
          </button>
          <button
            onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }}
            className="px-3 py-2 bg-red-500/40 hover:bg-red-500/60 rounded-lg text-white font-bold w-fit"
          >
            Clear Hash & Reload
          </button>
        </div>
      )}`;

if (content.includes(oldDebugger)) {
  content = content.replace(oldDebugger, newDebugger);
  fs.writeFileSync('src/pages/AccountAuth.tsx', content);
  console.log('Updated debugger');
} else {
  console.log('Could not find match');
}
