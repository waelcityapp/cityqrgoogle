const fs = require('fs');
let code = fs.readFileSync('src/services/supabase.ts', 'utf-8');

code = code.replace(
  /const { error: err1 } = await client\s*\.from\('profiles'\)\s*\.update\(\{([\s\S]*?)\}\)\s*\.eq\('email', user\.email\);\s*if \(\!err1\) updated = true;/g,
  `const { data: data1, error: err1 } = await client
            .from('profiles')
            .update({$1})
            .eq('email', user.email)
            .select('id');
          if (!err1 && data1 && data1.length > 0) updated = true;`
);

code = code.replace(
  /const { error: err2 } = await client\s*\.from\('profiles'\)\s*\.update\(coreData\)\s*\.eq\('email', user\.email\);\s*if \(\!err2\) updated = true;/g,
  `const { data: data2, error: err2 } = await client
            .from('profiles')
            .update(coreData)
            .eq('email', user.email)
            .select('id');
          if (!err2 && data2 && data2.length > 0) updated = true;`
);

code = code.replace(
  /const { error: err3 } = await client\s*\.from\('profiles'\)\s*\.update\(\{([\s\S]*?)\}\)\s*\.eq\('id', user\.id\);\s*if \(\!err3\) updated = true;/g,
  `const { data: data3, error: err3 } = await client
            .from('profiles')
            .update({$1})
            .eq('id', user.id)
            .select('id');
          if (!err3 && data3 && data3.length > 0) updated = true;`
);

fs.writeFileSync('src/services/supabase.ts', code);
