'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const COLORS = [
  { name: 'أحمر', hex: 'bg-red-500' },
  { name: 'أزرق', hex: 'bg-blue-500' },
  { name: 'أخضر', hex: 'bg-green-500' },
  { name: 'أصفر', hex: 'bg-yellow-400' }
];

export default function RANTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [grid, setGrid] = useState<{hex: string, id: number}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);

  const startTest = () => {
    const newGrid = Array.from({ length: 20 }, (_, i) => ({
      ...COLORS[Math.floor(Math.random() * COLORS.length)],
      id: i
    }));
    setGrid(newGrid);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setGameState('playing');
  };

  const handleColorClick = (index: number) => {
    if (index === currentIndex) {
      if (currentIndex + 1 === grid.length) {
        const time = (Date.now() - startTime) / 1000;
        setFinalTime(time);
        if (typeof window !== 'undefined') localStorage.setItem('languageRANScore', time.toFixed(2));
        setGameState('result');
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-blue-500/20 shadow-2xl max-w-3xl w-full text-center">
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">⏱️</div>
            <h1 className="text-4xl font-black mb-6 text-blue-400">اختبار التسمية السريعة (RAN)</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10 space-y-4">
                <p className="text-blue-400 font-bold">💡 معيار التشخيص:</p>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                    هذا الاختبار يحاكي بروتوكول **RAN/RAS** العالمي. البطء في تسمية الألوان يشير إلى ضعف في سرعة المعالجة البصرية واسترجاع المفردات من الذاكرة.
                </p>
                <p className="text-xl">المهمة: اضغط على الألوان بالترتيب (من اليمين لليسار) بأسرع ما يمكن!</p>
            </div>
            <button onClick={startTest} className="bg-blue-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">ابدأ السباق 🚀</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl mb-8 font-bold">اضغط بالترتيب... {currentIndex + 1} / 20</h2>
            <div className="grid grid-cols-5 gap-4 bg-slate-950 p-6 rounded-3xl">
              {grid.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleColorClick(i)}
                  className={`h-16 md:h-24 rounded-2xl transition-all duration-200 shadow-lg border-4
                    ${item.hex} ${currentIndex === i ? 'border-white scale-110 shadow-white/50' : 'border-transparent opacity-50'}`}
                />
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-blue-400 mb-8 italic">سرعة استجابة ممتازة!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-blue-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase">الزمن الإجمالي:</p>
               <div className="text-8xl font-black text-white">{finalTime.toFixed(2)} <span className="text-2xl text-slate-500">ثانية</span></div>
            </div>
            <Link href="/diagnose/language" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}