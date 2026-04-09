'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function CorsiMatrixTest() {
  const { play } = useSound();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [gridSize, setGridSize] = useState(3); // Start with 3x3 (9 tiles)
  
  const currentLength = useRef(2);

  const startRound = useCallback((len: number) => {
    const tileCount = gridSize * gridSize;
    const newSeq: number[] = [];
    while (newSeq.length < len) {
      const next = Math.floor(Math.random() * tileCount);
      // Optional: avoid immediate duplicates for better spatial span
      if (newSeq.length === 0 || next !== newSeq[newSeq.length - 1]) {
        newSeq.push(next);
      }
    }
    setSequence(newSeq);
    setUserSequence([]);
    setIsShowing(true);
  }, [gridSize]);

  useEffect(() => {
    if (isShowing) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < sequence.length) {
          setHighlighted(sequence[i]);
          play('click');
          setTimeout(() => setHighlighted(null), 500);
          i++;
        } else {
          clearInterval(interval);
          setIsShowing(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isShowing, sequence, play]);

  const handleTileClick = (idx: number, setScore: any, nextRound: any) => {
    if (isShowing || userSequence.length >= sequence.length) return;
    
    const nextUserSeq = [...userSequence, idx];
    setUserSequence(nextUserSeq);
    play('click');

    // Immediate check (Corsi standard)
    if (idx !== sequence[nextUserSeq.length - 1]) {
      // Error
      play('click');
      currentLength.current = Math.max(2, currentLength.current - 1);
      setTimeout(() => startRound(currentLength.current), 1500);
      nextRound(false);
    } else if (nextUserSeq.length === sequence.length) {
      // Level Success
      setScore((s: number) => s + sequence.length * 20);
      play('success');
      currentLength.current += 1;
      
      // Adaptive grid size
      if (currentLength.current > 6 && gridSize < 4) setGridSize(4);
      
      setTimeout(() => startRound(currentLength.current), 1000);
      nextRound(true);
    }
  };

  return (
    <ClinicalPlayerEngine
      title="المسار العصبي (Corsi Matrix)"
      category="memory_prob_sequence"
      domainId="memory"
      description="تقييم عيادي للذاكرة العاملة البصرية المكانية (WISC-V: Visual-Spatial Span)."
      instruction="المهمة: شاهد ترتيب المربعات التي ستضيء، ثم كررها بنفس الترتيب تماماً."
      icon="🧠"
      color="indigo"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full flex justify-center py-10 scale-90 md:scale-100">
           <div 
             className="grid gap-4 bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 shadow-2xl"
             style={{ 
               gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` 
             }}
           >
              {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                <motion.button
                  key={i}
                  disabled={isShowing}
                  whileHover={!isShowing ? { scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' } : {}}
                  whileTap={!isShowing ? { scale: 0.95 } : {}}
                  onClick={() => handleTileClick(i, setScore, nextRound)}
                  className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
                    highlighted === i 
                      ? 'bg-indigo-500 border-indigo-400 scale-110 shadow-[0_0_40px_rgba(99,102,241,0.6)] mix-blend-screen' 
                      : userSequence.includes(i) && !isShowing
                        ? 'bg-indigo-500/20 border-indigo-500/50 scale-95'
                        : 'bg-slate-950 border-white/5 active:border-indigo-500/50'
                  }`}
                >
                  <AnimatePresence>
                    {highlighted === i && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 2.5 }}
                        exit={{ opacity: 0, scale: 4 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-white/20 blur-2xl rounded-full" 
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Subtle index helper removed for clinical validity (standard Corsi use blank blocks) */}
                </motion.button>
              ))}
           </div>
           
           <GameTrigger gameState={gameState} onStart={() => startRound(currentLength.current)} />

           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">تتبع المسار</span>
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${isShowing ? 'text-indigo-400 animate-pulse' : 'text-slate-700'}`}>
                 {isShowing ? 'المعاينة نشطة' : 'دورك الآن'}
              </div>
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
