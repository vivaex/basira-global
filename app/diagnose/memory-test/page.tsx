'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

/**
 * WISC-V Spatial Span (Corsi Blocks)
 * ---------------------------------------------
 * Protocol: Forward Span followed by Backward Span.
 * Clinical Metric: Max Span Length & Chunking Efficiency.
 */

type TestPhase = 'FORWARD' | 'BACKWARD';

export default function CorsiMemoryTest() {
  const { play } = useSound();
  const [phase, setPhase] = useState<TestPhase>('FORWARD');
  const [subPhase, setSubPhase] = useState<'WATCHING' | 'PLAYING' | 'FEEDBACK'>('WATCHING');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [trialCount, setTrialCount] = useState(0);

  const trialStartTime = useRef<number>(0);
  const touchTimes = useRef<number[]>([]);
  const sequenceTimer = useRef<NodeJS.Timeout | null>(null);

  const generateSequence = useCallback((difficulty: number) => {
    setSubPhase('WATCHING');
    setPlayerSequence([]);
    setActiveBlock(null);
    touchTimes.current = [];

    // Difficulty maps to length (e.g. 2 to 9)
    const length = Math.min(9, Math.floor(difficulty) + 2);
    const newSeq: number[] = [];
    let last = -1;
    for (let i = 0; i < length; i++) {
      let next;
      do { next = Math.floor(Math.random() * 9); } while (next === last);
      newSeq.push(next);
      last = next;
    }
    setSequence(newSeq);

    let step = 0;
    const playNext = () => {
      if (step >= newSeq.length) {
        setActiveBlock(null);
        setSubPhase('PLAYING');
        trialStartTime.current = performance.now();
        return;
      }
      setActiveBlock(newSeq[step]);
      play('coin'); // Visual cue sound
      setTimeout(() => {
        setActiveBlock(null);
        setTimeout(() => {
          step++;
          playNext();
        }, 500);
      }, 800);
    };

    sequenceTimer.current = setTimeout(playNext, 1200);
  }, [play]);

  const handleBlockClick = (index: number, recordInteraction: any, difficulty: number) => {
    if (subPhase !== 'PLAYING') return;

    const now = performance.now();
    touchTimes.current.push(now);
    
    // Feedback animation
    setActiveBlock(index);
    setTimeout(() => setActiveBlock(null), 200);

    const newPlayerSeq = [...playerSequence, index];
    setPlayerSequence(newPlayerSeq);

    const targetSeq = phase === 'FORWARD' ? sequence : [...sequence].reverse();
    const isCorrectSoFar = newPlayerSeq[newPlayerSeq.length - 1] === targetSeq[newPlayerSeq.length - 1];

    if (!isCorrectSoFar) {
      play('click');
      setSubPhase('FEEDBACK');
      recordInteraction({
        isCorrect: false,
        timestampDisplayed: trialStartTime.current,
        timestampResponded: now,
        responseValue: JSON.stringify(newPlayerSeq),
        itemDifficulty: difficulty,
        metadata: { phase, sequenceLength: sequence.length, targetSeq }
      });
      setTimeout(() => {
        setTrialCount(prev => prev + 1);
        generateSequence(difficulty);
      }, 1500);
      return;
    }

    if (newPlayerSeq.length === targetSeq.length) {
      play('success');
      setSubPhase('FEEDBACK');
      recordInteraction({
        isCorrect: true,
        timestampDisplayed: trialStartTime.current,
        timestampResponded: now,
        responseValue: JSON.stringify(newPlayerSeq),
        itemDifficulty: difficulty,
        metadata: { phase, sequenceLength: sequence.length }
      });

      // Clinical Bridge: After 6 trials of forward, maybe switch to backward
      setTimeout(() => {
        if (trialCount === 5 && phase === 'FORWARD') {
          setPhase('BACKWARD');
          setTrialCount(prev => prev + 1);
          generateSequence(difficulty);
        } else {
          setTrialCount(prev => prev + 1);
          generateSequence(difficulty);
        }
      }, 1500);
    } else {
      play('click'); // Regular tap sound
    }
  };

  useEffect(() => {
    return () => {
      if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
    };
  }, []);

  return (
    <ClinicalPlayerEngine
      title="مصفوفة الذاكرة المكانية (WISC-V Corsi)"
      category="cognition"
      domainId="working_memory"
      description="تقييم الذاكرة العاملة البصرية والقدرة على المعالجة التسلسلية (forward/backward span)."
      instruction={phase === 'FORWARD' ? 'راقب المربعات التي تضيء، ثم المسها بنفس الترتيب.' : 'راقب المربعات، ثم المسها بالترتيب العكسي (من الأخير للأول).'}
      icon="🧠"
      color="cyan"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="flex justify-between w-full max-w-4xl mb-12 bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 backdrop-blur-xl">
             <div className="flex flex-col items-start gap-1">
                <span className="text-cyan-400 font-black text-[0.6rem] uppercase tracking-[0.3em]">الوضع الحالي</span>
                <span className="text-2xl font-bold text-white font-arabic">
                  {phase === 'FORWARD' ? 'التسلسل الأمامي ➡️' : 'التسلسل العكسي ↩️'}
                </span>
             </div>
             
             <div className="flex flex-col items-center gap-1">
                <span className="text-slate-500 font-black text-[0.6rem] uppercase tracking-[0.3em]">الحالة</span>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={subPhase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-6 py-2 rounded-full text-sm font-bold border ${
                      subPhase === 'WATCHING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                      subPhase === 'PLAYING' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 animate-pulse' :
                      'bg-slate-800 text-slate-400 border-white/5'
                    }`}
                  >
                    {subPhase === 'WATCHING' ? '👀 راقب النمط...' : subPhase === 'PLAYING' ? '👇 دورك الآن' : '⌛ جاري التحميل...'}
                  </motion.div>
                </AnimatePresence>
             </div>

             <div className="flex flex-col items-end gap-1">
                <span className="text-slate-500 font-black text-[0.6rem] uppercase tracking-[0.3em]">طول التسلسل</span>
                <span className="text-3xl font-black text-cyan-500 font-mono tracking-tighter">
                   {sequence.length}
                </span>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full max-w-2xl aspect-square p-10 bg-slate-950/50 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
             {/* Decorative Background Grid */}
             <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:40px_40px]" />
             
             {[0,1,2,3,4,5,6,7,8].map((i) => (
               <motion.button
                 key={i}
                 whileHover={subPhase === 'PLAYING' ? { scale: 1.05 } : {}}
                 whileTap={subPhase === 'PLAYING' ? { scale: 0.95 } : {}}
                 onClick={() => handleBlockClick(i, recordInteraction, difficulty)}
                 disabled={subPhase !== 'PLAYING'}
                 className={`aspect-square rounded-[2rem] border-2 transition-all duration-300 relative overflow-hidden
                   ${activeBlock === i 
                     ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_60px_rgba(34,211,238,0.6)] z-20 scale-105' 
                     : 'bg-slate-900/60 border-white/5 hover:border-white/10 active:bg-slate-800'}`}
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  {/* Subtle index hint for clinical tracking if needed, otherwise hidden */}
                  <span className="absolute bottom-3 right-4 text-[0.5rem] font-bold text-white/5 font-mono">{i + 1}</span>
               </motion.button>
             ))}
          </div>

          <div className="mt-16 flex items-center gap-4 text-slate-600 font-bold uppercase tracking-[0.4em] text-[0.6rem]">
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
             <span>Encoding_Telemetry: ACTIVE_STREAMS</span>
          </div>

          <GameTrigger 
            gameState={gameState} 
            trialCount={trialCount} 
            onStart={() => generateSequence(difficulty)} 
          />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, trialCount, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing' && trialCount === 0) {
      onStart();
    }
  }, [gameState, trialCount, onStart]);
  return null;
}