import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const bannerStart = content.indexOf('{/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}');
const bannerEnd = content.indexOf(')}', bannerStart) + 2;

const newBanner = `      {/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}
      {typeof window !== 'undefined' && window.location.hash.includes('access_token') && (
        <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs flex flex-col gap-2 overflow-auto max-h-96" id="debug-banner" style={{ zIndex: 9999 }}>
          <span className="font-bold">Debugging Auth (v5)...</span>
          <div id="debug-output" className="p-2 bg-black/50 text-white rounded whitespace-pre-wrap mt-2 select-text" style={{ minHeight: '100px' }}>
            Ready.
          </div>
          <button 
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              const out = document.getElementById('debug-output');
              const log = (msg) => { if(out) out.innerText += '\\n' + msg; };
              log('Check clicked...');
              try {
                const client = getSupabaseClient();
                if (!client) { log('No client configured'); return; }
                log('Client OK. Getting session...');
                const { data, error } = await client.auth.getSession();
                log('Session: ' + (data?.session ? 'YES' : 'NO') + ' Err: ' + (error?.message || 'none'));
                
                if (data?.session) {
                  log('Has session for ' + data.session.user.email);
                  log('Reloading in 2s...');
                  setTimeout(() => {
                     window.location.hash = '';
                     window.location.reload();
                  }, 2000);
                }
              } catch(err) {
                log('Catch: ' + err.message);
              }
            }}
            className="px-3 py-2 bg-amber-500/40 rounded-lg text-white font-bold mt-2 border border-amber-500"
          >
            Check Session Again
          </button>
          
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              const hash = window.location.hash;
              const params = new URLSearchParams(hash.substring(1));
              const token = params.get('access_token');
              const out = document.getElementById('debug-output');
              const log = (msg) => { if(out) out.innerText += '\\n' + msg; };
              log('Token len: ' + (token ? token.length : 0));
              
              if (token) {
                 const client = getSupabaseClient();
                 if (client) {
                   log('Setting session...');
                   try {
                     const res = await client.auth.setSession({ access_token: token, refresh_token: params.get('refresh_token') || '' });
                     log('Set result: ' + (res.error ? res.error.message : 'OK'));
                     if (!res.error) {
                        setTimeout(() => {
                           window.location.hash = '';
                           window.location.reload();
                        }, 1000);
                     }
                   } catch (err) {
                     log('Set err: ' + err.message);
                   }
                 }
              }
            }}
            className="px-3 py-2 bg-blue-500/40 rounded-lg text-white font-bold mt-2 border border-blue-500"
          >
            Force Inject Token
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
              window.location.reload();
            }}
            className="px-3 py-2 bg-red-500/40 rounded-lg text-white font-bold mt-2"
          >
            Clear Hash & Reload
          </button>
        </div>
      )}`;

content = content.substring(0, bannerStart) + newBanner + content.substring(bannerEnd);
fs.writeFileSync('src/pages/AccountAuth.tsx', content);
console.log('Patched');
