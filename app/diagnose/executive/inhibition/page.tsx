'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

const STROOP_COLORS = [
  { name: 'أحمر', hex: '#ef4444', value: 'red' },
  { name: 'أزرق', hex: '#3b82f6', value: 'blue' },
  { name: 'أخضر', hex: '#22c55e', value: 'green' },
  { name: 'أصفر', hex: '#eab308', value: 'yellow' },
];

export default function InhibitionStroopTest() {
  const { play } = useSound();
  const [stimulus, setStimulus] = useState<{ word: string, color: string, isCongruent: boolean } | null>(null);
  const [trialCount, setTrialCount] = useState(0);
  
  const trialStartTime = useRef<number>(0);

  const generateTrial = useCallback(() => {
    const isCongruent = Math.random() > 0.5;
    const wordIdx = Math.floor(Math.random() * 4);
    const colorIdx = isCongruent ? wordIdx : (wordIdx + Math.floor(Math.random() * 3) + 1) % 4;
    
    setStimulus({
      word: STROOP_COLORS[wordIdx].name,
      color: STROOP_COLORS[colorIdx].hex,
      isCongruent
    });
    trialStartTime.current = performance.now();
  }, []);

  const handleResponse = (colorValue: string, recordInteraction: any, difficulty: number) => {
    if (!stimulus) return;

    const now = performance.now();
    const targetValue = STROOP_COLORS.find(c => c.hex === stimulus.color)?.value;
    const isCorrect = colorValue === targetValue;

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: colorValue,
      itemDifficulty: difficulty,
      metadata: { 
        isCongruent: stimulus.isCongruent,
        interferenceType: stimulus.isCongruent ? 'congruent' : 'incongruent'
      }
    });

    if (isCorrect) {
      play('success');
    } else {
      play('click');
    }

    setTrialCount(prev => prev + 1);
    generateTrial();
  };

  return (
    <ClinicalPlayerEngine
      title="مختبر التحكم (Inhibition - Stroop)"
      category="executive_inhibition"
      domainId="executive"
      description="تقييم القدرة على كبح الاستجابة التلقائية والتحكم في الاندفاعية (Stroop Effect)."
      instruction="المهمة: انتبه! لا تقرأ الكلمة، بل اضغط على لون الحبر الحقيقي الذي كتبت به الكلمة."
      icon="🚫"
      color="rose"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="mb-16 relative w-full h-80 flex items-center justify-center bg-slate-900/40 rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-xl">
             <AnimatePresence mode="wait">
                {gameState === 'playing' && stimulus && (
                  <motion.div
                    key={`${trialCount}-${stimulus.word}`}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                     <h2 
                       className="text-8xl md:text-9xl font-black tracking-tighter"
                       style={{ color: stimulus.color }}
                     >
                        {stimulus.word}
                     </h2>
                  </motion.div>
                )}
             </AnimatePresence>
             
             {/* UI Grid Hint */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:40px_40px]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
            {STROOP_COLORS.map((c) => (
              <motion.button
                key={c.value}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleResponse(c.value, recordInteraction, difficulty)}
                className="group relative h-32 rounded-[2.5rem] border-2 border-white/5 overflow-hidden shadow-2xl transition-all hover:border-white/20"
                style={{ backgroundColor: `${c.hex}22` }}
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                 <div className="relative flex flex-col items-center justify-center h-full gap-1">
                    <div className="w-4 h-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" style={{ backgroundColor: c.hex }} />
                    <span className="text-xl font-bold font-arabic text-white/90 group-hover:text-white">{c.name}</span>
                 </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[0.6rem]">Stroop Interference Protocol v4.0</span>
          </div>

          <GameTrigger gameState={gameState} trialCount={trialCount} onStart={generateTrial} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, trialCount, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing' && trialCount === 0) {
      onStart();
    }
  }, [gameState, trialCount, onStart]);
  return null;
}