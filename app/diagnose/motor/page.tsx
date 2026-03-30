'use client';
import Link from 'next/link';

export default function MotorPage() {
  // البيانات لازم تكون هون داخل الصفحة عشان الـ map تشتغل صح
  const tests = [
    { id: 'precision', title: 'دقة التتبع الحركي', icon: '✍️', desc: 'قياس التآزر بين العين واليد (متاهة بورتيوس).' },
    { id: 'reaction', title: 'سرعة الاستجابة الحركية', icon: '⚡', desc: 'اختبار سرعة رد الفعل العصبية (Psychomotor).' },
    { id: 'tapping', title: 'ثبات النقر المتكرر', icon: '👆', desc: 'قياس التعب العضلي والتحكم الدقيق (Tapping Test).' },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-20 font-sans overflow-hidden" dir="rtl">
      {/* لمسة فنية خلفية */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-950/10 rounded-full blur-[150px]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-20">
          <Link href="/diagnose" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-8 font-mono">
            <span>▶</span> BACK_TO_HUB
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-8xl p-6 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl">✍️</span>
            <div>
              <h1 className="text-6xl font-black italic tracking-tighter bg-gradient-to-l from-white to-slate-500 bg-clip-text text-transparent">مختبر المهارات الحركية</h1>
              <p className="text-slate-500 mt-2 text-xl font-light italic">التحليل الحركي والسيال العصبي العضلي.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/motor/${test.id}`} className="group">
              <div className="bg-slate-900/30 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] h-full transition-all hover:bg-white hover:text-black duration-500 shadow-2xl flex flex-col justify-between">
                <div>
                  <span className="text-6xl mb-8 block group-hover:scale-110 transition-transform">{test.icon}</span>
                  <h2 className="text-3xl font-black mb-4">{test.title}</h2>
                  <p className="text-slate-500 group-hover:text-slate-800 text-sm leading-relaxed font-light">{test.desc}</p>
                </div>
                <div className="mt-10 pt-6 border-t border-white/5 group-hover:border-black/10 flex justify-end">
                   <span className="text-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 font-mono">GO_TASK ◀</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}