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
    const timeToMemorize = Math.max(4 - Math.floor(level / 3), 2);
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
        const newScore = score + (level * 10);
        setScore(newScore);
        if (level < 5) {
          setTimeout(() => { setLevel(level + 1); setGameState('start'); }, 500);
        } else {
          // حفظ النتيجة النهائية للذاكرة
          localStorage.setItem('memoryScore', newScore.toString());
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
            <h1 className="text-4xl font-black mb-6 text-blue-400">المستوى {level}</h1>
            <button onClick={() => startLevel()} className="bg-blue-600 px-12 py-4 rounded-2xl font-bold text-xl">ابدأ التحدي 🚀</button>
          </div>
        )}
        {gameState === 'memorize' && (
          <div>
            <h2 className="text-2xl mb-8 text-yellow-400">احفظ الأشكال: {timer}</h2>
            <div className="flex flex-wrap justify-center gap-4 text-6xl">
              {targetShapes.map((s, i) => <span key={i} className="bg-slate-700 p-4 rounded-2xl">{s}</span>)}
            </div>
          </div>
        )}
        {gameState === 'recall' && (
          <div>
            <div className="flex flex-wrap justify-center gap-4 mb-8 min-h-[80px]">
              {selectedShapes.map((s, i) => <span key={i} className="text-5xl">{s}</span>)}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {SHAPES.map((s, i) => (
                <button key={i} onClick={() => handleShapeClick(s)} className="text-4xl p-4 bg-slate-700 rounded-xl hover:bg-blue-600 transition">{s}</button>
              ))}
            </div>
          </div>
        )}
        {gameState === 'result' && (
          <div>
            <h2 className="text-5xl font-black mb-6 text-green-400">انتهى الاختبار!</h2>
            <p className="text-3xl mb-8">النتيجة: {score}</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => startLevel(true)} className="bg-blue-600 py-4 rounded-xl font-bold">إعادة 🔄</button>
              <Link href="/diagnose" className="text-slate-400 underline">العودة للبوابة</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}