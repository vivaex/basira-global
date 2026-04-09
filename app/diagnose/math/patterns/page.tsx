'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function MathPatternsTest() {
  const { play } = useSound();
  const [trial, setTrial] = useState<{ sequence: any[], answer: any, options: any[] } | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const trialStartTime = useRef<number>(0);

  const SYMBOLS = ['🔴', '🔵', '🟢', '🟡', '⭐', '💎', '🌸', '☀️'];

  const generateTrial = useCallback((difficulty: number) => {
    let sequence: any[] = [];
    let answer: any = null;
    let options: any[] = [];

    if (difficulty <= 2) {
      // Identity Patterns (A-B-A-?)
      const s1 = SYMBOLS[Math.floor(Math.random() * 4)];
      const s2 = SYMBOLS[Math.floor(Math.random() * 4) + 4];
      sequence = [s1, s2, s1];
      answer = s2;
      options = [s2, s1, SYMBOLS[1], SYMBOLS[7]].sort(() => 0.5 - Math.random());
    } else if (difficulty <= 6) {
      // Linear Arithmetic Patterns
      const start = Math.floor(Math.random() * 10);
      const step = difficulty <= 4 ? 2 : 3;
      sequence = [start, start + step, start + (step * 2)];
      answer = start + (step * 3);
      options = [answer, answer + step, answer - step, answer + 1].sort(() => 0.5 - Math.random());
    } else {
      // Complex Recursive/Gap Patterns
      const start = 20;
      const step = difficulty === 7 ? 4 : 5;
      sequence = [start, start - step, start - (step * 2)];
      answer = start - (step * 3);
      options = [answer, answer - step, answer + step, 0].sort(() => 0.5 - Math.random());
    }

    setTrial({ sequence, answer, options });
    setFeedback('none');
    trialStartTime.current = performance.now();
  }, []);

  const handleSelect = (val: any, recordInteraction: any, difficulty: number) => {
    if (!trial || feedback !== 'none') return;
    
    const now = performance.now();
    const isCorrect = val === trial.answer;
    
    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: val,
      itemDifficulty: difficulty,
      metadata: { expected: trial.answer }
    });

    if (isCorrect) {
      play('success');
      setFeedback('correct');
    } else {
      play('click');
      setFeedback('wrong');
    }

    setTimeout(() => generateTrial(difficulty), 1000);
  };

  return (
    <ClinicalPlayerEngine
      title="الأنماط والتسلسل المنطقي (Logical Patterns)"
      category="math_patterns"
      domainId="math"
      description="تقييم القدرة على اكتشاف القواعد الرياضية والمنطقية وإكمال الأنماط (KeyMath-3)."
      instruction="المهمة: اكتشف القاعدة التي تربط الأشكال أو الأرقام ببعضها، ثم اختر الرمز الذي يكمل النمط."
      icon="🔢"
      color="indigo"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           
           <div className="flex gap-8 mb-20 p-12 bg-slate-900/40 rounded-[4rem] border-2 border-white/5 shadow-2xl backdrop-blur-xl">
              {trial?.sequence.map((s, i) => (
                <motion.div
                  key={`${difficulty}-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-black text-white"
                >
                   {s}
                </motion.div>
              ))}
              <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border-4 border-dashed border-indigo-500/40 flex items-center justify-center text-5xl font-black text-indigo-400 animate-pulse">
                ؟
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
              {trial?.options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(opt, recordInteraction, difficulty)}
                  className={`p-10 rounded-[3rem] text-6xl font-black transition-all border-2 ${
                    feedback === 'correct' && opt === trial.answer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_40px_emerald]' :
                    feedback === 'wrong' && opt !== trial.answer ? 'bg-slate-900/40 border-white/5 opacity-20' :
                    'bg-slate-900 border-white/5 hover:border-indigo-500 text-white'
                  }`}
                >
                   {opt}
                </motion.button>
              ))}
           </div>

           <GameTrigger gameState={gameState} onStart={() => generateTrial(difficulty)} />
           
           <div className="mt-20 text-slate-700 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic text-center">
             KeyMath Complexity Level: {difficulty} | Logical Sequential Protocol v1.4
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