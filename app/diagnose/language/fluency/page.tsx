'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const WORD_LISTS = [
  { word: "سـمـكة", type: "real", difficulty: "سهل" },
  { word: "شـمـس", type: "real", difficulty: "سهل" },
  { word: "بـرتـقـال", type: "real", difficulty: "متوسط" },
  { word: "قـسـطـنـطـيـنية", type: "real", difficulty: "صعب" },
  { word: "سـمـبـاط", type: "pseudo", difficulty: "صعب" }, // كلمة غير حقيقية
  { word: "خـرنـفـل", type: "pseudo", difficulty: "صعب" } // كلمة غير حقيقية
];

export default function FluencyTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const startTest = () => {
    setStartTime(Date.now());
    setGameState('playing');
  };

  const handleDecision = (isReal: boolean) => {
    const correctType = WORD_LISTS[currentIdx].type === "real";
    if (isReal === correctType) setScore(s => s + 1);

    if (currentIdx + 1 < WORD_LISTS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      const timeTaken = (Date.now() - startTime) / 1000;
      if (typeof window !== 'undefined') localStorage.setItem('languageFluencyScore', score.toString());
      setGameState('result');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-cyan-500/20 shadow-2xl max-w-2xl w-full text-center">
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">📖</div>
            <h1 className="text-4xl font-black mb-6 text-cyan-400">مختبر الطلاقة وفك التشفير</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10 space-y-4">
                <p className="text-cyan-400 font-bold">🎯 المبدأ العلمي:</p>
                <p className="text-slate-300 italic leading-relaxed text-sm">
                    مستوحى من اختبار **TOWRE** العالمي. اختبار الكلمات "غير الحقيقية" ضروري جداً لأنه يمنع الطفل من الاعتماد على ذاكرته البصرية ويجبره على فك تشفير الحروف فعلياً.
                </p>
                <p className="text-xl">المهمة: اقرأ الكلمة وقرر بسرعة.. هل هي <span className="text-green-500 font-bold">كلمة حقيقية</span> أم <span className="text-red-500 font-bold">كلمة مخترعة</span>؟</p>
            </div>
            <button onClick={startTest} className="bg-cyan-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl">بدء التقييم 🔍</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="text-slate-500 mb-8">الكلمة {currentIdx + 1} من {WORD_LISTS.length}</div>
            <div className="bg-slate-950 py-16 rounded-3xl mb-12 border-2 border-slate-800 shadow-inner">
                <div className="text-7xl md:text-8xl font-black text-white tracking-widest">{WORD_LISTS[currentIdx].word}</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <button onClick={() => handleDecision(true)} className="bg-green-600 p-8 rounded-3xl text-2xl font-black shadow-lg">حقيقية ✅</button>
              <button onClick={() => handleDecision(false)} className="bg-red-600 p-8 rounded-3xl text-2xl font-black shadow-lg">مخترعة ❌</button>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-5xl font-black text-cyan-400 mb-8 italic">تحليل الطلاقة القرائية</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-cyan-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase">النتيجة الدقيقة:</p>
               <div className="text-8xl font-black text-white">{score} / {WORD_LISTS.length}</div>
            </div>
            <Link href="/diagnose/language" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة للمختبر</Link>
          </div>
        )}
      </div>
    </main>
  );
}