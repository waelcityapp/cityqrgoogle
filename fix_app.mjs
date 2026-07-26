import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const popupLogic = `  const [isOAuthPopup, setIsOAuthPopup] = useState(false);

  useEffect(() => {
    // If this window is a popup (has opener) and has an access token in the hash,
    // wait a moment for Supabase to parse it, then close this popup window.
    if (typeof window !== 'undefined' && window.opener && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
      setIsOAuthPopup(true);
      const timer = setTimeout(() => {
        window.close();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isOAuthPopup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4 text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-bold font-sans">
            {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
          </h2>
          <p className="text-zinc-400 font-medium">
            {language === 'ar' ? 'سيتم إغلاق هذه النافذة تلقائياً.' : 'This window will close automatically.'}
          </p>
        </div>
      </div>
    );
  }
`;

content = content.replace(popupLogic, '');
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx');
