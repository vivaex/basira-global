'use client';
import { useState } from 'react';
import Link from 'next/link';

const LEVELS = [
  { sentence: "الولد الصغير يلعب بالكرة الحمراء في الحديقة.", options: ["⚽", "🚗", "🐱"], correct: "⚽", difficulty: "بسيط" },
  { sentence: "تشرب القطة الحليب في المطبخ.", options: ["🥛", "🍎", "🍕"], correct: "🥛", difficulty: "بسيط" },
  { sentence: "السماء تمطر، والطفل يحمل مظلة زرقاء.", options: ["☀️", "☔", "☁️"], correct: "☔", difficulty: "متوسط" },
  { sentence: "الأسد ملك الغابة يعيش في عرينه الكبير.", options: ["🦁", "🐘", "🦒"], correct: "🦁", difficulty: "متوسط" },
  { sentence: "يقف العصفور فوق غصن الشجرة ويغرد بصوت جميل.", options: ["🐦", "🐟", "🦋"], correct: "🐦", difficulty: "متقدم" },
];

export default function ReadingComprehension() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (option: string) => {
    if (option === LEVELS[currentIdx].correct) setScore(s => s + 20);
    
    if (currentIdx + 1 < LEVELS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      if (typeof window !== 'undefined') localStorage.setItem('readingCompScore', score.toString());
      setGameState('result');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-blue-500/20 shadow-2xl max-w-3xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <h1 className="text-4xl font-black mb-8 text-blue-400">تحدي "فهم المقروء"</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10 space-y-4">
                <p className="text-blue-400 font-bold">🎯 الهدف التشخيصي:</p>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                    مستوحى من اختبارات **PIRLS**.. يقيس هذا الاختبار قدرة الدماغ على تحويل الرموز المكتوبة إلى صور ذهنية مفهومة، وهو جوهر عملية القراءة.
                </p>
                <p className="text-xl">المهمة: اقرأ الجملة بتمعّن، ثم اختر الإيموجي الذي يعبر عنها بالظبط.</p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-blue-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">ابدأ القراءة 🚀</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8">
               <span className="bg-slate-800 px-4 py-1 rounded-full text-sm text-slate-400">المستوى: {LEVELS[currentIdx].difficulty}</span>
               <span className="text-blue-400 font-black">{currentIdx + 1} / {LEVELS.length}</span>
            </div>
            
            <div className="bg-slate-950 p-10 rounded-[2.5rem] border-2 border-slate-800 mb-12 shadow-inner">
                <h2 className="text-3xl md:text-4xl font-bold leading-relaxed text-white">
                    {LEVELS[currentIdx].sentence}
                </h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {LEVELS[currentIdx].options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAnswer(opt)} 
                  className="text-7xl p-8 bg-slate-800 hover:bg-blue-600 rounded-[2rem] transition-all active:scale-90 border-2 border-slate-700 shadow-lg"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-6xl font-black text-blue-400 mb-8 italic">قارئ متميز!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-blue-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase tracking-widest text-sm">سكور الاستيعاب القرائي</p>
               <div className="text-9xl font-black text-white">{score}%</div>
            </div>
            <Link href="/diagnose/reading" className="bg-slate-800 px-12 py-4 rounded-xl font-bold">العودة لمختبر القراءة</Link>
          </div>
        )}
      </div>
    </main>
  );
}