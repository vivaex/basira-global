const fs = require('fs');
const content = fs.readFileSync('lib/testsData.ts');
let fixed = Buffer.alloc(content.length);
let j = 0;
for (let i = 0; i < content.length; i++) {
    // Basic UTF-8 validation (simplified)
    // If it's a single byte (0-127), it's OK
    // If it's a multi-byte sequence, it's harder, but toString('utf-8') usually handles it by inserting \uFFFD
    // Instead of doing it manually, we'll just use the built-in replacement and ensure it writes back
}
fs.writeFileSync('lib/testsData.ts', content.toString('utf-8'));
console.log('Fixed lib/testsData.ts');
