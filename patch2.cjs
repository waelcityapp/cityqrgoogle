const fs = require('fs');
let code = fs.readFileSync('src/services/supabase.ts', 'utf-8');

code = code.replace(
  /const updatePromise = async \(\) => \{\n\s*try \{\n\s*let updated = false;/g,
  `const updatePromise = async () => {
    try {
      if (client.auth) {
        await client.auth.getSession();
      }
      let updated = false;`
);

fs.writeFileSync('src/services/supabase.ts', code);
