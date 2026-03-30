'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function SelectiveAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentRobot, setCurrentRobot] = useState({ type: 'target', emoji: '🤖', color: 'text-green-500', id: 0 });

  // دالة توليد الروبوت - تم فصلها لتكون مستقلة
  const spawnRobot = useCallback(() => {
    const isTarget = Math.random() > 0.4;
    setCurrentRobot({
      type: isTarget ? 'target' : 'distractor',
      emoji: isTarget ? '🤖' : '👾',
      color: isTarget ? 'text-green-500' : 'text-red-500',
      id: Math.random() // Key عشوائي لإجبار الأنييميشن
    });
  }, []);

  // تايمر الوقت (ينقص كل ثانية)
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) {
      if (timeLeft === 0 && gameState === 'playing') {
        if (typeof window !== 'undefined') localStorage.setItem('selectiveScore', score.toString());
        setGameState('result');
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, score]);

  // تايمر تغيير الإيموجي (تلقائي كل 1.2 ثانية)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const robotTimer = setInterval(spawnRobot, 1200); // هون السر! بتغير لحاله
    return () => clearInterval(robotTimer);
  }, [gameState, spawnRobot]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-red-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <h1 className="text-4xl font-black mb-8 text-red-500 italic">مختبر "القرار السريع"</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10">
                <p className="text-slate-400 text-sm mb-4 italic">بناءً على معيار Go/No-Go العالمي لتشخيص الاندفاعية.</p>
                <ul className="space-y-4 text-xl">
                    <li>✅ اضغط على <span className="text-green-500 font-bold">الروبوت</span>.</li>
                    <li>❌ طنّش <span className="text-red-500 font-bold">الفضائي</span>.</li>
                </ul>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-red-600 px-16 py-5 rounded-2xl font-black text-2xl">هجوم! 🚀</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-12">
               <span className="text-yellow-400 text-2xl font-mono">⏳ {timeLeft}</span>
               <span className="text-green-500 text-2xl font-black">النقاط: {score}</span>
            </div>
            
            <div className="h-64 flex items-center justify-center">
                <button 
                    key={currentRobot.id} // هذا السطر بخلي الإيموجي "ينط" لما يتغير
                    onClick={() => {
                        if (currentRobot.type === 'target') setScore(s => s + 10);
                        else setScore(s => Math.max(0, s - 15));
                        spawnRobot();
                    }}
                    className={`text-[10rem] md:text-[12rem] animate-in zoom-in duration-200 ${currentRobot.color} drop-shadow-2xl`}
                >
                    {currentRobot.emoji}
                </button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-red-500 mb-8 font-sans">انتهى التحدي!</h2>
            <div className="text-9xl font-black mb-10">{score}</div>
            <Link href="/diagnose/attention" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}