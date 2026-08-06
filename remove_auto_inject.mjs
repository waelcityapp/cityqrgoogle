import fs from 'fs';
let content = fs.readFileSync('src/services/AppContext.tsx', 'utf8');

const injectionCodeStart = content.indexOf('// Auto-inject hash if present');
if (injectionCodeStart !== -1) {
  const nextSectionStart = content.indexOf('const storedUser', injectionCodeStart);
  if (nextSectionStart !== -1) {
    content = content.substring(0, injectionCodeStart) + content.substring(nextSectionStart);
    fs.writeFileSync('src/services/AppContext.tsx', content);
    console.log('Removed auto inject');
  }
}
