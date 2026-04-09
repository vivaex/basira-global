import { generateClinicalSummary } from '../lib/studentProfile';

console.log('Testing generateClinicalSummary...');
const summary = generateClinicalSummary([]);
console.log('Summary generated successfully:', summary);
