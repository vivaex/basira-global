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
    const left = Math.floor(Math.random() * 12) + 2;
    let right = Math.floor(Math.random() * 12) + 2;
    while (right === left || Math.abs(right - left) < 1) right = Math.floor(Math.random() * 12) + 2;

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
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-yellow-500/20 shadow-2xl max-w-3xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in duration-500">
            <div className="text-7xl mb-6">⚖️</div>
            <h1 className="text-4xl font-black mb-6 text-yellow-400 font-sans">تحدي "الحس العددي"</h1>
            
            {/* شرح الاختبار للطالب */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-right mb-10 space-y-4">
                <p className="text-xl font-bold text-blue-400">💡 كيف نلعب؟</p>
                <ul className="text-slate-300 space-y-2 text-lg">
                    <li>• ستظهر لك مجموعتان من النقاط الملونة.</li>
                    <li>• <span className="text-yellow-500 font-bold">المهمة:</span> اختر الجهة التي تحتوي على نقاط "أكثر".</li>
                    <li>• <span className="text-red-400 font-bold">السر:</span> لا تحاول العد! ثق بـ "نظرة عينك" السريعة.</li>
                </ul>
                <p className="text-slate-500 text-sm italic">لماذا؟ هذا الاختبار يقيس مدى قوة "الرادار" الرياضي في عقلك قبل البدء بالأرقام الصعبة.</p>
            </div>

            <button onClick={generateRound} className="bg-yellow-600 hover:bg-yellow-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95">
                أنا مستعد للهجوم! 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 font-bold">
               <span className="bg-slate-800 px-4 py-2 rounded-full text-slate-400">الجولة {rounds + 1} / 10</span>
               <span className="bg-yellow-600/20 px-4 py-2 rounded-full text-yellow-500">النقاط: {score}</span>
            </div>
            
            <h2 className="text-2xl mb-8 font-bold">أي جهة فيها نقاط أكـثـر؟ 🤔</h2>

            <div className="grid grid-cols-2 gap-6 h-72 md:h-80">
              <button onClick={() => handleChoice('left')} className="bg-slate-950 rounded-[2.5rem] border-4 border-slate-800 hover:border-blue-500 transition-all flex flex-wrap p-6 items-center justify-center gap-2 overflow-hidden shadow-inner active:scale-95">
                {Array.from({ length: data.left }).map((_, i) => <div key={i} className="w-4 h-4 md:w-8 md:h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>)}
              </button>
              <button onClick={() => handleChoice('right')} className="bg-slate-950 rounded-[2.5rem] border-4 border-slate-800 hover:border-purple-500 transition-all flex flex-wrap p-6 items-center justify-center gap-2 overflow-hidden shadow-inner active:scale-95">
                {Array.from({ length: data.right }).map((_, i) => <div key={i} className="w-4 h-4 md:w-8 md:h-8 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>)}
              </button>
            </div>
            <p className="mt-8 text-slate-500 animate-pulse">لا تتردد.. ثق بحدسك! ✨</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-5xl font-black text-yellow-400 mb-6 font-sans">نتيجة مذهلة!</h2>
            <div className="bg-slate-950 p-8 rounded-3xl mb-10 border border-slate-800">
               <p className="text-slate-500 mb-2">رادارك الرياضي سجل:</p>
               <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose/math">
              <button className="bg-slate-800 hover:bg-slate-700 px-10 py-4 rounded-xl font-bold transition">العودة لمختبر الرياضيات</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}