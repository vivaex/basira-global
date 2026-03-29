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

  // بدء مستوى جديد وصعوبة متدرجة
  const startLevel = (isNewGame = false) => {
    if (isNewGame) {
      setScore(0);
      setLevel(1);
    }
    
    // الصعوبة: عدد الأشكال = المستوى + 2 (مثلاً مستوى 1 فيه 3 أشكال، مستوى 3 فيه 5 أشكال)
    const shapeCount = Math.min(level + 2, 8);
    const timeToMemorize = Math.max(4 - Math.floor(level / 3), 2); // الوقت يقل كلما زاد المستوى
    
    const shuffled = [...SHAPES].sort(() => 0.5 - Math.random());
    setTargetShapes(shuffled.slice(0, shapeCount));
    setSelectedShapes([]);
    setTimer(timeToMemorize);
    setGameState('memorize');
  };

  // عداد تنازلي مرئي للمستخدم
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
        setScore(score + (level * 10));
        if (level < 5) { // ننتقل للمستوى التالي حتى المستوى 5
            setTimeout(() => {
                setLevel(level + 1);
                setGameState('start'); // نرجعه للبداية ليضغط "ابدأ المستوى التالي"
            }, 500);
        } else {
            setGameState('result');
        }
      } else {
        setGameState('result'); // خسر
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-800 p-8 md:p-12 rounded-[2rem] border-4 border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.2)] max-w-3xl w-full text-center relative overflow-hidden">
        
        {/* شريط التقدم العلوي */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-700">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(level/5)*100}%` }}></div>
        </div>

        {gameState === 'start' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-blue-400 font-bold mb-2">المستوى {level} من 5</div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
               {level === 1 ? 'اختبار الذاكرة الخارق' : 'رائع! جاهز للتحدي؟'}
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                ستظهر الآن <span className="text-blue-400 font-bold">{level + 2}</span> رموز عشوائية. <br/>
                لديك <span className="text-yellow-400 font-bold">وقت محدد</span> لحفظها بالترتيب!
            </p>
            <button onClick={() => startLevel()} className="bg-blue-600 hover:bg-blue-500 px-16 py-5 rounded-2xl font-black text-2xl transition shadow-[0_10px_20px_rgba(37,99,235,0.4)] active:translate-y-1">
              {level === 1 ? 'ابدأ اللعب! 🚀' : 'ابدأ المستوى التالي ⚡'}
            </button>
          </div>
        )}

        {gameState === 'memorize' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center justify-center gap-3">
               🧠 احفظ الترتيب... <span className="bg-yellow-500/20 px-4 py-1 rounded-full text-3xl font-mono">{timer}</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-6xl md:text-7xl">
              {targetShapes.map((s, i) => (
                <div key={i} className="bg-slate-700 p-6 rounded-3xl border-2 border-slate-600 shadow-inner animate-pulse">
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState === 'recall' && (
          <div className="animate-in slide-in-from-bottom-10 duration-500">
            <h2 className="text-2xl font-bold mb-6 text-blue-300">أعد ترتيب الرموز الآن:</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-12 min-h-[100px] border-b-2 border-dashed border-slate-700 pb-6">
              {selectedShapes.map((s, i) => (
                <span key={i} className="text-6xl animate-in zoom-in">{s}</span>
              ))}
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {SHAPES.map((s, i) => (
                <button 
                  key={i} 
                  disabled={selectedShapes.includes(s)}
                  onClick={() => handleShapeClick(s)} 
                  className={`text-4xl md:text-5xl p-4 rounded-2xl transition shadow-lg active:scale-90 
                    ${selectedShapes.includes(s) ? 'bg-slate-900 opacity-20' : 'bg-slate-700 hover:bg-blue-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in duration-500">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl font-black mb-4 text-green-400">انتهى التقييم!</h2>
            <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-slate-700">
                <p className="text-slate-400 mb-2">إجمالي النقاط المكتسبة</p>
                <div className="text-6xl font-black text-blue-400 tracking-widest">{score}</div>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => startLevel(true)} className="bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-2xl font-bold text-xl shadow-lg">
                 إعادة التحدي من جديد 🔄
              </button>
              <Link href="/diagnose" className="text-slate-500 hover:text-white transition">العودة للبوابة الرئيسية</Link>
            </div>
          </div>
        )}
      </div>
      
      {/* سكور جانبي صغير */}
      <div className="mt-8 text-slate-500 font-bold">سكورك الحالي: {score}</div>
    </main>
  );
}