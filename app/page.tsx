import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white font-sans" dir="rtl">
      {/* Header - الهيدر الفخم */}
      <header className="py-20 px-6 text-center border-b border-blue-500/20 bg-gradient-to-b from-blue-900/30 to-transparent">
        <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-6">
          الإصدار التجريبي 1.0 (2026)
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-blue-400 mb-6 tracking-tight drop-shadow-2xl">
          منظومة "بصيرة" العالمية
        </h1>
        <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
          المركز الرقمي السيادي الشامل لصعوبات التعلم <br/>
          <span className="text-blue-500 font-bold">(أكاديمياً، نمائياً، وموهبياً)</span>
        </p>
      </header>

      {/* Main Sections - الأقسام الرئيسية */}
      <section className="flex flex-col md:flex-row items-stretch justify-center gap-10 p-16 max-w-7xl mx-auto">
        
        {/* بطاقة التشخيص - الآن مرتبطة بصفحة التشخيص */}
        <div className="group bg-slate-800/40 p-10 rounded-3xl border-2 border-blue-500/20 hover:border-blue-500 hover:bg-slate-800/60 transition-all duration-500 text-center flex-1 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">🧠</div>
          <h2 className="text-3xl font-bold mb-4 text-blue-300">التشخيص المزدوج</h2>
          <p className="text-slate-400 leading-relaxed text-center mb-8 h-20">
            ابدأ رحلة التميز عبر مسار مرن للتشخيص الداخلي بالذكاء الاصطناعي أو رفع التقارير المعتمدة.
          </p>
          
          {/* هذا هو الزر السحري الذي سينقلك للتشخيص */}
          <Link href="/diagnose">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              ابدأ الآن
            </button>
          </Link>
        </div>

        {/* بطاقة مختبر الـ PDF */}
        <div className="group bg-slate-800/40 p-10 rounded-3xl border-2 border-green-500/20 hover:border-green-500 hover:bg-slate-800/60 transition-all duration-500 text-center flex-1 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="text-7xl mb-6 group-hover:rotate-12 transition-transform duration-300">📄</div>
          <h2 className="text-3xl font-bold mb-4 text-green-300">مختبر الـ PDF</h2>
          <p className="text-slate-400 leading-relaxed text-center mb-8 h-20">
            ارفع مناهجك المدرسية ليقوم الأفاتار الذكي بتحويلها إلى دروس علاجية مبسطة وتفاعلية.
          </p>
          <button className="w-full bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-lg transition opacity-50 cursor-not-allowed">
            قريباً..
          </button>
        </div>

      </section>

      {/* Footer - التذييل */}
      <footer className="mt-20 p-8 bg-slate-950/80 backdrop-blur-md text-center border-t border-slate-800">
        <p className="text-slate-500 font-medium">
          بصيرة © 2026 | رفيقك الذكي للسيادة التعليمية والتميز الرقمي
        </p>
      </footer>
    </main>
  );
}