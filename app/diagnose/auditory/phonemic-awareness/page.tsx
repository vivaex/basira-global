'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

/**
 * Phonemic Awareness (Elision) - CTOPP-2 Clinical Standard
 * ------------------------------------------------------
 * Measures the ability to remove phonemes from words.
 * Telemetry: Initial Reaction Time (IRT), Hesitation, Accuracy.
 */

const ELISION_STIMULI = [
  // Level 1: Compound Words
  { 
    word: 'فراشة', // butterfly
    instruction: 'قول "فراشة" بدون "فرا"', // Say 'Farasha' without 'Fara'
    correct: 'شة',
    options: ['شة', 'فة', 'رشة', 'راشة'],
    difficulty: 1
  },
  { 
    word: 'سيارة', // car
    instruction: 'قول "سيارة" بدون "سي"', 
    correct: 'يارة',
    options: ['يارة', 'سارة', 'يارة', 'ارة'],
    difficulty: 1
  },
  // Level 2: Syllable deletion
  { 
    word: 'مكتبة', // library
    instruction: 'قول "مكتبة" بدون "مك"',
    correct: 'تبة',
    options: ['تبة', 'كتة', 'كبة', 'متبة'],
    difficulty: 2
  },
  // Level 3: Phoneme deletion (Initial)
  { 
    word: 'فول', // Beans
    instruction: 'قول "فول" بدون حرف "ف"', 
    correct: 'ول',
    options: ['ول', 'فل', 'لو', 'وو'],
    difficulty: 3
  },
  { 
    word: 'سماء', // Sky
    instruction: 'قول "سماء" بدون حرف "س"', 
    correct: 'ماء',
    options: ['ماء', 'سما', 'ماء', 'ام'],
    difficulty: 4
  },
  // Level 4: Phoneme deletion (Medial - Hardest)
  { 
    word: 'مدرسه', // School
    instruction: 'قول "مدرسه" بدون حرف "د"', 
    correct: 'مرسه',
    options: ['مرسه', 'مدسة', 'درسة', 'مدسه'],
    difficulty: 5
  }
];

export default function PhonemicAwarenessTest() {
  return (
    <ClinicalPlayerEngine
      title="الوعي الفونيمي (Elision)"
      category="auditory_elision"
      domainId="phonological-awareness"
      description="تقييم عيادي للقدرة على معالجة وتفكيك الأصوات اللغوية (معيار CTOPP-2)."
      instruction="المهمة: استمع للكلمة والتعليمات، ثم اختر الجزء المتبقي من الكلمة."
      icon="🧩"
      color="violet"
      onComplete={() => {}}
      duration={120}
    >
      {(engineProps: any) => <PhonemicAwarenessModule {...engineProps} />}
    </ClinicalPlayerEngine>
  );
}

function PhonemicAwarenessModule({ recordInteraction, difficulty, gameState }: any) {
  const { play } = useSound();
  const { speak } = useTTS();
  const [currentStimulus, setCurrentStimulus] = useState<typeof ELISION_STIMULI[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const trialStartRef = useRef<number>(0);
  const started = useRef(false);

  const spawnTrial = useCallback((diff: number) => {
    if (gameState !== 'playing') return;

    const pool = ELISION_STIMULI.filter(s => s.difficulty <= Math.ceil(diff));
    const random = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrentStimulus(random);
    setOptions([...random.options].sort(() => Math.random() - 0.5));
    trialStartRef.current = Date.now();

    setTimeout(() => {
        speak(random.instruction);
    }, 500);
  }, [speak, gameState]);

  const handleAnswer = (choice: string) => {
    if (!currentStimulus || gameState !== 'playing') return;
    
    const isCorrect = choice === currentStimulus.correct;
    const rt = Date.now() - trialStartRef.current;

    if (isCorrect) play('success');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: choice,
      metadata: {
        word: currentStimulus.word,
        instruction: currentStimulus.instruction,
        expected: currentStimulus.correct,
        difficulty: currentStimulus.difficulty,
        hesitation: rt > 3000
      }
    });

    setTimeout(() => {
        spawnTrial(difficulty);
    }, 1000);
  };

  useEffect(() => {
    if (gameState === 'playing' && !started.current) {
      started.current = true;
      spawnTrial(difficulty);
    }
  }, [gameState, difficulty, spawnTrial]);

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        {currentStimulus && gameState === 'playing' && (
          <motion.div
            key={currentStimulus.word}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-12 text-center"
          >
            <div className="text-8xl mb-6 drop-shadow-lg scale-110">🧩</div>
            <h2 className="text-6xl font-black text-white mb-4 font-dyslexic bg-white/5 px-12 py-6 rounded-[3rem] border border-white/10 italic">
              {currentStimulus.word}
            </h2>
            <div className="flex justify-center mt-6">
               <button 
                 onClick={() => speak(currentStimulus.instruction)}
                 className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-purple-500/30 transition-all animate-pulse"
               >
                 <span>🔊 أعد التعليمات</span>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl px-4">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(opt)}
            className="bg-slate-900 border-4 border-slate-800 hover:border-purple-500 rounded-[2.5rem] p-10 text-4xl font-black text-white transition-all shadow-xl hover:shadow-purple-500/20 flex items-center justify-center min-h-[140px]"
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <div className="mt-12 text-slate-500 text-[10px] uppercase tracking-[0.4em] font-mono opacity-30">
        CTOPP-2 Clinical Protocol // LATENCY_SENSITIVE
      </div>
    </div>
  );
}
