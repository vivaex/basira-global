'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TARGET = '🤖'; 
const DISTRACTORS = ['💣', '📦', '🎈', '☁️', '🧱', '🚗']; 

export default function AttentionTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);

  const nextEmoji = () => {
    const isTarget = Math.random() > 0.65;
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
      const e = setInterval(nextEmoji, 1000);
      return () => { clearInterval(t); clearInterval(e); };
    } else if (timeLeft === 0 && gameState === 'playing') {
      localStorage.setItem('attentionScore', score.toString());
      localStorage.setItem('attentionDone', 'true');
      setGameState('result');
    }
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="bg-slate-800 p-10 rounded-[3rem] border-4 border-purple-500/20 shadow-2xl max-w-xl w-full">
        {gameState === 'playing' ? (
          <div>
            <div className="flex justify-between mb-8 text-2xl font-bold">
              <span className="text-yellow-400">{timeLeft}ث</span>
              <span className="text-green-400">سكور: {score}</span>
            </div>
            <button onClick={handlePress} className="text-[10rem] active:scale-75 transition-transform">{currentEmoji}</button>
          </div>
        ) : (
          <div>
            <h2 className="text-4xl font-bold mb-8">{gameState === 'start' ? 'تحدي الانتباه' : 'انتهى الوقت!'}</h2>
            {gameState === 'start' ? (
               <button onClick={() => {setScore(0); setTimeLeft(25); setGameState('playing'); nextEmoji();}} className="bg-purple-600 px-12 py-4 rounded-xl font-bold">ابدأ ⚡</button>
            ) : (
               <Link href="/diagnose" className="bg-purple-600 px-10 py-4 rounded-xl font-bold">العودة للبوابة</Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}