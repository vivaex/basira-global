'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const DIRECTIONS = [
  { icon: '⬅️', label: 'يسار', value: 'left' },
  { icon: '➡️', label: 'يمين', value: 'right' },
  { icon: '⬆️', label: 'فوق', value: 'up' },
  { icon: '⬇️', label: 'تحت', value: 'down' },
];

const ITEMS = ['🚀', '🏹', '✈️', '🚗', '🐟', '🐦'];

export default function SpatialPerception() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentTask, setCurrentTask] = useState({ item: '', rotation: 0, target: '' });

  const generateTask = () => {
    if (round > 10) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('spatialScore', score.toString());
        localStorage.setItem('spatialDone', 'true');
      }
      setGameState('result');
      return;
    }

    const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    
    // تحديد زاوية الدوران بناءً على الاتجاه
    let rotation = 0;
    if (randomDir.value === 'right') rotation = 0;
    if (randomDir.value === 'left') rotation = 180;
    if (randomDir.value === 'up') rotation = -90;
    if (randomDir.value === 'down') rotation = 90;

    setCurrentTask({ item: randomItem, rotation, target: randomDir.value });
    setGameState('playing');
  };

  const handleAnswer = (answer: string) => {
    if (answer === currentTask.target) {
      setScore(s => s + 10);
    }
    setRound(r => r + 1);
    generateTask();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-green-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">📐</div>
            <h1 className="text-4xl font-black mb-6 text-green-400 font-sans italic">بوصلة الاتجاهات</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                انظر للشكل جيداً.. <br/> 
                إلى أي اتجاه يشير؟ (يمين، يسار، فوق، تحت)
            </p>
            <button onClick={generateTask} className="bg-green-600 hover:bg-green-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">
                ابدأ التحدي! 🧭
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 text-slate-500 font-bold italic">
               <span>اللغز {round} / 10</span>
               <span className="text-green-400 font-black">النقاط: {score}</span>
            </div>
            
            <h2 className="text-2xl mb-12 font-bold text-white">إلى أين يتجه هاد الشكل؟</h2>

            {/* الشكل المراد تحديد اتجاهه */}
            <div className="mb-16 flex justify-center">
                <div 
                    className="text-[10rem] transition-all duration-500 ease-out drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    style={{ transform: `rotate(${currentTask.rotation}deg)` }}
                >
                    {currentTask.item}
                </div>
            </div>

            {/* أزرار الاتجاهات */}
            <div className="grid grid-cols-2 gap-4">
              {DIRECTIONS.map((dir) => (
                <button 
                  key={dir.value} 
                  onClick={() => handleAnswer(dir.value)} 
                  className="bg-slate-800 hover:bg-green-600 p-6 rounded-3xl text-2xl font-black transition-all active:scale-90 border-2 border-slate-700 flex flex-col items-center gap-2"
                >
                  <span className="text-4xl">{dir.icon}</span>
                  {dir.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🛰️</div>
            <h2 className="text-5xl font-black text-green-400 mb-6 italic">القائد الذكي!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-green-500/20">
               <p className="text-slate-500 mb-2 font-bold">سكور الإدراك المكاني:</p>
               <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose/visual" className="bg-slate-800 px-12 py-4 rounded-xl font-bold hover:bg-slate-700 transition">
                العودة لمختبر البصر
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}