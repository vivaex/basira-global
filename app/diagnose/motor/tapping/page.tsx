'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TappingTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('motorTappingScore', taps.toString());
      }
      setGameState('result');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, taps]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-amber-500/20 shadow-2xl max-w-xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">👆</div>
            <h1 className="text-4xl font-black mb-6 text-amber-500 italic">تحدي النقر السريع</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              كم مرة تستطيع النقر في <span className="text-white font-bold">10 ثوانٍ</span>؟ <br/>
              هذا الاختبار يقيس التنسيق الحركي الدقيق والسرعة العصبية.
            </p>
            <button onClick={() => setGameState('playing')} className="bg-amber-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl">ابدأ النقر! 🚀</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="text-4xl font-mono text-amber-500 mb-8 font-black">الوقت: {timeLeft}ث</div>
            <button 
              onPointerDown={() => setTaps(t => t + 1)}
              className="w-64 h-64 bg-amber-500 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.4)] border-8 border-white/20 active:scale-90 transition-all text-6xl font-black flex items-center justify-center select-none touch-none"
            >
              {taps}
            </button>
            <p className="mt-8 text-slate-500 italic">انقر بأسرع ما يمكن! 👆⚡</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-amber-500 mb-6 italic">أصابع ذهبية!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-amber-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase tracking-widest">عدد النقرات في 10 ثوانٍ</p>
               <div className="text-9xl font-black text-white">{taps}</div>
            </div>
            <Link href="/diagnose/motor">
              <button className="bg-slate-800 px-12 py-4 rounded-xl font-bold hover:bg-slate-700 transition">العودة لمختبر الحركة</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}