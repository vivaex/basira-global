'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function PatternGhostTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, pattern: string } | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const PATTERNS = ['💠', '🌀', '🔆', '💠', '🪁', '🧿', '🧬', '🔮'];

  const spawnRound = useCallback(() => {
    const t = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    setTarget({ id: Math.random(), pattern: t });
    
    let opts = [t];
    while (opts.length < 4) {
      const rand = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
      if (!opts.includes(rand)) opts.push(rand);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  }, []);

  return (
    <ClinicalPlayerEngine
      title="خيال الأنماط (Pattern Ghost)"
      category="perception_prob_ghost"
      domainId="perception"
      description="تقييم عيادي لقدرة الدماغ على مطابقة الأنماط البصرية المعقدة والتمييز بينها."
      instruction="المهمة: انظر للنمط الموجود في المركز وحاول العثور على توأمه المماثل تماماً في الخيارات."
      icon="👻"
      color="indigo"
      onComplete={() => {}}
    >
      {({ setScore, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           <AnimatePresence mode="wait">
             {target && (
               <motion.div 
                 key={target.id}
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1.2, opacity: 1 }}
                 className="mb-16 w-48 h-48 bg-purple-500/10 border-4 border-purple-500/50 rounded-[4rem] flex items-center justify-center text-8xl shadow-[0_0_60px_rgba(168,85,247,0.3)]"
               >
                 {target.pattern}
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex gap-8 justify-center flex-wrap">
             {options.map((opt, i) => (
               <motion.button
                 key={i}
                 whileHover={{ scale: 1.1, y: -10 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={() => {
                   if (opt === target?.pattern) {
                     setScore((s: number) => s + 25);
                     play('coin');
                   } else {
                     setScore((s: number) => Math.max(0, s - 10));
                     play('click');
                   }
                   spawnRound();
                 }}
                 className="w-28 h-28 md:w-36 md:h-36 bg-slate-900 border-2 border-white/5 hover:border-purple-500/50 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-xl transition-all"
               >
                 {opt}
               </motion.button>
             ))}
           </div>

           <GameTrigger gameState={gameState} spawnRound={spawnRound} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, spawnRound }: any) {
  useEffect(() => {
    if (gameState === 'playing') spawnRound();
  }, [gameState, spawnRound]);
  return null;
}
