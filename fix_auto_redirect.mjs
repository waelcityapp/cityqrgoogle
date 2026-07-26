import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const autoRedirect = `  // Auto-switch to dashboard if logged in and currently on landing page
  useEffect(() => {
    if (currentUser && activeTab === 'landing') {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);`;

content = content.replace(autoRedirect, `  // Removed auto-redirect so user stays on Account or Landing explicitly.`);
fs.writeFileSync('src/App.tsx', content);
console.log('Removed auto redirect');
