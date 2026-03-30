'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SelectiveAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentRobot, setCurrentRobot] = useState({ type: 'target', emoji: '🤖', color: 'text-green-500' });

  const spawnRobot = () => {
    const isTarget = Math.random() > 0.4;
    setCurrentRobot(isTarget 
      ? { type: 'target', emoji: '🤖', color: 'text-green-500' } 
      : { type: 'distractor', emoji: '👾', color: 'text-red-500' }
    );
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let spawnInterval: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      spawnInterval = setInterval(spawnRobot, 1200);
    } else if (timeLeft === 0 && gameState === 'playing') {
      // حماية الـ localStorage عشان Vercel ما يزعل
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectiveAttentionScore', score.toString());
      }
      setGameState('result');
    }

    return () => {
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [gameState, timeLeft, score]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-red-500/20 shadow-2xl max-w-xl w-full text-center">
        {gameState === 'start' && (
          <button onClick={() => setGameState('playing')} className="bg-red-600 px-12 py-5 rounded-2xl font-bold text-2xl shadow-xl">ابدأ التحدي! 🚀</button>
        )}
        {gameState === 'playing' && (
          <div>
            <div className="flex justify-between mb-8 text-2xl">
               <span className="text-yellow-400 font-mono">⏳ {timeLeft}ث</span>
               <span className="text-green-400 font-black">النقاط: {score}</span>
            </div>
            <button onClick={() => {
              if (currentRobot.type === 'target') setScore(s => s + 10);
              else setScore(s => Math.max(0, s - 15));
              spawnRobot();
            }} className={`text-[10rem] active:scale-90 transition-transform ${currentRobot.color}`}>
              {currentRobot.emoji}
            </button>
          </div>
        )}
        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-4xl font-black text-red-500 mb-8">انتهى الوقت!</h2>
            <div className="text-7xl font-black mb-10">{score}</div>
            <Link href="/diagnose/attention-test" className="bg-slate-800 px-10 py-4 rounded-xl font-bold">العودة لمختبر الانتباه</Link>
          </div>
        )}
      </div>
    </main>
  );
}