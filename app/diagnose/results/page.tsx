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

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 md:p-20 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-black mb-12 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">تقرير بصيرة النهائي</h1>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900 p-10 rounded-3xl border-b-8 border-blue-500">
            <div className="text-slate-500 text-sm">الذاكرة</div>
            <div className="text-5xl font-black">{sc.mem}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl border-b-8 border-purple-500">
            <div className="text-slate-500 text-sm">الانتباه</div>
            <div className="text-5xl font-black">{sc.att}</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl border-b-8 border-green-500">
            <div className="text-slate-500 text-sm">السمع</div>
            <div className="text-5xl font-black">{sc.aud}</div>
          </div>
        </div>
        <Link href="/" className="bg-slate-800 px-12 py-4 rounded-xl">العودة للرئيسية</Link>
      </div>
    </main>
  );
}