'use client';
import Link from 'next/link';

export default function MathMenu() {
  const tests = [
    { id: 'comparison', title: 'مقارنة الكميات (الحس العددي)', icon: '⚖️', desc: 'أي المجموعة أكبر؟' },
    { id: 'counting', title: 'العد والترتيب', icon: '🔢', desc: 'تحديد الأعداد المفقودة' },
    { id: 'patterns', title: 'الأنماط المنطقية', icon: '🧩', desc: 'إكمال تسلسل الأشكال' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-12 text-yellow-400">🔢 مختبر الرياضيات والعد</h1>
        <div className="grid gap-6">
          {tests.map(test => (
            <Link key={test.id} href={`/diagnose/math/${test.id}`}>
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-yellow-500 transition shadow-xl flex justify-between items-center group">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span>{test.icon}</span> {test.title}
                  </h2>
                  <p className="text-slate-500 mt-2">{test.desc}</p>
                </div>
                <span className="text-yellow-500 opacity-0 group-hover:opacity-100 transition">ابدأ ←</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/diagnose" className="text-slate-500 underline">العودة للمختبر الرئيسي</Link>
        </div>
      </div>
    </main>
  );
}