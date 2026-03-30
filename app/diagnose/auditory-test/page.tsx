'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function AuditoryTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [currentTask, setCurrentTask] = useState({ sound: '', options: [] as string[], correct: '' });

  const tasks = [
    { question: "أي كلمة تسمعها الآن؟", word: "قلم", options: ["قلم", "علم", "سلم"], correct: "قلم" },
    { question: "ما هو الصوت المشترك بين (تمر) و (توت)؟", word: "ت", options: ["ت", "م", "ر"], correct: "ت" },
  ];

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      window.speechSynthesis.speak(u);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-cyan-500/20 shadow-2xl max-w-xl w-full text-center">
        {gameState === 'start' && (
          <div>
            <div className="text-7xl mb-6">👂</div>
            <h1 className="text-3xl font-black mb-8 text-cyan-400">مختبر التمييز السمعي</h1>
            <button onClick={() => { setGameState('playing'); speak(tasks[0].question + " " + tasks[0].word); }} className="bg-cyan-600 px-12 py-4 rounded-2xl font-bold">ابدأ الفحص السمعي</button>
          </div>
        )}
        {gameState === 'playing' && (
          <div>
            <button onClick={() => speak(tasks[0].word)} className="bg-slate-800 p-10 rounded-full mb-10 animate-pulse text-5xl">🔊</button>
            <div className="grid gap-4">
              {tasks[0].options.map(opt => (
                <button key={opt} onClick={() => setGameState('result')} className="bg-slate-800 p-6 rounded-2xl text-2xl font-bold hover:bg-cyan-600 transition">{opt}</button>
              ))}
            </div>
          </div>
        )}
        {gameState === 'result' && (
          <div className="animate-in zoom-in">
             <h2 className="text-4xl font-bold mb-8">تم الفحص بنجاح</h2>
             <Link href="/diagnose" className="text-cyan-400 underline">العودة للبوابة</Link>
          </div>
        )}
      </div>
    </main>
  );
}