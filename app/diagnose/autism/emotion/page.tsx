'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function EmotionExplorerTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, emotion: string, icon: string } | null>(null);
  const [options, setOptions] = useState<{ emotion: string, icon: string }[]>([]);

  const EMOTIONS = [
    { emotion: 'سعيد', icon: '😊' },
    { emotion: 'حزين', icon: '😢' },
    { emotion: 'غاضب', icon: '😠' },
    { emotion: 'خائف', icon: '😨' },
    { emotion: 'متفاجئ', icon: '😲' },
    { emotion: 'هادئ', icon: '😌' },
  ];

  const spawnRound = useCallback(() => {
    const t = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
    setTarget({ ...t, id: Math.random() });
    
    let opts = [t];
    while (opts.length < 3) {
      const rand = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      if (!opts.find(o => o.emotion === rand.emotion)) opts.push(rand);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  }, []);

  return (
    <ClinicalPlayerEngine
      title="مستكشف المشاعر (Face Explorer)"
      category="autism_emotion"
      domainId="social"
      description="تقييم عيادي للقدرة على تمييز الانفعالات الأساسية من خلال تعابير الوجه."
      instruction="المهمة: ابحث عن الصورة التي تعبر عن المشعر المذكور في الأعلى."
      icon="🎭"
      color="amber"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           <AnimatePresence mode="wait">
             {target && (
               <motion.div 
                 key={target.id}
                 initial={{ y: -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="mb-12 bg-white/5 p-8 rounded-[3rem] border border-white/10"
               >
                 <span className="text-5xl font-black text-amber-400 italic uppercase tracking-widest">{target.emotion}</span>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex gap-8 justify-center">
             {options.map((opt, i) => (
               <motion.button
                 key={i}
                 whileHover={{ scale: 1.1, rotate: 5 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={() => {
                   const isCorrect = opt.emotion === target?.emotion;
                   if (isCorrect) {
                     setScore((s: number) => s + 20);
                     play('coin');
                   } else {
                     setScore((s: number) => Math.max(0, s - 10));
                     play('click');
                   }
                   nextRound(isCorrect);
                   spawnRound();
                 }}
                 className="w-32 h-32 md:w-44 md:h-44 bg-slate-900 border-2 border-white/10 rounded-[2.5rem] flex items-center justify-center text-7xl md:text-8xl shadow-xl transition-all hover:border-amber-500/50"
               >
                 {opt.icon}
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
