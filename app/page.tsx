'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020203] text-white font-sans overflow-hidden relative" dir="rtl">
      
      {/* عناصر خلفية متحركة (أضواء نيون ضبابية) */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>

      {/* خطوط الشبكة الفضائية (Grid) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center">
        
        {/* شارة الإصدار المضيئة */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-mono mb-12 animate-bounce">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
          BASIRA_CORE_V4.0 // 2026
        </div>

        {/* العنوان الرئيسي الدرامي */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none mb-6">
            منظومة <span className="bg-gradient-to-l from-blue-400 via-cyan-300 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">بـصيرة</span>
          </h1>
          <p className="text-2xl md:text-3xl text-slate-400 font-light max-w-3xl mx-auto leading-relaxed italic">
            المركز الرقمي السيادي الشامل لتشخيص صعوبات التعلم 
            <span className="text-white font-bold block mt-2 text-4xl">أكاديمياً، نمائياً، وموهبياً</span>
          </p>
        </div>

        {/* أزرار الانتقال السريع (Glass Cards) */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mt-12">
          
          <Link href="/diagnose" className="group">
            <div className="h-full p-10 bg-slate-900/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] transition-all hover:border-blue-500/50 hover:bg-slate-900/60 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 group-hover:opacity-20 transition-opacity">🔬</div>
              <h2 className="text-4xl font-black mb-4">بدء التشخيص</h2>
              <p className="text-slate-500 group-hover:text-slate-300 transition-colors">الدخول إلى المختبرات العشرة الذكية لبدء عملية التقييم الشامل.</p>
              <div className="mt-8 flex items-center gap-3 text-blue-400 font-bold">
                 استكشاف المختبرات <span className="text-2xl group-hover:translate-x-[-10px] transition-transform">◀</span>
              </div>
            </div>
          </Link>

          <Link href="/diagnose/results" className="group">
            <div className="h-full p-10 bg-slate-900/40 backdrop-blur-xl border-2 border-white/5 rounded-[3rem] transition-all hover:border-emerald-500/50 hover:bg-slate-900/60 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 group-hover:opacity-20 transition-opacity">📊</div>
              <h2 className="text-4xl font-black mb-4">النتائج والتقارير</h2>
              <p className="text-slate-500 group-hover:text-slate-300 transition-colors">عرض التحليلات البيانية العميقة والخطة العلاجية المخصصة للطفل.</p>
              <div className="mt-8 flex items-center gap-3 text-emerald-400 font-bold">
                 تحميل التقرير PDF <span className="text-2xl group-hover:translate-x-[-10px] transition-transform">◀</span>
              </div>
            </div>
          </Link>

        </div>

        {/* إحصائيات النظام بالأسفل */}
        <div className="mt-24 grid grid-cols-3 gap-12 border-t border-white/5 pt-12 w-full max-w-4xl text-center">
            <div>
                <div className="text-3xl font-black text-white italic">10+</div>
                <div className="text-slate-600 text-xs uppercase tracking-widest mt-1">مختبر ذكي</div>
            </div>
            <div>
                <div className="text-3xl font-black text-white italic">AI_DRIVEN</div>
                <div className="text-slate-600 text-xs uppercase tracking-widest mt-1">خوارزمية التشخيص</div>
            </div>
            <div>
                <div className="text-3xl font-black text-white italic">2026_EDITION</div>
                <div className="text-slate-600 text-xs uppercase tracking-widest mt-1">تحديث المنظومة</div>
            </div>
        </div>

      </div>
    </main>
  );
}