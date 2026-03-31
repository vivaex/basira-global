'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SovereignGridResults() {
  const [name, setName] = useState('أيها البطل');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);
  }, []);

  // بيانات الـ 10 مختبرات مع نسب افتراضية (ممكن تعدلها لاحقاً)
  const results = [
    { id: 'math', title: 'الرياضيات', icon: '🔢', score: 85, color: 'border-blue-500/50' },
    { id: 'visual', title: 'البصر', icon: '👁️', score: 70, color: 'border-purple-500/50' },
    { id: 'attention', title: 'الانتباه', icon: '🎯', score: 65, color: 'border-red-500/50' },
    { id: 'memory', title: 'الذاكرة', icon: '🧠', score: 92, color: 'border-emerald-500/50' },
    { id: 'motor', title: 'الحركة', icon: '✍️', score: 88, color: 'border-rose-500/50' },
    { id: 'language', title: 'اللغة', icon: '📖', score: 75, color: 'border-indigo-500/50' },
    { id: 'auditory', title: 'السمع', icon: '👂', score: 80, color: 'border-cyan-500/50' },
    { id: 'executive', title: 'الوظائف', icon: '⚙️', score: 60, color: 'border-fuchsia-500/50' },
    { id: 'cognitive', title: 'الإدراك', icon: '💡', score: 82, color: 'border-amber-500/50' },
    { id: 'writing', title: 'الكتابة', icon: '🖋️', score: 95, color: 'border-teal-500/50' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-16 font-sans relative" dir="rtl">
      
      {/* توهج خلفي ناعم */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="mb-16">
          <Link href="/diagnose" className="text-slate-500 hover:text-white transition-colors mb-8 inline-block font-mono">
             ◀ BACK_TO_HUB
          </Link>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter">
            تقرير <span className="bg-gradient-to-l from-blue-400 to-cyan-400 bg-clip-text text-transparent">بَصيرة</span> النهائي
          </h1>
          <p className="text-slate-400 mt-4 text-2xl font-light italic">
            تحليل القدرات السيادي للبطل: <span className="text-white font-bold">{name}</span>
          </p>
        </header>

        {/* شبكة المربعات (الخانات) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {results.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`bg-slate-900/40 backdrop-blur-xl border-2 ${item.color} p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center group hover:bg-white hover:text-black transition-all duration-500 shadow-2xl`}
            >
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</span>
              <h3 className="text-xl font-black mb-2 italic">{item.title}</h3>
              
              {/* النسبة المئوية */}
              <div className="text-3xl font-black font-mono bg-white/5 group-hover:bg-black/5 px-4 py-2 rounded-xl mt-2">
                {item.score}%
              </div>
            </motion.div>
          ))}
        </div>

        {/* ملخص الحالة */}
        <div className="bg-slate-900/60 border border-white/10 p-12 rounded-[4rem] text-center mb-16">
          <h2 className="text-3xl font-black mb-6 italic text-cyan-400">التشخيص النهائي</h2>
          <p className="text-2xl text-slate-300 leading-relaxed italic max-w-4xl mx-auto">
            أظهر البطل <span className="text-white font-bold">{name}</span> استجابة استثنائية في مهارات الذاكرة والكتابة، مع حاجة طفيفة لتعزيز الانتباه البصري والوظائف التنفيذية عبر التدريب المكثف.
          </p>
        </div>

        {/* أزرار التحكم */}
        <div className="flex flex-wrap gap-6 justify-center">
          <button className="px-16 py-7 bg-white text-black font-black text-2xl rounded-3xl hover:scale-105 transition-all shadow-xl">
            تحميل التقرير PDF 📄
          </button>
          <button className="px-16 py-7 bg-slate-800 text-white font-black text-2xl rounded-3xl border border-white/10">
            مشاركة النتائج 🛡️
          </button>
        </div>

      </div>

      <footer className="mt-20 py-12 border-t border-white/5 text-center text-slate-700 font-mono text-sm tracking-widest uppercase">
        Sovereign_System_V6 // 2026
      </footer>
    </main>
  );
}