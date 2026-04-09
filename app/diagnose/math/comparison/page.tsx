'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function MathComparisonTest() {
  const { play } = useSound();
  const [trial, setTrial] = useState<{ left: number, right: number } | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [masked, setMasked] = useState(false);
  const trialStartTime = useRef<number>(0);

  const generateTrial = useCallback((difficulty: number) => {
    // ANS Ratio management (Halberda et al., 2008)
    const base = Math.floor(Math.random() * 8) + 8 + (difficulty * 2);
    const ratio = Math.max(0.65, 0.92 - (difficulty * 0.03)); 
    
    let other = Math.round(base * ratio);
    if (other === base) other = base - 1;
    
    const isLeftLarger = Math.random() > 0.5;
    setTrial({
      left: isLeftLarger ? base : other,
      right: isLeftLarger ? other : base
    });
    
    setFeedback('none');
    setMasked(false);
    trialStartTime.current = performance.now();

    // After 750ms, mask the dots to prevent explicit counting (Standard ANS Protocol)
    if (difficulty >= 3) {
      setTimeout(() => setMasked(true), 750);
    }
  }, []);

  const handleSelect = (side: 'left' | 'right', recordInteraction: any, difficulty: number) => {
    if (!trial || feedback !== 'none') return;
    
    const now = performance.now();
    const isCorrect = side === 'left' ? trial.left > trial.right : trial.right > trial.left;
    
    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: side,
      itemDifficulty: difficulty,
      metadata: { ratio: Math.min(trial.left, trial.right) / Math.max(trial.left, trial.right) }
    });

    if (isCorrect) {
      play('success');
      setFeedback('correct');
    } else {
      play('click');
      setFeedback('wrong');
    }

    setTimeout(() => generateTrial(difficulty), 800);
  };

  return (
    <ClinicalPlayerEngine
      title="مقارنة الكميات (Approximate Number System)"
      category="math_comparison"
      domainId="math"
      description="قياس الحس العددي الفطري (ANS). القدرة على تقدير الكميات والمقارنة بينها."
      instruction="المهمة: انظر إلى مجموعتي النقاط واضغط على الجهة التي تحتوي على 'أكثر'. ثق بحدسك ولا تحاول العد!"
      icon="⚖️"
      color="amber"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           
           <div className="grid grid-cols-2 gap-12 w-full max-w-6xl h-[32rem]">
              {/* Left Side */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect('left', recordInteraction, difficulty)}
                className={`relative bg-slate-900/60 rounded-[5rem] border-4 transition-all overflow-hidden flex flex-wrap content-center justify-center p-12 gap-3 shadow-2xl ${
                  feedback === 'correct' && trial?.left! > trial?.right! ? 'border-emerald-500 bg-emerald-500/10' :
                  feedback === 'wrong' && trial?.left! < trial?.right! ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 hover:border-amber-500/50'
                }`}
              >
                 {!masked && trial && Array.from({ length: trial.left }).map((_, i) => (
                    <div key={`l-${i}`} className="w-6 h-6 md:w-8 md:h-8 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                 ))}
                 {masked && <div className="text-4xl text-slate-800 font-black animate-pulse opacity-20">MASKED</div>}
                 {feedback !== 'none' && trial && (
                   <div className="absolute top-8 left-8 text-3xl font-black text-white/10">{trial.left}</div>
                 )}
              </motion.button>

              {/* Right Side */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect('right', recordInteraction, difficulty)}
                className={`relative bg-slate-900/60 rounded-[5rem] border-4 transition-all overflow-hidden flex flex-wrap content-center justify-center p-12 gap-3 shadow-2xl ${
                  feedback === 'correct' && trial?.right! > trial?.left! ? 'border-emerald-500 bg-emerald-500/10' :
                  feedback === 'wrong' && trial?.right! < trial?.left! ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 hover:border-amber-500/50'
                }`}
              >
                 {!masked && trial && Array.from({ length: trial.right }).map((_, i) => (
                    <div key={`r-${i}`} className="w-6 h-6 md:w-8 md:h-8 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                 ))}
                 {masked && <div className="text-4xl text-slate-800 font-black animate-pulse opacity-20">MASKED</div>}
                 {feedback !== 'none' && trial && (
                   <div className="absolute top-8 right-8 text-3xl font-black text-white/10">{trial.right}</div>
                 )}
              </motion.button>
           </div>

           <GameTrigger gameState={gameState} onStart={() => generateTrial(difficulty)} />
           
           <div className="mt-16 text-slate-700 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic text-center">
             ANS Ratio Controller: {trial ? (Math.min(trial.left, trial.right) / Math.max(trial.left, trial.right)).toFixed(2) : '0.00' } | Mask: {masked ? 'YES' : 'NO'} | Clinical Protocol v2.1
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