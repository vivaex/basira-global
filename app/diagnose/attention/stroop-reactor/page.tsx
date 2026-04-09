'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// --- STROOP CONSTANTS ---
type ColorKey = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';

const COLORS: Record<ColorKey, { ar: string, css: string, hex: string }> = {
  RED: { ar: 'أحمر', css: 'text-rose-500', hex: '#f43f5e' },
  BLUE: { ar: 'أزرق', css: 'text-cyan-500', hex: '#06b6d4' },
  GREEN: { ar: 'أخضر', css: 'text-emerald-500', hex: '#10b981' },
  YELLOW: { ar: 'أصفر', css: 'text-amber-400', hex: '#fbbf24' },
};

export default function StroopReactorGame() {
  const { play } = useSound();
  const [round, setRound] = useState<{ textKey: ColorKey, inkKey: ColorKey, isCongruent: boolean } | null>(null);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const roundCount = useRef(0);

  const generateRound = useCallback(() => {
    setFeedback(null);
    const keys: ColorKey[] = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
    const textKey = keys[Math.floor(Math.random() * keys.length)];
    
    // 40% congruent, 60% incongruent for diagnostic variance
    const isCongruent = Math.random() < 0.4;
    let inkKey = textKey;
    
    if (!isCongruent) {
      const remainingKeys = keys.filter(k => k !== textKey);
      inkKey = remainingKeys[Math.floor(Math.random() * remainingKeys.length)];
    }

    setRound({ textKey, inkKey, isCongruent });
    roundCount.current += 1;
  }, []);

  const handleAnswer = (selectedKey: ColorKey, setScore: any, nextRound: any) => {
    if (!round || feedback) return;

    const isCorrect = selectedKey === round.inkKey;
    
    if (isCorrect) {
      setScore((s: number) => s + 10);
      setFeedback('CORRECT');
      play('success');
    } else {
      setFeedback('WRONG');
      play('click');
    }

    setTimeout(() => {
      generateRound();
      nextRound(isCorrect);
    }, 400);
  };

  return (
    <ClinicalPlayerEngine
      title="مفاعل ستروب للانتباه (Stroop)"
      category="attention_stroop"
      domainId="attention"
      description="قياس القدرة على كبح المشتتات والتركيز على المعلومات المهمة (الوظائف التنفيذية)."
      instruction="المهمة: اختر لون 'إضاءة' الكلمة وتجاهل تماماً ما هو مكتوب."
      icon="🔋"
      color="fuchsia"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full max-w-4xl px-4 flex flex-col items-center">
          
          <div className="relative w-full h-80 flex items-center justify-center mb-16">
            <AnimatePresence mode="wait">
              {gameState === 'playing' && round && !feedback ? (
                <motion.div
                  key={roundCount.current}
                  initial={{ scale: 0.5, opacity: 0, filter: 'blur(20px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
                  className="relative"
                >
                  <div 
                    className="absolute inset-0 blur-[80px] opacity-40 rounded-full" 
                    style={{ backgroundColor: COLORS[round.inkKey].hex }}
                  />
                  <h2 
                    className={`relative z-10 text-[7rem] md:text-[10rem] font-black tracking-tighter leading-none ${COLORS[round.inkKey].css}`}
                    style={{ textShadow: `0 0 50px ${COLORS[round.inkKey].hex}` }}
                  >
                    {COLORS[round.textKey].ar}
                  </h2>
                </motion.div>
              ) : feedback ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  className={`text-6xl font-black ${feedback === 'CORRECT' ? 'text-emerald-400' : 'text-rose-500'}`}
                >
                  {feedback === 'CORRECT' ? '⚡ إصابة!' : '❌ خطأ!'}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl">
            {(Object.keys(COLORS) as ColorKey[]).map(key => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(key, setScore, nextRound)}
                className="relative group h-32 rounded-[2.5rem] bg-slate-900 border-2 border-white/5 hover:border-white/20 transition-all flex items-center justify-center overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: COLORS[key].hex }} />
                <div 
                  className="w-16 h-16 rounded-full shadow-2xl border-4 border-white/20" 
                  style={{ backgroundColor: COLORS[key].hex }} 
                />
              </motion.button>
            ))}
          </div>

          <div className="mt-12 text-slate-500 font-bold uppercase tracking-widest text-sm flex items-center gap-6">
             <span className="w-16 h-[1px] bg-slate-800" />
             تحدي الوظيفة التنفيذية
             <span className="w-16 h-[1px] bg-slate-800" />
          </div>

          <GameTrigger gameState={gameState} onStart={generateRound} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing') {
      onStart();
    }
  }, [gameState, onStart]);
  return null;
}
