'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TARGET = '🤖'; 
const DISTRACTORS = ['💣', '📦', '🎈', '☁️', '🧱', '🚗']; 

export default function AttentionTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [level, setLevel] = useState(1);

  const nextEmoji = () => {
    const isTarget = Math.random() > 0.7;
    setCurrentEmoji(isTarget ? TARGET : DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(20);
    setLevel(1);
    setGameState('playing');
    nextEmoji();
  };

  const handlePress = () => {
    if (gameState !== 'playing') return;
    if (currentEmoji === TARGET) {
      setScore(s => {
        const newScore = s + 10;
        if (newScore > 100) setLevel(3); // مستوى سريع جداً
        else if (newScore > 50) setLevel(2); // مستوى متوسط
        return newScore;
      });
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    nextEmoji(); // تغيير فوري عند الضغط
  };

  // مؤقت اللعبة (الثواني)
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(t);
    } else if (timeLeft === 0 && gameState === 'playing') {
      localStorage.setItem('attentionScore', score.toString());
      setGameState('result');
    }
  }, [gameState, timeLeft]);

  // مؤقت تغيير الإيموجي (السرعة تعتمد على المستوى)
  useEffect(() => {
    if (gameState === 'playing') {
      const speed = level === 1 ? 1200 : level === 2 ? 900 : 600; // السرعة تزيد!
      const e = setInterval(nextEmoji, speed);
      return () => clearInterval(e);
    }
  }, [gameState, level]);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-800 p-8 md:p-12 rounded-[3rem] border-4 border-purple-500/30 shadow-2xl max-w-xl w-full text-center">
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <h1 className="text-4xl font-black mb-6 text-purple-400">تحدي السرعة والمستويات</h1>
            <p className="mb-8 text-slate-300 font-light">كل ما زاد سكورك.. اللعبة بتصير أسرع! ⚡</p>
            <button onClick={startGame} className="bg-purple-600 px-12 py-5 rounded-2xl font-bold text-2xl shadow-lg">ابدأ التحدي 🚀</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <div className="flex justify-between mb-8 text-xl font-bold">
                <span className="text-yellow-400 bg-slate-900 px-4 py-1 rounded-full border border-yellow-500/30">⏳ {timeLeft}ث</span>
                <span className="text-blue-400 bg-slate-900 px-4 py-1 rounded-full border border-blue-500/30">Level {level}</span>
                <span className="text-green-400 bg-slate-900 px-4 py-1 rounded-full border border-green-500/30">🏆 {score}</span>
            </div>
            <div className="h-64 flex items-center justify-center">
                <button onClick={handlePress} className="text-[9rem] active:scale-75 transition-transform duration-75">
                    {currentEmoji}
                </button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black mb-6 text-purple-400">انتهى الوقت!</h2>
            <div className="text-8xl font-black mb-8 text-white">{score}</div>
            <div className="flex flex-col gap-4">
               <button onClick={startGame} className="bg-purple-600 py-4 rounded-xl font-bold">إعادة التحدي 🔄</button>
               <Link href="/diagnose" className="text-slate-500 underline">العودة للبوابة</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}