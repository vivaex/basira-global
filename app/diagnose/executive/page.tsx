'use client';
import Link from 'next/link';

export default function ExecutiveMenu() {
  const tests = [
    { id: 'flexibility', title: 'المرونة المعرفية', icon: '🔄', color: 'border-fuchsia-500', desc: 'القدرة على التبديل بين القواعد الذهنية المختلفة بسرعة.' },
    { id: 'inhibition', title: 'كبح الاندفاع (Stroop)', icon: '🚫', color: 'border-violet-600', desc: 'التحكم في رد الفعل التلقائي والتركيز على المهمة الحقيقية.' },
    { id: 'logic', title: 'الاستدلال المنطقي', icon: '🧩', color: 'border-purple-500', desc: 'حل المشكلات وفهم التسلسل المنطقي والأنماط المعقدة.' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto text-center">
        <header className="mb-16 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className="text-7xl mb-6">⚙️</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-fuchsia-400 to-purple-600 bg-clip-text text-transparent italic">
            مختبر الوظائف التنفيذية
          </h1>
          <p className="text-slate-500 mt-6 text-xl">تحليل كفاءة الفص الجبهي والتحكم الإدراكي الأعلى</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/executive/${test.id}`}>
              <div className={`bg-slate-900/60 p-8 rounded-[3rem] border-2 ${test.color} hover:scale-105 transition-all cursor-pointer shadow-2xl group flex flex-col items-center h-full`}>
                <span className="text-6xl mb-6 group-hover:rotate-12 transition-transform">{test.icon}</span>
                <h2 className="text-2xl font-black mb-4">{test.title}</h2>
                <p className="text-slate-400 font-light text-sm leading-relaxed">{test.desc}</p>
                <div className="mt-auto pt-8">
                    <span className="bg-slate-800 p-4 rounded-full group-hover:bg-fuchsia-600 transition">◀</span>
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