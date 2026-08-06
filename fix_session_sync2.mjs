import fs from 'fs';
let content = fs.readFileSync('src/services/AppContext.tsx', 'utf8');

const oldContext = `  // Listen for Supabase OAuth / Session changes (e.g. after Google Sign-In redirect)
  useEffect(() => {
    const client = getSupabaseClient();
    if (client) {
      // Check existing session
      // Enhanced session check for mobile redirects
      setTimeout(() => {
        getCurrentUserFromSupabaseSession().then((user) => {
          if (user) setCurrentUser(user);
        });
      }, 500); // Small delay to ensure Supabase parsed the URL hash

      const { data: authListener } = client.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          const user = await getCurrentUserFromSupabaseSession();
          if (user) setCurrentUser(user);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });`;

const newContext = `  // Listen for Supabase OAuth / Session changes (e.g. after Google Sign-In redirect)
  useEffect(() => {
    const client = getSupabaseClient();
    
    // Immediate fallback check from localStorage just in case Supabase is slow
    const storedUser = localStorage.getItem('cityqr_local_user');
    if (storedUser && !currentUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch(e){}
    }

    if (client) {
      // Direct session fetch
      setTimeout(() => {
        getCurrentUserFromSupabaseSession().then((user) => {
          if (user) {
            setCurrentUser(user);
          }
        });
      }, 100);

      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || session) {
          const user = await getCurrentUserFromSupabaseSession();
          if (user) setCurrentUser(user);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });`;

if (content.includes(oldContext)) {
  content = content.replace(oldContext, newContext);
  fs.writeFileSync('src/services/AppContext.tsx', content);
  console.log('Fixed session sync');
} else {
  console.log('Could not find match');
}
