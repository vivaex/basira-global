'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const DATA = [
  { word: 'تفاحة', emoji: '🍎' }, { word: 'صاروخ', emoji: '🚀' },
  { word: 'قطة', emoji: '🐱' }, { word: 'كرة', emoji: '⚽' },
  { word: 'أسد', emoji: '🦁' }, { word: 'سيارة', emoji: '🚗' },
  { word: 'روبوت', emoji: '🤖' }, { word: 'ساعة', emoji: '⌚' },
];

export default function AuditoryTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof DATA>([]);

  // وظيفة نطق الكلمة بالعربي
  const speak = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'ar-SA';
    msg.rate = 0.8; // سرعة نطق هادئة للطفل
    window.speechSynthesis.speak(msg);
  };

  const startNextLevel = () => {
    if (currentLevel >= 5) {
      localStorage.setItem('auditoryScore', score.toString());
      setGameState('result');
      return;
    }
    const shuffled = [...DATA].sort(() => 0.5 - Math.random());
    const roundOptions = shuffled.slice(0, 4);
    setOptions(roundOptions);
    setGameState('playing');
    setTimeout(() => speak(roundOptions[0].word), 600);
  };

  const handleChoice = (emoji: string) => {
    if (emoji === options[0].emoji) {
      setScore(s => s + 20);
    }
    setCurrentLevel(l => l + 1);
    startNextLevel();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-green-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🔊</div>
            <h1 className="text-4xl font-black mb-6 text-green-400 font-sans">اختبار التمييز السمعي</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed font-light">
              استمع جيداً للكلمة التي ينطقها "بصيرة".. <br/> ثم اختر الصورة المطابقة لها!
            </p>
            <button onClick={() => {setScore(0); setCurrentLevel(0); startNextLevel();}} className="bg-green-600 hover:bg-green-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">ابدأ الاستماع! 👂</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <button onClick={() => speak(options[0].word)} className="mb-12 p-8 bg-slate-800 rounded-full hover:bg-slate-700 transition-all border-2 border-green-500/30 group shadow-lg">
              <span className="text-5xl group-active:scale-90 inline-block">🔊 أعد الاستماع</span>
            </button>
            <div className="grid grid-cols-2 gap-6">
              {[...options].sort(() => 0.5 - Math.random()).map((opt, i) => (
                <button key={i} onClick={() => handleChoice(opt.emoji)} className="text-[5rem] md:text-[6rem] p-8 bg-slate-950 rounded-[2.5rem] hover:bg-green-600 transition-all active:scale-90 border-2 border-slate-800 shadow-xl">
                  {opt.emoji}
                </button>
              ))}
            </div>
            <p className="mt-8 text-slate-500 font-medium">المرحلة {currentLevel + 1} من 5</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-green-400 mb-8 font-sans">أحسنت يا بطل! 🏆</h2>
            <div className="bg-slate-950 p-10 rounded-[2rem] border border-green-500/20 mb-8">
                <p className="text-slate-500 text-lg mb-2">سكورك السمعي:</p>
                <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <Link href="/diagnose/results">
              <button className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-black text-xl shadow-lg animate-bounce">عرض التقرير النهائي 📑</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}