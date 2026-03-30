'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const COLORS = [
  { name: 'أحمر', hex: '#ef4444', value: 'red' },
  { name: 'أزرق', hex: '#3b82f6', value: 'blue' },
  { name: 'أخضر', hex: '#22c55e', value: 'green' },
  { name: 'أصفر', hex: '#eab308', value: 'yellow' },
];

export default function InhibitionTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [target, setTarget] = useState(COLORS[0]);
  const [displayWord, setDisplayWord] = useState(COLORS[1]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  const nextRound = () => {
    setTarget(COLORS[Math.floor(Math.random() * 4)]);
    setDisplayWord(COLORS[Math.floor(Math.random() * 4)]);
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0 && gameState === 'playing') setGameState('result');
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3.5rem] border-4 border-violet-500/20 shadow-2xl max-w-xl w-full text-center">
        {gameState === 'start' && (
          <div>
            <h1 className="text-4xl font-black mb-8 text-violet-400">تحدي "الفرامل الذهنية"</h1>
            <p className="text-slate-400 mb-10 italic font-sans leading-relaxed">تجاهل الكلمة المكتوبة واضغط على "اللون الحقيقي" للأحرف. (Stroop Effect)</p>
            <button onClick={() => { nextRound(); setGameState('playing'); }} className="bg-violet-600 px-16 py-5 rounded-2xl font-bold text-2xl">ابدأ الفخ! 🚫</button>
          </div>
        )}
        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 text-2xl font-mono"><span>⏳ {timeLeft}</span><span className="text-violet-400 font-black">النقاط: {score}</span></div>
            <div className="bg-slate-950 py-16 rounded-3xl mb-10 border-2 border-slate-800"><span className="text-8xl font-black" style={{ color: target.hex }}>{displayWord.name}</span></div>
            <div className="grid grid-cols-2 gap-4">
              {COLORS.map(c => <button key={c.value} onClick={() => { if(c.value === target.value) setScore(s=>s+10); else setScore(s=>Math.max(0, s-5)); nextRound(); }} className="p-6 rounded-2xl text-2xl font-bold shadow-lg" style={{ backgroundColor: c.hex }}>{c.name}</button>)}
            </div>
          </div>
        )}
        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-violet-400 mb-8 italic">تحكم حديدي!</h2>
            <div className="text-9xl font-black mb-10">{score}</div>
            <Link href="/diagnose/executive" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}