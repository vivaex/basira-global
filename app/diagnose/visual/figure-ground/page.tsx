'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// الأهداف المطلوب البحث عنها
const TARGETS = ['🐱', '🔑', '💎', '🚀', '🎁', '🦖'];
// المشتتات (الزحمة)
const DISTRACTORS = ['🌿', '🍂', '🍀', '🌾', '🌱', '🌵', '🌴', '🌻', '🍃', '🌫️', '☁️'];

export default function FigureGroundTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [targetEmoji, setTargetEmoji] = useState('');
  const [grid, setGrid] = useState<string[]>([]);

  const startNextLevel = () => {
    if (level > 6) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('figureGroundScore', score.toString());
        localStorage.setItem('visualFinalDone', 'true'); // ختمنا البصر!
      }
      setGameState('result');
      return;
    }

    const currentTarget = TARGETS[level - 1];
    setTargetEmoji(currentTarget);

    // زيادة حجم الزحمة مع كل مستوى
    const gridSize = 12 + (level * 8); 
    const newGrid = [];
    
    // تعبئة الشبكة بمشتتات عشوائية
    for (let i = 0; i < gridSize; i++) {
      newGrid.push(DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]);
    }
    
    // وضع الهدف في مكان عشوائي
    const randomPos = Math.floor(Math.random() * gridSize);
    newGrid[randomPos] = currentTarget;

    setGrid(newGrid);
    setGameState('playing');
  };

  const handlePick = (emoji: string) => {
    if (emoji === targetEmoji) {
      setScore(s => s + 15);
      setLevel(l => l + 1);
      startNextLevel();
    } else {
      // عقوبة بسيطة عند الخطأ لتشجيع التركيز
      setScore(s => Math.max(0, s - 5));
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-pink-500/20 shadow-2xl max-w-4xl w-full text-center overflow-hidden">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🖼️</div>
            <h1 className="text-4xl font-black mb-6 text-pink-400 font-sans italic">تحدي "الهدف المفقود"</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
                هل تستطيع إيجاد الشكل المطلوب وسط الغابة الكبيرة؟ <br/> 
                ركز جيداً.. الزحمة ستزداد في كل مستوى!
            </p>
            <button onClick={startNextLevel} className="bg-pink-600 hover:bg-pink-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">
                ابدأ البحث الآن! 🕵️‍♂️
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
               <div className="text-slate-500 font-bold">المستوى {level} / 6</div>
               <div className="bg-pink-600/20 px-6 py-2 rounded-full text-pink-400 font-black">
                  الهدف: <span className="text-4xl mr-2">{targetEmoji}</span>
               </div>
               <div className="text-green-400 font-black">النقاط: {score}</div>
            </div>
            
            <h2 className="text-xl mb-8 text-slate-300">أين يختبئ الـ ({targetEmoji})؟</h2>

            {/* شبكة الزحمة */}
            <div className="flex flex-wrap justify-center gap-3 bg-slate-950/50 p-8 rounded-[2.5rem] border-2 border-slate-800 shadow-inner max-h-[50vh] overflow-y-auto">
              {grid.map((emoji, i) => (
                <button 
                  key={i} 
                  onClick={() => handlePick(emoji)} 
                  className={`text-4xl md:text-5xl p-3 hover:bg-slate-800 rounded-xl transition-all active:scale-75
                    ${emoji === targetEmoji ? 'hover:border-pink-500 border border-transparent' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">👑</div>
            <h2 className="text-5xl font-black text-pink-400 mb-6 italic">خبير الفلترة!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-pink-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase">سكور التركيز البصري:</p>
               <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose/visual" className="bg-slate-800 px-10 py-4 rounded-xl font-bold hover:bg-slate-700 transition">
                إتمام مختبر البصر ✅
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}