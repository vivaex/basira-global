'use client';
import Link from 'next/link';

export default function MathMenu() {
  const tests = [
    { 
      id: 'comparison', 
      title: 'مقارنة الكميات', 
      icon: '⚖️', 
      color: 'border-blue-500', 
      desc: 'تحدي "الرادار البصري".. أي المجموعة أكبر؟' 
    },
    { 
      id: 'counting', 
      title: 'تحدي الرقم المفقود', 
      icon: '🔢', 
      color: 'border-yellow-500', 
      desc: 'اكتشف الرقم الذي هرب من السلسلة الحسابية.' 
    },
    { 
      id: 'patterns', 
      title: 'تحدي الأنماط الذكي', 
      icon: '🧩', 
      color: 'border-purple-500', 
      desc: 'أكمل اللوحة بالشكل المنطقي الصحيح.' 
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* رأس الصفحة */}
        <header className="text-center mb-16 animate-in fade-in duration-700">
          <div className="text-7xl mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">🔢</div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent italic">
            مختبر التشخيص الرياضي
          </h1>
          <p className="text-slate-500 mt-6 text-xl font-light">
            اختر التحدي المطلوب لتقييم المهارات الحسابية والمنطقية
          </p>
        </header>

        {/* شبكة الاختيارات */}
        <div className="grid gap-6">
          {tests.map((test) => (
            <Link key={test.id} href={`/diagnose/math/${test.id}`}>
              <div className={`bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border-2 ${test.color} hover:scale-[1.03] transition-all cursor-pointer shadow-2xl flex justify-between items-center group overflow-hidden relative`}>
                
                {/* تأثير خلفية عند الحوم (Hover) */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-white`}></div>

                <div className="text-right z-10">
                  <h2 className="text-2xl md:text-3xl font-black flex items-center gap-4 text-white">
                    <span className="bg-slate-800 p-3 rounded-2xl shadow-inner">{test.icon}</span> 
                    {test.title}
                  </h2>
                  <p className="text-slate-400 mt-3 text-lg font-light pr-2">
                    {test.desc}
                  </p>
                </div>

                <div className="bg-slate-800 p-5 rounded-3xl group-hover:bg-yellow-600 group-hover:text-black transition-all shadow-lg z-10">
                  <span className="text-2xl font-bold">ابدأ ←</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* زر العودة */}
        <div className="mt-16 text-center">
          <Link href="/diagnose" className="text-slate-600 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 text-lg group">
             <span className="group-hover:-translate-x-2 transition-transform">🔙</span>
             العودة لبوابة التشخيص الرئيسية
          </Link>
        </div>

        <footer className="mt-20 opacity-20 text-center text-sm italic">
          منصة بصيرة - وحدة التقييم الرقمي v1.2
        </footer>
      </div>
    </main>
  );
}