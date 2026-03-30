'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MotorPrecision() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(100);
  const [isOut, setIsOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // حماية النتيجة وحفظها
  const finishTest = (finalScore: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('motorPrecisionScore', finalScore.toString());
    }
    setGameState('result');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    
    // التحقق إذا كان المؤشر خرج عن المسار (عن طريق العناصر)
    // في هذا الاختبار البسيط، سنعتمد على منطق "الخروج من الحاوية"
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-rose-500/20 shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">🖋️</div>
            <h1 className="text-4xl font-black mb-6 text-rose-500 italic font-sans">تحدي المسار الذهبي</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10 space-y-4">
                <p className="text-blue-400 font-bold">💡 القيمة التشخيصية:</p>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                    هذا الاختبار يحاكي "اختبار متاهة بورتيوس" العالمي، ويقيس دقة التآزر بين العين واليد، وهو مؤشر أساسي لسرعة تعلم الكتابة والتحكم العضلي الدقيق.
                </p>
                <p className="text-xl text-white">المهمة: ابقِ المؤشر (أو إصبعك) داخل المسار <span className="text-rose-500 font-bold underline">الأصفر</span> من البداية للنهاية دون الخروج عنه!</p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-rose-600 hover:bg-rose-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all">
                ابدأ الرحلة 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in flex flex-col items-center">
            <div className="flex justify-between w-full mb-8">
               <span className="text-rose-500 font-black">الدقة الحالية: {score}%</span>
               <span className="text-slate-500 italic">اتبع المسار بحذر...</span>
            </div>

            {/* المسار الحركي */}
            <div 
              className="relative w-full h-64 bg-slate-950 rounded-3xl border-2 border-slate-800 overflow-hidden cursor-crosshair"
              onMouseLeave={() => { setIsOut(true); setScore(s => Math.max(0, s - 1)); }}
              onMouseEnter={() => setIsOut(false)}
            >
                {/* منطقة البداية */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-20 bg-green-500/20 border-r-4 border-green-500 flex items-center justify-center font-bold text-green-500">
                    ابدأ
                </div>

                {/* المسار الملتوي (بسيط للتمثيل) */}
                <div className="absolute inset-x-20 inset-y-10 bg-rose-500/10 border-y-4 border-rose-500/30 flex items-center justify-center">
                    <div className="w-full h-12 bg-rose-500/20 border-y-2 border-rose-500 animate-pulse"></div>
                </div>

                {/* منطقة النهاية */}
                <button 
                  onMouseEnter={() => finishTest(score)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500/20 border-l-4 border-blue-500 flex items-center justify-center font-bold text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                >
                    النهاية
                </button>
            </div>
            
            {isOut && <p className="mt-4 text-red-500 animate-bounce font-bold">⚠️ أنت خارج المسار! عُد بسرعة!</p>}
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-5xl font-black text-rose-500 mb-6 italic font-sans">تحكم مذهل!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-rose-500/20">
               <p className="text-slate-500 mb-2 font-bold uppercase tracking-widest">نسبة دقة التآزر الحركي</p>
               <div className="text-8xl font-black text-white">{score}%</div>
            </div>
            <Link href="/diagnose/motor">
              <button className="bg-slate-800 hover:bg-slate-700 px-12 py-4 rounded-xl font-bold transition">العودة لمختبر الحركة</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}