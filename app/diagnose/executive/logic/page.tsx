'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// --- STIMULI CONFIG (WISC-V Matrix Reasoning Style) ---
const MATRIX_LEVELS = [
  {
    id: 1,
    pattern: ['🟥', '🟦', '🟥'],
    options: ['🟦', '🟩', '🟨', '⬜'],
    correct: 0,
    logic: 'Simple alternation'
  },
  {
    id: 2,
    pattern: ['🟢', '🟡', '🟢'],
    options: ['🔴', '🟡', '🟣', '🟠'],
    correct: 1,
    logic: 'Simple alternation with different shapes'
  },
  {
    id: 3,
    pattern: ['🐱', '🐭', '🐱'],
    options: ['🐶', '🐭', '🦁', '🐻'],
    correct: 1,
    logic: 'A-B-A pattern'
  },
  {
    id: 4,
    pattern: ['1', '2', '3'],
    options: ['4', '5', '6', '0'],
    correct: 0,
    logic: 'Sequential progression'
  },
  {
    id: 5,
    pattern: ['⬆️', '➡️', '⬇️'],
    options: ['⬅️', '↗️', '↘️', '↕️'],
    correct: 0,
    logic: 'Directional rotation'
  }
];

export default function MatrixReasoningTest() {
  const { play } = useSound();
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  
  const trialStartTime = useRef<number>(0);

  const startTrial = useCallback(() => {
    setFeedback('none');
    trialStartTime.current = performance.now();
  }, []);

  const handleChoice = (idx: number, recordInteraction: any, difficulty: number) => {
    if (feedback !== 'none') return;
    
    const now = performance.now();
    const currentLevel = MATRIX_LEVELS[currentLevelIdx];
    const isCorrect = idx === currentLevel.correct;

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: String(idx),
      itemDifficulty: difficulty,
      metadata: { 
        levelId: currentLevel.id,
        logicType: currentLevel.logic
      }
    });

    if (isCorrect) {
      play('success');
      setFeedback('correct');
      setTimeout(() => {
        if (currentLevelIdx + 1 < MATRIX_LEVELS.length) {
          setCurrentLevelIdx(prev => prev + 1);
          setFeedback('none');
          trialStartTime.current = performance.now();
        }
      }, 1000);
    } else {
      play('click');
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 800);
    }
  };

  return (
    <ClinicalPlayerEngine
      title="مختبر المصفوفات (Matrix Reasoning)"
      category="executive_logic"
      domainId="executive"
      description="تقييم التفكير الاستدلالي والقدرة على تحليل الأنماط البصرية (معيار WISC-V)."
      instruction="المهمة: انظر إلى النمط في الأعلى، واختر القطعة التي تكمل التسلسل بشكل منطقي."
      icon="🧩"
      color="amber"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="mb-16 w-full max-w-5xl bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
             {/* Matrix Grid Representation */}
             <div className="flex justify-center items-center gap-8 md:gap-12">
                <AnimatePresence mode="wait">
                  {gameState === 'playing' && (
                    <motion.div 
                      key={currentLevelIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-8 md:gap-12"
                    >
                       {MATRIX_LEVELS[currentLevelIdx].pattern.map((item, i) => (
                         <React.Fragment key={i}>
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-950 rounded-3xl border-2 border-white/5 flex items-center justify-center text-6xl md:text-8xl shadow-inner">
                               {item}
                            </div>
                            <div className="text-4xl text-slate-800 font-black">→</div>
                         </React.Fragment>
                       ))}
                       {/* The Missing Piece */}
                       <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-dashed flex items-center justify-center text-6xl relative transition-all duration-300 ${
                         feedback === 'correct' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                         feedback === 'wrong' ? 'bg-rose-500/20 border-rose-500 text-rose-500' :
                         'bg-slate-950/50 border-amber-500/30 text-amber-500/30'
                       }`}>
                          {feedback === 'correct' ? MATRIX_LEVELS[currentLevelIdx].options[MATRIX_LEVELS[currentLevelIdx].correct] : '?'}
                          {feedback === 'correct' && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1.5, opacity: 0 }}
                              className="absolute inset-0 bg-emerald-500 rounded-full"
                            />
                          )}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="text-8xl font-black italic">{String(currentLevelIdx + 1).padStart(2, '0')}</span>
             </div>
          </div>

          <p className="mb-10 text-slate-500 text-xs font-bold uppercase tracking-[0.4em] font-arabic">خيارات الإكمال المتاحة</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
             {MATRIX_LEVELS[currentLevelIdx].options.map((opt, i) => (
                <motion.button
                  key={`${currentLevelIdx}-${i}`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(i, recordInteraction, difficulty)}
                  className={`h-32 rounded-[2rem] border-2 flex items-center justify-center text-5xl md:text-6xl transition-all duration-300 shadow-xl overflow-hidden relative group
                    ${feedback === 'correct' && i === MATRIX_LEVELS[currentLevelIdx].correct ? 'bg-emerald-600/20 border-emerald-500' : 
                      feedback === 'wrong' && i !== MATRIX_LEVELS[currentLevelIdx].correct ? 'bg-slate-900/50 border-white/5 opacity-50' :
                      'bg-slate-900/40 border-white/10 hover:border-amber-500/40'}`}
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <span className="relative z-10">{opt}</span>
                </motion.button>
             ))}
          </div>

          <div className="mt-16 flex items-center gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
             <span className="text-slate-600 font-black uppercase tracking-[0.4em] text-[0.6rem]">Reasoning_Engine: Active_WISC_V_Logic</span>
          </div>

          <GameTrigger gameState={gameState} onStart={startTrial} />
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