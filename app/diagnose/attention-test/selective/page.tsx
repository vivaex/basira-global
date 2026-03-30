'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SelectiveAttention() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [currentRobot, setCurrentRobot] = useState({ type: 'target', emoji: '🤖' });
  const [feedback, setFeedback] = useState('');

  const robots = [
    { type: 'target', emoji: '🤖', color: 'text-green-500' }, // الروبوت الصحيح
    { type: 'distractor', emoji: '👾', color: 'text-red-500' } // الروبوت الفخ
  ];

  const spawnRobot = () => {
    const isTarget = Math.random() > 0.4;
    setCurrentRobot(isTarget ? robots[0] : robots[1]);
    setFeedback('');
  };

  const handleAction = () => {
    if (gameState !== 'playing') return;

    if (currentRobot.type === 'target') {
      setScore(s => s + 10);
      setFeedback('✅ أحسنت!');
    } else {
      setScore(s => Math.max(0, s - 15));
      setFeedback('❌ خطأ! هذا فخ');
    }
    spawnRobot();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let spawnInterval: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      spawnInterval = setInterval(spawnRobot, 1200); // تغيير الروبوت كل ثانية وشوي
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('attentionScore', score.toString());
        localStorage.setItem('attentionDone', 'true');
      }
      setGameState('result');
    }

    return () => {
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-red-500/20 shadow-2xl max-w-2xl w-full text-center relative overflow-hidden">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">🎯</div>
            <h1 className="text-4xl font-black mb-6 text-red-500">تحدي صائد الروبوتات</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10 space-y-4">
                <p className="text-lg">🤖 اضغط على <span className="text-green-500 font-bold">الروبوت الأخضر</span> فوراً.</p>
                <p className="text-lg">👾 <span className="text-red-500 font-bold">احذر!</span> لا تضغط على الفضائي الأحمر.</p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-red-600 hover:bg-red-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">
                ابدأ الصيد! 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-12">
               <span className="text-yellow-400 font-mono text-2xl">⏳ {timeLeft}ث</span>
               <span className="text-green-400 font-black text-2xl">النقاط: {score}</span>
            </div>
            
            <div className="h-64 flex flex-col items-center justify-center">
                <button 
                    onClick={handleAction}
                    className={`text-[10rem] transition-transform active:scale-90 ${currentRobot.color}`}
                >
                    {currentRobot.emoji}
                </button>
                <div className={`mt-4 font-bold text-xl h-8 ${feedback.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                    {feedback}
                </div>
            </div>

            <p className="mt-12 text-slate-500 italic">بسرعة.. قبل أن يختفي!</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🏆</div>
            <h2 className="text-5xl font-black text-red-500 mb-6 italic">صياد ماهر!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-red-500/20">
               <p className="text-slate-500 mb-2 font-bold">سكور الانتباه والتحكم:</p>
               <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose/attention" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">
                العودة لمختبر الانتباه
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}