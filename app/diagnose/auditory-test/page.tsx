'use client';
import { useState } from 'react';
import Link from 'next/link';

const DATA = [
  { word: 'تفاحة', emoji: '🍎' }, { word: 'صاروخ', emoji: '🚀' },
  { word: 'قطة', emoji: '🐱' }, { word: 'كرة', emoji: '⚽' },
  { word: 'أسد', emoji: '🦁' }, { word: 'سيارة', emoji: '🚗' },
];

export default function AuditoryTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof DATA>([]);

  const speak = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'ar-SA';
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
    if (emoji === options[0].emoji) setScore(s => s + 20);
    setCurrentLevel(l => l + 1);
    startNextLevel();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-green-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div>
            <div className="text-8xl mb-6">🔊</div>
            <h1 className="text-4xl font-black mb-6 text-green-400">اختبار التمييز السمعي</h1>
            <button onClick={() => {setScore(0); setCurrentLevel(0); startNextLevel();}} className="bg-green-600 px-16 py-5 rounded-2xl font-black text-2xl">ابدأ الاستماع! 👂</button>
          </div>
        )}
        {gameState === 'playing' && (
          <div>
            <button onClick={() => speak(options[0].word)} className="mb-12 p-8 bg-slate-800 rounded-full text-4xl border-2 border-green-500/30">🔊 اضغط لتسمع</button>
            <div className="grid grid-cols-2 gap-6">
              {[...options].sort(() => 0.5 - Math.random()).map((opt, i) => (
                <button key={i} onClick={() => handleChoice(opt.emoji)} className="text-[6rem] p-8 bg-slate-950 rounded-3xl hover:bg-green-600 transition active:scale-90 shadow-xl border-2 border-slate-800">{opt.emoji}</button>
              ))}
            </div>
          </div>
        )}
        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-green-400 mb-8">أحسنت يا بطل! 🏆</h2>
            <div className="text-8xl font-black text-white mb-10">{score}</div>
            <Link href="/diagnose/results">
              <button className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-black text-xl shadow-lg animate-bounce">عرض التقرير والتشخيص 📑</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}