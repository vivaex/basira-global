const fs = require('fs');
const path = require('path');

function fix(f) {
    const b = fs.readFileSync(f);
    // toString('utf-8') on a Buffer replaces invalid bytes with \uFFFD
    const s = b.toString('utf-8');
    // Buffer.from(s, 'utf-8') converts back to valid UTF-8
    const b2 = Buffer.from(s, 'utf-8');
    if (Buffer.compare(b, b2) !== 0) {
        console.log(`FIXED ${f}`);
        fs.writeFileSync(f, b2);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(p);
        } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.json')) {
            fix(p);
        }
    }
}

walk('lib');
walk('app');
console.log('Done');
