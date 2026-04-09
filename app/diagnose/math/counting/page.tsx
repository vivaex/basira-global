'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function MathCountingTest() {
  const { play } = useSound();
  const [sequence, setSequence] = useState<number[]>([]);
  const [answer, setAnswer] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  
  const trialStartTime = useRef<number>(0);

  const generateTrial = useCallback((difficulty: number) => {
    // difficulty 1-10
    // 1-3: Simple counting (1, 2, 3...)
    // 4-6: Skip counting (2, 4, 6... or 5, 10, 15...)
    // 7-10: More complex or backward (10, 8, 6...)
    
    let step = 1;
    if (difficulty >= 4) step = [2, 3, 5, 10][Math.floor(Math.random() * Math.min(difficulty - 2, 4))];
    
    const isBackward = difficulty >= 7 && Math.random() > 0.5;
    const start = isBackward ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 10);
    
    const seq = [];
    for (let i = 0; i < 3; i++) {
        seq.push(isBackward ? start - (i * step) : start + (i * step));
    }
    
    const ans = isBackward ? start - (3 * step) : start + (3 * step);
    
    const opts = [ans, ans + step, ans - step, ans + 1].sort(() => Math.random() - 0.5);
    
    setSequence(seq);
    setAnswer(ans);
    setOptions(opts);
    setFeedback('none');
    trialStartTime.current = performance.now();
  }, []);

  const handleSelect = (val: number, setScore: any, nextRound: any, difficulty: number) => {
    if (feedback !== 'none') return;
    
    const isCorrect = val === answer;
    if (isCorrect) {
      setScore((s: number) => s + 50);
      play('success');
      setFeedback('correct');
    } else {
      play('click');
      setFeedback('wrong');
    }
    
    nextRound(isCorrect);
    setTimeout(() => generateTrial(difficulty), 1000);
  };

  return (
    <ClinicalPlayerEngine
      title="التسلسل العددي (Arithmetic Sequencing)"
      category="math_counting"
      domainId="math"
      description="تقييم مهارات التسلسل المنطقي السمعي-البصري والمرونة الذهنية في معالجة الأرقام (WISC-V)."
      instruction="المهمة: اكتشف القاعدة الرياضية للتسلسل وأكمل الرقم القادم في السلسلة بأسرع ما يمكن."
      icon="🧮"
      color="indigo"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           
           <div className="flex gap-8 mb-16">
              {sequence.map((num, i) => (
                <motion.div
                  key={`${difficulty}-${i}`}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-32 h-44 bg-slate-900 border-2 border-indigo-500/30 rounded-3xl flex items-center justify-center text-6xl font-black text-white shadow-2xl"
                >
                   {num}
                </motion.div>
              ))}
              <div className="w-32 h-44 border-4 border-dashed border-indigo-500/20 rounded-3xl flex items-center justify-center text-7xl font-black text-indigo-400 bg-indigo-500/5 animate-pulse">
                 ?
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(opt, setScore, nextRound, difficulty)}
                  className={`p-10 rounded-[3rem] text-5xl font-black transition-all border-2 ${
                    feedback === 'correct' && opt === answer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_40px_emerald]' :
                    feedback === 'wrong' && opt !== answer ? 'bg-slate-900/40 border-white/5 opacity-20' :
                    'bg-slate-900 border-white/5 hover:border-indigo-500 text-white'
                  }`}
                >
                   {opt}
                </motion.button>
              ))}
           </div>

           <GameTrigger gameState={gameState} onStart={() => generateTrial(difficulty)} />
           
           <div className="mt-20 text-slate-700 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic text-center">
             Clinical Arithmetic Logic v2.4 | Sequencing Protocol
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