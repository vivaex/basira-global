'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// TOWRE-inspired stimuli: Real words vs. Pseudo-words (Nonsense words)
const STIMULI = [
  // Level 1: Simple
  { word: "قلم", isReal: true, difficulty: 1 },
  { word: "درب", isReal: true, difficulty: 1 },
  { word: "سـبـق", isReal: false, difficulty: 1 },
  { word: "بـحـر", isReal: true, difficulty: 1 },
  
  // Level 2: Medium
  { word: "مـسـتـقـبل", isReal: true, difficulty: 2 },
  { word: "خـرنـبـل", isReal: false, difficulty: 2 },
  { word: "طـيـارة", isReal: true, difficulty: 2 },
  { word: "صـمـبـاخ", isReal: false, difficulty: 2 },
  
  // Level 3: Advanced
  { word: "اسـتـكـشاف", isReal: true, difficulty: 3 },
  { word: "مـطـمـطـام", isReal: false, difficulty: 3 },
  { word: "تـكـنـولـوجـيا", isReal: true, difficulty: 3 },
  { word: "قـنـفـقـان", isReal: false, difficulty: 3 },
];

export default function VisualWordTest() {
  const { play } = useSound();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const flashTimer = useRef<any>(null);

  const spawnStimulus = useCallback(() => {
    setShowStimulus(true);
    play('click');
    
    // Flash stimuli for a limited time to measure "Sight Word" efficiency
    // Difficulty 1: 1500ms, Difficulty 2: 1000ms, Difficulty 3: 700ms
    const flashDuration = STIMULI[currentIdx].difficulty === 1 ? 1500 : 
                          STIMULI[currentIdx].difficulty === 2 ? 1000 : 750;

    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => {
      setShowStimulus(false);
    }, flashDuration);
  }, [currentIdx, play]);

  const handleChoice = (isRealChoice: boolean, setScore: any, nextRound: any) => {
    const isCorrect = isRealChoice === STIMULI[currentIdx].isReal;
    
    if (isCorrect) {
      setScore((s: number) => s + 10);
      play('success');
    } else {
      play('click');
    }

    if (currentIdx + 1 < STIMULI.length) {
      setCurrentIdx(prev => prev + 1);
      setTimeout(spawnStimulus, 800); // Small gap between trials
      nextRound(isCorrect); // Trigger IRT scaling
    } else {
      // Completion handled by ClinicalPlayerEngine
    }
  };

  return (
    <ClinicalPlayerEngine
      title="الكفاءة البصرية (Visual Efficiency)"
      category="reading_visual_word"
      domainId="literacy"
      description="تقييم سرعة التعرف على الكلمات (TOWRE) والتمييز بين الكلمات الحقيقية والزائفة."
      instruction="المهمة: ستظهر كلمة بسرعة كبيرة. اضغط 'حقيقية' إذا كانت كلمة موجودة، أو 'زائفة' إذا لم يكن لها معنى."
      icon="👁️"
      color="cyan"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="h-64 flex items-center justify-center mb-16 relative w-full">
            <AnimatePresence mode="wait">
              {showStimulus && gameState === 'playing' ? (
                <motion.div
                  key={currentIdx}
                  initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ scale: 1.1, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                  className="bg-slate-900/40 backdrop-blur-3xl px-16 py-12 rounded-[3.5rem] border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
                >
                  <span className="text-7xl md:text-8xl font-black tracking-widest text-white font-serif">
                    {STIMULI[currentIdx].word}
                  </span>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 0.2 }} 
                  className="text-slate-600 text-2xl italic font-black"
                >
                  {gameState === 'playing' ? '...ترقب الكلمة...' : ''}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(true, setScore, nextRound)}
              className="bg-emerald-600/20 hover:bg-emerald-600 border-2 border-emerald-500/30 p-10 rounded-[3rem] text-3xl font-black text-white transition-all shadow-xl"
            >
              كلمة حقيقية ✅
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChoice(false, setScore, nextRound)}
              className="bg-rose-600/20 hover:bg-rose-600 border-2 border-rose-500/30 p-10 rounded-[3rem] text-3xl font-black text-white transition-all shadow-xl"
            >
              ليست كلمة ❌
            </motion.button>
          </div>
          
          <p className="mt-8 text-slate-500 font-bold uppercase tracking-widest text-sm">التحدي: السرعة والدقة معاً</p>

          <GameTrigger gameState={gameState} onStart={spawnStimulus} />
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