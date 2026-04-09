const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\Lenovo\\basira-global\\app\\diagnose';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            if (fullPath.endsWith('.tsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walk(baseDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix imports
    content = content.replace(/from '\.\.\/components\//g, "from '@/app/components/");
    content = content.replace(/from '\.\.\/\.\.\/components\//g, "from '@/app/components/");
    
    // Fix implicit any in children
    content = content.replace(/\{(\s*)\(\{ setScore, gameState \}\)\s*=>/g, '{$1({ setScore, gameState }: any) =>');
    
    // Fix implicit any in setScore
    content = content.replace(/setScore\(s =>/g, 'setScore((s: number) =>');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed: ${file}`);
    }
});
console.log("Done fixing lints.");
