'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function CognitiveTest() {
  const [score, setScore] = useState(0);
  const [step, setStep] = useState(0);

  const challenges = [
    { target: "تفاحة", items: ["🍎", "🚗", "🐶"], correct: "🍎", desc: "اختر نوعاً من الفواكه" },
    { target: "كلب", items: ["🏠", "🐕", "🚲"], correct: "🐕", desc: "اختر كائناً حياً" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="bg-slate-900 p-12 rounded-[3rem] border-4 border-amber-500/20 max-w-2xl w-full shadow-2xl">
        <h1 className="text-4xl font-black mb-8 text-amber-500">مختبر المعالجة الذهنية</h1>
        <p className="text-slate-400 mb-10">{challenges[step].desc}</p>
        <div className="flex justify-center gap-6">
          {challenges[step].items.map(item => (
            <button key={item} onClick={() => setStep(s => (s + 1) % 2)} className="text-8xl bg-slate-800 p-6 rounded-3xl hover:bg-amber-600 transition-all active:scale-90">{item}</button>
          ))}
        </div>
        <Link href="/diagnose" className="block mt-12 text-slate-600 italic">إنهاء الجلسة</Link>
      </div>
    </main>
  );
}