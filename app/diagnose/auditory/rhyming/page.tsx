'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

/**
 * Rhyming Diagnostic (Phonological Sensitivity) - Clinical Protocol
 * -------------------------------------------------------------
 * Measures the ability to recognize identical ending sounds (rimes).
 * Telemetry: Latency to match, Phonetic Distractor Analysis.
 */

const RHYMING_STIMULI = [
  { target: 'بيت', choices: ['زيت', 'كتاب', 'كورة', 'فيل'], difficulty: 1 },
  { target: 'فيل', choices: ['ميل', 'ديك', 'ساعة', 'بحر'], difficulty: 1 },
  { target: 'رمل', choices: ['حمل', 'ولد', 'منزل', 'قطار'], difficulty: 2 },
  { target: 'سماء', choices: ['دواء', 'أرض', 'شجر', 'قلم'], difficulty: 3 },
  { target: 'تفاح', choices: ['تمساح', 'موز', 'عنب', 'كيك'], difficulty: 4 },
  { target: 'مدرسة', choices: ['هندسة', 'دراسة', 'كتب', 'مكتب'], difficulty: 5 },
];

export default function RhymingTest() {
  const { play } = useSound();
  const { speak, isSpeaking } = useTTS();
  const [current, setCurrent] = useState<typeof RHYMING_STIMULI[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const trialStartRef = useRef<number>(0);

  const spawnTrial = useCallback((difficulty: number, gameState?: string) => {
    if (gameState && gameState !== 'playing') return;

    const pool = RHYMING_STIMULI.filter(s => s.difficulty <= Math.ceil(difficulty));
    const random = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrent(random);
    setOptions([...random.choices].sort(() => Math.random() - 0.5));
    trialStartRef.current = Date.now();
    
    // Clinical: Speak the target word
    setTimeout(() => {
        speak(`ما الكلمة التي تقفي مع كلمة: ${random.target}`);
    }, 500);
  }, [speak]);

  const handleAnswer = (choice: string, recordInteraction: any, gameState: string) => {
    if (!current) return;
    
    const isCorrect = choice === current.choices[0]; // First one is correct by definition in data
    if (isCorrect) play('success');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: choice,
      metadata: { 
        target: current.target, 
        choice, 
        difficulty: current.difficulty 
      }
    });

    setTimeout(() => {
      if (gameState === 'playing') spawnTrial(1, gameState);
    }, 1200);
  };

  return (
    <ClinicalPlayerEngine
      title="القافية والسجع (Rhyming)"
      category="auditory_rhyming"
      domainId="phonological-sensitivity"
      description="تقييم عيادي للحساسية الصوتية والقدرة على تمييز القوافي (أهم مؤشرات عسر القراءة)."
      instruction="المهمة: استمع للكلمة، ثم اختر الكلمة التي تنتهي بنفس الصوت (تقفي معها)."
      icon="🎵"
      color="cyan"
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
                <div className="text-8xl mb-4 p-8 bg-cyan-500/10 rounded-full border-4 border-cyan-500/20 shadow-2xl animate-bounce">
                  🎵
                </div>
                <h2 className="text-7xl font-black text-white italic font-arabic bg-slate-900 border-2 border-white/5 py-8 px-16 rounded-[4rem] shadow-inner tracking-tight">
                  {current.target}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
            {options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(opt, recordInteraction, gameState)}
                className={`h-28 bg-slate-900 border-4 border-slate-800 hover:border-indigo-500 rounded-[2rem] text-4xl font-black text-white transition-all shadow-xl ${isSpeaking ? 'opacity-50 cursor-wait' : ''}`}
              >
                {opt}
              </motion.button>
            ))}
          </div>

          <GameTrigger 
            gameState={gameState} 
            difficulty={difficulty} 
            onStart={() => spawnTrial(difficulty, gameState)} 
          />
          
          <div className="mt-12 text-cyan-600/30 text-[9px] uppercase tracking-[0.4em] font-mono">
            Acoustic Rhyme Processor // PROTOCOL_RHYME_V1
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
