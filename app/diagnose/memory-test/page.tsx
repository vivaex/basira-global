'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const SHAPES = ['🍎', '🚀', '⚽', '🎮', '🦁', '🛡️', '🤖', '🛸', '🌈', '💎', '🎨', '🎸'];

export default function MemoryTest() {
  const [gameState, setGameState] = useState<'start' | 'memorize' | 'recall' | 'result'>('start');
  const [level, setLevel] = useState(1);
  const [targetShapes, setTargetShapes] = useState<string[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(3);

  const startLevel = (isNewGame = false) => {
    if (isNewGame) { setScore(0); setLevel(1); }
    const shapeCount = Math.min(level + 2, 8); // مستوى 1 = 3 أشكال، مستوى 5 = 7 أشكال
    const timeToMemorize = Math.max(4 - Math.floor(level / 2), 2); // الوقت يقل مع المستويات
    const shuffled = [...SHAPES].sort(() => 0.5 - Math.random());
    setTargetShapes(shuffled.slice(0, shapeCount));
    setSelectedShapes([]);
    setTimer(timeToMemorize);
    setGameState('memorize');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'memorize' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (gameState === 'memorize' && timer === 0) {
      setGameState('recall');
    }
    return () => clearInterval(interval);
  }, [gameState, timer]);

  const handleShapeClick = (shape: string) => {
    if (gameState !== 'recall') return;
    const newSelection = [...selectedShapes, shape];
    setSelectedShapes(newSelection);

    if (newSelection.length === targetShapes.length) {
      const isCorrect = JSON.stringify(newSelection) === JSON.stringify(targetShapes);
      if (isCorrect) {
        const nextScore = score + (level * 10);
        setScore(nextScore);
        if (level < 5) {
          setTimeout(() => { setLevel(l => l + 1); setGameState('start'); }, 600);
        } else {
          localStorage.setItem('memoryScore', nextScore.toString());
          setGameState('result');
        }
      } else {
        localStorage.setItem('memoryScore', score.toString());
        setGameState('result');
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-800 p-10 rounded-[2.5rem] border-4 border-blue-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div>
            <div className="text-blue-400 font-bold mb-2">المستوى {level} من 5</div>
            <h1 className="text-4xl font-black mb-8 text-white">جاهز للتحدي؟</h1>
            <button onClick={() => startLevel()} className="bg-blue-600 px-12 py-5 rounded-2xl font-bold text-2xl shadow-xl">ابدأ المستوى 🚀</button>
          </div>
        )}
        {gameState === 'memorize' && (
          <div>
            <h2 className="text-2xl mb-8 text-yellow-400 font-bold">احفظهم بسرعة! ⏱️ {timer}</h2>
            <div className="flex flex-wrap justify-center gap-4 text-7xl">
              {targetShapes.map((s, i) => <span key={i} className="bg-slate-700 p-6 rounded-3xl animate-pulse">{s}</span>)}
            </div>
          </div>
        )}
        {gameState === 'recall' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl mb-8 text-blue-300">أين كانت الأشكال؟</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-10 min-h-[100px] border-b border-slate-700 pb-6">
                {selectedShapes.map((s, i) => <span key={i} className="text-6xl animate-in zoom-in">{s}</span>)}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SHAPES.map((s, i) => (
                <button key={i} onClick={() => handleShapeClick(s)} className="text-4xl p-4 bg-slate-700 rounded-xl hover:bg-blue-600 transition shadow-md">{s}</button>
              ))}
            </div>
          </div>
        )}
        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black mb-6 text-green-400">كفو يا بطل! 🏆</h2>
            <p className="text-3xl mb-8">مجموع نقاطك: {score}</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => startLevel(true)} className="bg-blue-600 py-4 rounded-xl font-bold text-xl transition">إعادة من جديد 🔄</button>
              <Link href="/diagnose" className="text-slate-400 underline">بوابة التشخيص</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}