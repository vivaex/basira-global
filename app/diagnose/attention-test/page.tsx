'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TARGET = '🤖'; 
const DISTRACTORS = ['💣', '📦', '🎈', '☁️', '🧱', '🚗']; 

export default function AttentionTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [message, setMessage] = useState('استعد...');

  // وظيفة اختيار الإيموجي التالي
  const nextEmoji = () => {
    const isTarget = Math.random() > 0.7; // احتمالية ظهور الروبوت
    if (isTarget) {
      setCurrentEmoji(TARGET);
    } else {
      const randomDistractor = DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
      setCurrentEmoji(randomDistractor);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(20);
    setMessage('انطلق! ⚡');
    setGameState('playing');
    nextEmoji();
  };

  const handlePress = () => {
    if (gameState !== 'playing') return;
    
    if (currentEmoji === TARGET) {
      setScore(s => s + 10);
      setMessage('أحسنت! ⚡');
      nextEmoji(); // غير الشكل فوراً عند الضغط الصحيح
    } else {
      setScore(s => Math.max(0, s - 5));
      setMessage('انتبه! ⚠️');
      nextEmoji(); // غير الشكل فوراً عند الخطأ
    }
  };

  // مؤقت اللعبة الأساسي (20 ثانية)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('result');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // مؤقت تغيير الرموز تلقائياً (كل 1.2 ثانية)
  useEffect(() => {
    let emojiTimer: NodeJS.Timeout;
    if (gameState === 'playing') {
      emojiTimer = setInterval(() => {
        nextEmoji();
      }, 1200); // بغير الشكل تلقائياً حتى لو ما ضغطت
    }
    return () => clearInterval(emojiTimer);
  }, [gameState]);

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-800 p-10 md:p-14 rounded-[3rem] border-4 border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)] max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in duration-500">
            <div className="text-8xl mb-8">🎯</div>
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-purple-400 font-sans">تحدي الانتباه الخارق</h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed font-light">
              اضغط على الروبوت <span className="text-5xl font-bold bg-purple-500/20 px-4 py-2 rounded-2xl mx-1">🤖</span> فور ظهوره! <br/>
              الشكل يتغير تلقائياً.. لا تلمس القنابل!
            </p>
            <button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 px-16 py-5 rounded-2xl font-black text-2xl transition shadow-xl hover:scale-105">
              ابدأ التحدي! ⚡
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-10">
              <div className="bg-slate-900 px-6 py-2 rounded-full border border-yellow-500/50 text-yellow-400 font-mono text-2xl">
                {timeLeft} ثانية
              </div>
              <div className="bg-slate-900 px-6 py-2 rounded-full border border-green-500/50 text-green-400 font-bold text-2xl">
                النقاط: {score}
              </div>
            </div>
            
            <div className="h-80 flex flex-col items-center justify-center bg-slate-900/40 rounded-[2rem] border border-slate-700/50 shadow-inner mb-6">
               <div className={`text-xl mb-4 font-bold ${message.includes('أحسنت') ? 'text-green-400' : 'text-yellow-400'}`}>
                 {message}
               </div>
               <button 
                onClick={handlePress}
                className="text-[10rem] transform active:scale-90 transition-all cursor-pointer hover:drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
               >
                 {currentEmoji}
               </button>
            </div>
            <p className="text-slate-500 font-medium italic">ركز على الروبوت فقط...</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in duration-500">
            <div className="text-7xl mb-6">🏁</div>
            <h2 className="text-5xl font-black mb-6 text-purple-400">النتيجة النهائية</h2>
            <div className="bg-slate-950 p-10 rounded-[2rem] mb-10 border border-purple-500/20">
              <p className="text-slate-500 text-lg mb-2 font-bold">مستوى التركيز:</p>
              <div className="text-8xl font-black text-white tracking-widest">{score}</div>
              <p className="text-purple-500 mt-4 font-bold">{score > 120 ? 'أداء عالمي! 🦅' : 'استمر في التمرين.. 💪'}</p>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 px-8 py-5 rounded-2xl font-bold text-xl transition">إعادة المحاولة 🔄</button>
              <Link href="/diagnose" className="text-slate-500 hover:text-white transition underline">العودة للبوابة</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}