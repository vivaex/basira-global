export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white" dir="rtl">
      {/* Header - الهيدر الفخم */}
      <header className="py-16 px-6 text-center border-b border-blue-500/20 bg-gradient-to-b from-blue-900/20 to-transparent">
        <h1 className="text-6xl font-black text-blue-400 mb-6 tracking-tight drop-shadow-md">
          منظومة "بصيرة" العالمية
        </h1>
        <p className="text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light text-center">
          المركز الرقمي السيادي الشامل لصعوبات التعلم <br/>
          <span className="text-blue-500 font-bold">(أكاديمياً، نمائياً، وموهبياً)</span>
        </p>
      </header>

      {/* Main Sections - الأقسام الرئيسية */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-10 p-16">
        
        {/* بطاقة التشخيص */}
        <div className="group bg-slate-800/50 p-10 rounded-3xl border-2 border-blue-500/20 hover:border-blue-500 hover:scale-105 transition-all duration-300 text-center w-full max-w-sm shadow-2xl backdrop-blur-sm">
          <div className="text-6xl mb-6">🧠</div>
          <h2 className="text-3xl font-bold mb-4 text-blue-300">التشخيص المزدوج</h2>
          <p className="text-slate-400 leading-relaxed text-center">
            ابدأ رحلة التميز عبر مسار مرن للتشخيص الداخلي أو رفع التقارير الخارجية.
          </p>
          <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition">
            ابدأ الآن
          </button>
        </div>

        {/* بطاقة مختبر الـ PDF */}
        <div className="group bg-slate-800/50 p-10 rounded-3xl border-2 border-green-500/20 hover:border-green-500 hover:scale-105 transition-all duration-300 text-center w-full max-w-sm shadow-2xl backdrop-blur-sm">
          <div className="text-6xl mb-6">📄</div>
          <h2 className="text-3xl font-bold mb-4 text-green-300">مختبر الـ PDF</h2>
          <p className="text-slate-400 leading-relaxed text-center">
            ارفع مناهجك المدرسية ليقوم الأفاتار الذكي بتحويلها إلى دروس علاجية مبسطة.
          </p>
          <button className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition">
            ارفع ملفك
          </button>
        </div>

      </section>

      {/* Footer - التذييل */}
      <footer className="fixed bottom-0 w-full p-6 bg-slate-950/80 backdrop-blur-md text-center border-t border-slate-800">
        <p className="text-slate-500 font-medium text-center">
          بصيرة © 2026 | رفيقك الذكي للسيادة التعليمية
        </p>
      </footer>
    </main>
  );
}
