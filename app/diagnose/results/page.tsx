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

  const getDiagnosis = () => {
    if (total === 0) return "يرجى إكمال الاختبارات الثلاثة للحصول على تشخيص دقيق.";
    let advice = "";
    if (sc.mem < 30) advice += "• الذاكرة البصرية تحتاج لتدعيم عبر ألعاب الربط الصوري. ";
    if (sc.att < 50) advice += "• هناك تشتت في الانتباه؛ ينصح بتمارين التركيز البصري المكثفة. ";
    if (sc.aud < 40) advice += "• التمييز السمعي يحتاج تدريب؛ جرب سماع القصص الصوتية. ";
    if (advice === "") return "نتائج طفلك مثالية جداً وتدل على نمو معرفي سليم في كافة الجوانب!";
    return advice;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black text-center mb-16 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">تقرير "بصيرة" النهائي</h1>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border-b-8 border-blue-500 text-center shadow-2xl">
            <div className="text-slate-500 text-sm font-bold mb-2">الذاكرة البصرية</div>
            <div className="text-6xl font-black text-blue-400">{sc.mem}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border-b-8 border-purple-500 text-center shadow-2xl">
            <div className="text-slate-500 text-sm font-bold mb-2">سرعة الانتباه</div>
            <div className="text-6xl font-black text-purple-400">{sc.att}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2.5rem] border-b-8 border-green-500 text-center shadow-2xl">
            <div className="text-slate-500 text-sm font-bold mb-2">الإدراك السمعي</div>
            <div className="text-6xl font-black text-green-400">{sc.aud}</div>
          </div>
        </div>

        <div className="bg-slate-900 p-12 rounded-[3rem] border-2 border-slate-800 text-right shadow-inner">
          <h2 className="text-3xl font-bold mb-8 text-blue-300">🤖 التشخيص الذكي:</h2>
          <div className="text-2xl text-slate-300 leading-relaxed space-y-4">
             {getDiagnosis()}
          </div>
        </div>

        <div className="mt-16 text-center">
            <Link href="/" className="bg-slate-800 px-12 py-5 rounded-2xl hover:bg-slate-700 transition font-bold text-xl">العودة للرئيسية</Link>
        </div>
      </div>
    </main>
  );
}