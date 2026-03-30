'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function SustainedAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [active, setActive] = useState({ emoji: '⚪', isTarget: false, id: 0 });

  const spawnEmoji = useCallback(() => {
    const isStar = Math.random() > 0.7; 
    setActive({
      emoji: isStar ? '⭐' : '☁️',
      isTarget: isStar,
      id: Math.random()
    });
  }, []);

  // تايمر الوقت
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) {
      if (timeLeft === 0 && gameState === 'playing') {
        if (typeof window !== 'undefined') localStorage.setItem('sustainedScore', score.toString());
        setGameState('result');
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score]);

  // تايمر تغيير الأشكال التلقائي (كل 1.4 ثانية)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(spawnEmoji, 1400);
    return () => clearInterval(interval);
  }, [gameState, spawnEmoji]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3.5rem] border-4 border-orange-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <h1 className="text-4xl font-black mb-8 text-orange-400 italic">مختبر "اليقظة المستمرة"</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10">
                <p className="text-slate-400 text-sm mb-4 italic">مبني على اختبار CPT العالمي لقياس القدرة على التركيز لفترات طويلة.</p>
                <p className="text-2xl text-white">المهمة: اضغط <span className="text-yellow-400 font-bold underline">فقط</span> على النجمة ⭐.</p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-orange-600 px-16 py-5 rounded-2xl font-black text-2xl">بدء المراقبة 🛰️</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-12">
               <span className="text-orange-400 text-2xl font-mono">⏳ {timeLeft}</span>
               <span className="text-green-500 text-2xl font-black">النقاط: {score}</span>
            </div>
            
            <div className="h-64 flex items-center justify-center">
                <button 
                    key={active.id}
                    onClick={() => {
                        if (active.isTarget) setScore(s => s + 15);
                        else setScore(s => Math.max(0, s - 10));
                        spawnEmoji();
                    }}
                    className="text-[11rem] md:text-[13rem] animate-in slide-in-from-top-10 duration-300 drop-shadow-2xl active:scale-90"
                >
                    {active.emoji}
                </button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-orange-400 mb-8 italic">مستوى تركيز عالٍ!</h2>
            <div className="text-9xl font-black mb-10">{score}</div>
            <Link href="/diagnose/attention" className="bg-slate-800 px-12 py-4 rounded-xl font-bold transition">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}