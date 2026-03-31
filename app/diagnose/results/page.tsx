'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ResultsPage() {
  const [name, setName] = useState('أيها البطل');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 font-sans relative overflow-hidden" dir="rtl">
      
      {/* توهج خلفي ناعم */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        <header className="mb-16">
          <Link href="/diagnose" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-8 font-mono">
            <span>▶</span> BACK_TO_HUB
          </Link>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-tight">
            التقرير <span className="bg-gradient-to-l from-blue-400 to-cyan-400 bg-clip-text text-transparent">النهائي</span>
          </h1>
          <p className="text-slate-400 mt-4 text-2xl font-light italic">
            نتائج تحليل القدرات للبطل: <span className="text-white font-bold">{name}</span>
          </p>
        </header>

        {/* شبكة البيانات - Glassmorphism */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-black mb-10 italic border-b border-white/5 pb-4">المؤشرات العصبية</h2>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-xl">سرعة الاستجابة</span>
                <span className="text-cyan-400 font-black text-2xl">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl">التركيز البصري</span>
                <span className="text-purple-400 font-black text-2xl">70%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl">الذاكرة العاملة</span>
                <span className="text-blue-400 font-black text-2xl">92%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-12 rounded-[4rem] shadow-2xl flex flex-col justify-center">
            <div className="text-7xl mb-6 opacity-10 text-center font-black italic">TOP_SCORE</div>
            <p className="text-2xl text-slate-300 leading-relaxed italic text-center font-light">
              يظهر التحليل الرقمي تفوقاً في المهارات المنطقية والحركية. نوصي بالاستمرار في المسار التدريبي لتعزيز الانتباه البصري.
            </p>
          </div>

        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-wrap gap-6 justify-center">
          <button className="px-12 py-6 bg-white text-black font-black text-xl rounded-2xl hover:scale-105 transition-all">
            تصدير التقرير PDF 📥
          </button>
          <button className="px-12 py-6 bg-slate-800 text-white font-black text-xl rounded-2xl border border-white/10">
            مشاركة النتائج 🛡️
          </button>
        </div>

      </div>

      <footer className="mt-20 text-center text-slate-700 font-mono text-xs uppercase tracking-[0.5em]">
        SOVEREIGN_SYSTEM_REPORT // 2026
      </footer>
    </main>
  );
}