'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function BackwardDigitSpan() {
  const { play } = useSound();
  const [sequence, setSequence] = useState<number[]>([]);
  const [input, setInput] = useState('');
  const [isShowing, setIsShowing] = useState(false);
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  
  const currentLength = useRef(2); // Backward usually starts shorter (WISC-V starts at 2)

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
          setTimeout(() => setCurrentDigit(null), 800); // Slightly slower for encoding
          i++;
        } else {
          clearInterval(interval);
          setIsShowing(false);
        }
      }, 1600);
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
    
    // CRITICAL: Check for REVERSED sequence
    const reversedSeq = [...sequence].reverse().join('');
    const isCorrect = input === reversedSeq;
    
    if (isCorrect) {
      setScore((s: number) => s + sequence.length * 20); // Higher weight for backward
      play('success');
      currentLength.current += 1;
      setTimeout(() => startRound(currentLength.current), 1000);
      nextRound(true);
    } else {
      setIsWrong(true);
      play('click');
      currentLength.current = Math.max(2, currentLength.current - 1);
      setTimeout(() => startRound(currentLength.current), 1500);
      nextRound(false);
    }
  };

  return (
    <ClinicalPlayerEngine
      title="سلسلة الأرقام العكسية (Backward)"
      category="memory_backward_digit"
      domainId="memory"
      description="تقييم عيادي لمرونة الذاكرة العاملة والقدرة على معالجة المعلومات ذهنياً (WISC-V: Backward Digit Span)."
      instruction="المهمة: ركز على الأرقام.. ثم اكتبها بالترتيب العكسي (من الآخر للأول)."
      icon="🔄"
      color="rose"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full max-w-4xl px-4 flex flex-col items-center">
          
          <div className="h-64 flex items-center justify-center mb-12">
             <AnimatePresence mode="wait">
               {isShowing && currentDigit !== null ? (
                 <motion.div 
                   key={`digit-${currentDigit}`}
                   initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
                   animate={{ scale: 1.5, opacity: 1, rotateY: 0 }}
                   exit={{ scale: 2, opacity: 0, x: 50 }}
                   className="text-[12rem] font-black text-rose-400 font-mono drop-shadow-[0_0_40px_rgba(244,63,94,0.3)]"
                 >
                   {currentDigit}
                 </motion.div>
               ) : !isShowing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                     <div className={`text-6xl font-black tracking-[0.5em] px-12 py-6 rounded-3xl border-2 ${isWrong ? 'border-rose-500 text-rose-500 bg-rose-500/10' : 'border-rose-500/20 text-white bg-slate-900/50'}`}>
                        {input || '...'}
                     </div>
                     <p className="text-rose-500/60 font-black uppercase tracking-[0.2em] text-xs animate-pulse">اكتب الأرقام بالعكس الآن</p>
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
                     btn === 'OK' ? 'bg-rose-500 border-rose-400 text-white col-span-1 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 
                     btn === 'C' ? 'bg-slate-800 border-white/5 text-slate-400' :
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
