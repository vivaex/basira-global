'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function IntegratedResultsPage() {
  const [name, setName] = useState('أيها البطل');
  const [parentData, setParentData] = useState<any>(null);

  useEffect(() => {
    // جلب اسم الطالب
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);

    // جلب ومعالجة نتائج الأهل
    const savedParentData = localStorage.getItem('parentAssessment');
    if (savedParentData) {
      const rawAnswers = JSON.parse(savedParentData);
      
      // تحليل الإجابات وتحويلها لسكورات مئوية (كل فئة سؤالين، المجموع من 8)
      const categories = [
        { label: 'الانتباه المنزلي', scores: [rawAnswers[1], rawAnswers[7]], color: 'bg-cyan-500' },
        { label: 'التواصل الاجتماعي', scores: [rawAnswers[2], rawAnswers[6]], color: 'bg-blue-500' },
        { label: 'الضبط الانفعالي', scores: [rawAnswers[3], rawAnswers[8]], color: 'bg-red-500' },
        { label: 'المعالجة الحسية', scores: [rawAnswers[4], rawAnswers[10]], color: 'bg-purple-500' },
        { label: 'التنظيم والاستقلالية', scores: [rawAnswers[5], rawAnswers[9]], color: 'bg-emerald-500' },
      ];

      const processed = categories.map(cat => ({
        label: cat.label,
        percentage: Math.round(((cat.scores[0] + cat.scores[1]) / 8) * 100),
        color: cat.color
      }));
      
      setParentData(processed);
    }
  }, []);

  const childLabs = [
    { title: 'المنطق الرقمي', score: 85, color: 'border-blue-500/30' },
    { title: 'البصر المكاني', score: 70, color: 'border-purple-500/30' },
    { title: 'الذاكرة السيادية', score: 92, color: 'border-emerald-500/30' },
    { title: 'التآزر الحركي', score: 88, color: 'border-rose-500/30' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 relative overflow-hidden" dir="rtl">
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="mb-16 border-b border-white/5 pb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter">التقرير <span className="text-cyan-400">الشامل</span></h1>
            <p className="text-slate-500 text-2xl mt-4">البطل: <span className="text-white font-bold">{name}</span></p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 px-6 py-2 rounded-full text-cyan-400 font-mono text-sm hidden md:block">
            Sovereign_ID: {Math.floor(Math.random() * 900000) + 100000}
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* القسم الأول: نتائج المختبرات (الطفل) */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-3xl font-black italic flex items-center gap-4">
              <span className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-xl">🤖</span>
              أداء البطل في المختبرات
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {childLabs.map((lab) => (
                <div key={lab.title} className={`bg-slate-900/40 backdrop-blur-xl border ${lab.color} p-8 rounded-[2.5rem]`}>
                  <div className="flex justify-between mb-4 items-end">
                    <span className="text-xl font-bold italic">{lab.title}</span>
                    <span className="text-3xl font-black text-cyan-400 font-mono">{lab.score}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${lab.score}%` }} className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* القسم الثاني: نتائج رصد الأهل (الجديد) */}
          <div className="bg-gradient-to-b from-slate-900 to-[#020617] border-2 border-white/5 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl italic font-black">PARENT</div>
            <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4 relative z-10">
               <span className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl">👨‍👩‍👧</span>
               رصد الأهل الميداني
            </h2>

            {parentData ? (
              <div className="space-y-8 relative z-10">
                {parentData.map((item: any) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between mb-2 text-sm font-bold">
                      <span className="text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                      <span className="text-white font-mono">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${item.percentage}%` }} 
                        className={`h-full ${item.color} shadow-lg`} 
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-6 mt-6 border-t border-white/5 text-slate-500 italic text-sm text-center font-light">
                  * تم دمج ملاحظات الأهل مع الأداء الرقمي لتحسين دقة التوصيات.
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-700 italic border-2 border-dashed border-white/5 rounded-[3rem] p-6">
                <p>بيانات الأهل غير مكتملة بعد.</p>
                <Link href="/diagnose/parent-hub" className="mt-4 text-cyan-500 underline">أكمل الرصد الميداني ◀</Link>
              </div>
            )}
          </div>

        </div>

        {/* القسم الثالث: التحليل السيادي المدمج */}
        <section className="mt-16 bg-white/5 border border-white/10 p-12 rounded-[4rem] backdrop-blur-md">
            <h2 className="text-4xl font-black italic mb-8 text-cyan-400">التوصية السيادية الموحدة 🛡️</h2>
            <p className="text-2xl text-slate-300 leading-relaxed font-light italic">
              بناءً على التآزر بين نتائج المختبرات ورصد الأهل، يظهر البطل استجابة قوية في التعلم البصري، بينما يشير التباين في "الضبط الانفعالي" و"الوظائف العليا" إلى ضرورة البدء ببروتوكول "تعديل السلوك التنظيمي" لضمان استقرار الأداء الأكاديمي.
            </p>
        </section>

      </div>
    </main>
  );
}