'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function ForwardDigitSpan() {
  const { play } = useSound();
  const [sequence, setSequence] = useState<number[]>([]);
  const [input, setInput] = useState('');
  const [isShowing, setIsShowing] = useState(false);
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  
  const trialCount = useRef(0);
  const currentLength = useRef(3);

  const startRound = useCallback((len: number) => {
    const newSeq = Array.from({ length: len }, () => Math.floor(Math.random() * 10));
    setSequence(newSeq);
    setInput('');
    setIsShowing(true);
    setIsWrong(false);
  }, []);

  useEffect(() => {
    if (isShowing) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < sequence.length) {
          setCurrentDigit(sequence[i]);
          play('click');
          setTimeout(() => setCurrentDigit(null), 700);
          i++;
        } else {
          clearInterval(interval);
          setIsShowing(false);
        }
      }, 1400); // 1.4s per digit for cognitive load
      return () => clearInterval(interval);
    }
  }, [isShowing, sequence, play]);

  const handleInput = (digit: string) => {
    if (isShowing) return;
    setInput(prev => prev + digit);
    play('click');
  };

  const handleBackspace = () => {
    setInput(prev => prev.slice(0, -1));
    play('click');
  };

  const handleSubmit = (setScore: any, nextRound: any) => {
    if (isShowing || !sequence.length) return;
    
    const isCorrect = input === sequence.join('');
    
    if (isCorrect) {
      setScore((s: number) => s + sequence.length * 10);
      play('success');
      currentLength.current += 1; // Adaptive: increase length
      setTimeout(() => startRound(currentLength.current), 1000);
      nextRound(true);
    } else {
      setIsWrong(true);
      play('click');
      currentLength.current = Math.max(3, currentLength.current - 1); // Adaptive: lower length
      setTimeout(() => startRound(currentLength.current), 1500);
      nextRound(false);
    }
  };

  return (
    <ClinicalPlayerEngine
      title="سلسلة الأرقام المباشرة (Forward)"
      category="memory_forward_digit"
      domainId="memory"
      description="تقييم عيادي لسعة الذاكرة العاملة اللفظية (WISC-V: Forward Digit Span)."
      instruction="المهمة: ركز على الأرقام، ثم اكتبها بنفس الترتيب الذي ظهرت به."
      icon="🔢"
      color="emerald"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full max-w-4xl px-4 flex flex-col items-center">
          
          <div className="h-64 flex items-center justify-center mb-12">
             <AnimatePresence mode="wait">
               {isShowing && currentDigit !== null ? (
                 <motion.div 
                   key={`digit-${currentDigit}`}
                   initial={{ scale: 0.5, opacity: 0 }}
                   animate={{ scale: 1.5, opacity: 1, filter: 'blur(0px)' }}
                   exit={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
                   className="text-[12rem] font-black text-emerald-400 font-mono drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                 >
                   {currentDigit}
                 </motion.div>
               ) : !isShowing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                     <div className={`text-6xl font-black tracking-[0.5em] px-12 py-6 rounded-3xl border-2 ${isWrong ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-emerald-500/20 text-white bg-slate-900/50'}`}>
                        {input || '...'}
                     </div>
                     <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">أدخل السلسلة الآن</p>
                  </motion.div>
               )}
             </AnimatePresence>
          </div>

          {!isShowing && (
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((btn) => (
                 <motion.button
                   key={btn}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => {
                     if (btn === 'C') handleBackspace();
                     else if (btn === 'OK') handleSubmit(setScore, nextRound);
                     else handleInput(btn.toString());
                   }}
                   className={`h-24 rounded-3xl font-black text-3xl shadow-xl border-2 transition-all ${
                     btn === 'OK' ? 'bg-emerald-500 border-emerald-400 text-slate-950 col-span-1' : 
                     btn === 'C' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                     'bg-slate-900 border-white/5 text-white'
                   }`}
                 >
                   {btn}
                 </motion.button>
               ))}
            </div>
          )}

          <GameTrigger gameState={gameState} onStart={() => startRound(currentLength.current)} />
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
