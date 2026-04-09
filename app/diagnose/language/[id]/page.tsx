import TestEngine from '@/app/components/TestEngine';

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TestEngine testId={resolvedParams.id} category="language" />;
}
