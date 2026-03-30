'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SustainedAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [active, setActive] = useState({ emoji: '⚪', isTarget: false, id: 0 });

  const spawnEmoji = () => {
    const isStar = Math.random() > 0.7; 
    setActive({
      emoji: isStar ? '⭐' : '☁️',
      isTarget: isStar,
      id: Math.random()
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let emojiInterval: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      emojiInterval = setInterval(spawnEmoji, 1300);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') localStorage.setItem('sustainedScore', score.toString());
      setGameState('result');
    }
    return () => { clearInterval(timer); clearInterval(emojiInterval); };
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-orange-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-6xl mb-6">⏳</div>
            <h1 className="text-3xl font-black mb-6 text-orange-400 italic">مختبر "الانتباه المستمر"</h1>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-8 space-y-4">
                <p className="text-yellow-400 font-bold">💡 القيمة العلمية:</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                    يعتمد هذا التحدي على معيار **Conners CPT**، وهو الاختبار الأدق عالمياً لقياس قدرة الطالب على البقاء يقظاً ومركزاً في المهام المملة أو الطويلة.
                </p>
                <p className="text-lg text-slate-400 font-bold underline decoration-orange-500">
                    المهمة: اضغط "فقط" على النجمة الذهبية.
                </p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-orange-600 hover:bg-orange-500 px-16 py-4 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95">
                بدء المراقبة 🛰️
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-12 text-xl font-mono">
               <span className="bg-orange-500/10 px-4 py-2 rounded-full text-orange-400">⏳ {timeLeft}ث</span>
               <span className="bg-green-500/10 px-4 py-2 rounded-full text-green-400">🏆 {score}</span>
            </div>
            
            <div className="h-64 flex flex-col items-center justify-center">
                <button 
                    key={active.id}
                    onClick={() => {
                        if (active.isTarget) setScore(s => s + 15);
                        else setScore(s => Math.max(0, s - 10));
                        spawnEmoji();
                    }}
                    className="text-[10rem] md:text-[12rem] animate-in slide-in-from-top-4 duration-300 hover:scale-105 active:scale-90 transition-all"
                >
                    {active.emoji}
                </button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-orange-400 mb-8 italic">بطل الصبر!</h2>
            <div className="text-8xl font-black mb-10 text-white">{score}</div>
            <Link href="/diagnose/attention" className="bg-slate-800 px-10 py-4 rounded-xl font-bold transition hover:bg-slate-700">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}