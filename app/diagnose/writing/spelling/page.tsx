'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

/**
 * Spelling Diagnostic (Orthographic Processing) - Clinical Protocol
 * -------------------------------------------------------------
 * Measures the ability to recognize correctly spelled words.
 * Telemetry: Latency, Phonetic Confusion, Accuracy.
 */

const SPELLING_STIMULI = [
  { target: 'أسد', choices: ['أسد', 'اصد', 'أست', 'عسد'], difficulty: 1 },
  { target: 'مدرسه', choices: ['مدرسه', 'مدرصة', 'مدراسة', 'مدرسة'], difficulty: 1 },
  { target: 'سماء', choices: ['سماء', 'سما', 'سمأ', 'صماء'], difficulty: 2 },
  { target: 'ضفدع', choices: ['ضفدع', 'ظفدع', 'دفدع', 'ضفضع'], difficulty: 3 },
  { target: 'طائرة', choices: ['طائرة', 'تائرة', 'طائره', 'طيرة'], difficulty: 4 },
  { target: 'شخصية', choices: ['شخصية', 'شخسية', 'شخصيه', 'صخصية'], difficulty: 5 },
];

export default function SpellingTest() {
  const { play } = useSound();
  const { speak } = useTTS();
  const [current, setCurrent] = useState<typeof SPELLING_STIMULI[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const trialStartRef = useRef<number>(0);

  const spawnTrial = useCallback((difficulty: number) => {
    const pool = SPELLING_STIMULI.filter(s => s.difficulty <= Math.ceil(difficulty));
    const random = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrent(random);
    setOptions([...random.choices].sort(() => Math.random() - 0.5));
    trialStartRef.current = Date.now();
    
    // Clinical: Speak the target word
    setTimeout(() => {
        speak(random.target);
    }, 500);
  }, [speak]);

  const handleAnswer = (choice: string, recordInteraction: any) => {
    if (!current) return;
    
    const isCorrect = choice === current.target;
    if (isCorrect) play('success');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: choice,
      metadata: { 
        word: current.target, 
        choice, 
        isPhoneticError: !isCorrect && choice.length === current.target.length, // Rough heuristic
        difficulty: current.difficulty
      }
    });

    setTimeout(() => spawnTrial(1), 1200);
  };

  return (
    <ClinicalPlayerEngine
      title="الإملاء والتهجئة (Spelling)"
      category="writing_spelling"
      domainId="orthographic-processing"
      description="تقييم عيادي للمعالجة الإملائية والقدرة على تمييز الكلمات المكتوبة بشكل صحيح."
      instruction="المهمة: استمع للكلمة جيداً، ثم اختر التهجئة الصحيحة لها من الخيارات."
      icon="🔊"
      color="emerald"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }) => (
        <div className="w-full flex flex-col items-center">
          
          <AnimatePresence mode="wait">
            {current && gameState === 'playing' && (
              <motion.div
                key={current.target}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="mb-16 flex flex-col items-center"
              >
                <div className="relative mb-8">
                   <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-6xl shadow-2xl animate-pulse">
                      🔊
                   </div>
                   <button 
                     onClick={() => speak(current.target)}
                     className="absolute -bottom-4 right-0 bg-slate-800 p-4 rounded-3xl border border-emerald-500 shadow-xl hover:scale-110 transition-all font-black text-xl"
                   >
                     REPLAY
                   </button>
                </div>
                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-[0.2em]">Spelling Trial // LIVE</h3>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
            {options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(opt, recordInteraction)}
                className="bg-slate-900 border-4 border-slate-800 hover:border-emerald-500 rounded-[3rem] p-12 text-5xl font-black text-white shadow-xl italic font-arabic transition-all"
              >
                {opt}
              </motion.button>
            ))}
          </div>

          <GameTrigger 
            gameState={gameState} 
            onStart={() => spawnTrial(difficulty)} 
          />
          
          <div className="mt-12 text-emerald-600/30 text-[9px] uppercase tracking-[0.4em] font-mono">
            Ortho-Linguistic Unit // SPEL_ANALYSIS_V1
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
