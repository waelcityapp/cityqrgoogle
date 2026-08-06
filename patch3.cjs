const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf-8');

code = code.replace(
  /setProfileErrorMsg\(language === 'ar' \? 'عفواً، فشل حفظ التغييرات\. تحقق من اتصالك بالإنترنت\.' : 'Failed to save changes\. Please check your internet connection\.'\);/g,
  `setProfileErrorMsg(language === 'ar' ? 'عفواً، فشل الحفظ: ' + (err as any).message : 'Failed to save: ' + (err as any).message);`
);

fs.writeFileSync('src/pages/AccountAuth.tsx', code);
