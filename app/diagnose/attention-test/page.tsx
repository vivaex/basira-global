'use client';
import Link from 'next/link';

export default function AttentionMenu() {
  const tests = [
    { id: 'selective', title: 'الانتباه الانتقائي', icon: '🎯', color: 'border-red-500', desc: 'التركيز على هدف محدد وتجاهل المشتتات.' },
    { id: 'sustained', title: 'الانتباه المستمر', icon: '⏳', color: 'border-orange-500', desc: 'قياس القدرة على التركيز لفترات طويلة.' },
    { id: 'divided', title: 'الانتباه المتشعب', icon: '🌪️', color: 'border-yellow-500', desc: 'القيام بمهمتين في وقت واحد بدقة.' },
    { id: 'impulsivity', title: 'التحكم بالاندفاع', icon: '🛑', color: 'border-pink-500', desc: 'التوقف عن الاستجابة في الوقت المناسب.' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 animate-in fade-in">
          <div className="text-7xl mb-6">🎯</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent italic">
            مختبر تشخيص الانتباه
          </h1>
          <p className="text-slate-500 mt-6 text-xl">تحليل سرعة الاستجابة والقدرة على التركيز الذهني</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/attention/${test.id}`}>
              <div className={`bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border-2 ${test.color} hover:scale-[1.03] transition-all cursor-pointer shadow-2xl group`}>
                <div className="flex items-center gap-6">
                  <span className="text-6xl bg-slate-800 p-4 rounded-3xl group-hover:rotate-12 transition-transform">{test.icon}</span>
                  <div className="text-right">
                    <h2 className="text-2xl font-black text-white">{test.title}</h2>
                    <p className="text-slate-400 mt-2 font-light">{test.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/diagnose" className="text-slate-600 hover:text-white underline transition">العودة للبوابة الرئيسية</Link>
        </div>
      </div>
    </main>
  );
}