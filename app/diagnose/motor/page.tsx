// كود موحد لكل القوائم الفرعية عشان التناسق
'use client';
import Link from 'next/link';

export default function ModernSubMenu({ title, icon, tests, backPath }: any) {
  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-20 font-sans overflow-hidden" dir="rtl">
      {/* لمسة فنية خلفية */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-950/20 rounded-full blur-[150px]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-20">
          <Link href={backPath} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-8">
            <span>▶</span> العودة للرئيسية
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-8xl p-6 bg-white/5 rounded-3xl border border-white/10">{icon}</span>
            <div>
              <h1 className="text-6xl font-black italic">{title}</h1>
              <p className="text-slate-500 mt-2 text-xl">اختر نوع الفحص المطلوب للبدء بالتحليل المتقدم.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tests.map((test: any) => (
            <Link key={test.id} href={`${backPath}/${test.id}`} className="group">
              <div className="bg-slate-900/30 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] h-full transition-all hover:bg-white hover:text-black duration-500 shadow-2xl">
                <span className="text-6xl mb-8 block group-hover:scale-110 transition-transform">{test.icon}</span>
                <h2 className="text-2xl font-black mb-4">{test.title}</h2>
                <p className="text-slate-500 group-hover:text-slate-800 text-sm leading-relaxed">{test.desc}</p>
                <div className="mt-10 pt-6 border-t border-white/5 group-hover:border-black/10 flex justify-end">
                   <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">◀</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}