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
    setSelectedShapes([]); // تصفير الاختيارات
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
    
    // منع إضافة أشكال أكثر من المطلوب
    if (selectedShapes.length >= targetShapes.length) return;

    // تحديث المصفوفة بطريقة تضمن إعادة رندرة الشاشة فوراً
    setSelectedShapes(prev => [...prev, shape]);

    // التأكد إذا خلص الاختيارات عشان ننتقل للنتيجة
    const updatedSelection = [...selectedShapes, shape];
    if (updatedSelection.length === targetShapes.length) {
      const isCorrect = JSON.stringify(updatedSelection) === JSON.stringify(targetShapes);
      
      setTimeout(() => {
        if (isCorrect) {
          const nextScore = score + (level * 10);
          setScore(nextScore);
          if (level < 5) {
            setLevel(l => l + 1);
            setGameState('start');
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
      }, 500);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-800 p-8 md:p-12 rounded-[3rem] border-4 border-blue-500/20 shadow-2xl text-center max-w-2xl w-full">
        
        {gameState === 'start' && (
          <div className="animate-in fade-in zoom-in">
             <div className="text-blue-400 font-bold mb-2">المستوى {level} من 5</div>
             <h1 className="text-4xl font-black mb-8">اختبار الذاكرة</h1>
             <button onClick={() => startLevel()} className="bg-blue-600 hover:bg-blue-500 px-12 py-5 rounded-2xl font-bold text-2xl shadow-lg transition-transform active:scale-95">ابدأ الآن 🚀</button>
          </div>
        )}

        {gameState === 'memorize' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl mb-8 text-yellow-400 font-bold italic">احفظ الترتيب! ⏳ {timer}</h2>
            <div className="flex flex-wrap justify-center gap-4 text-6xl md:text-7xl">
              {targetShapes.map((s, i) => (
                <div key={i} className="bg-slate-700 p-6 rounded-3xl border-2 border-slate-600 shadow-inner">
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'recall' && (
          <div className="animate-in slide-in-from-bottom-5">
            <h2 className="text-2xl mb-6 text-blue-300 font-bold">أين كانت الأشكال؟</h2>
            
            {/* خانة عرض الأشكال المختارة - تأكدنا هنا إنها بتظهر 100% */}
            <div className="flex flex-wrap justify-center gap-4 mb-10 min-h-[120px] bg-slate-900/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-700">
                {selectedShapes.map((s, i) => (
                  <span key={i} className="text-6xl md:text-7xl animate-in zoom-in duration-200">
                    {s}
                  </span>
                ))}
                {selectedShapes.length === 0 && <span className="text-slate-600 italic">اضغط على الأشكال تحت..</span>}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {SHAPES.map((s, i) => (
                <button 
                  key={i} 
                  disabled={selectedShapes.includes(s)}
                  onClick={() => handleShapeClick(s)} 
                  className={`text-4xl md:text-5xl p-4 rounded-2xl transition-all shadow-md active:scale-75
                    ${selectedShapes.includes(s) ? 'bg-slate-900 opacity-20 grayscale' : 'bg-slate-700 hover:bg-blue-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-5xl font-black text-green-400 mb-8 italic">عمل رائع!</h2>
            <div className="bg-slate-950 p-8 rounded-3xl border border-green-500/20 mb-10">
               <p className="text-slate-500 mb-2">سكورك في الذاكرة:</p>
               <div className="text-7xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose">
               <button className="bg-blue-600 hover:bg-blue-500 px-12 py-4 rounded-2xl font-bold text-xl shadow-lg transition-all">العودة للبوابة الرئيسية</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}