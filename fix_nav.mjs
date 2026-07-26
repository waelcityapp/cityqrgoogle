import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldNav = `  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      return 'account';
    }
    return 'landing';
  });`;

const newNav = `  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
      return 'account';
    }
    return 'landing';
  });`;

content = content.replace(oldNav, newNav);
fs.writeFileSync('src/App.tsx', content);
console.log('Fixed Nav');
