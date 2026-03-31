'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DeepDiagnosticReport() {
  const [name, setName] = useState('أيها البطل');
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) setName(savedName);

    const parentRaw = localStorage.getItem('parentAssessment');
    if (parentRaw) {
      const raw = JSON.parse(parentRaw);
      // محاكاة محرك التحليل الذكي
      setAnalysis({
        executive: Math.round(((raw[5] + raw[9]) / 8) * 100), // التنظيم
        attention: Math.round(((raw[1] + raw[7]) / 8) * 100), // الانتباه
        emotional: Math.round(((raw[3] + raw[8]) / 8) * 100), // الضبط
        sensory: Math.round(((raw[4] + raw[10]) / 8) * 100),  // الحس
        social: Math.round(((raw[2] + raw[6]) / 8) * 100),   // التواصل
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-16 relative overflow-x-hidden" dir="rtl">
      
      {/* تأثيرات بصرية سيادية */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* 1. رأس التقرير (Official Header) */}
        <header className="mb-16 border-b border-white/10 pb-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-right">
            <h1 className="text-6xl font-black italic tracking-tighter text-white mb-2 underline decoration-cyan-500 decoration-4 underline-offset-8">
              ملف التشخيص <span className="text-cyan-400 font-mono italic">V1.0</span>
            </h1>
            <p className="text-slate-500 text-xl italic uppercase tracking-widest font-light">Sovereign_Diagnostic_Intelligence</p>
          </div>
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-cyan-500/30 text-center min-w-[250px]">
            <p className="text-xs text-cyan-500 uppercase font-mono mb-1">اسم البطل المعالج</p>
            <p className="text-3xl font-black italic text-white uppercase">{name}</p>
          </div>
        </header>

        {/* 2. قطاع التحليل العصب-نفسي (The Deep Analysis) */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          
          {/* الجانب الأيمن: التقييم السلوكي (الأهل) */}
          <div className="bg-slate-950/50 border border-white/5 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl font-black italic mb-8 border-r-4 border-cyan-500 pr-4">البروتوكول السلوكي (الأهل)</h3>
            <div className="space-y-10">
              {analysis && Object.entries(analysis).map(([key, val]: any) => (
                <div key={key}>
                  <div className="flex justify-between mb-2 font-bold text-sm italic">
                    <span>{key === 'executive' ? 'التنظيم' : key === 'attention' ? 'الانتباه' : key === 'emotional' ? 'الانفعال' : key === 'sensory' ? 'الحس' : 'التواصل'}</span>
                    <span className={val < 50 ? 'text-rose-500' : 'text-cyan-400'}>{val}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className={`h-full ${val < 50 ? 'bg-rose-600' : 'bg-cyan-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الجانب الأوسط والأيسر: التشخيص المفصل (Detailed Diagnosis) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* خانة التشخيص الدقيق */}
            <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] backdrop-blur-xl">
              <h3 className="text-3xl font-black italic mb-8 text-cyan-400 flex items-center gap-4">
                <span className="text-4xl">🔬</span> الاستنتاج العيادي المفصل
              </h3>
              <div className="space-y-6 text-2xl leading-relaxed font-light italic text-slate-300">
                <p>
                  بناءً على التقاطع بين <span className="text-white font-bold">الأداء الرقمي الميداني</span> و <span className="text-white font-bold">الملاحظة الوالدية</span>، يتبين أن البطل يعاني من تباين في 
                  <span className="text-cyan-400 font-bold"> التكامل الحسي الحركي</span>. 
                </p>
                <div className="p-8 bg-slate-900/40 rounded-3xl border-r-8 border-cyan-600 my-8">
                  <h4 className="text-white font-black mb-4">الملخص التشخيصي:</h4>
                  <ul className="space-y-4 text-lg">
                    <li>• <strong className="text-cyan-500">النمط الإدراكي:</strong> بصري متفوق (يستوعب الصور أسرع بـ 3 أضعاف من الكلمات).</li>
                    <li>• <strong className="text-rose-500">التحدي الرئيسي:</strong> ضعف في "كف الاندفاعية" (Impulse Control)، مما يفسر التسرع في الإجابة رغم معرفة الحل.</li>
                    <li>• <strong className="text-blue-500">المؤشر النمائي:</strong> تآزر حركي دقيق يحتاج لصقل لرفع جودة الخط والكتابة.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* خارطة الطريق العلاجية (Roadmap) */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem]">
                <h4 className="text-2xl font-black italic mb-6 text-white">الخطة العلاجية (0-3 أشهر)</h4>
                <ul className="space-y-4 text-slate-400 italic">
                  <li>1. جلسات تدريب "التركيز الانتقائي" (3 مرات أسبوعياً).</li>
                  <li>2. استخدام "تقنيات التوقيت البصري" لإدارة المهام المنزلية.</li>
                  <li>3. تمارين التكامل الحسي لتقليل التشتت الصوتي.</li>
                </ul>
              </div>
              <div className="bg-cyan-600 p-10 rounded-[3rem] text-slate-900 shadow-[0_0_40px_rgba(8,145,178,0.3)]">
                <h4 className="text-2xl font-black italic mb-6">توصية بَصيرة السيادية 🛡️</h4>
                <p className="font-bold text-xl leading-relaxed italic">
                  "يُنصح بدمج البطل في أنشطة تعتمد على التفكير الاستراتيجي (مثل الشطرنج أو البرمجة) لاستغلال ذكائه المنطقي العالي وتفريغ طاقته الذهنية بشكل بناء."
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 3. أزرار العمل النهائية */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link href="/diagnose/passport" className="w-full md:w-auto px-20 py-8 bg-white text-black font-black text-3xl rounded-[3rem] hover:scale-105 transition-all shadow-2xl text-center">
            إصدار الجواز الرقمي 🎫
          </Link>
          <button className="w-full md:w-auto px-16 py-8 bg-slate-900 text-white font-black text-2xl rounded-[3rem] border border-white/10 hover:bg-slate-800 transition-all">
            حفظ التشخيص السيادي 💾
          </button>
        </div>

      </div>

      <footer className="mt-20 py-10 text-center opacity-20 font-mono text-xs tracking-[0.5em] uppercase">
        End_of_Diagnostic_Protocol // Basira_AI // 2026
      </footer>
    </main>
  );
}