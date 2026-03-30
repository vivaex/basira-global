'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SustainedAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeEmoji, setActiveEmoji] = useState('⚪'); // دائرة فارغة كبداية
  const [isTarget, setIsTarget] = useState(false);

  const spawnEmoji = () => {
    // احتمالية ظهور النجمة (الهدف) قليلة عشان نجبره يركز ويصبر
    const chance = Math.random() > 0.7; 
    if (chance) {
      setActiveEmoji('⭐');
      setIsTarget(true);
    } else {
      setActiveEmoji('☁️');
      setIsTarget(false);
    }
  };

  const handlePress = () => {
    if (gameState !== 'playing') return;
    if (isTarget) {
      setScore(s => s + 15);
      setActiveEmoji('✅');
    } else {
      setScore(s => Math.max(0, s - 10));
      setActiveEmoji('❌');
    }
    setIsTarget(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let emojiInterval: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      emojiInterval = setInterval(spawnEmoji, 1500); // تظهر صورة كل ثانية ونص
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sustainedScore', score.toString());
      }
      setGameState('result');
    }

    return () => {
      clearInterval(timer);
      clearInterval(emojiInterval);
    };
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-orange-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">⏳</div>
            <h1 className="text-4xl font-black mb-6 text-orange-400 font-sans italic">تحدي صيد النجوم</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                ركز جيداً.. لا تضغط على أي شيء! <br/> 
                اضغط <span className="text-yellow-400 font-bold underline">فقط</span> عندما تظهر النجمة (⭐).
            </p>
            <button onClick={() => setGameState('playing')} className="bg-orange-600 hover:bg-orange-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95">
                بدء التحدي 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-12">
               <span className="bg-slate-950 px-6 py-2 rounded-full border border-orange-500/30 text-orange-400 font-mono text-2xl">⏳ {timeLeft}ث</span>
               <span className="bg-green-600/20 px-6 py-2 rounded-full text-green-400 font-black text-2xl">🏆 {score}</span>
            </div>
            
            <div className="h-64 flex flex-col items-center justify-center">
                <button 
                    onClick={handlePress}
                    className="text-[12rem] transition-all duration-200 active:scale-75 hover:opacity-80"
                >
                    {activeEmoji}
                </button>
            </div>

            <p className="mt-12 text-slate-600 italic">انتظر اللحظة المناسبة.. لا تستعجل! ✨</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🧘‍♂️</div>
            <h2 className="text-5xl font-black text-orange-400 mb-6 italic">تركيز عالي!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-orange-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase tracking-tighter">سكور الانتباه المستمر:</p>
               <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose/attention-test">
              <button className="bg-slate-800 hover:bg-slate-700 px-12 py-4 rounded-xl font-bold transition">العودة لمختبر الانتباه</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}