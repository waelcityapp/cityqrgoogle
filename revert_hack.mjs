import fs from 'fs';
let content = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

const hack = `    // iframe detection for Google OAuth
    if (typeof window !== 'undefined' && window.self !== window.top) {
      window.open(window.location.href, '_blank');
      setErrorMsg(language === 'ar' 
        ? 'تم فتح التطبيق في نافذة جديدة. يرجى إكمال تسجيل الدخول هناك.' 
        : 'Opened app in a new window. Please complete sign in there.');
      return;
    }

`;

content = content.replace(hack, '');
fs.writeFileSync('src/pages/AccountAuth.tsx', content);
console.log('Reverted hack');
