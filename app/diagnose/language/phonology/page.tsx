'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const LEVELS = [
  { question: "ما هو الحرف الأول في كلمة (بحر)؟", options: ["ب", "ح", "ر"], correct: "ب", difficulty: "بسيط" },
  { question: "أي كلمة تبدأ بنفس صوت (تـفاح)؟", options: ["تـمر", "مـوز", "عـنب"], correct: "تـمر", difficulty: "بسيط" },
  { question: "ماذا تبقى من كلمة (سماء) إذا حذفنا حرف (س)؟", options: ["ماء", "سما", "مأ"], correct: "ماء", difficulty: "متوسط" },
  { question: "ادمج الأصوات (قـ - لـ - مـ) لتكوين كلمة:", options: ["قلم", "لقم", "ملق"], correct: "قلم", difficulty: "متوسط" },
  { question: "ما هو الصوت الأوسط في كلمة (سيف)؟", options: ["ي", "س", "ف"], correct: "ي", difficulty: "متقدم" },
  { question: "كلمة (خروف) تنتهي بصوت:", options: ["ف", "خ", "ر"], correct: "ف", difficulty: "متقدم" },
];

export default function PhonologyTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (option: string) => {
    if (option === LEVELS[currentIdx].correct) {
      setScore(s => s + 1);
    }
    
    if (currentIdx + 1 < LEVELS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('languagePhonologyScore', ((score / LEVELS.length) * 100).toString());
      }
      setGameState('result');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-indigo-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">🗣️</div>
            <h1 className="text-4xl font-black mb-6 text-indigo-400">تحدي أصوات الحروف</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10 space-y-4 text-sm md:text-base">
                <p className="text-blue-400 font-bold">🎯 الأساس العلمي:</p>
                <p className="text-slate-300 italic leading-relaxed">
                    يعتمد هذا الاختبار على بروتوكول **CTOPP-2**، وهو المعيار الذهبي عالمياً لقياس المعالجة الفونولوجية. الضعف هنا يعتبر المؤشر الأول لصعوبات القراءة (الديسلكسيا).
                </p>
                <p className="text-white font-bold">المهمة: استمع للأسئلة واختر الإجابة الصحيحة بناءً على صوت الحرف.</p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-indigo-600 hover:bg-indigo-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">
                ابدأ التشخيص 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8">
               <span className="text-slate-500 font-bold">المستوى: {LEVELS[currentIdx].difficulty}</span>
               <span className="text-indigo-400 font-black">{currentIdx + 1} / {LEVELS.length}</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-12 text-white leading-snug">
                {LEVELS[currentIdx].question}
            </h2>

            <div className="grid gap-4">
              {LEVELS[currentIdx].options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAnswer(opt)} 
                  className="bg-slate-800 hover:bg-indigo-600 p-6 rounded-3xl text-2xl font-black transition-all active:scale-95 border-2 border-slate-700 shadow-lg text-center"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🏅</div>
            <h2 className="text-5xl font-black text-indigo-400 mb-6 italic">تحليل اللغة</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-indigo-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase tracking-widest">كفاءة المعالجة الفونولوجية</p>
               <div className="text-8xl font-black text-white">
                 {Math.round((score / LEVELS.length) * 100)}%
               </div>
            </div>
            <Link href="/diagnose/language">
              <button className="bg-slate-800 px-12 py-4 rounded-xl font-bold transition hover:bg-slate-700">العودة لمختبر اللغة</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}