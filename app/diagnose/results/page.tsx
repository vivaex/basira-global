'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Results() {
  const [sc, setSc] = useState({ mem: 0, att: 0, aud: 0 });

  useEffect(() => {
    setSc({
      mem: Number(localStorage.getItem('memoryScore') || 0),
      att: Number(localStorage.getItem('attentionScore') || 0),
      aud: Number(localStorage.getItem('auditoryScore') || 0),
    });
  }, []);

  const total = sc.mem + sc.att + sc.aud;

  // وظيفة التشخيص الذكي
  const getDiagnosis = () => {
    if (total === 0) return "يرجى إكمال الاختبارات الثلاثة للحصول على تشخيص دقيق.";
    
    let advice = "";
    if (sc.mem < 30) advice += "• لوحظ ضعف في الذاكرة البصرية؛ ينصح بألعاب الربط الصوري. ";
    if (sc.att < 50) advice += "• الطفل يتشتت بسرعة؛ يفضل تقليل وقت الشاشات وزيادة ألعاب التركيز. ";
    if (sc.aud < 40) advice += "• التمييز السمعي يحتاج تدريب؛ ينصح بتمارين سماع الأصوات المتشابهة. ";
    
    if (advice === "") return "ما شاء الله! نتائج الطفل مثالية وتدل على نمو معرفي سليم ومتوازن في كافة الجوانب.";
    return advice;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black text-center mb-16 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            تقرير "بصيرة" النهائي
        </h1>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border-b-8 border-blue-500 shadow-2xl">
            <div className="text-slate-500 text-sm font-bold mb-2">الذاكرة البصرية</div>
            <div className="text-6xl font-black text-blue-400">{sc.mem}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border-b-8 border-purple-500 shadow-2xl">
            <div className="text-slate-500 text-sm font-bold mb-2">سرعة الانتباه</div>
            <div className="text-6xl font-black text-purple-400">{sc.att}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border-b-8 border-green-500 shadow-2xl">
            <div className="text-slate-500 text-sm font-bold mb-2">الإدراك السمعي</div>
            <div className="text-6xl font-black text-green-400">{sc.aud}</div>
          </div>
        </div>

        <div className="bg-slate-900 p-12 rounded-[3rem] border-2 border-slate-800 text-right shadow-inner relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 blur-[80px]"></div>
          <h2 className="text-3xl font-bold mb-8 text-blue-300 flex items-center gap-4">
             🤖 التشخيص التحليلي لـ "بصيرة":
          </h2>
          <div className="text-2xl text-slate-300 leading-relaxed space-y-4">
             {getDiagnosis()}
          </div>
          <div className="mt-10 p-6 bg-blue-600/10 rounded-2xl border border-blue-500/20">
             <p className="text-lg text-blue-400">💡 **ملاحظة:** هذه النتائج أولية وتستخدم للتوجيه المنزلي، لنتائج أدق يرجى استشارة أخصائي تربوي.</p>
          </div>
        </div>

        <div className="mt-16 text-center flex flex-col md:flex-row gap-6 justify-center">
            <Link href="/" className="bg-slate-800 px-12 py-5 rounded-2xl hover:bg-slate-700 transition font-bold text-xl">العودة للرئيسية</Link>
            <button onClick={() => window.print()} className="bg-blue-600 px-12 py-5 rounded-2xl hover:bg-blue-500 transition font-bold text-xl shadow-lg">تحميل التقرير PDF 📄</button>
        </div>
      </div>
    </main>
  );
}