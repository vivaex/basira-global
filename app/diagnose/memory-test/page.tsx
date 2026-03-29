'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SHAPES = ['🍎', '🚀', '⚽', '🎮', '🦁', '🛡️', '🤖', '🛸'];

export default function MemoryTest() {
  const [gameState, setGameState] = useState<'start' | 'memorize' | 'recall' | 'result'>('start');
  const [targetShapes, setTargetShapes] = useState<string[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const startLevel = () => {
    const shuffled = [...SHAPES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setTargetShapes(selected);
    setSelectedShapes([]);
    setGameState('memorize');
  };

  useEffect(() => {
    if (gameState === 'memorize') {
      const timer = setTimeout(() => setGameState('recall'), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleShapeClick = (shape: string) => {
    if (gameState !== 'recall') return;
    const newSelection = [...selectedShapes, shape];
    setSelectedShapes(newSelection);
    
    if (newSelection.length === targetShapes.length) {
      const isCorrect = JSON.stringify(newSelection) === JSON.stringify(targetShapes);
      if (isCorrect) setScore(score + 10);
      setGameState('result');
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-800 p-10 rounded-3xl border-2 border-blue-500/30 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div>
            <h1 className="text-4xl font-black mb-6 text-blue-400">اختبار الذاكرة البصرية</h1>
            <p className="text-xl text-slate-300 mb-8 font-light leading-relaxed">
                ستظهر لك 3 رموز لمدة 3 ثوانٍ.. <br/> 
                حاول حفظ أشكالها وترتيبها جيداً!
            </p>
            <button onClick={startLevel} className="bg-blue-600 hover:bg-blue-500 px-12 py-4 rounded-2xl font-bold text-xl transition transform hover:scale-105 shadow-xl">
              أنا جاهز يا بطل! 🚀
            </button>
          </div>
        )}

        {gameState === 'memorize' && (
          <div>
            <h2 className="text-2xl font-bold mb-8 text-yellow-400">ركز.. احفظ الأشكال! 🧠</h2>
            <div className="flex justify-center gap-6 text-7xl animate-pulse">
              {targetShapes.map((s, i) => <span key={i} className="bg-slate-700 p-6 rounded-3xl border border-slate-600">{s}</span>)}
            </div>
          </div>
        )}

        {gameState === 'recall' && (
          <div>
            <h2 className="text-2xl font-bold mb-8 text-blue-300 italic underline">ما هو الترتيب الصحيح؟</h2>
            <div className="flex justify-center gap-4 mb-10 h-24 border-b border-slate-700/50 pb-6">
              {selectedShapes.map((s, i) => <span key={i} className="text-6xl drop-shadow-lg">{s}</span>)}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {SHAPES.map((s, i) => (
                <button key={i} onClick={() => handleShapeClick(s)} className="text-5xl p-4 bg-slate-700 rounded-2xl hover:bg-blue-600 transition active:scale-90 shadow-md">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div>
            <h2 className="text-4xl font-black mb-6 text-green-400">رائع جداً! 🏁</h2>
            <p className="text-2xl mb-8">نقاط التقييم المحرزة: <span className="font-black text-blue-400">{score}</span></p>
            <div className="flex flex-col gap-4">
              <button onClick={startLevel} className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-xl font-bold text-lg">إعادة الاختبار 🔄</button>
              <Link href="/diagnose" className="text-slate-400 hover:underline">العودة للبوابة الرئيسية</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}