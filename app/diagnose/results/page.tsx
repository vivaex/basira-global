'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
// تأكد إن المسار هاد يطابق مكان الروبوت عندك بالظبط
import BasirRobot from '../../components/BasirRobot'; 

export default function FinalResultsPage() {
  const [name, setName] = useState('أيها البطل');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);
  }, []);

  const scores = [
    { label: 'الذكاء المنطقي', value: 85, color: 'bg-blue-500' },
    { label: 'الذاكرة البصرية', value: 70, color: 'bg-purple-500' },
    { label: 'سرعة المعالجة', value: 60, color: 'bg-cyan-500' },
    { label: 'المهارات الحركية', value: 90, color: 'bg-emerald-500' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 relative overflow-hidden" dir="rtl">
      
      {/* 1. الروبوت بصير */}
      <BasirRobot message={`أهلاً يا بطل يا ${name}! نتائجك مذهلة وسنعمل سوياً لتطوير مهاراتك! 💪🌟`} />

      {/* 2. المحتوى الرئيسي */}
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-16">
          <Link href="/diagnose" className="text-slate-500 hover:text-white transition-colors mb-8 inline-block">
             ◀ العودة للبوابة
          </Link>
          <h1 className="text-5xl font-black italic tracking-tighter">التقرير التشخيصي <span className="text-cyan-400">السيادي</span></h1>
          <p className="text-slate-400 mt-4 text-xl">البطل: <span className="text-white font-bold">{name}</span></p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem]">
            <h2 className="text-3xl font-black mb-10 italic">مؤشرات الأداء</h2>
            <div className="space-y-8">
              {scores.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-2"><span>{s.label}</span><span>{s.value}%</span></div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 1 }} className={`${s.color} h-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/10 p-10 rounded-[3rem] flex flex-col justify-center text-center">
            <span className="text-7xl mb-6 opacity-20">📊</span>
            <p className="text-slate-300 text-xl italic">أداء متميز في التآزر الحركي البصري، ونوصي بتمارين لزيادة سرعة المعالجة الذهنية عبر جلسات بصير.</p>
          </div>
        </div>
      </div>
    </main>
  );
}