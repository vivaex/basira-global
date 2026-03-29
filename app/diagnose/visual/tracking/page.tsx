'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function VisualTracking() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [speed, setSpeed] = useState(1500); // سرعة الحركة بالملي ثانية
  const containerRef = useRef<HTMLDivElement>(null);

  // دالة تحريك الكرة لمكان عشوائي
  const moveBall = () => {
    const newX = Math.random() * 80 + 10; // من 10% لـ 90%
    const newY = Math.random() * 80 + 10;
    setPosition({ x: newX, y: newY });
  };

  // معالجة الضغط على الكرة
  const handleBallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScore(s => s + 10);
    setSpeed(prev => Math.max(500, prev - 100)); // تسريع الحركة
    moveBall();
  };

  // تكرار الحركة وتناقص الوقت
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let moveInterval: NodeJS.Timeout;

    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      moveInterval = setInterval(moveBall, speed);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('trackingScore', score.toString());
      }
      setGameState('result');
    }

    return () => {
      clearInterval(timer);
      clearInterval(moveInterval);
    };
  }, [gameState, timeLeft, speed]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border-4 border-blue-500/20 shadow-2xl max-w-4xl w-full text-center relative overflow-hidden h-[80vh]">
        
        {gameState === 'start' && (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in">
            <div className="text-8xl mb-6">🎯</div>
            <h1 className="text-4xl font-black mb-6 text-blue-400 font-sans italic">تحدي التتبع السريع</h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                راقب الكرة الزرقاء بعناية.. <br/> 
                ستحاول الهروب منك، اضغط عليها قبل أن تختفي!
            </p>
            <button onClick={() => setGameState('playing')} className="bg-blue-600 hover:bg-blue-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95">
                أنا جاهز للمطاردة! 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="relative h-full w-full" ref={containerRef}>
            {/* شريط المعلومات */}
            <div className="flex justify-between items-center mb-4 relative z-10 pointer-events-none">
              <div className="bg-slate-950/80 px-6 py-2 rounded-full border border-slate-700">
                <span className="text-slate-500 ml-2">الوقت:</span>
                <span className="text-yellow-400 font-mono text-2xl">{timeLeft}ث</span>
              </div>
              <div className="bg-blue-600/20 px-6 py-2 rounded-full border border-blue-500/30">
                <span className="text-blue-400 font-black text-2xl">🏆 {score}</span>
              </div>
            </div>

            {/* الكرة المتحركة */}
            <button
              onClick={handleBallClick}
              className="absolute w-20 h-20 md:w-24 md:h-24 bg-blue-500 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.8)] border-4 border-white/20 transition-all duration-500 ease-in-out cursor-crosshair flex items-center justify-center group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-8 h-8 bg-white/30 rounded-full blur-sm group-active:scale-150 transition-transform"></div>
            </button>
            
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-600 italic">لا تفقدها من عينك! 👀</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in">
            <div className="text-8xl mb-6">🛰️</div>
            <h2 className="text-5xl font-black text-blue-400 mb-6 italic">رادار بشري!</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-blue-500/20 min-w-[300px]">
               <p className="text-slate-500 mb-2 font-bold uppercase">سكور التتبع والتركيز:</p>
               <div className="text-8xl font-black text-white">{score}</div>
            </div>
            <div className="flex gap-4">
                <button onClick={() => {setScore(0); setTimeLeft(20); setGameState('playing');}} className="bg-slate-800 px-10 py-4 rounded-xl font-bold hover:bg-slate-700 transition">إعادة الاختبار</button>
                <Link href="/diagnose/visual" className="bg-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-500 transition">العودة لمختبر البصر</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}