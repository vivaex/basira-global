'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import BasirRobot from '@/app/components/BasirRobot';

export default function FinalResultsPage() {
  const [name, setName] = useState('أيها البطل');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);
  }, []);

  // بيانات افتراضية للنتائج (ممكن تربطها بالـ State لاحقاً)
  const scores = [
    { label: 'الذكاء المنطقي', value: 85, color: 'bg-blue-500' },
    { label: 'الذاكرة البصرية', value: 70, color: 'bg-purple-500' },
    { label: 'سرعة المعالجة', value: 60, color: 'bg-cyan-500' },
    { label: 'المهارات الحركية', value: 90, color: 'bg-emerald-500' },
  ];

  const getRobotMessage = () => {
    return `أهلاً يا بطل يا [NAME]! لقد حللت نتائجك بعناية.. أنت تمتلك قدرات رائعة في المهارات الحركية والذكاء المنطقي، وسنعمل سوياً على تطوير باقي المهارات! 💪🌟`;
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 font-sans relative overflow-hidden" dir="rtl">
      
      {/* الروبوت بصير التفاعلي */}
      <BasirRobot message={getRobotMessage()} />

      {/* خلفية تقنية (توهج) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* الهيدر */}
        <header className="mb-16">
          <Link href="/diagnose" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mb-8 font-mono">
            <span>▶</span> BACK_TO_HUB
          </Link>
          <h1 className="text-6xl font-black italic tracking-tighter">
            التقرير التشخيصي <span className="text-cyan-400 underline decoration-cyan-900">السيادي</span>
          </h1>
          <p className="text-slate-400 mt-4 text-xl italic font-light">
            تحليل البيانات العصبية والنمائية للبطل: <span className="text-white font-bold">{name}</span>
          </p>
        </header>

        {/* شبكة النتائج (التي كانت مختفية) */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          
          {/* كرت سكورات الذكاء */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-black mb-10 italic border-b border-white/5 pb-4">مؤشرات الأداء المعرفي</h2>
            <div className="space-y-8">
              {scores.map((score) => (
                <div key={score.label}>
                  <div className="flex justify-between mb-3 font-bold">
                    <span className="text-lg">{score.label}</span>
                    <span className="text-cyan-400">{score.value}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${score.value}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`${score.color} h-full shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* كرت التوصيات */}
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[4rem] shadow-2xl flex flex-col justify-center">
            <div className="text-8xl mb-6 opacity-20 text-center">📊</div>
            <h2 className="text-3xl font-black mb-6 italic text-center">الملخص السريري</h2>
            <p className="text-slate-400 text-xl leading-relaxed italic text-center font-light">
              بناءً على التفاعل مع مختبرات بَصيرة، يظهر البطل استجابة حركية ممتازة مع حاجة لتعزيز التركيز البصري المكاني. الخطة المقترحة تتضمن 12 جلسة تفاعلية مع الأفاتار "بصير".
            </p>
          </div>

        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-wrap gap-6 justify-center">
            <button className="px-12 py-6 bg-white text-black font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-xl">
                تحميل التقرير الكامل PDF 📥
            </button>
            <button className="px-12 py-6 bg-slate-800 text-white font-black text-xl rounded-2xl hover:bg-slate-700 transition-all border border-white/10">
                مشاركة النتائج مع الأخصائي 🛡️
            </button>
        </div>

      </div>

      <footer className="mt-20 text-center text-slate-700 font-mono text-xs uppercase tracking-widest">
        Official_Diagnostic_Report // Basira_2026
      </footer>
    </main>
  );
}