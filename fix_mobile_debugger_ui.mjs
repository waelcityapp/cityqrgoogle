import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

// Ensure import is at the top
if (!content.includes('getSupabaseClient')) {
  content = content.replace("import { useApp } from '../services/AppContext';", "import { useApp } from '../services/AppContext';\nimport { getSupabaseClient } from '../services/supabase';");
}

const oldDebugger = `        <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs flex flex-col gap-2" id="debug-banner">
          <span>Loading your session... If this takes too long, please try refreshing the page.</span>
          <span>Hash detected. Waiting for Supabase to authenticate...</span>
          <div id="debug-output" className="p-2 bg-black/50 text-white rounded whitespace-pre-wrap mt-2 empty:hidden"></div>
          <button 
            onClick={async () => {
              const out = document.getElementById('debug-output');
              if (out) out.innerText = 'Checking...';
              try {
                const { getSupabaseClient } = await import('../services/supabase');
                const client = getSupabaseClient();
                if (!client) {
                  if (out) out.innerText = 'Error: No supabase client configured! Check env vars.';
                  return;
                }
                
                let sessionInfo = 'Client initialized.\\n';
                const { data, error } = await client.auth.getSession();
                sessionInfo += 'Session Data: ' + (data?.session ? 'Exists' : 'Null') + '\\n';
                sessionInfo += 'Error: ' + (error?.message || 'None') + '\\n';
                
                // Let's try to get user explicitly
                const { data: userData, error: userError } = await client.auth.getUser();
                sessionInfo += 'User Data: ' + (userData?.user ? userData.user.email : 'Null') + '\\n';
                sessionInfo += 'User Error: ' + (userError?.message || 'None') + '\\n';
                
                if (out) out.innerText = sessionInfo;
              } catch(e) {
                if (out) out.innerText = 'Exception:\\n' + e.message + '\\n' + e.stack;
              }
            }}
            className="px-3 py-2 bg-amber-500/40 hover:bg-amber-500/60 rounded-lg text-white font-bold w-fit mt-2"
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
        </div>`;

const newDebugger = `        <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs flex flex-col gap-2" id="debug-banner">
          <span>Loading your session... If this takes too long, please try refreshing the page.</span>
          <span>Hash detected. Waiting for Supabase to authenticate...</span>
          <div id="debug-output" className="p-2 bg-black/50 text-white rounded whitespace-pre-wrap mt-2 empty:hidden"></div>
          <button 
            onClick={async () => {
              const out = document.getElementById('debug-output');
              if (out) out.innerText = 'Checking...';
              try {
                const client = getSupabaseClient();
                if (!client) {
                  if (out) out.innerText = 'Error: No supabase client configured! Check env vars.';
                  return;
                }
                
                let sessionInfo = 'Client initialized.\\n';
                const { data, error } = await client.auth.getSession();
                sessionInfo += 'Session Data: ' + (data?.session ? 'Exists' : 'Null') + '\\n';
                sessionInfo += 'Error: ' + (error?.message || 'None') + '\\n';
                
                // Let's try to get user explicitly
                const { data: userData, error: userError } = await client.auth.getUser();
                sessionInfo += 'User Data: ' + (userData?.user ? userData.user.email : 'Null') + '\\n';
                sessionInfo += 'User Error: ' + (userError?.message || 'None') + '\\n';
                
                if (out) out.innerText = sessionInfo;
              } catch(e) {
                if (out) out.innerText = 'Exception:\\n' + e.message + '\\n' + e.stack;
              }
            }}
            className="px-3 py-2 bg-amber-500/40 hover:bg-amber-500/60 rounded-lg text-white font-bold w-fit mt-2"
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
        </div>`;

if (content.includes(oldDebugger)) {
  content = content.replace(oldDebugger, newDebugger);
  fs.writeFileSync('src/pages/AccountAuth.tsx', content);
  console.log('Updated debugger UI to static import');
} else {
  console.log('Could not find match in debugger UI update');
}
