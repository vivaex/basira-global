'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function FlashDetailTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, icon: string, x: number, y: number } | null>(null);
  const [isShowing, setIsShowing] = useState(false);

  const spawnRound = useCallback(() => {
    const icons = ['🔍', '🔬', '🔭', '🧬', '🔮', '🧿'];
    setTarget({
      id: Math.random(),
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20
    });
    setIsShowing(true);
    setTimeout(() => setIsShowing(false), 800);
  }, []);

  return (
    <ClinicalPlayerEngine
      title="كاشف التفاصيل (Flash Detail)"
      category="perception_prob_detail"
      description="تقييم عيادي للانتباه للتفاصيل الدقيقة والقدرة على تمييز الأشياء في وقت وجيز."
      instruction="المهمة: سيظهر عنصر لدقائق معدودة ثم يختفي، حاول الضغط على مكانه الصحيح تماماً."
      icon="🔬"
      color="rose"
      onComplete={() => {}}
    >
      {({ setScore, gameState }: any) => (
        <div className="w-full h-full relative overflow-hidden bg-slate-900 shadow-2xl rounded-[4rem] border-2 border-white/5">
           <AnimatePresence>
             {target && isShowing && (
               <motion.div
                 key={target.id}
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1.5, opacity: 1 }}
                 exit={{ scale: 0, opacity: 0 }}
                 style={{ left: `${target.x}%`, top: `${target.y}%`, position: 'absolute' }}
                 className="text-7xl z-20 pointer-events-none"
               >
                 {target.icon}
               </motion.div>
             )}
           </AnimatePresence>

           {!isShowing && target && (
             <div 
               className="absolute inset-0 z-10 cursor-crosshair"
               onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  
                  const dist = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
                  if (dist < 10) {
                    setScore((s: number) => s + 30);
                    play('success');
                  } else {
                    setScore((s: number) => Math.max(0, s - 10));
                    play('click');
                  }
                  spawnRound();
               }}
             />
           )}

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
