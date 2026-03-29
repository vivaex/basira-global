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
    const shapeCount = Math.min(level + 2, 8);
    const timeToMemorize = Math.max(4 - Math.floor(level / 2), 2);
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
          localStorage.setItem('memoryDone', 'true');
          setGameState('result');
        }
      } else {
        localStorage.setItem('memoryScore', score.toString());
        localStorage.setItem('memoryDone', 'true');
        setGameState('result');
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-800 p-10 rounded-[2.5rem] border-4 border-blue-500/20 shadow-2xl text-center max-w-2xl w-full">
        {gameState === 'result' ? (
          <div>
            <h2 className="text-5xl font-black text-green-400 mb-8">أحسنت يا بطل!</h2>
            <Link href="/diagnose" className="bg-blue-600 px-10 py-4 rounded-xl font-bold">العودة للبوابة</Link>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl mb-4 text-blue-400">مستوى الذاكرة: {level}</h1>
            {gameState === 'start' && <button onClick={() => startLevel()} className="bg-blue-600 px-12 py-4 rounded-xl text-xl font-bold">ابدأ 🚀</button>}
            {gameState === 'memorize' && (
              <div className="flex flex-wrap justify-center gap-4 text-7xl">
                {targetShapes.map((s, i) => <span key={i} className="bg-slate-700 p-4 rounded-2xl animate-pulse">{s}</span>)}
              </div>
            )}
            {gameState === 'recall' && (
              <div className="grid grid-cols-4 gap-3 mt-8">
                {SHAPES.map((s, i) => (
                  <button key={i} onClick={() => handleShapeClick(s)} className="text-4xl p-4 bg-slate-700 rounded-xl">{s}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}