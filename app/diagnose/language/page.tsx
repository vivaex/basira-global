'use client';
import Link from 'next/link';

export default function LanguageMenu() {
  const tests = [
    { id: 'phonology', title: 'الوعي الفونولوجي', icon: '🗣️', color: 'border-indigo-500', desc: 'تحليل الأصوات والقدرة على دمج وتقطيع الكلمات.' },
    { id: 'ran', title: 'التسمية السريعة (RAN)', icon: '⏱️', color: 'border-blue-500', desc: 'قياس سرعة استرجاع المعلومات من الذاكرة بعيدة المدى.' },
    { id: 'fluency', title: 'الطلاقة القرائية', icon: '📖', color: 'border-cyan-500', desc: 'اختبار دقة وسرعة قراءة الكلمات المألوفة وغير المألوفة.' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 animate-in fade-in">
          <div className="text-7xl mb-6">📖</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent italic">
            مختبر اللغة ومعالجة القراءة
          </h1>
          <p className="text-slate-500 mt-6 text-xl">تشخيص المهارات اللغوية التأسيسية والكفاءة القرائية</p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/language/${test.id}`}>
              <div className={`bg-slate-900/60 p-8 rounded-[2.5rem] border-2 ${test.color} hover:scale-[1.05] transition-all cursor-pointer shadow-2xl group flex flex-col justify-between h-full`}>
                <div className="text-right">
                  <span className="text-6xl mb-6 block">{test.icon}</span>
                  <h2 className="text-2xl font-black text-white mb-3">{test.title}</h2>
                  <p className="text-slate-400 font-light leading-relaxed">{test.desc}</p>
                </div>
                <div className="mt-8 flex justify-end">
                    <span className="bg-slate-800 p-4 rounded-full group-hover:bg-indigo-600 transition-all text-white">◀</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link href="/diagnose" className="text-slate-600 hover:text-white underline transition">العودة للبوابة الرئيسية</Link>
        </div>
      </div>
    </main>
  );
}