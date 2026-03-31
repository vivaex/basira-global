'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FinalSovereignReport() {
  const [name, setName] = useState('أيها البطل');
  const [parentData, setParentData] = useState<any[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);

    // معالجة بيانات الأهل
    const savedParent = localStorage.getItem('parentAssessment');
    if (savedParent) {
      const raw = JSON.parse(savedParent);
      setParentData([
        { label: 'الانتباه والتركيز', val: Math.round(((raw[1] + raw[7]) / 8) * 100) },
        { label: 'الضبط الانفعالي', val: Math.round(((raw[3] + raw[8]) / 8) * 100) },
        { label: 'التواصل الاجتماعي', val: Math.round(((raw[2] + raw[6]) / 8) * 100) },
        { label: 'المعالجة الحسية', val: Math.round(((raw[4] + raw[10]) / 8) * 100) },
        { label: 'التنظيم والاستقلال', val: Math.round(((raw[5] + raw[9]) / 8) * 100) },
      ]);
    }
  }, []);

  // بيانات الـ 10 مختبرات (النتائج الرقمية للطفل)
  const childLabs = [
    { title: 'المنطق الرقمي', score: 85, icon: '🔢', status: 'متفوق', color: 'border-blue-500/30' },
    { title: 'البصر المكاني', score: 72, icon: '👁️', status: 'مستقر', color: 'border-purple-500/30' },
    { title: 'التركيز العميق', score: 60, icon: '🎯', status: 'بحاجة لدعم', color: 'border-red-500/30' },
    { title: 'الذاكرة السيادية', score: 94, icon: '🧠', status: 'عبقري', color: 'border-emerald-500/30' },
    { title: 'التآزر الحركي', score: 88, icon: '✍️', status: 'ممتاز', color: 'border-rose-500/30' },
    { title: 'البناء اللغوي', score: 78, icon: '📖', status: 'مستقر', color: 'border-indigo-500/30' },
    { title: 'الرصد السمعي', score: 82, icon: '👂', status: 'جيد جداً', color: 'border-cyan-500/30' },
    { title: 'الوظائف العليا', score: 55, icon: '⚙️', status: 'تحدي حرج', color: 'border-fuchsia-500/30' },
    { title: 'الإدراك العام', score: 80, icon: '💡', status: 'جيد جداً', color: 'border-amber-500/30' },
    { title: 'التعبير الكتابي', score: 91, icon: '🖋️', status: 'متفوق', color: 'border-teal-500/30' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-16 relative overflow-hidden" dir="rtl">
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* هيدر التقرير الفخم */}
        <header className="mb-20 border-b border-white/5 pb-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter">
              ملف <span className="text-cyan-400">التشخيص السيادي</span> الشامل
            </h1>
            <p className="text-slate-500 text-2xl font-light italic mt-2">البطل المعالج: <span className="text-white font-bold underline decoration-cyan-500">{name}</span></p>
          </div>
          <div className="p-6 bg-slate-900/80 rounded-[2rem] border border-cyan-500/20 shadow-2xl">
             <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest block mb-1">Status: Authorized</span>
             <span className="text-2xl font-black italic">Basira_Protocol_2026</span>
          </div>
        </header>

        {/* الخانة (1): نتائج مختبرات الطفل الـ 10 */}
        <section className="mb-24">
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4 text-white">
            <span className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl">🤖</span>
            أولاً: الأداء الرقمي (نتائج الألعاب التشخيصية)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {childLabs.map((lab) => (
              <div key={lab.title} className={`bg-slate-900/40 backdrop-blur-xl border-2 ${lab.color} p-8 rounded-[3rem] text-center hover:bg-white hover:text-black transition-all duration-500 group shadow-xl`}>
                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform">{lab.icon}</span>
                <h3 className="text-sm font-bold text-slate-500 group-hover:text-black mb-1 italic">{lab.title}</h3>
                <div className="text-3xl font-black font-mono mb-2">{lab.score}%</div>
                <div className="text-[10px] uppercase font-black text-cyan-500 group-hover:text-blue-700 tracking-tighter">{lab.status}</div>
              </div>
            ))}
          </div>
        </section>

        {/* الخانة (2): تقييم الأهل من الأسئلة */}
        <section className="mb-24">
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4 text-white">
            <span className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-2xl">👨‍👩‍👧</span>
            ثانياً: الرصد الميداني (تقييم الأهل)
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {parentData.length > 0 ? parentData.map((p) => (
              <div key={p.label} className="bg-gradient-to-br from-slate-900 to-cyan-950/20 border border-cyan-500/20 p-10 rounded-[3.5rem] text-center shadow-2xl">
                <h3 className="text-xs font-bold text-cyan-400 mb-4 h-8 flex items-center justify-center uppercase">{p.label}</h3>
                <div className="text-4xl font-black text-white mb-4 italic">{p.val}%</div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${p.val}%` }} className="h-full bg-cyan-400 shadow-[0_0_15px_cyan]" />
                </div>
              </div>
            )) : (
              <div className="col-span-full p-10 bg-slate-900/30 border-2 border-dashed border-white/5 rounded-[3rem] text-center italic text-slate-600">بيانات الأهل لم تكتمل بعد.</div>
            )}
          </div>
        </section>

        {/* الخانة (3): التشخيص الدقيق لحالة الطفل */}
        <section className="mb-24 bg-white/5 border border-white/10 p-12 rounded-[4rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 p-10 text-[12rem] opacity-5 font-black pointer-events-none italic">DIAGNOSIS</div>
           <h2 className="text-4xl font-black italic mb-10 text-cyan-400 flex items-center gap-4 relative z-10">
              <span className="text-5xl">🔬</span> ثالثاً: التشخيص العيادي المفصل
           </h2>
           <div className="space-y-8 text-2xl leading-relaxed font-light italic text-slate-300 relative z-10">
             <p>بناءً على التقاطع بين <span className="text-white font-bold">الأداء الرقمي الميداني</span> و <span className="text-white font-bold">الملاحظة الوالدية</span>، يتبين أن البطل يمتلك <span className="text-cyan-400 font-bold">ذكاءً بصرياً سيادياً</span> يجعله يتفوق في المهام التي تعتمد على الصورة والربط المكاني.</p>
             <div className="grid md:grid-cols-2 gap-10 mt-10">
                <div className="p-8 bg-slate-900/60 rounded-3xl border-r-8 border-cyan-500 shadow-xl">
                  <h4 className="text-white font-black mb-4 underline decoration-cyan-500/20">الاستنتاج العصبي:</h4>
                  <ul className="space-y-4 text-lg">
                    <li>• تباين في "الوظائف التنفيذية" يسبب تشتتاً عند المهام الورقية.</li>
                    <li>• قدرة عالية على الحفظ البصري (يعالج البيانات أسرع بـ 3 مرات).</li>
                    <li>• مؤشر اندفاعية (Impulse) مرتفع قليلاً في اختبار المنطق.</li>
                  </ul>
                </div>
                <div className="p-8 bg-slate-900/60 rounded-3xl border-r-8 border-rose-500 shadow-xl">
                  <h4 className="text-white font-black mb-4 underline decoration-rose-500/20">نقاط التركيز:</h4>
                  <ul className="space-y-4 text-lg text-slate-400">
                    <li>• تحسين "كف الاندفاعية" لزيادة دقة النتائج الدراسية.</li>
                    <li>• تدريبات التآزر الحركي لرفع مستوى الخط والكتابة.</li>
                    <li>• استخدام الجداول البصرية لتقليل نوبات القلق عند التغيير.</li>
                  </ul>
                </div>
             </div>
           </div>
        </section>

        {/* الخانة (4): الخطوات العلاجية والخطة */}
        <section className="mb-20">
          <div className="bg-cyan-600 text-slate-900 p-14 rounded-[5rem] shadow-[0_0_60px_rgba(8,145,178,0.4)] relative">
            <h2 className="text-4xl font-black italic mb-8 border-b-2 border-black/10 pb-4">رابعاً: خارطة الطريق العلاجية 🚀</h2>
            <div className="grid md:grid-cols-3 gap-10">
               <div className="space-y-4">
                  <h4 className="text-2xl font-black">الخطة القريبة (أسبوع 1-4)</h4>
                  <p className="text-lg font-bold leading-tight">البدء بجلسات "تعديل الانتباه الانتقائي" (3 مرات أسبوعياً) مع الاعتماد على نظام المكافأة الفورية.</p>
               </div>
               <div className="space-y-4">
                  <h4 className="text-2xl font-black">البيئة المدرسية</h4>
                  <p className="text-lg font-bold leading-tight">يُنصح بجلوس البطل في الصفوف الأمامية وتقسيم المهام الكبيرة لخطوات صغيرة جداً (Chunking).</p>
               </div>
               <div className="space-y-4">
                  <h4 className="text-2xl font-black">توصية بَصيرة السيادية</h4>
                  <p className="text-lg font-bold leading-tight underline decoration-white/30 italic">"استثمار شغف الطفل بالصورة لتدريس المواد الصعبة (الرياضيات واللغة) عبر الخرائط الذهنية."</p>
               </div>
            </div>
            <div className="mt-12 text-center">
               <Link href="/diagnose/passport" className="inline-block px-20 py-8 bg-black text-white text-3xl font-black rounded-full hover:scale-110 transition-all shadow-2xl">
                  إصدار الجواز التعليمي 🎫
               </Link>
            </div>
          </div>
        </section>

      </div>

      <footer className="py-20 text-center opacity-10 font-mono text-xs tracking-[1em] uppercase">
        End_of_Protocol // Basira_Integrated_Report // 2026
      </footer>
    </main>
  );
}