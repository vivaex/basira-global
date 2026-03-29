'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TARGET = '🤖'; 
const DISTRACTORS = ['💣', '📦', '🎈', '☁️', '🧱']; 

export default function AttentionTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  const nextEmoji = () => {
    const isTarget = Math.random() > 0.7;
    setCurrentEmoji(isTarget ? TARGET : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]);
  };

  const handlePress = () => {
    if (gameState !== 'playing') return;
    if (currentEmoji === TARGET) setScore(s => s + 10);
    else setScore(s => Math.max(0, s - 5));
    nextEmoji();
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      const e = setInterval(nextEmoji, 1100);
      return () => { clearInterval(t); clearInterval(e); };
    } else if (timeLeft === 0 && gameState === 'playing') {
      localStorage.setItem('attentionScore', score.toString());
      setGameState('result');
    }
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-800 p-10 rounded-[3rem] border-4 border-purple-500/20 shadow-2xl max-w-xl w-full text-center">
        {gameState === 'start' && (
          <button onClick={() => {setScore(0); setTimeLeft(20); setGameState('playing'); nextEmoji();}} className="bg-purple-600 px-12 py-5 rounded-2xl font-bold text-2xl">بدء تحدي الانتباه ⚡</button>
        )}
        {gameState === 'playing' && (
          <div>
            <div className="flex justify-between mb-8 text-2xl font-mono">
                <span className="text-yellow-400">{timeLeft}ث</span>
                <span className="text-green-400">سكور: {score}</span>
            </div>
            <button onClick={handlePress} className="text-[10rem] active:scale-90 transition-transform">{currentEmoji}</button>
          </div>
        )}
        {gameState === 'result' && (
          <div>
            <h2 className="text-5xl font-black mb-6 text-purple-400">انتهى الوقت!</h2>
            <div className="text-7xl font-black mb-8">{score}</div>
            <Link href="/diagnose" className="text-slate-400 underline">العودة للبوابة</Link>
          </div>
        )}
      </div>
    </main>
  );
}