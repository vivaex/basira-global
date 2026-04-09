'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

const STIMULI = [
  { type: 'target', emoji: '🤖', color: 'text-emerald-400', label: 'Robot' },
  { type: 'distractor', emoji: '👾', color: 'text-rose-500', label: 'Alien' },
];

export default function SelectiveAttentionTest() {
  const { play } = useSound();
  const [stimulus, setStimulus] = useState<{ type: string, emoji: string, color: string, id: number } | null>(null);
  const [isResponded, setIsResponded] = useState(false);
  const [trialCount, setTrialCount] = useState(0);

  const trialStartTime = useRef<number>(0);
  const nextTrialTimer = useRef<NodeJS.Timeout | null>(null);

  const generateTrial = useCallback((recordInteraction: any, difficulty: number) => {
    // Audit previous trial for Omission Error
    if (stimulus && stimulus.type === 'target' && !isResponded) {
       recordInteraction({
         isCorrect: false,
         timestampDisplayed: trialStartTime.current,
         timestampResponded: performance.now(),
         responseValue: 'missed_go',
         itemDifficulty: difficulty,
         metadata: { errorType: 'omission' }
       });
    }

    setIsResponded(false);
    const isTarget = Math.random() > 0.35; // 65% Target (Go), 35% Distractor (No-Go)
    const stim = isTarget ? STIMULI[0] : STIMULI[1];
    
    setStimulus({ ...stim, id: Math.random() });
    trialStartTime.current = performance.now();

    // Stimulus visibility duration (Adaptive)
    const duration = Math.max(600, 1500 - difficulty * 150);
    
    if (nextTrialTimer.current) clearTimeout(nextTrialTimer.current);
    nextTrialTimer.current = setTimeout(() => {
       setStimulus(null);
       // Small ITI (Inter-trial interval)
       setTimeout(() => {
         setTrialCount(prev => prev + 1);
       }, 400);
    }, duration);
  }, [stimulus, isResponded]);

  const handleResponse = (recordInteraction: any, difficulty: number) => {
    if (isResponded || !stimulus) return;
    setIsResponded(true);

    const now = performance.now();
    const isCorrect = stimulus.type === 'target';

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: 'tap',
      itemDifficulty: difficulty,
      metadata: { 
        errorType: isCorrect ? 'none' : 'commission',
        reactionTime: now - trialStartTime.current
      }
    });

    if (isCorrect) {
      play('success');
    } else {
      play('click');
    }
  };

  useEffect(() => {
    return () => {
      if (nextTrialTimer.current) clearTimeout(nextTrialTimer.current);
    };
  }, []);

  return (
    <ClinicalPlayerEngine
      title="انتباه انتقائي (Go / No-Go Test)"
      category="attention_selective"
      domainId="attention"
      description="تقييم القدرة على التركيز وسرعة القرار وكبح الاندفاعية (Inhibition Control)."
      instruction="المهمة: اضغط بسرعة عند ظهور الروبوت الأخضر 🤖، ولكن توقف تماماً ولا تلمس الشاشة عند ظهور الكائن الفضائي الأحمر 👾."
      icon="🚀"
      color="rose"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div 
            onClick={() => handleResponse(recordInteraction, difficulty)}
            className="mb-16 relative w-full max-w-5xl h-[34rem] flex items-center justify-center bg-slate-900/40 rounded-[5rem] border-4 border-white/5 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] overflow-hidden cursor-crosshair active:bg-slate-900/60 transition-colors"
          >
             <AnimatePresence mode="wait">
                {gameState === 'playing' && stimulus && (
                  <motion.div
                    key={stimulus.id}
                    initial={{ scale: 0, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="relative z-10"
                  >
                     <div className={`text-[15rem] md:text-[20rem] drop-shadow-[0_0_80px_rgba(255,255,255,0.1)] ${stimulus.color} select-none`}>
                        {stimulus.emoji}
                     </div>
                     
                     {/* Visual Pulse for Targets */}
                     {stimulus.type === 'target' && (
                       <motion.div
                         animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0, 0.1] }}
                         transition={{ repeat: Infinity, duration: 1 }}
                         className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[100px]"
                       />
                     )}
                  </motion.div>
                )}
             </AnimatePresence>
             
             {/* HUD overlays */}
             <div className="absolute top-12 left-14 text-slate-700 font-bold uppercase tracking-[0.4em] text-[0.6rem]">
                Attention_Protocol: Selective_V2
             </div>
             <div className="absolute bottom-12 right-14 text-slate-700 font-bold uppercase tracking-[0.4em] text-[0.6rem]">
                Signal_Detection: Active
             </div>

             {/* Dynamic Aim UI */}
             <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20" />
          </div>

          <div className="flex items-center gap-16 px-16 py-8 bg-slate-900/40 rounded-[3rem] border border-white/5 backdrop-blur-xl">
             <div className="flex flex-col items-center">
                <div className="text-slate-500 text-[0.6rem] font-black uppercase tracking-[0.3em] mb-2 font-arabic">سرعة الاستجابة</div>
                <div className="text-5xl font-black text-white font-mono">
                  {difficulty.toFixed(1)}x
                </div>
             </div>
             <div className="w-[2px] h-14 bg-white/5" />
             <div className="flex flex-col items-center">
                <div className="text-slate-500 text-[0.6rem] font-black uppercase tracking-[0.3em] mb-2 font-arabic">رقم المحاولة</div>
                <div className="text-5xl font-black text-rose-500 font-mono">
                  {String(trialCount).padStart(2, '0')}
                </div>
             </div>
          </div>

          <GameTrigger 
            gameState={gameState} 
            trialCount={trialCount} 
            onStart={() => generateTrial(recordInteraction, difficulty)} 
          />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, trialCount, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing') {
      onStart();
    }
  }, [gameState, trialCount, onStart]);
  return null;
}