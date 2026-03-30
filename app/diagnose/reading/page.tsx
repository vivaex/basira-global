'use client';
import Link from 'next/link';

export default function ReadingMenu() {
  const tests = [
    { id: 'comprehension', title: 'الفهم القرائي', icon: '🧠', color: 'border-blue-500', desc: 'قياس القدرة على فهم واستيعاب معاني الجمل والفقرات.' },
    { id: 'vocabulary', title: 'المفردات اللغوية', icon: '📚', color: 'border-indigo-500', desc: 'اختبار سعة القاموس اللغوي والربط بين الكلمة ودلالتها.' },
    { id: 'visual-word', title: 'التعرف البصري', icon: '👁️', color: 'border-cyan-500', desc: 'سرعة التعرف على الكلمات المألوفة دون الحاجة للتهجئة.' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto text-center">
        <header className="mb-16 animate-in fade-in">
          <div className="text-7xl mb-6">📖</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent italic font-sans">
            مختبر مهارات القراءة
          </h1>
          <p className="text-slate-500 mt-6 text-xl">تشخيص دقة الاستيعاب وسرعة معالجة النصوص</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/reading/${test.id}`}>
              <div className={`bg-slate-900/60 p-8 rounded-[3rem] border-2 ${test.color} hover:scale-105 transition-all cursor-pointer shadow-2xl group flex flex-col items-center h-full`}>
                <span className="text-6xl mb-6 group-hover:rotate-12 transition-transform">{test.icon}</span>
                <h2 className="text-2xl font-black mb-4">{test.title}</h2>
                <p className="text-slate-400 font-light text-sm leading-relaxed">{test.desc}</p>
                <div className="mt-auto pt-8">
                    <span className="bg-slate-800 p-4 rounded-full group-hover:bg-blue-600 transition">◀</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20">
          <Link href="/diagnose" className="text-slate-600 hover:text-white underline transition">العودة للبوابة الرئيسية</Link>
        </div>
      </div>
    </main>
  );
}