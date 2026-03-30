'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SustainedAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeEmoji, setActiveEmoji] = useState('⚪');
  const [isTarget, setIsTarget] = useState(false);

  const spawnEmoji = () => {
    const chance = Math.random() > 0.7; 
    if (chance) { setActiveEmoji('⭐'); setIsTarget(true); } 
    else { setActiveEmoji('☁️'); setIsTarget(false); }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let emojiInterval: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      emojiInterval = setInterval(spawnEmoji, 1500);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sustainedAttentionScore', score.toString());
      }
      setGameState('result');
    }

    return () => {
      clearInterval(timer);
      clearInterval(emojiInterval);
    };
  }, [gameState, timeLeft, score]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-orange-500/20 shadow-2xl max-w-xl w-full text-center">
        {gameState === 'start' && (
          <button onClick={() => setGameState('playing')} className="bg-orange-600 px-12 py-5 rounded-2xl font-bold text-2xl shadow-xl">بدء صيد النجوم! ⭐</button>
        )}
        {gameState === 'playing' && (
          <div>
            <div className="flex justify-between mb-8 text-2xl font-mono">
               <span className="text-orange-400">⏳ {timeLeft}ث</span>
               <span className="text-green-400 font-black">🏆 {score}</span>
            </div>
            <button onClick={() => {
              if (isTarget) setScore(s => s + 15);
              else setScore(s => Math.max(0, s - 10));
              setIsTarget(false);
              setActiveEmoji(isTarget ? '✅' : '❌');
            }} className="text-[12rem] active:scale-75 transition-transform">
              {activeEmoji}
            </button>
          </div>
        )}
        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-4xl font-bold text-orange-400 mb-8 font-sans">تركيز رائع!</h2>
            <div className="text-8xl font-black mb-10">{score}</div>
            <Link href="/diagnose/attention-test" className="bg-slate-800 px-10 py-4 rounded-xl font-bold">العودة لمختبر الانتباه</Link>
          </div>
        )}
      </div>
    </main>
  );
}