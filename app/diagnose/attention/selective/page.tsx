'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SelectiveAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentRobot, setCurrentRobot] = useState({ type: 'target', emoji: '🤖', color: 'text-green-500', id: 0 });

  const spawnRobot = () => {
    const isTarget = Math.random() > 0.4;
    setCurrentRobot({
      type: isTarget ? 'target' : 'distractor',
      emoji: isTarget ? '🤖' : '👾',
      color: isTarget ? 'text-green-500' : 'text-red-500',
      id: Math.random() // لضمان إعادة تشغيل الأنييميشن
    });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let spawnInterval: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      spawnInterval = setInterval(spawnRobot, 1100); 
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') localStorage.setItem('selectiveScore', score.toString());
      setGameState('result');
    }
    return () => { clearInterval(timer); clearInterval(spawnInterval); };
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-red-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-6xl mb-6">🎯</div>
            <h1 className="text-3xl font-black mb-6 text-red-500">مختبر "الانتباه الانتقائي"</h1>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-8 space-y-4">
                <p className="text-blue-400 font-bold">💡 لماذا نلعب هذا التحدي؟</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                    هذا الاختبار مبني على معيار **Go/No-Go** العالمي، المستخدم في مراكز التشخيص النفسي لقياس قدرة الدماغ على اتخاذ القرار السريع وكبح الاندفاع.
                </p>
                <ul className="text-slate-400 text-lg space-y-2">
                    <li>• اضغط فوراً على <span className="text-green-500 font-bold">الروبوت الأخضر</span>.</li>
                    <li>• <span className="text-red-500 font-bold">توقف!</span> لا تلمس الفضائي البنفسجي.</li>
                </ul>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-red-600 hover:bg-red-500 px-16 py-4 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95">
                أنا مستعد للصيد! 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 text-xl font-bold font-mono">
               <span className="text-yellow-500">⏳ {timeLeft}ث</span>
               <span className="text-green-500">النقاط: {score}</span>
            </div>
            
            <div className="h-64 flex flex-col items-center justify-center">
                <button 
                    key={currentRobot.id} // لضمان إعادة تشغيل الحركة
                    onClick={() => {
                        if (currentRobot.type === 'target') setScore(s => s + 10);
                        else setScore(s => Math.max(0, s - 15));
                        spawnRobot();
                    }}
                    className={`text-[9rem] md:text-[11rem] transition-all animate-in zoom-in duration-300 ${currentRobot.color}`}
                >
                    {currentRobot.emoji}
                </button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-red-500 mb-8 italic">صياد ذكي!</h2>
            <div className="text-8xl font-black mb-10">{score}</div>
            <Link href="/diagnose/attention" className="bg-slate-800 px-10 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}