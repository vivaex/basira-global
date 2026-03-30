'use client';
import Link from 'next/link';

export default function AttentionMenu() {
  const tests = [
    { id: 'selective', title: 'الانتباه الانتقائي', icon: '🎯', color: 'border-red-500', desc: 'التركيز على هدف محدد وتجاهل الفخاخ.' },
    { id: 'sustained', title: 'الانتباه المستمر', icon: '⏳', color: 'border-orange-500', desc: 'تحدي الصبر والتركيز لفترة طويلة.' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-black mb-12 bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent italic">مختبر تشخيص الانتباه</h1>
        <div className="grid gap-6">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/attention-test/${test.id}`}>
              <div className={`bg-slate-900/60 p-8 rounded-[2.5rem] border-2 ${test.color} hover:scale-105 transition-all cursor-pointer shadow-xl flex justify-between items-center group`}>
                <div className="text-right">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="text-4xl">{test.icon}</span> {test.title}
                  </h2>
                  <p className="text-slate-400 mt-2">{test.desc}</p>
                </div>
                <span className="text-2xl group-hover:translate-x-[-10px] transition-transform">◀</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/diagnose" className="block mt-12 text-slate-600 underline">العودة للبوابة الرئيسية</Link>
      </div>
    </main>
  );
}