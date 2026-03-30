'use client';
import Link from 'next/link';

export default function AttentionMenu() {
  const tests = [
    { id: 'selective', title: 'الانتباه الانتقائي', icon: '🎯', color: 'border-red-500', desc: 'التركيز على هدف محدد وتجاهل المشتتات.' },
    { id: 'sustained', title: 'الانتباه المستمر', icon: '⏳', color: 'border-orange-500', desc: 'قياس القدرة على التركيز لفترات طويلة.' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-black mb-12 bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent italic">
            مختبر تشخيص الانتباه
        </h1>
        
        <div className="grid gap-6">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/attention/${test.id}`}>
              <div className={`bg-slate-900/60 p-8 rounded-[2.5rem] border-2 ${test.color} hover:scale-105 transition-all cursor-pointer shadow-xl flex justify-between items-center group`}>
                <div className="text-right">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                    <span className="text-4xl">{test.icon}</span> {test.title}
                  </h2>
                  <p className="text-slate-400 mt-2 font-light">{test.desc}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-full group-hover:bg-red-600 transition">
                   <span className="text-2xl text-white">◀</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-slate-600">
            <Link href="/diagnose" className="hover:text-white underline transition">
                العودة للبوابة الرئيسية
            </Link>
        </div>
      </div>
    </main>
  );
}