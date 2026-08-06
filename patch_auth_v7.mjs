import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const bannerStart = content.indexOf('{/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}');
const bannerEnd = content.indexOf(')}', bannerStart) + 2;

const newBanner = `      {/* DIAGNOSTIC BANNER FOR MOBILE DEBUGGING */}
      {typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.search.includes('code=')) && (
        <div className="bg-amber-500/10 border border-amber-500/50 p-4 rounded-xl text-amber-300 font-mono text-xs flex flex-col gap-2 overflow-auto max-h-96" id="debug-banner" style={{ zIndex: 9999 }}>
          <span className="font-bold">Debugging Auth (v7)...</span>
          <div id="debug-output" className="p-2 bg-black/50 text-white rounded whitespace-pre-wrap mt-2 select-text" style={{ minHeight: '100px', wordBreak: 'break-all' }}>
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
                if (!client) { log('No client'); return; }
                log('Getting session (timeout in 5s)...');
                
                const sessionPromise = client.auth.getSession();
                const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ error: { message: 'Timeout 5s' }, data: { session: null } }), 5000));
                
                const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
                log('Session: ' + (data?.session ? 'YES' : 'NO') + ' Err: ' + (error?.message || 'none'));
                
                if (data?.session) {
                  log('Reloading in 2s...');
                  setTimeout(() => { window.location.hash = ''; window.location.search = ''; window.location.reload(); }, 2000);
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
              const search = window.location.search;
              const out = document.getElementById('debug-output');
              const log = (msg) => { if(out) out.innerText += '\\n' + msg; };
              
              log('Hash: ' + hash.substring(0, 30));
              log('Search: ' + search.substring(0, 30));
              
              const tokenMatch = hash.match(/access_token=([^&]+)/);
              const refreshMatch = hash.match(/refresh_token=([^&]+)/);
              
              const token = tokenMatch ? tokenMatch[1] : null;
              const refreshToken = refreshMatch ? refreshMatch[1] : '';
              
              log('Token extracted len: ' + (token ? token.length : 0));
              
              if (token) {
                 const client = getSupabaseClient();
                 if (client) {
                   log('Setting session...');
                   try {
                     const res = await client.auth.setSession({ access_token: token, refresh_token: refreshToken });
                     log('Set result: ' + (res.error ? res.error.message : 'OK'));
                     if (!res.error) {
                        setTimeout(() => { window.location.hash = ''; window.location.reload(); }, 1500);
                     }
                   } catch (err) {
                     log('Set err: ' + err.message);
                   }
                 }
              } else {
                 log('Could not find access_token in hash');
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
              window.location.search = '';
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
console.log('Patched v7');
