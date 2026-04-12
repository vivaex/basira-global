'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// Clinical Stimuli: Letters and symbols prone to flipping (b/d, p/q, 6/9)
const STIMULI = [
  { char: 'b', flips: ['d', 'p', 'q'], category: 'letter' },
  { char: 'p', flips: ['q', 'b', 'd'], category: 'letter' },
  { char: 'd', flips: ['b', 'q', 'p'], category: 'letter' },
  { char: 'q', flips: ['p', 'd', 'b'], category: 'letter' },
  { char: '6', flips: ['9'], category: 'number' },
  { char: '9', flips: ['6'], category: 'number' },
  { char: 'm', flips: ['w'], category: 'letter' },
  { char: 'w', flips: ['m'], category: 'letter' },
  { char: 'u', flips: ['n'], category: 'letter' },
  { char: 'n', flips: ['u'], category: 'letter' },
  { char: 'س', flips: ['ش'], category: 'arabic' },
  { char: 'ر', flips: ['ز'], category: 'arabic' },
  { char: 'د', flips: ['ذ'], category: 'arabic' },
  { char: 'ح', flips: ['ج', 'خ'], category: 'arabic' },
];

export default function VisualDiscriminationTest() {
  const { play } = useSound();
  const [trial, setTrial] = useState<{
    target: string;
    options: { char: string; isMatch: boolean; id: number }[];
  } | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const trialStartTime = useRef<number>(0);

  const generateTrial = useCallback((difficulty: number) => {
    // Pick a random stimulus
    const s = STIMULI[Math.floor(Math.random() * STIMULI.length)];
    const target = s.char;
    
    // Difficulty 1-10: More options and more similar distractors
    const numOptions = Math.min(6, 3 + Math.floor(difficulty / 2));
    
    let opts: { char: string; isMatch: boolean; id: number }[] = [
      { char: target, isMatch: true, id: Math.random() }
    ];

    // Add flips as distractors first
    const distractors = [...s.flips];
    while (opts.length < numOptions) {
      if (distractors.length > 0) {
        const char = distractors.shift()!;
        opts.push({ char, isMatch: false, id: Math.random() });
      } else {
        // Add other random stimuli
        const other = STIMULI[Math.floor(Math.random() * STIMULI.length)].char;
        if (!opts.find(o => o.char === other)) {
          opts.push({ char: other, isMatch: false, id: Math.random() });
        }
      }
    }

    setTrial({
      target,
      options: opts.sort(() => Math.random() - 0.5)
    });
    setFeedback('none');
    trialStartTime.current = performance.now();
  }, []);

  const handleSelect = (option: any, nextRound: any, setScore: any, difficulty: number) => {
    if (feedback !== 'none') return;

    const isCorrect = option.isMatch;
    const now = performance.now();
    const duration = now - trialStartTime.current;

    if (isCorrect) {
      setScore((s: number) => s + 50);
      play('success');
      setFeedback('correct');
    } else {
      play('click');
      setFeedback('wrong');
    }

    nextRound(isCorrect);
    setTimeout(() => generateTrial(difficulty), 800);
  };

  return (
    <ClinicalPlayerEngine
      title="التمييز البصري (Visual Discrimination)"
      category="visual_discrimination"
      domainId="visual-processing"
      description="تقييم عيادي للقدرة على تمييز الاختلافات الدقيقة في الحروف والرموز (WISC-PSI)."
      instruction="المهمة: انظر إلى الحرف الملون في الأعلى، ثم اختر الحرف المطابق له تماماً من المجموعة في الأسفل."
      icon="🔍"
      color="cyan"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, difficulty, gameState }: any) => (
        <div className="w-full h-full flex flex-col items-center justify-center">
          
          <AnimatePresence mode="wait">
            {trial && gameState === 'playing' && (
              <div className="w-full max-w-4xl flex flex-col items-center">
                
                {/* Reference Target */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-20 p-10 bg-slate-900 border-4 border-cyan-500 rounded-[3rem] shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                >
                  <span className="text-[10rem] font-black text-cyan-400 leading-none">
                    {trial.target}
                  </span>
                </motion.div>

                {/* Grid Divider */}
                <div className="w-full flex items-center gap-4 mb-20 opacity-30">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white" />
                   <div className="text-[0.6rem] font-black uppercase tracking-[0.5em] text-white">Select matching character</div>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white" />
                </div>

                {/* Options Grid */}
                <div className="flex gap-6 flex-wrap justify-center w-full">
                   {trial.options.map((opt) => (
                     <motion.button
                       key={opt.id}
                       whileHover={{ scale: 1.1, y: -5 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => handleSelect(opt, nextRound, setScore, difficulty)}
                       className={`w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-4 flex items-center justify-center text-8xl font-black transition-all shadow-2xl ${
                         feedback === 'correct' && opt.isMatch ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]' :
                         feedback === 'wrong' && !opt.isMatch ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 opacity-50' :
                         'bg-slate-900 border-white/5 text-white hover:border-cyan-500/50'
                       }`}
                     >
                        {opt.char}
                     </motion.button>
                   ))}
                </div>

              </div>
            )}
          </AnimatePresence>

          <GameTrigger gameState={gameState} onStart={() => generateTrial(difficulty)} />

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-700 text-[0.6rem] font-black uppercase tracking-[0.4em] italic text-center w-full">
            NEURAL SCAN: PSI_ALPHA_MATCH // V4.2 Standardized
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