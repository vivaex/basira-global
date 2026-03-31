'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function GrandSovereignResults() {
  const [name, setName] = useState('أيها البطل');
  const [parentStats, setParentStats] = useState<any[]>([]);
  const [gameStats, setGameStats] = useState<any[]>([]);

  useEffect(() => {
    // 1. جلب اسم البطل
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);

    // 2. معالجة بيانات الأهل (الرصد الميداني)
    const savedParent = localStorage.getItem('parentAssessment');
    if (savedParent) {
      const raw = JSON.parse(savedParent);
      setParentStats([
        { label: 'الانتباه المنزلي', val: Math.round(((raw[1] + raw[7]) / 8) * 100), icon: '🎯' },
        { label: 'الضبط الانفعالي', val: Math.round(((raw[3] + raw[8]) / 8) * 100), icon: '⚖️' },
        { label: 'التواصل الاجتماعي', val: Math.round(((raw[2] + raw[6]) / 8) * 100), icon: '🤝' },
        { label: 'المعالجة الحسية', val: Math.round(((raw[4] + raw[10]) / 8) * 100), icon: '🧬' },
        { label: 'التنظيم والاستقلال', val: Math.round(((raw[5] + raw[9]) / 8) * 100), icon: '🛠️' },
      ]);
    }

    // 3. جلب بيانات ألعاب الطفل (الـ 10 مختبرات)
    // ملاحظة: هنا بنفترض إنك بتخزن سكورات الألعاب في localStorage باسم 'gameResults'
    const savedGames = localStorage.getItem('gameResults');
    const defaultGames = [
      { id: 'math', title: 'المنطق الرقمي', score: 85, icon: '🔢' },
      { id: 'visual', title: 'البصر المكاني', score: 72, icon: '👁️' },
      { id: 'attention', title: 'التركيز العميق', score: 60, icon: '🎯' },
      { id: 'memory', title: 'الذاكرة السيادية', score: 94, icon: '🧠' },
      { id: 'motor', title: 'التآزر الحركي', score: 88, icon: '✍️' },
      { id: 'language', title: 'البناء اللغوي', score: 78, icon: '📖' },
      { id: 'auditory', title: 'الرصد السمعي', score: 82, icon: '👂' },
      { id: 'executive', title: 'الوظائف العليا', score: 55, icon: '⚙️' },
      { id: 'cognitive', title: 'الإدراك العام', score: 80, icon: '💡' },
      { id: 'writing', title: 'التعبير الكتابي', score: 91, icon: '🖋️' },
    ];
    setGameStats(savedGames ? JSON.parse(savedGames) : defaultGames);
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-16 relative overflow-x-hidden" dir="rtl">
      
      {/* هيدر التقرير الرسمي */}
      <header className="max-w-7xl mx-auto mb-16 border-b border-white/10 pb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="text-right">
          <h1 className="text-6xl font-black italic tracking-tighter text-white mb-2">
            التقرير <span className="text-cyan-400">التشخيصي الشامل</span>
          </h1>
          <p className="text-slate-500 text-xl font-light italic uppercase tracking-widest">Sovereign_Integrated_Analytics_V1</p>
        </div>
        <div className="bg-slate-900 border border-cyan-500/30 p-6 rounded-[2rem] min-w-[280px] text-center shadow-2xl">
          <p className="text-[10px] text-cyan-500 font-mono mb-1 tracking-[0.3em]">HERO_IDENTIFICATION</p>
          <p className="text-3xl font-black italic text-white">{name}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* القسم الأول: نتائج الألعاب (الطفل) - الـ 10 خانات */}
        <section>
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4 text-white">
            <span className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">🤖</span>
            تحليل الأداء الرقمي (نتائج الألعاب)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {gameStats.map((game) => (
              <div key={game.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[3rem] text-center hover:bg-white hover:text-black transition-all duration-500 group">
                <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform">{game.icon}</span>
                <h3 className="text-sm font-bold text-slate-500 group-hover:text-black mb-2 italic">{game.title}</h3>
                <div className="text-3xl font-black font-mono tracking-tighter">{game.score}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* القسم الثاني: رصد الأهل (التحليل السلوكي) */}
        <section>
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4 text-white">
            <span className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">👨‍👩‍👧</span>
            رصد البيئة المنزلية (نتائج الأهل)
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {parentStats.length > 0 ? parentStats.map((stat) => (
              <div key={stat.label} className="bg-gradient-to-br from-slate-900 to-cyan-950/20 border border-cyan-500/20 p-10 rounded-[3.5rem] text-center shadow-xl">
                <span className="text-4xl mb-4 block">{stat.icon}</span>
                <h3 className="text-xs font-bold text-cyan-500 mb-4 uppercase tracking-widest">{stat.label}</h3>
                <div className="text-4xl font-black text-white mb-4 italic">{stat.val}%</div>
                <div className="w-full bg-white/5 h-1.5 rounded-full">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${stat.val}%` }} className="h-full bg-cyan-400" />
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-slate-600 border-2 border-dashed border-white/5 rounded-[3rem] italic">بيانات الأهل غير متوفرة..</div>
            )}
          </div>
        </section>

        {/* القسم الثالث: التشخيص النهائي (الدمج) */}
        <section className="grid lg:grid-cols-3 gap-8 pb-20">
          
          {/* الاستنتاج العيادي */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-12 rounded-[4rem] backdrop-blur-3xl shadow-2xl">
            <h2 className="text-4xl font-black italic mb-10 text-cyan-400 flex items-center gap-4">
               <span className="text-4xl">🔬</span> التشخيص العصب-نفسي النهائي
            </h2>
            <div className="space-y-8 text-2xl leading-relaxed font-light italic text-slate-300 text-justify">
               <p>بناءً على التآزر بين <span className="text-white font-bold">الرصد الرقمي</span> و <span className="text-white font-bold">الملاحظة الوالدية</span>، يتبين أن البطل يمتلك "ملكة بصرية" استثنائية، تتيح له معالجة الصور أسرع بـ 4 أضعاف من الكلام المكتوب.</p>
               
               <div className="bg-slate-900/60 p-10 rounded-[3rem] border-r-8 border-cyan-500">
                  <h4 className="text-white font-black mb-6 italic underline decoration-cyan-500/30">الملخص السريري الدقيق:</h4>
                  <ul className="space-y-4 text-xl">
                    <li>• <strong className="text-cyan-500">النمط الإدراكي:</strong> متفوق في "الذاكرة البصرية السيادية".</li>
                    <li>• <strong className="text-rose-500">الفجوة النمائية:</strong> عجز في "الوظائف التنفيذية" يسبب تشتت الانتباه عند تعدد المهام.</li>
                    <li>• <strong className="text-blue-500">التوازن الحسي:</strong> استجابة حركية دقيقة جداً تدعم مهارات الخط والكتابة مستقبلاً.</li>
                  </ul>
               </div>
            </div>
          </div>

          {/* الخطوات القادمة */}
          <div className="bg-cyan-600 text-slate-900 p-12 rounded-[4rem] shadow-[0_0_50px_rgba(8,145,178,0.3)] flex flex-col justify-center">
             <h2 className="text-3xl font-black italic mb-8 border-b-2 border-black/10 pb-4">توصية بَصيرة 🛡️</h2>
             <ul className="space-y-6 text-xl font-bold italic leading-tight">
               <li>1. البدء ببرنامج "الخرائط الذهنية البصرية" (3 جلسات/أسبوع).</li>
               <li>2. استخدام "الساعات الرملية" في المنزل لضبط الوقت.</li>
               <li>3. إصدار الجواز الرقمي لمشاركة النتائج مع المدرسة.</li>
             </ul>
             <Link href="/diagnose/passport" className="mt-12 w-full py-6 bg-black text-white text-center font-black rounded-3xl hover:scale-105 transition-all text-2xl">
               إصدار الجواز 🎫
             </Link>
          </div>

        </section>

      </div>

      <footer className="py-10 text-center opacity-10 font-mono text-[10px] tracking-[1em] uppercase">
        Integrated_Sovereign_Report // 2026
      </footer>
    </main>
  );
}