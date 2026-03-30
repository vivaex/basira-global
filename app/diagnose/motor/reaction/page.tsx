'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ReactionTest() {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'result'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setGameState('ready');
    const delay = Math.random() * 3000 + 2000; // تأخير عشوائي بين 2-5 ثواني
    timeoutRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setGameState('go');
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'ready') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      alert('تم الاستعجال! انتظر حتى يصبح اللون أخضر 🚦');
      setGameState('waiting');
    } else if (gameState === 'go') {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      if (typeof window !== 'undefined') {
        localStorage.setItem('motorReactionScore', time.toString());
      }
      setGameState('result');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className={`w-full max-w-2xl p-12 rounded-[3rem] border-4 transition-all duration-300 text-center shadow-2xl
        ${gameState === 'go' ? 'bg-green-600 border-green-400' : 'bg-slate-900 border-orange-500/20'}`}>
        
        {gameState === 'waiting' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">⚡</div>
            <h1 className="text-4xl font-black mb-6">اختبار سرعة الاستجابة</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              مبني على اختبارات **Psychomotor Speed** العالمية.. <br/> 
              عندما تتحول الشاشة للون <span className="text-green-500 font-bold">الأخضر</span>، اضغط بأسرع ما يمكن!
            </p>
            <button onClick={startTest} className="bg-orange-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl">ابدأ الفحص</button>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="cursor-wait" onClick={handleClick}>
            <h2 className="text-5xl font-black animate-pulse">انتظر اللون الأخضر...</h2>
          </div>
        )}

        {gameState === 'go' && (
          <div className="w-full h-full cursor-pointer" onClick={handleClick}>
            <h2 className="text-7xl font-black text-white">اضغط الآن! 🔥</h2>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black mb-6 italic">رد فعل صاعق!</h2>
            <div className="bg-slate-950/50 p-10 rounded-[2.5rem] mb-10 border border-white/10">
               <p className="text-slate-400 mb-2 font-bold uppercase">سرعة الاستجابة:</p>
               <div className="text-7xl font-black text-white">{reactionTime} <span className="text-2xl">ملي ثانية</span></div>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setGameState('waiting')} className="bg-slate-800 px-8 py-4 rounded-xl font-bold">إعادة</button>
              <Link href="/diagnose/motor" className="bg-orange-600 px-8 py-4 rounded-xl font-bold">العودة للمختبر</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}