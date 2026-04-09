'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function SubitizingTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ count: number, positions: { x: number, y: number }[] } | null>(null);
  const [showStimulus, setShowStimulus] = useState(false);
  const [awaitingInput, setAwaitingInput] = useState(false);
  
  const trialStartTime = useRef(0);

  const spawnTarget = useCallback((difficulty: number) => {
    // Difficulty 1: 1-3 items, Difficulty 5: 7-9 items
    const min = Math.min(2, difficulty);
    const max = Math.min(9, difficulty + 2);
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const positions = Array.from({ length: count }, () => ({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60
    }));

    setTarget({ count, positions });
    setAwaitingInput(false);
    
    // Brief exposure to prevent counting (Subitizing threshold is ~400ms)
    setTimeout(() => {
      setShowStimulus(true);
      trialStartTime.current = performance.now();
      play('click');
      
      setTimeout(() => {
        setShowStimulus(false);
        setAwaitingInput(true);
      }, 400); // Strict threshold
    }, 1000);
  }, [play]);

  const handleGuess = (guess: number, setScore: any, nextRound: any, difficulty: number) => {
    if (!awaitingInput || !target) return;
    
    const isCorrect = guess === target.count;
    setAwaitingInput(false);

    if (isCorrect) {
      setScore((s: number) => s + target.count * 10);
      play('success');
      nextRound(true);
    } else {
      play('click');
      nextRound(false);
    }

    setTimeout(() => spawnTarget(difficulty), 1000);
  };

  return (
    <ClinicalPlayerEngine
      title="ومضات اليراعات (Subitizing)"
      category="math_subitizing"
      domainId="math"
      description="تقييم القدرة الفطرية على تقدير الكميات دون عد (Number Sense)."
      instruction="المهمة: ستظهر اليراعات لبرهة قصيرة جداً.. أخبرنا كم يراعة رأيت دون أن تعدها واحدة تلو الأخرى!"
      icon="✨"
      color="amber"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           
           <div className="relative w-full max-w-2xl h-[30rem] bg-slate-950 border-4 border-slate-900 rounded-[4rem] shadow-[inset_0_0_100px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center">
              {/* Forest Background Ambient */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
              
              <AnimatePresence>
                {showStimulus && target && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                    {target.positions.map((pos, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute w-6 h-6 bg-yellow-300 rounded-full shadow-[0_0_40px_20px_rgba(253,224,71,0.5)]"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      >
                         <div className="absolute inset-0 bg-white blur-sm rounded-full opacity-50" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!showStimulus && !awaitingInput && gameState === 'playing' && (
                <div className="text-slate-700 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
                  استعد...
                </div>
              )}
              
              {awaitingInput && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                   <div className="text-4xl text-white font-black italic">كم عددها؟</div>
                   <div className="w-16 h-1 bg-amber-500/50 rounded-full" />
                </motion.div>
              )}
           </div>

           {/* Numeric Grid Input */}
           <div className={`mt-10 grid grid-cols-4 md:grid-cols-8 gap-4 w-full max-w-4xl transition-all duration-500 ${awaitingInput ? 'opacity-100 translate-y-0' : 'opacity-20 translate-y-4 pointer-events-none'}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleGuess(num, setScore, nextRound, difficulty)}
                  className="h-20 bg-slate-900 border-2 border-white/5 rounded-3xl text-3xl font-black text-white shadow-xl hover:border-amber-500/50 transition-all"
                >
                  {num}
                </motion.button>
              ))}
           </div>
           
           <GameTrigger gameState={gameState} onStart={() => spawnTarget(difficulty)} />

           <div className="mt-12 text-slate-600 text-[0.6rem] font-bold uppercase tracking-[0.3em] italic text-center">
             Subitizing Threshold: 400ms | Quantity Range: 1-8
           </div>
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, onStart }: any) {
  const started = useRef(false);
  useEffect(() => {
    if (gameState === 'playing' && !started.current) {
      started.current = true;
      onStart();
    }
  }, [gameState, onStart]);
  return null;
}
