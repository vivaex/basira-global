'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SovereignResultsPage() {
  const [name, setName] = useState('أيها البطل');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);
  }, []);

  // بيانات الاختبارات العشرة الذكية
  const diagnosticData = [
    { label: 'الذكاء المنطقي والرياضي', value: 88, color: 'bg-blue-500', icon: '🔢' },
    { label: 'الإدراك البصري المكاني', value: 72, color: 'bg-purple-500', icon: '👁️' },
    { label: 'الانتباه والتركيز', value: 65, color: 'bg-red-500', icon: '🎯' },
    { label: 'الذاكرة العاملة', value: 80, color: 'bg-emerald-500', icon: '🧠' },
    { label: 'التآزر الحركي البصري', value: 92, color: 'bg-rose-500', icon: '✍️' },
    { label: 'اللغة والقراءة', value: 78, color: 'bg-indigo-500', icon: '📖' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-20 font-sans relative overflow-hidden" dir="rtl">
      
      {/* لمسات خلفية (أضواء نيون خافتة) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* الهيدر */}
        <header className="mb-16 border-b border-white/5 pb-10">
          <Link href="/diagnose" className="text-slate-500 hover:text-white transition-all flex items-center gap-2 mb-8 font-mono group">
            <span className="group-hover:translate-x-1 transition-transform">▶</span> BACK_TO_DASHBOARD
          </Link>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
            التقرير <span className="bg-gradient-to-l from-cyan-400 to-blue-500 bg-clip-text text-transparent">السيادي</span> الشامل
          </h1>
          <p className="text-slate-500 text-2xl font-light italic">
            تحليل القدرات العصبية للبطل: <span className="text-white font-bold border-b-2 border-cyan-500/30">{name}</span>
          </p>
        </header>

        {/* شبكة النتائج */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          
          {/* كرت الرسوم البيانية */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[3.5rem] shadow-2xl">
            <h2 className="text-3xl font-black mb-10 italic flex items-center gap-4">
               <span className="p-3 bg-white/5 rounded-2xl">📊</span> مؤشرات الأداء اللحظية
            </h2>
            <div className="space-y-10">
              {diagnosticData.map((item) => (
                <div key={item.label} className="group">
                  <div className="flex justify-between mb-3 items-end">
                    <span className="text-xl font-bold group-hover:text-cyan-400 transition-colors">{item.icon} {item.label}</span>
                    <span className="text-cyan-400 font-mono text-2xl font-black italic">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden border border-white/5 p-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 2, ease: "circOut" }}
                      className={`${item.color} h-full rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* كرت التوصيات العلاجية */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/10 backdrop-blur-xl border border-cyan-500/20 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
               <div className="absolute -right-10 -bottom-10 text-[15rem] opacity-5 pointer-events-none italic font-black">AI</div>
               <h2 className="text-4xl font-black mb-8 italic">التوصية السيادية 🛡️</h2>
               <p className="text-2xl text-slate-300 leading-relaxed font-light italic mb-8">
                 بناءً على بروتوكول بَصيرة الرقمي، يظهر البطل تفوقاً استثنائياً في التآزر الحركي، مع حاجة طفيفة لتعزيز مهارات الانتباه الانتقائي عبر التدريب البصري المكثف.
               </p>
               <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <p className="text-cyan-400 font-bold mb-2 font-mono uppercase text-sm tracking-widest">Next_Step // الخطوة القادمة</p>
                  <p className="text-lg">البدء في المسار العلاجي المخصص (المستوى الأول) لرفع دقة التركيز البصري.</p>
               </div>
            </div>
          </div>

        </div>

        {/* أزرار الإجراءات الفخمة */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button className="w-full md:w-auto px-16 py-7 bg-white text-black font-black text-2xl rounded-3xl hover:bg-slate-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95">
                تصدير تقرير PDF 📄
            </button>
            <button className="w-full md:w-auto px-16 py-7 bg-slate-900 text-white font-black text-2xl rounded-3xl hover:bg-slate-800 transition-all border border-white/10 shadow-2xl">
                مشاركة مع المركز 🛡️
            </button>
        </div>

      </div>

      <footer className="mt-24 py-12 border-t border-white/5 text-center opacity-30 font-mono text-xs tracking-[1em] uppercase">
        Sovereign_Basira_Results // 2026
      </footer>
    </main>
  );
}