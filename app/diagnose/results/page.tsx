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

  const avg = (sc.mem + sc.att + sc.aud) / 3;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-black mb-12 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">تقرير بصيرة الذكي</h1>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900 p-10 rounded-[2rem] border border-blue-500/30">
            <div className="text-slate-500 text-sm mb-2">الذاكرة البصرية</div>
            <div className="text-5xl font-black text-blue-400">{sc.mem}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2rem] border border-purple-500/30">
            <div className="text-slate-500 text-sm mb-2">سرعة الانتباه</div>
            <div className="text-5xl font-black text-purple-400">{sc.att}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-[2rem] border border-green-500/30">
            <div className="text-slate-500 text-sm mb-2">الإدراك السمعي</div>
            <div className="text-5xl font-black text-green-400">{sc.aud}</div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-12 rounded-[3rem] border-2 border-slate-700 text-right shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-blue-300">💡 تحليل بصيرة AI:</h2>
          <p className="text-2xl text-slate-300 leading-relaxed">
            {avg > 60 
              ? "مستوى طفلك متقدم جداً في المهارات النمائية. يُنصح بالبدء في تعلم البرمجة أو اللغات الأجنبية." 
              : "طفلك يمتلك قاعدة جيدة، يحتاج لبعض التمارين لتعزيز سرعة الاستجابة والتركيز."}
          </p>
        </div>

        <div className="mt-12">
            <Link href="/" className="bg-slate-700 px-10 py-4 rounded-2xl hover:bg-slate-600 transition">العودة للرئيسية</Link>
        </div>
      </div>
    </main>
  );
}