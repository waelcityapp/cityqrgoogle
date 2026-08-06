import fs from 'fs';
let auth = fs.readFileSync('src/pages/AccountAuth.tsx', 'utf8');

auth = auth.replace(
  "              const out = document.getElementById('debug-output');",
  `              const out = document.getElementById('debug-output');
              if (out) out.innerText += '\\nStarting check...';`
);

auth = auth.replace(
  "              if (out) out.innerText = 'Checking...';",
  ""
);

fs.writeFileSync('src/pages/AccountAuth.tsx', auth);
console.log('Fixed auth UI');
