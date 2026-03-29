'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TARGET = '🤖'; // الهدف اللي لازم نضغط عليه
const DISTRACTORS = ['💣', '📦', '🎈', '☁️', '🧱']; // المشتتات

export default function AttentionTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20); // مدة الاختبار 20 ثانية
  const [message, setMessage] = useState('استعد...');

  // بدء اللعبة
  const startGame = () => {
    setScore(0);
    setTimeLeft(20);
    setGameState('playing');
    nextEmoji();
  };

  // إظهار الإيموجي التالي بشكل عشوائي
  const nextEmoji = () => {
    const isTarget = Math.random() > 0.7; // احتمالية 30% يظهر الهدف
    if (isTarget) {
      setCurrentEmoji(TARGET);
    } else {
      const randomDistractor = DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
      setCurrentEmoji(randomDistractor);
    }
  };

  // التعامل مع الضغط
  const handlePress = () => {
    if (currentEmoji === TARGET) {
      setScore(s => s + 10);
      setMessage('أحسنت! ⚡');
    } else {
      setScore(s => Math.max(0, s - 5)); // خصم نقاط لو ضغط غلط
      setMessage('انتبه! ⚠️');
    }
    nextEmoji();
  };

  // مؤقت اللعبة
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      const emojiTimer = setInterval(() => nextEmoji(), 1200); // تغيير الإيموجي كل ثانية وشوي
      return () => {
        clearInterval(timer);
        clearInterval(emojiTimer);
      };
    } else if (timeLeft === 0) {
      setGameState('result');
    }
  }, [gameState, timeLeft]);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-800 p-10 rounded-[2.5rem] border-4 border-purple-500/30 shadow-2xl max-w-xl w-full text-center">
        
        {gameState === 'start' && (
          <div>
            <div className="text-6xl mb-6">🎯</div>
            <h1 className="text-4xl font-black mb-6 text-purple-400">اختبار سرعة الانتباه</h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              اضغط على الروبوت <span className="text-4xl">🤖</span> بأسرع ما يمكن! <br/>
              تجنب الضغط على أي شكل آخر.
            </p>
            <button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 px-12 py-4 rounded-2xl font-bold text-2xl transition shadow-lg animate-pulse">
              ابدأ التحدي! ⚡
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div>
            <div className="flex justify-between mb-8 font-bold text-xl">
              <span className="text-yellow-400">الوقت: {timeLeft}ث</span>
              <span className="text-green-400">النقاط: {score}</span>
            </div>
            
            <div className="h-64 flex flex-col items-center justify-center">
               <div className="text-2xl mb-4 text-slate-400">{message}</div>
               <button 
                onClick={handlePress}
                className="text-9xl transform active:scale-75 transition-transform cursor-pointer hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
               >
                 {currentEmoji}
               </button>
            </div>
            <p className="mt-8 text-slate-500">اضغط على الشكل فوراً!</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in duration-500">
            <h2 className="text-5xl font-black mb-6 text-purple-400">انتهى الوقت!</h2>
            <div className="bg-slate-900 p-8 rounded-3xl mb-8">
              <p className="text-slate-400 text-lg mb-2">مستوى التركيز لديك:</p>
              <div className="text-7xl font-black text-white">{score}</div>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={startGame} className="bg-purple-600 px-8 py-4 rounded-xl font-bold text-xl">حاول مجدداً 🔄</button>
              <Link href="/diagnose" className="text-slate-500 hover:text-white">العودة للبوابة</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
