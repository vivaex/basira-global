'use client';
import { useState } from 'react';
import Link from 'next/link';

const PUZZLES = [
  { sequence: ['🍎', '🍏', '🍎', '🍏'], options: ['🍎', '🍏', '🚗'], correct: '🍎', desc: "أكمل النمط الدوري" },
  { sequence: ['🥚', '🐣', '🐥', '؟'], options: ['🐔', '🦆', '🥚'], correct: '🐔', desc: "ماذا سيحدث تالياً؟" },
  { sequence: ['☀️', '☁️', '🌧️', '؟'], options: ['🌈', '🌙', '🔥'], correct: '🌈', desc: "ما النتيجة المنطقية؟" },
];

export default function LogicTest() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (choice: string) => {
    if (choice === PUZZLES[idx].correct) setScore(s => s + 33);
    if (idx + 1 < PUZZLES.length) setIdx(i => i + 1);
    else setFinished(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3.5rem] border-4 border-purple-500/20 shadow-2xl max-w-xl w-full text-center">
        {!finished ? (
          <div className="animate-in fade-in">
            <h1 className="text-3xl font-black mb-8 text-purple-400">{PUZZLES[idx].desc}</h1>
            <div className="bg-slate-950 p-10 rounded-3xl mb-12 flex justify-center gap-4 text-6xl">
              {PUZZLES[idx].sequence.map((item, i) => <span key={i}>{item}</span>)}
            </div>
            <div className="grid grid-cols-3 gap-6">
              {PUZZLES[idx].options.map((opt, i) => <button key={i} onClick={() => handleAnswer(opt)} className="text-6xl p-6 bg-slate-800 rounded-3xl hover:bg-purple-600 transition-all border-2 border-slate-700">{opt}</button>)}
            </div>
          </div>
        ) : (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-purple-400 mb-8 italic">محقق بارع!</h2>
            <div className="text-9xl font-black mb-10">{score}%</div>
            <Link href="/diagnose/executive" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}