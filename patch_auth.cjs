const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf-8');

code = code.replace(
  /<button\s+type="submit"\s+disabled=\{isSavingProfile\}/g,
  '<button type="button" onClick={handleSaveProfile} disabled={isSavingProfile}'
);

fs.writeFileSync('src/pages/AccountAuth.tsx', code);
