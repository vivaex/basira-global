'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function CalmRegulationTest() {
  const { play } = useSound();
  const [pulse, setPulse] = useState(1);
  const [targetScale, setTargetScale] = useState(1.5);
  const [userScale, setUserScale] = useState(1);

  const spawnRound = useCallback(() => {
    setTargetScale(1 + Math.random() * 2);
    setUserScale(1);
  }, []);

  return (
    <ClinicalPlayerEngine
      title="مختبر الهدوء (Calm Regulation)"
      category="anxiety_calm"
      description="تقييم عيادي للقدرة على التنظيم الذاتي والهدوء الفسيولوجي تحت الطلب."
      instruction="المهمة: اجعل الدائرة الزرقاء تتطابق تماماً مع الدائرة الخارجية المضيئة بالضغط المستمر، وحاول الحفاظ على ثباتك."
      icon="🌬️"
      color="indigo"
      onComplete={() => {}}
    >
      {({ setScore, gameState }) => (
        <div 
          className="w-full h-full flex items-center justify-center relative cursor-none"
          onMouseDown={() => setPulse(1.1)}
          onMouseUp={() => setPulse(1)}
        >
           {/* Target Ring */}
           <motion.div 
             animate={{ scale: targetScale, opacity: [0.1, 0.3, 0.1] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute w-60 h-60 border-4 border-white/20 rounded-full blur-xl"
           />

           {/* User Circle */}
           <motion.button 
             animate={{ scale: userScale }}
             onMouseDown={() => {
                const interval = setInterval(() => {
                   setUserScale(s => Math.min(4, s + 0.1));
                }, 50);
                (window as any)._calmInterval = interval;
             }}
             onMouseUp={() => {
                clearInterval((window as any)._calmInterval);
                const diff = Math.abs(userScale - targetScale);
                if (diff < 0.3) {
                  setScore(s => s + 40);
                  play('success');
                } else {
                  setScore(s => Math.max(0, s - 10));
                  play('click');
                }
                spawnRound();
             }}
             className="w-40 h-40 bg-indigo-500 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.6)] flex items-center justify-center z-20 transition-transform duration-100"
           >
              <span className="text-4xl text-white font-black italic">{Math.round(userScale * 10)}</span>
           </motion.button>
           
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
