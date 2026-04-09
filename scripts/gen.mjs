import fs from 'fs';
import path from 'path';

const cats = ['auditory','visual','attention','motor','language','reading','writing','math','executive','cognitive'];
const code = `import TestEngine from '@/app/components/TestEngine';

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TestEngine testId={resolvedParams.id} category="CAT" />;
}
`;

cats.forEach(c => {
  const d = path.join('app/diagnose', c, '[id]');
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'page.tsx'), code.replace('CAT', c));
});

console.log('Done generating 10 dynamic routes');
