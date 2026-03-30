'use client';
import Link from 'next/link';

export default function MotorMenu() {
  const tests = [
    { id: 'precision', title: 'دقة التتبع الحركي', icon: '✍️', color: 'border-rose-500', desc: 'قياس التآزر بين العين واليد من خلال تتبع المسارات.' },
    { id: 'reaction', title: 'سرعة الاستجابة الحركية', icon: '⚡', color: 'border-orange-500', desc: 'اختبار سرعة رد الفعل العضلي للأوامر البصرية.' },
    { id: 'tapping', title: 'ثبات النقر المتكرر', icon: '👆', color: 'border-amber-500', desc: 'قياس التعب العضلي والتحكم في الحركات الدقيقة.' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-16 animate-in fade-in">
          <div className="text-7xl mb-6">✍️</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent italic">
            مختبر المهارات الحركية الدقيقة
          </h1>
          <p className="text-slate-500 mt-6 text-xl italic">تحليل كفاءة الجهاز العصبي الحركي والتحكم الدقيق</p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/motor/${test.id}`}>
              <div className={`bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border-2 ${test.color} hover:scale-[1.05] transition-all cursor-pointer shadow-2xl group h-full flex flex-col justify-between`}>
                <div className="text-right">
                  <span className="text-6xl mb-4 block">{test.icon}</span>
                  <h2 className="text-2xl font-black text-white mb-2">{test.title}</h2>
                  <p className="text-slate-400 font-light leading-relaxed">{test.desc}</p>
                </div>
                <div className="mt-8 flex justify-end">
                    <span className="bg-slate-800 p-4 rounded-full group-hover:bg-rose-600 transition-colors">◀</span>
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