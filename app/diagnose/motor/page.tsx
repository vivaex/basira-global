'use client';
import Link from 'next/link';

export default function MotorMenu() {
  const tests = [
    { id: 'precision', title: 'دقة التتبع الحركي', icon: '✍️', color: 'border-rose-500', desc: 'قياس التآزر بين العين واليد (متاهة بورتيوس).' },
    { id: 'reaction', title: 'سرعة الاستجابة الحركية', icon: '⚡', color: 'border-orange-500', desc: 'اختبار سرعة رد الفعل العصبية (Psychomotor).' },
    { id: 'tapping', title: 'ثبات النقر المتكرر', icon: '👆', color: 'border-amber-500', desc: 'قياس التعب العضلي والتحكم الدقيق (Tapping Test).' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 animate-in fade-in">
          <div className="text-7xl mb-6">✍️</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent italic">
            مختبر المهارات الحركية
          </h1>
          <p className="text-slate-500 mt-6 text-xl">تحليل الكفاءة العصبية والتحكم العضلي الدقيق</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/motor/${test.id}`}>
              <div className={`bg-slate-900/60 p-8 rounded-[2.5rem] border-2 ${test.color} hover:scale-105 transition-all cursor-pointer shadow-2xl group flex flex-col items-center text-center`}>
                <span className="text-6xl mb-6">{test.icon}</span>
                <h2 className="text-2xl font-black mb-3">{test.title}</h2>
                <p className="text-slate-400 font-light text-sm">{test.desc}</p>
                <div className="mt-8 bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-rose-600 transition">◀</div>
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