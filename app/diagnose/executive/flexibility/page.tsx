'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FlexibilityTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [rule, setRule] = useState<'color' | 'shape'>('color'); 
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ shape: '▲', color: '#ef4444' });
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const generateTarget = () => {
    const shapes = ['▲', '■', '●'];
    const colors = ['#ef4444', '#3b82f6', '#22c55e'];
    setTarget({ shape: shapes[Math.floor(Math.random() * 3)], color: colors[Math.floor(Math.random() * 3)] });
    if (round === 5) setRule('shape');
    setFeedback('none');
  };

  const handleChoice = (s: string, c: string) => {
    const isCorrect = rule === 'color' ? c === target.color : s === target.shape;
    if (isCorrect) { setScore(s => s + 10); setFeedback('correct'); }
    else setFeedback('wrong');

    setTimeout(() => {
      if (round < 10) { setRound(r => r + 1); generateTarget(); }
      else { if (typeof window !== 'undefined') localStorage.setItem('execFlexScore', score.toString()); setGameState('result'); }
    }, 600);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3.5rem] border-4 border-fuchsia-500/20 shadow-2xl max-w-xl w-full text-center">
        {gameState === 'start' && (
          <div>
            <h1 className="text-4xl font-black mb-8 text-fuchsia-400">تحدي المرونة الذهنية</h1>
            <p className="text-slate-400 mb-10 italic">مبني على اختبار (Wisconsin Card Sorting) العالمي.. القواعد تتغير فجأة!</p>
            <button onClick={() => { generateTarget(); setGameState('playing'); }} className="bg-fuchsia-600 px-16 py-5 rounded-2xl font-bold text-2xl">ابدأ التكيف 🔄</button>
          </div>
        )}
        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 font-black"><span>الجولة: {round}/10</span><span className="text-fuchsia-400">النقاط: {score}</span></div>
            <div className={`bg-slate-950 p-16 rounded-3xl mb-12 border-4 transition-all ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-800'}`}>
              <span className="text-9xl" style={{ color: target.color }}>{target.shape}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {['▲', '■', '●'].map((s, i) => (
                <button key={i} onClick={() => handleChoice(s, ['#ef4444', '#3b82f6', '#22c55e'][i])} className="bg-slate-800 p-6 rounded-2xl text-5xl hover:scale-105 transition-all">
                  <span style={{ color: ['#ef4444', '#3b82f6', '#22c55e'][i] }}>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-fuchsia-400 mb-8">مرونة ممتازة!</h2>
            <div className="text-9xl font-black mb-10">{score}</div>
            <Link href="/diagnose/executive" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}