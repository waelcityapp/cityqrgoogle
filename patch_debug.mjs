import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const bannerStart = content.indexOf('{/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}');
const bannerEnd = content.indexOf(')}', bannerStart) + 2;

const newBanner = `      {/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}
      {typeof window !== 'undefined' && window.location.hash.includes('access_token') && !currentUser && (
        <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs flex flex-col gap-2 overflow-auto max-h-96" id="debug-banner" style={{ zIndex: 9999 }}>
          <span className="font-bold">Debugging Auth...</span>
          <div id="debug-output" className="p-2 bg-black/50 text-white rounded whitespace-pre-wrap mt-2 select-text" style={{ minHeight: '100px' }}>
            Initializing...
          </div>
          <button 
            onClick={async () => {
              const out = document.getElementById('debug-output');
              const log = (msg) => { if(out) out.innerText += '\\n' + msg; };
              log('Manual check started...');
              try {
                const client = getSupabaseClient();
                if (!client) { log('No client'); return; }
                log('Client exists');
                const { data, error } = await client.auth.getSession();
                log('Session: ' + (data?.session ? 'YES' : 'NO') + ' Err: ' + (error?.message || 'none'));
              } catch(e) {
                log('Exception: ' + e.message);
              }
            }}
            className="px-3 py-2 bg-amber-500/40 rounded-lg text-white font-bold mt-2 border border-amber-500"
          >
            Check Session Again
          </button>
          <button
            onClick={() => {
              const hash = window.location.hash;
              const params = new URLSearchParams(hash.substring(1));
              const token = params.get('access_token');
              const type = params.get('token_type');
              const out = document.getElementById('debug-output');
              if (out) out.innerText += '\\nHash token length: ' + (token ? token.length : 0);
              
              if (token) {
                 const client = getSupabaseClient();
                 if (client) {
                   client.auth.setSession({ access_token: token, refresh_token: params.get('refresh_token') || '' }).then(res => {
                     if (out) out.innerText += '\\nSet session result: ' + (res.error ? res.error.message : 'OK');
                     setTimeout(() => window.location.reload(), 1000);
                   }).catch(e => {
                     if (out) out.innerText += '\\nSet session err: ' + e.message;
                   });
                 }
              }
            }}
            className="px-3 py-2 bg-blue-500/40 rounded-lg text-white font-bold mt-2 border border-blue-500"
          >
            Force Inject Token
          </button>
          <button
            onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }}
            className="px-3 py-2 bg-red-500/40 rounded-lg text-white font-bold"
          >
            Clear Hash & Reload
          </button>
        </div>
      )}`;

content = content.substring(0, bannerStart) + newBanner + content.substring(bannerEnd);
fs.writeFileSync('src/pages/AccountAuth.tsx', content);

// Also add a window error listener inside a useEffect in AppContext to catch unhandled errors
console.log('Patched');
