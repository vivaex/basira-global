'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type SignalColor = 'GREEN' | 'RED' | 'NONE';

interface GameStats {
  hits: number;         // Clicked on Green
  misses: number;       // Missed Green
  falseAlarms: number;  // Clicked on Red
  correctStops: number; // Ignored Red
}

export default function TrainStopGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [signal, setSignal] = useState<SignalColor>('NONE');
  
  const [stats, setStats] = useState<GameStats>({ hits: 0, misses: 0, falseAlarms: 0, correctStops: 0 });
  const [feedback, setFeedback] = useState<'SUCCESS' | 'ERROR' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundCount = useRef(0);
  const maxRounds = 30; // Short training session

  const currentSignalRef = useRef<SignalColor>('NONE');
  const hasReactedRef = useRef<boolean>(false);

  const startNextRound = useCallback(() => {
    if (roundCount.current >= maxRounds) {
      setGameOver(true);
      setIsPlaying(false);
      setSignal('NONE');
      return;
    }

    roundCount.current += 1;
    setFeedback(null);
    hasReactedRef.current = false;

    // 80% Green (Go), 20% Red (No-Go)
    const isGo = Math.random() < 0.8;
    const nextSignal = isGo ? 'GREEN' : 'RED';
    
    setSignal(nextSignal);
    currentSignalRef.current = nextSignal;

    // Signal stays on screen for 800ms
    timerRef.current = setTimeout(() => {
      // Evaluate if missed
      if (!hasReactedRef.current) {
        if (currentSignalRef.current === 'GREEN') {
          // Missed a GO signal
          setStats(s => ({ ...s, misses: s.misses + 1 }));
          setFeedback('ERROR');
        } else if (currentSignalRef.current === 'RED') {
          // Correctly ignored a NO-GO signal
          setStats(s => ({ ...s, correctStops: s.correctStops + 1 }));
          setFeedback('SUCCESS');
        }
      }

      setSignal('NONE');
      currentSignalRef.current = 'NONE';
      
      // Inter-stimulus interval (400-800ms random)
      timerRef.current = setTimeout(startNextRound, 400 + Math.random() * 400);

    }, 800);

  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setStats({ hits: 0, misses: 0, falseAlarms: 0, correctStops: 0 });
    roundCount.current = 0;
    
    // Initial delay before first signal
    setTimeout(startNextRound, 1000);
  };

  const handleActionClick = () => {
    if (!isPlaying || signal === 'NONE' || hasReactedRef.current) return;
    
    hasReactedRef.current = true;

    if (signal === 'GREEN') {
      // Correct hit
      setStats(s => ({ ...s, hits: s.hits + 1 }));
      setFeedback('SUCCESS');
    } else if (signal === 'RED') {
      // Impulse failure (False Alarm)
      setStats(s => ({ ...s, falseAlarms: s.falseAlarms + 1 }));
      setFeedback('ERROR');
    }

    // Immediately clear signal on click
    setSignal('NONE');
    currentSignalRef.current = 'NONE';
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Jump straight to inter-stimulus
    timerRef.current = setTimeout(startNextRound, 400);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleActionClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, signal]);

  const accuracy = stats.hits + stats.misses > 0 
    ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100) : 0;
    
  const impulseControl = stats.correctStops + stats.falseAlarms > 0
    ? Math.round((stats.correctStops / (stats.correctStops + stats.falseAlarms)) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans" dir="rtl">
      {/* Background moving tracks effect */}
      {isPlaying && (
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0 flex flex-col justify-end pb-20">
          <motion.div 
            animate={{ x: ['0%', '100%'] }} 
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-[200%] h-4 border-t-4 border-dashed border-slate-400"
          />
        </div>
      )}

      <div className="relative z-10 w-full max-w-2xl text-center">
        {!isPlaying && !gameOver && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
            <h1 className="text-5xl font-black text-rose-500 mb-4">كابح القطار 🚂</h1>
            <p className="text-xl text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
              تدريب (Go / No-Go) للتحكم في الاندفاعية.
              <br/><br/>
              اضغط على المحرك <span className="text-emerald-400 font-bold">بسرعة</span> عندما تضيء الإشارة <span className="text-emerald-400 font-bold">بالأخضر</span>.
              <br/>
              لكن <span className="text-rose-500 font-bold underline">توقف فوراً</span> إذا ظهرت الإشارة <span className="text-rose-500 font-bold">بالأحمر</span>!
            </p>
            <button 
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-2xl rounded-2xl shadow-rose-500/30 shadow-2xl hover:scale-105 transition active:scale-95"
            >
              تشغيل المحرك ⚡
            </button>
            <div className="mt-8">
               <Link href="/training" className="text-slate-500 hover:text-white transition font-bold">
                 العودة للصالة
               </Link>
            </div>
          </motion.div>
        )}

        {isPlaying && (
          <div className="flex flex-col items-center">
             <div className="flex justify-between w-full mb-8 text-slate-400 font-mono font-bold">
               <span>المحاولة: {roundCount.current} / {maxRounds}</span>
             </div>

             {/* Traffic Light Container */}
             <div className="bg-slate-900 border-4 border-slate-800 w-32 h-64 rounded-full flex flex-col items-center justify-evenly p-2 shadow-2xl mb-12">
               {/* RED LIGHT */}
               <div className={`w-24 h-24 rounded-full transition-all duration-100 ${signal === 'RED' ? 'bg-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.8)]' : 'bg-slate-800/50'}`} />
               {/* GREEN LIGHT */}
               <div className={`w-24 h-24 rounded-full transition-all duration-100 ${signal === 'GREEN' ? 'bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.8)]' : 'bg-slate-800/50'}`} />
             </div>

             {/* Action Button */}
             <button 
                onMouseDown={handleActionClick}
                onTouchStart={handleActionClick}
                className="w-full max-w-sm h-32 bg-slate-800 rounded-[2rem] border-b-8 border-slate-950 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center text-3xl font-black text-white cursor-pointer shadow-2xl overflow-hidden relative group"
             >
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition" />
                (اضغط هنا ليمشي القطار)
             </button>

             {/* Screen Feedback */}
             <AnimatePresence>
               {feedback && (
                 <motion.div
                   initial={{ opacity: 0, y: -20, scale: 0.5 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0 }}
                   className={`absolute top-20 text-6xl font-black drop-shadow-2xl ${feedback === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-500'}`}
                 >
                   {feedback === 'SUCCESS' ? '✅ ممتاز' : '❌ أوبس'}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        )}

        {gameOver && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl text-center">
            <h2 className="text-4xl font-black text-white mb-8">اكتمل التدريب! ⚡</h2>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-md mx-auto mb-10">
              <div className="bg-slate-950 p-6 rounded-3xl border border-emerald-500/20">
                <div className="text-sm text-slate-400 mb-2 font-bold">دقة التفاعل (Go)</div>
                <div className="text-4xl font-black text-emerald-400">{accuracy}%</div>
              </div>
              <div className="bg-slate-950 p-6 rounded-3xl border border-rose-500/20">
                <div className="text-sm text-slate-400 mb-2 font-bold">كبح الاندفاع (No-Go)</div>
                <div className="text-4xl font-black text-rose-500">{impulseControl}%</div>
              </div>
            </div>

            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              {impulseControl > 80 ? 'أداء رائع! قدرتك على كبح الاندفاعية تتطور بشكل مبهر. ⭐' : 'سرعتك ممتازة، لكن خذ نفساً عميقاً في المرة القادمة وحاول التركيز على الإشارة الحمراء أكثر. 💪'}
            </p>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={startGame}
                className="px-8 py-3 bg-white hover:bg-slate-200 text-black font-bold rounded-2xl transition"
              >
                إعادة التدريب
              </button>
              <Link 
                href="/training"
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition"
              >
                العودة للصالة
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
