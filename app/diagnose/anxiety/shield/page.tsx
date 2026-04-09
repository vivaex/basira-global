'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function FocusShieldTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, x: number, y: number } | null>(null);
  const [distractors, setDistractors] = useState<{ id: number, x: number, y: number }[]>([]);

  const spawnTarget = useCallback(() => {
    setTarget({
      id: Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15
    });

    const newDist = Array.from({ length: 8 }, () => ({
      id: Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15
    }));
    setDistractors(newDist);
  }, []);

  return (
    <ClinicalPlayerEngine
      title="درع التركيز (Focus Shield)"
      category="anxiety_shield"
      domainId="emotional"
      description="تقييم عيادي للأداء تحت الضغط والقدرة على تصفية المشتتات الانفعالية."
      instruction="المهمة: اضغط على الكرة المضيئة 💎 وتجاهل الأشكال المزعجة التي تظهر وتختفي بسرعة."
      icon="🛡️"
      color="rose"
      onComplete={() => {}}
    >
      {({ setScore, gameState }) => (
        <div className="w-full h-full relative overflow-hidden bg-black/40 rounded-[3rem]">
           {/* Visual Pressure: Flashing backgrounds */}
           <motion.div 
             animate={{ opacity: [0, 0.1, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute inset-0 bg-red-500 pointer-events-none" 
           />

           <AnimatePresence>
             {target && gameState === 'playing' && (
               <motion.button
                 key={target.id}
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1.2, opacity: 1 }}
                 exit={{ scale: 0, opacity: 0 }}
                 whileHover={{ scale: 1.4 }}
                 style={{ left: `${target.x}%`, top: `${target.y}%` }}
                 className="absolute w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(244,63,94,0.6)] z-20"
                 onClick={() => {
                   setScore(s => s + 20);
                   play('coin');
                   setTarget(null);
                   setTimeout(spawnTarget, 400);
                 }}
               >
                 💎
               </motion.button>
             )}
           </AnimatePresence>

           <AnimatePresence>
             {distractors.map(d => (
               <motion.div
                 key={d.id}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.3, scale: [1, 1.5, 1] }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 1.5, repeat: Infinity }}
                 style={{ left: `${d.x}%`, top: `${d.y}%` }}
                 className="absolute w-16 h-16 border-2 border-white/10 rounded-full flex items-center justify-center text-2xl z-10 pointer-events-none"
               >
                 💢
               </motion.div>
             ))}
           </AnimatePresence>
           
           <GameTrigger gameState={gameState} spawnTarget={spawnTarget} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, spawnTarget }: any) {
  useEffect(() => {
    if (gameState === 'playing') spawnTarget();
  }, [gameState, spawnTarget]);
  return null;
}
