'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// --- CPT-3 STIMULI ---
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'Z'];
const TARGET_NO_GO = 'X';

export default function SustainedAttentionGame() {
  const { play } = useSound();
  const [stimulus, setStimulus] = useState<string | null>(null);
  const [isi, setIsi] = useState(2000); // Inter-Stimulus Interval (Adaptive)
  const [isResponded, setIsResponded] = useState(false);
  const [trialCount, setTrialCount] = useState(0);

  const trialStartTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateStimulus = useCallback((recordInteraction: any, difficulty: number) => {
    // 1. Audit previous trial for Omission error (Missed a target)
    if (stimulus && stimulus !== TARGET_NO_GO && !isResponded) {
       recordInteraction({
         isCorrect: false,
         timestampDisplayed: trialStartTime.current,
         timestampResponded: performance.now(),
         responseValue: 'missed_target',
         itemDifficulty: difficulty,
         metadata: { errorType: 'omission', isi }
       });
    }

    setIsResponded(false);
    const isX = Math.random() < 0.25; // 25% 'X' (The No-Go Distractor)
    const nextStim = isX ? TARGET_NO_GO : LETTERS[Math.floor(Math.random() * LETTERS.length)];
    
    setStimulus(nextStim);
    trialStartTime.current = performance.now();

    // Stimulus duration (Standard CPT is 250ms active exposure)
    setTimeout(() => setStimulus(null), 250);

    // Adaptive ISI Logic (Clinical standard difficulty adjustment)
    const currentIsi = Math.max(700, 2500 - trialCount * 50 - difficulty * 200);
    setIsi(currentIsi);

    // Schedule next trial
    timerRef.current = setTimeout(() => {
      setTrialCount(prev => prev + 1);
    }, currentIsi);
  }, [stimulus, isResponded, trialCount, isi]);

  const handleAction = (recordInteraction: any, difficulty: number) => {
    if (isResponded || !stimulus) return;
    setIsResponded(true);

    const now = performance.now();
    const isCorrect = stimulus !== TARGET_NO_GO;
    
    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: 'tap',
      itemDifficulty: difficulty,
      metadata: { 
        stimulus,
        errorType: isCorrect ? 'none' : 'commission',
        reactionTime: now - trialStartTime.current,
        isi
      }
    });

    if (isCorrect) {
      play('success');
    } else {
      play('click');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ClinicalPlayerEngine
      title="مختبر اليقظة المستمرة (CPT-3 Protocol)"
      category="attention_sustained"
      domainId="attention"
      description="قياس القدرة على البقاء متيقظاً لفترات طويلة وكبح الاندفاعية (Inhibition)."
      instruction="المهمة: انتبه جيداً! اضغط على الزر الكبير فور ظهور أي حرف.. إلا حرف (X)، لا تضغط عليه أبداً!"
      icon="🛰️"
      color="amber"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="relative w-full max-w-5xl h-[34rem] flex items-center justify-center mb-16 bg-slate-900/30 rounded-[5rem] border border-white/5 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 opacity-10">
               <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-500/50" />
               <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-500/50" />
            </div>

            <AnimatePresence mode="wait">
              {gameState === 'playing' && stimulus ? (
                <motion.div
                  key={`${trialCount}-${stimulus}`}
                  initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                  className="relative z-10"
                >
                  <h2 className={`text-[12rem] md:text-[15rem] font-black tracking-tighter leading-none ${stimulus === TARGET_NO_GO ? 'text-rose-500 drop-shadow-[0_0_50px_rgba(244,63,94,0.4)]' : 'text-white'}`}>
                    {stimulus}
                  </h2>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {!stimulus && gameState === 'playing' && (
              <div className="flex gap-4">
                <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-4 h-4 rounded-full bg-amber-500/30" />
                <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-4 h-4 rounded-full bg-amber-500/30" />
                <motion.div animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.8 }} className="w-4 h-4 rounded-full bg-amber-500/30" />
              </div>
            )}
            
            {/* HUD */}
            <div className="absolute bottom-12 left-16 flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-slate-600 font-bold uppercase tracking-[0.4em] text-[0.6rem]">Sustained_Protocol: ACTIVE</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(recordInteraction, difficulty)}
            className="w-full max-w-2xl h-40 bg-amber-600 hover:bg-amber-500 rounded-[3.5rem] flex items-center justify-center gap-6 shadow-[0_30px_60px_rgba(217,119,6,0.2)] border-b-[12px] border-amber-800 transition-all active:border-b-0 active:translate-y-2"
          >
            <span className="text-5xl font-black text-white italic tracking-tighter">استجابة (RESPOND)</span>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
               ⚡
            </div>
          </motion.button>

          <div className="mt-12 flex gap-8">
             <div className="flex flex-col items-center">
                <span className="text-slate-700 text-[0.5rem] font-bold uppercase tracking-[0.3em]">Processing Interval</span>
                <span className="text-slate-500 font-mono text-sm">{isi.toFixed(0)}ms</span>
             </div>
             <div className="w-[1px] h-8 bg-white/5" />
             <div className="flex flex-col items-center">
                <span className="text-slate-700 text-[0.5rem] font-bold uppercase tracking-[0.3em]">Trial Progress</span>
                <span className="text-slate-500 font-mono text-sm">{trialCount}</span>
             </div>
          </div>

          <GameTrigger 
            gameState={gameState} 
            trialCount={trialCount} 
            onStart={() => generateStimulus(recordInteraction, difficulty)} 
          />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, trialCount, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing') {
      onStart();
    }
  }, [gameState, trialCount, onStart]);
  return null;
}