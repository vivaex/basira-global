const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\Lenovo\\basira-global\\app\\diagnose';
const dirs = [
  'writing', 'visual', 'social', 'reading', 'motor', 'math', 
  'language', 'executive', 'cognitive', 'auditory', 'attention'
];

dirs.forEach(dir => {
  const filePath = path.join(baseDir, dir, '[id]', 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace("@/app/components/TestEngine", "@/app/components/features/TestEngine");
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
});
