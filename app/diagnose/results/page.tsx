'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RealTimeDiagnosticResults() {
  const [name, setName] = useState('البطل');
  const [childResults, setChildResults] = useState<any[]>([]);
  const [parentStats, setParentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. جلب البيانات الخام من المتصفح
    const savedName = localStorage.getItem('studentName');
    const savedParent = localStorage.getItem('parentAssessment');
    const savedGames = localStorage.getItem('gameResults'); // نفترض أن الألعاب تخزن سكوراتها هنا

    if (savedName) setName(savedName);

    // 2. معالجة نتائج الألعاب (الـ 10 مختبرات)
    // إذا لم توجد نتائج حقيقية بعد، سنضع 0 كقيمة افتراضية لكي لا تظهر أرقام وهمية
    const labsConfig = [
      { id: 'math', title: 'المنطق الرقمي', icon: '🔢', color: 'border-blue-500/30' },
      { id: 'visual', title: 'البصر المكاني', icon: '👁️', color: 'border-purple-500/30' },
      { id: 'attention', title: 'التركيز العميق', icon: '🎯', color: 'border-red-500/30' },
      { id: 'memory', title: 'الذاكرة السيادية', icon: '🧠', color: 'border-emerald-500/30' },
      { id: 'motor', title: 'التآزر الحركي', icon: '✍️', color: 'border-rose-500/30' },
      { id: 'language', title: 'البناء اللغوي', icon: '📖', color: 'border-indigo-500/30' },
      { id: 'auditory', title: 'الرصد السمعي', icon: '👂', color: 'border-cyan-500/30' },
      { id: 'executive', title: 'الوظائف العليا', icon: '⚙️', color: 'border-fuchsia-500/30' },
      { id: 'cognitive', title: 'الإدراك العام', icon: '💡', color: 'border-amber-500/30' },
      { id: 'writing', title: 'التعبير الكتابي', icon: '🖋️', score: 91, color: 'border-teal-500/30' },
    ];

    const actualGames = savedGames ? JSON.parse(savedGames) : {};
    const processedGames = labsConfig.map(lab => {
      const score = actualGames[lab.id] || 0; // القيمة الحقيقية أو 0
      let status = "قيد الفحص";
      if (score > 0) {
        if (score >= 90) status = "متفوق (سيادي)";
        else if (score >= 75) status = "أداء ممتاز";
        else if (score >= 50) status = "مستقر";
        else status = "تحدي حرج";
      }
      return { ...lab, score, status };
    });
    setChildResults(processedGames);

    // 3. معالجة نتائج الأهل (الرصد السلوكي)
    if (savedParent) {
      const raw = JSON.parse(savedParent);
      const pStats = [
        { label: 'الانتباه المنزلي', val: Math.round(((raw[1] + raw[7]) / 8) * 100) },
        { label: 'الضبط الانفعالي', val: Math.round(((raw[3] + raw[8]) / 8) * 100) },
        { label: 'التواصل الاجتماعي', val: Math.round(((raw[2] + raw[6]) / 8) * 100) },
        { label: 'المعالجة الحسية', val: Math.round(((raw[4] + raw[10]) / 8) * 100) },
        { label: 'التنظيم والاستقلال', val: Math.round(((raw[5] + raw[9]) / 8) * 100) },
      ];
      setParentStats(pStats);
    }
    setLoading(false);
  }, []);

  // دالة لتوليد التشخيص الذكي بناءً على الأرقام الحقيقية
  const generateDiagnosis = () => {
    const memoryScore = childResults.find(l => l.id === 'memory')?.score || 0;
    const attentionScore = childResults.find(l => l.id === 'attention')?.score || 0;
    const parentExecutive = parentStats.find(p => p.label === 'التنظيم والاستقلال')?.val || 0;

    if (memoryScore > 80 && attentionScore < 50) {
      return `يظهر البطل ${name} قدرة استثنائية في الذاكرة السيادية، لكن هناك فجوة كبيرة في التركيز العميق. هذا التباين يشير إلى أن الطفل "ذكي جداً لكنه متشتت"، ويحتاج لاستراتيجيات بصرية لتقليل تشتت الانتباه.`;
    }
    if (parentExecutive < 40) {
      return `تشير تقارير الأهل إلى تحدي كبير في "التنظيم والاستقلال". بالربط مع أداء المختبرات، يحتاج البطل لبرنامج تعديل سلوك يركز على تقسيم المهام الكبيرة لخطوات صغيرة ملموسة.`;
    }
    return `التحليل الأولي يظهر توازناً في القدرات الإدراكية. ننصح بالاستمرار في تطوير مهارات المنطق الرقمي لتعزيز الثقة بالنفس والوصول لمرحلة السيادة التعليمية.`;
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-16 relative" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 border-b border-white/5 pb-10">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">التقرير <span className="text-cyan-400">الفني الحقيقي</span></h1>
          <p className="text-slate-500 text-2xl mt-4">تحليل البيانات للبطل: <span className="text-white font-bold">{name}</span></p>
        </header>

        {/* القسم 1: نتائج الألعاب الحقيقية */}
        <section className="mb-24">
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4">
            <span className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl">🤖</span>
            أولاً: أداء البطل في المختبرات الرقمية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {childResults.map((lab) => (
              <div key={lab.id} className={`bg-slate-900/40 border-2 ${lab.color} p-8 rounded-[3rem] text-center backdrop-blur-md`}>
                <span className="text-5xl mb-4 block">{lab.icon}</span>
                <h3 className="text-xs font-bold text-slate-400 mb-2 italic">{lab.title}</h3>
                <div className="text-3xl font-black mb-1">{lab.score}%</div>
                <div className="text-[10px] font-black text-cyan-500 uppercase tracking-tighter">{lab.status}</div>
              </div>
            ))}
          </div>
        </section>

        {/* القسم 2: تقييم الأهل الحقيقي */}
        <section className="mb-24">
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4">
            <span className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-2xl">👨‍👩‍👧</span>
            ثانياً: نتائج الرصد الميداني (الأهل)
          </h2>
          {parentStats.length > 0 ? (
            <div className="grid md:grid-cols-5 gap-6">
              {parentStats.map((p) => (
                <div key={p.label} className="bg-slate-900/60 border border-cyan-500/20 p-10 rounded-[3.5rem] text-center shadow-xl">
                  <h3 className="text-[10px] text-cyan-500 font-bold mb-4 uppercase">{p.label}</h3>
                  <div className="text-4xl font-black text-white mb-4 italic">{p.val}%</div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.val}%` }} className="h-full bg-cyan-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed border-white/5 rounded-[4rem] text-center text-slate-600 italic">بيانات الأهل غير مكتملة.</div>
          )}
        </section>

        {/* القسم 3: التشخيص الدقيق والتحليل */}
        <section className="mb-24 bg-white/5 border border-white/10 p-12 rounded-[4rem] shadow-2xl">
          <h2 className="text-4xl font-black italic mb-10 text-cyan-400">ثالثاً: الاستنتاج العيادي والتشخيص 🔬</h2>
          <div className="text-2xl text-slate-300 leading-relaxed font-light italic">
            <p className="mb-8">{generateDiagnosis()}</p>
            <div className="grid md:grid-cols-2 gap-8">
               <div className="p-8 bg-slate-900/60 rounded-3xl border-r-8 border-cyan-600">
                  <h4 className="text-white font-black mb-4">نقاط القوة المرصودة:</h4>
                  <ul className="text-lg space-y-2">
                    <li>• قدرة عالية على المعالجة البصرية.</li>
                    <li>• استجابة سريعة في اختبارات المنطق.</li>
                  </ul>
               </div>
               <div className="p-8 bg-slate-900/60 rounded-3xl border-r-8 border-rose-600">
                  <h4 className="text-white font-black mb-4">تحديات تستوجب التدخل:</h4>
                  <ul className="text-lg space-y-2">
                    <li>• تشتت الانتباه عند المثيرات المتعددة.</li>
                    <li>• صعوبة في كف الاندفاعية أثناء الحل.</li>
                  </ul>
               </div>
            </div>
          </div>
        </section>

        {/* القسم 4: الخطة العلاجية */}
        <section className="bg-cyan-600 text-slate-900 p-14 rounded-[5rem] shadow-2xl">
          <h2 className="text-4xl font-black italic mb-8 border-b-2 border-black/10 pb-4">رابعاً: خارطة الطريق المقترحة 🚀</h2>
          <div className="grid md:grid-cols-2 gap-10">
             <div className="text-xl font-bold italic space-y-4">
                <p>1. البدء بـ 12 جلسة "تدريب انتباه" لزيادة دقة التركيز.</p>
                <p>2. تطبيق استراتيجية "التفكير قبل التنفيذ" في المنزل والمدرسة.</p>
                <p>3. إعادة التقييم بعد إتمام المستوى الأول من المسار العلاجي.</p>
             </div>
             <div className="flex items-center justify-center">
                <Link href="/diagnose/passport" className="px-16 py-8 bg-black text-white text-3xl font-black rounded-full hover:scale-105 transition-all shadow-2xl">
                   إصدار الجواز التعليمي 🎫
                </Link>
             </div>
          </div>
        </section>
      </div>
    </main>
  );
}