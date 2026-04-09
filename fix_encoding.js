const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

console.log('Scanning lib and app...');
const files = [...walk('lib'), ...walk('app')];
let fixCount = 0;
files.forEach(f => {
    try {
        const buffer = fs.readFileSync(f);
        const content = buffer.toString('utf-8');
        // Check if there are replacement characters that weren't there originally
        // Or simpler: check if buffer.toString() roundtrips
        const roundTrip = Buffer.from(content, 'utf-8');
        if (Buffer.compare(buffer, roundTrip) !== 0) {
            console.log(`Fixing ${f}`);
            fs.writeFileSync(f, content);
            fixCount++;
        }
    } catch (e) {
        console.error(`Error processing ${f}: ${e.message}`);
    }
});
console.log(`Done. Fixed ${fixCount} files.`);
