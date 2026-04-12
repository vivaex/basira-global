'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

/**
 * Auditory Memory (Digit Span) - WISC-V Clinical Standard
 * -----------------------------------------------------
 * Measures short-term and working memory.
 * Phases: Forward (Simple Span) -> Backward (Working Memory).
 */

type Phase = 'FORWARD' | 'BACKWARD';

export default function AuditoryMemoryTest() {
  const { play } = useSound();
  const { speak } = useTTS();
  
  const [phase, setPhase] = useState<Phase>('FORWARD');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  
  const [spanLength, setSpanLength] = useState(2);
  const trialStartRef = useRef<number>(0);

  const generateSequence = (length: number) => {
    const seq = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * 9) + 1);
    }
    return seq;
  };

  const playSequence = useCallback(async (seq: number[]) => {
    setIsShowingSequence(true);
    setUserSequence([]);
    
    // Safety delay
    await new Promise(r => setTimeout(r, 1000));

    for (const digit of seq) {
      setCurrentDigit(digit);
      speak(digit.toString());
      await new Promise(r => setTimeout(r, 1800)); // Increased interval for clinical clarity (Total ~2s)
      setCurrentDigit(null);
      await new Promise(r => setTimeout(r, 200));
    }

    setIsShowingSequence(false);
    trialStartRef.current = Date.now();
  }, [speak]);

  const spawnTrial = useCallback((difficulty: number, gameState?: string) => {
    if (gameState && gameState !== 'playing') return;
    
    // Phase logic: After span 5, switch to backward? Or just stay forward for now.
    // Let's implement difficulty based span length.
    const len = Math.max(2, Math.floor(difficulty) + 1);
    setSpanLength(len);
    
    const seq = generateSequence(len);
    setSequence(seq);
    playSequence(seq);
  }, [playSequence]);

  const handleInput = (num: number, recordInteraction: any, gameState: string) => {
    if (isShowingSequence) return;
    
    play('click');
    const newSeq = [...userSequence, num];
    setUserSequence(newSeq);

    // Immediate check
    const expected = phase === 'FORWARD' ? sequence : [...sequence].reverse();
    const isStillCorrect = newSeq.every((v, i) => v === expected[i]);

    if (!isStillCorrect) {
      // Failed Trial
      const rt = Date.now() - trialStartRef.current;
      recordInteraction({
        isCorrect: false,
        timestampDisplayed: trialStartRef.current,
        timestampResponded: Date.now(),
        responseValue: newSeq.join(','),
        metadata: { 
          phase, 
          sequence: sequence.join(','), 
          expected: expected.join(','), 
          errorIndex: newSeq.length - 1,
          spanLength 
        }
      });
      // Try again or step back difficulty
      setTimeout(() => {
        if (gameState === 'playing') spawnTrial(Math.max(1, spanLength - 2), gameState);
      }, 1500);
      return;
    }

    if (newSeq.length === expected.length) {
      // Success Trial
      const rt = Date.now() - trialStartRef.current;
      play('success');
      recordInteraction({
        isCorrect: true,
        timestampDisplayed: trialStartRef.current,
        timestampResponded: Date.now(),
        responseValue: newSeq.join(','),
        metadata: { phase, sequence: sequence.join(','), spanLength, rt }
      });

      // Transition phase or increase span
      if (spanLength >= 5 && phase === 'FORWARD') {
         setPhase('BACKWARD');
         setTimeout(() => {
           if (gameState === 'playing') spawnTrial(2, gameState);
         }, 2000);
      } else {
         setTimeout(() => {
           if (gameState === 'playing') spawnTrial(spanLength, gameState);
         }, 2000);
      }
    }
  };

  return (
    <ClinicalPlayerEngine
      title="الذاكرة السمعية (Digit Span)"
      category="auditory_memory"
      domainId="working-memory"
      description="تقييم عيادي لسعة الذاكرة السمعية القصيرة والذاكرة العاملة (معيار WISC-V)."
      instruction={phase === 'FORWARD' 
        ? "استمع لسلسلة الأرقام وأعدها بنفس الترتيب." 
        : "استمع لسلسلة الأرقام وأعدها بالترتيب العكسي (من الآخر للأول)!"}
      icon="🧠"
      color="indigo"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }) => (
        <div className="w-full flex flex-col items-center">
          {/* Phase Badge */}
          <div className="mb-8 flex flex-col items-center gap-2">
             <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border-2 ${phase === 'FORWARD' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400'}`}>
                {phase === 'FORWARD' ? 'تتبع أمامي' : 'تتبع عكسي ↺'}
             </div>
             <p className="text-slate-400 font-bold text-sm">طول السلسلة: {spanLength} أرقام</p>
          </div>

          <div className="relative mb-16 h-48 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isShowingSequence ? (
                <motion.div
                  key={currentDigit ?? 'listening'}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-9xl font-black text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]"
                >
                  {currentDigit ? currentDigit : '👂'}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 items-center"
                >
                  {userSequence.map((num, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="w-16 h-16 bg-white/10 border-2 border-white/20 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-400 shadow-xl"
                    >
                      {num}
                    </motion.div>
                  ))}
                  {userSequence.length === 0 && (
                    <p className="text-2xl font-black text-slate-500 animate-pulse uppercase tracking-[0.2em]">أعد الأرقام الآن...</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                disabled={isShowingSequence || gameState !== 'playing'}
                onClick={() => handleInput(num, recordInteraction, gameState)}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl text-4xl font-black border-4 transition-all shadow-xl ${isShowingSequence ? 'bg-slate-900 border-slate-800 text-slate-700 opacity-50' : 'bg-slate-800 border-slate-700 text-white hover:border-indigo-500 hover:bg-slate-700 active:bg-indigo-600'}`}
              >
                {num}
              </motion.button>
            ))}
          </div>

          <GameTrigger 
            gameState={gameState} 
            onStart={() => spawnTrial(difficulty)} 
          />
          
          <div className="mt-12 text-slate-600 text-[9px] uppercase tracking-[0.4em] font-mono opacity-40">
            WISC-V Digital Psychometrics // SPAN_ANALYSIS_V2
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
