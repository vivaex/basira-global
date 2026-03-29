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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); 
      window.speechSynthesis.resume(); 
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'ar-SA';
      msg.rate = 0.8;
      window.speechSynthesis.speak(msg);
    }
  };

  const startNextLevel = () => {
    if (currentLevel >= 5) {
      localStorage.setItem('auditoryScore', score.toString());
      localStorage.setItem('auditoryDone', 'true');
      setGameState('result');
      return;
    }
    const shuffled = [...DATA].sort(() => 0.5 - Math.random());
    const roundOptions = shuffled.slice(0, 4);
    setOptions(roundOptions);
    setGameState('playing');
    setTimeout(() => speak(roundOptions[0].word), 700);
  };

  const handleChoice = (emoji: string) => {
    if (emoji === options[0].emoji) setScore(s => s + 20);
    setCurrentLevel(l => l + 1);
    startNextLevel();
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="bg-slate-800 p-10 rounded-[3rem] border-4 border-green-500/20 shadow-2xl max-w-xl w-full">
        {gameState === 'playing' ? (
          <div>
            <button onClick={() => speak(options[0].word)} className="mb-12 p-8 bg-slate-700 rounded-full text-3xl">🔊 اسمع الكلمة</button>
            <div className="grid grid-cols-2 gap-4">
              {options.map((opt, i) => (
                <button key={i} onClick={() => handleChoice(opt.emoji)} className="text-7xl p-6 bg-slate-950 rounded-2xl hover:bg-green-600">{opt.emoji}</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-4xl mb-8">{gameState === 'start' ? 'اختبار السمع' : 'أحسنت!'}</h2>
            <button onClick={() => {setScore(0); setCurrentLevel(0); startNextLevel();}} className="bg-green-600 px-10 py-4 rounded-xl font-bold">ابدأ 👂</button>
          </div>
        )}
      </div>
    </main>
  );
}