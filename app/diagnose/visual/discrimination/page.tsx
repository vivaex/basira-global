'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const LEVELS = [
  { main: '🍎', odd: '🍅', size: 4 }, // التفاحة والبندورة (متشابهين)
  { main: '⚽', odd: '🏀', size: 9 }, // كرة قدم وسلة
  { main: '🐱', odd: '🐯', size: 12 }, // قطة ونمر
  { main: '🌲', odd: '🌳', size: 16 }, // شجرتين مختلفتين
  { main: '🤖', odd: '👾', size: 20 }, // آلي وفضائي
  { main: '🛡️', odd: '⚓', size: 25 }, // درع ومخطاف
];

export default function DiscriminationTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);

  const startLevel = () => {
    if (levelIdx >= LEVELS.length) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('visualScore', score.toString());
        localStorage.setItem('visualDone', 'true');
      }
      setGameState('result');
      return;
    }

    const current = LEVELS[levelIdx];
    const newGrid = Array(current.size).fill(current.main);
    const oddIdx = Math.floor(Math.random() * current.size);
    newGrid[oddIdx] = current.odd;
    
    setGrid(newGrid);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const handleSelect = (emoji: string) => {
    const isCorrect = emoji === LEVELS[levelIdx].odd;
    const timeTaken = (Date.now() - startTime) / 1000;
    
    if (isCorrect) {
      // السكور يعتمد على السرعة: كل ما كنت أسرع، السكور أعلى
      const levelScore = Math.max(5, Math.floor(20 - timeTaken));
      setScore(s => s + levelScore);
    }
    
    setTimeout(() => {
      setLevelIdx(prev => prev + 1);
      setGameState('start'); // نرجع لستارت عشان نولد ليفل جديد
    }, 300);
  };

  // توليد الليفل أول ما يرجع لستارت إذا كنا في نص اللعبة
  useEffect(() => {
    if (gameState === 'start' && levelIdx > 0 && levelIdx < LEVELS.length) {
      startLevel();
    }
  }, [gameState]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-purple-500/20 shadow-2xl max-w-3xl w-full text-center">
        
        {gameState === 'start' && levelIdx === 0 && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-black mb-6 text-purple-400">تحدي التمييز البصري</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                هناك عنصر واحد "مختلف" يختبئ بين الأشكال.. <br/> هل تستطيع إيجاده بسرعة البرق؟ ⚡
            </p>
            <button onClick={startLevel} className="bg-purple-600 hover:bg-purple-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">
                ابدأ البحث! 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 text-slate-500 font-bold italic">
               <span>المستوى {levelIdx + 1} / {LEVELS.length}</span>
               <span className="text-purple-400">النقاط: {score}</span>
            </div>
            
            <h2 className="text-2xl mb-8 font-bold">اضغط على الشكل المختلف!</h2>

            <div className={`grid gap-3 mx-auto`} style={{ 
                gridTemplateColumns: `repeat(${Math.sqrt(grid.length)}, minmax(0, 1fr))` 
              }}>
              {grid.map((emoji, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSelect(emoji)} 
                  className="text-4xl md:text-5xl p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all active:scale-75 shadow-lg border border-slate-700"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🦅</div>
            <h2 className="text-5xl font-black text-purple-400 mb-6">عين الصقر!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-purple-500/20">
               <p className="text-slate-500 mb-2">سكور قوة الملاحظة:</p>
               <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose/visual">
              <button className="bg-slate-800 px-10 py-4 rounded-xl font-bold">العودة لمختبر البصر</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}