'use client';
import { useState } from 'react';
import Link from 'next/link';

const VOCAB_LEVELS = [
  { word: "وسيلة نقل تطير في الجو", options: ["🚢", "✈️", "🚲"], correct: "✈️", difficulty: "بسيط" },
  { word: "أداة نستخدمها لفتح الباب", options: ["🔑", "🔨", "🪛"], correct: "🔑", difficulty: "بسيط" },
  { word: "حيوان ضخم يعيش في الغابة وله خرطوم", options: ["🦁", "🐘", "🦒"], correct: "🐘", difficulty: "متوسط" },
  { word: "الشيء الذي نرتديه لنعرف الوقت", options: ["👓", "⌚", "💍"], correct: "⌚", difficulty: "متوسط" },
  { word: "فاكهة صفراء طويلة يحبها القرد", options: ["🍎", "🍓", "🍌"], correct: "🍌", difficulty: "متقدم" },
];

export default function VocabularyTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (option: string) => {
    if (option === VOCAB_LEVELS[currentIdx].correct) setScore(s => s + 20);
    if (currentIdx + 1 < VOCAB_LEVELS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      if (typeof window !== 'undefined') localStorage.setItem('readingVocabScore', score.toString());
      setGameState('result');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-indigo-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <h1 className="text-4xl font-black mb-8 text-indigo-400 font-sans italic">مستودع المفردات 📚</h1>
            <p className="text-slate-400 mb-10 leading-relaxed italic">مستوحى من مقاييس اللغة العالمية لقياس العمق المعرفي والربط الدلالي.</p>
            <button onClick={() => setGameState('playing')} className="bg-indigo-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl">ابدأ التحدي 🚀</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="bg-slate-950 p-10 rounded-[2.5rem] border-2 border-slate-800 mb-12">
                <h2 className="text-3xl font-bold text-white">{VOCAB_LEVELS[currentIdx].word}</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {VOCAB_LEVELS[currentIdx].options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(opt)} className="text-7xl p-8 bg-slate-800 hover:bg-indigo-600 rounded-[2rem] transition-all border-2 border-slate-700">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-indigo-400 mb-8 italic">قاموس بشري!</h2>
            <div className="text-9xl font-black mb-10 text-white">{score}%</div>
            <Link href="/diagnose/reading" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}