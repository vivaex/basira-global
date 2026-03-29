'use client';
import { useState } from 'react';
import Link from 'next/link';

const SHAPES = ['🔴', '🔵', '🟡', '🟢', '⭐', '💎'];

export default function PatternsTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState({ sequence: [] as string[], answer: '', options: [] as string[] });

  const generatePattern = () => {
    if (round > 8) {
      localStorage.setItem('patternsScore', score.toString());
      setGameState('result');
      return;
    }

    const s1 = SHAPES[Math.floor(Math.random() * 3)];
    const s2 = SHAPES[Math.floor(Math.random() * 3) + 3];
    
    // نمط بسيط: A-B-A-B
    const sequence = [s1, s2, s1];
    const answer = s2;
    
    const options = [s2, s1, SHAPES[1], SHAPES[4]].sort(() => 0.5 - Math.random());
    
    setPattern({ sequence, answer, options });
    setGameState('playing');
  };

  const handleChoice = (choice: string) => {
    if (choice === pattern.answer) setScore(s => s + 12.5);
    setRound(r => r + 1);
    generatePattern();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-blue-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div>
            <div className="text-7xl mb-6">🧩</div>
            <h1 className="text-4xl font-black mb-6 text-blue-400">تحدي الأنماط الذكي</h1>
            <p className="text-xl text-slate-400 mb-10 italic">ما هو الشكل الذي يكمل اللوحة؟</p>
            <button onClick={generatePattern} className="bg-blue-600 px-16 py-5 rounded-2xl font-black text-xl">ابدأ التحدي!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="text-slate-500 mb-8 font-bold italic">اللغز {round} / 8</div>
            <div className="flex justify-center gap-6 mb-16 bg-slate-950 p-8 rounded-[2rem] border border-slate-800 shadow-inner">
              {pattern.sequence.map((s, i) => <span key={i} className="text-7xl">{s}</span>)}
              <div className="text-7xl w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-blue-500 animate-pulse text-blue-500">؟</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {pattern.options.map((opt, i) => (
                <button key={i} onClick={() => handleChoice(opt)} className="text-6xl p-6 bg-slate-800 hover:bg-blue-600 rounded-3xl transition active:scale-90 border-2 border-slate-700">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
             <h2 className="text-5xl font-black text-blue-400 mb-8 italic">منطقي بامتياز!</h2>
             <div className="text-8xl font-black mb-10">{Math.round(score)}</div>
             <Link href="/diagnose/math" className="bg-slate-800 px-10 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}