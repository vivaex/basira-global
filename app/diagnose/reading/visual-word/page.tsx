'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const WORD_BANK = [
  { word: "مـدرسة", isReal: true },
  { word: "سـمـقـة", isReal: false },
  { word: "طـيـارة", isReal: true },
  { word: "خـرنـبـل", isReal: false },
  { word: "كـتـاب", isReal: true },
  { word: "صـمـبـاخ", isReal: false },
];

export default function VisualWordTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') localStorage.setItem('readingVisualScore', score.toString());
      setGameState('result');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score]);

  const handleChoice = (choice: boolean) => {
    if (choice === WORD_BANK[currentIdx].isReal) setScore(s => s + 10);
    setCurrentIdx((prev) => (prev + 1) % WORD_BANK.length);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-cyan-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">👁️</div>
            <h1 className="text-4xl font-black mb-8 text-cyan-400">تحدي التعرف السريع</h1>
            <p className="text-slate-400 mb-10 italic leading-relaxed">مبني على اختبار **TOWRE** لقياس كفاءة المسار البصري للقراءة وتجاوز مرحلة التهجئة البطيئة.</p>
            <button onClick={() => setGameState('playing')} className="bg-cyan-600 px-16 py-5 rounded-2xl font-black text-2xl">ابدأ السباق 🏎️</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 text-2xl font-mono text-cyan-400">
               <span>⏳ {timeLeft}ث</span>
               <span>النقاط: {score}</span>
            </div>
            <div className="bg-slate-950 py-16 rounded-[2.5rem] border-2 border-slate-800 mb-12">
               <span className="text-7xl font-black tracking-widest">{WORD_BANK[currentIdx].word}</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <button onClick={() => handleChoice(true)} className="bg-green-600 p-8 rounded-3xl text-2xl font-black hover:scale-105 active:scale-90 transition-all">كلمة حقيقية ✅</button>
              <button onClick={() => handleChoice(false)} className="bg-red-600 p-8 rounded-3xl text-2xl font-black hover:scale-105 active:scale-90 transition-all">ليست كلمة ❌</button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-cyan-400 mb-8 italic">سرعة بصرية مذهلة!</h2>
            <div className="text-9xl font-black mb-10">{score}</div>
            <Link href="/diagnose/reading" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}