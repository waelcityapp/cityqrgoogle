import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const oldCode = `  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await loginWithGoogle();`;

const newCode = `  const handleGoogleSignIn = async () => {
    // iframe detection for Google OAuth
    if (typeof window !== 'undefined' && window.self !== window.top) {
      window.open(window.location.href, '_blank');
      setErrorMsg(language === 'ar' 
        ? 'تم فتح التطبيق في نافذة جديدة. يرجى إكمال تسجيل الدخول هناك.' 
        : 'Opened app in a new window. Please complete sign in there.');
      return;
    }

    setIsGoogleLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await loginWithGoogle();`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/pages/AccountAuth.tsx', content);
console.log('Fixed AccountAuth');
