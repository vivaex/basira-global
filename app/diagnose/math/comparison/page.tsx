'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ComparisonTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [rounds, setRounds] = useState(0);
  const [score, setScore] = useState(0);
  const [data, setData] = useState({ left: 0, right: 0 });

  const generateRound = () => {
    if (rounds >= 10) {
      localStorage.setItem('mathScore', score.toString());
      localStorage.setItem('mathDone', 'true');
      setGameState('result');
      return;
    }
    // توليد أرقام عشوائية متقاربة لزيادة التحدي
    const left = Math.floor(Math.random() * 10) + 1;
    let right = Math.floor(Math.random() * 10) + 1;
    while (right === left) right = Math.floor(Math.random() * 10) + 1;

    setData({ left, right });
    setGameState('playing');
  };

  const handleChoice = (choice: 'left' | 'right') => {
    const isCorrect = choice === 'left' ? data.left > data.right : data.right > data.left;
    if (isCorrect) setScore(s => s + 10);
    setRounds(r => r + 1);
    generateRound();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-yellow-500/20 shadow-2xl max-w-3xl w-full text-center">
        
        {gameState === 'start' && (
          <div>
            <div className="text-8xl mb-6">⚖️</div>
            <h1 className="text-4xl font-black mb-6 text-yellow-400">تحدي المقارنة السريعة</h1>
            <p className="text-xl text-slate-400 mb-10">بسرعة.. أي جهة تحتوي على "كرات" أكثر؟</p>
            <button onClick={generateRound} className="bg-yellow-600 hover:bg-yellow-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">ابدأ الآن!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <div className="flex justify-between mb-12 font-bold text-xl">
               <span className="text-slate-500">جولة {rounds + 1} / 10</span>
               <span className="text-yellow-400">النقاط: {score}</span>
            </div>
            <div className="grid grid-cols-2 gap-8 h-64">
              <button onClick={() => handleChoice('left')} className="bg-slate-950 rounded-[2.5rem] border-4 border-slate-800 hover:border-blue-500 transition-all flex flex-wrap p-6 items-center justify-center gap-2">
                {Array.from({ length: data.left }).map((_, i) => <div key={i} className="w-4 h-4 md:w-6 md:h-6 bg-blue-500 rounded-full"></div>)}
              </button>
              <button onClick={() => handleChoice('right')} className="bg-slate-950 rounded-[2.5rem] border-4 border-slate-800 hover:border-purple-500 transition-all flex flex-wrap p-6 items-center justify-center gap-2">
                {Array.from({ length: data.right }).map((_, i) => <div key={i} className="w-4 h-4 md:w-6 md:h-6 bg-purple-500 rounded-full"></div>)}
              </button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-yellow-400 mb-8 italic">عبقري رياضيات!</h2>
            <div className="text-8xl font-black mb-10">{score}</div>
            <Link href="/diagnose">
              <button className="bg-slate-800 px-10 py-5 rounded-2xl font-bold">العودة لمختبر التشخيص</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}