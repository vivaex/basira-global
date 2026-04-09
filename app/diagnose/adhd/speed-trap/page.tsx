'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// --- GO/NO-GO STIMULI ---
const GO_ICONS = ['👾', '🤖', '👻', '👽', '🛸'];
const NOGO_ICONS = ['💣', '🧨', '💥', '⚠️'];

export default function SpeedTrapTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, x: number, y: number, icon: string, isGo: boolean } | null>(null);
  const [speed, setSpeed] = useState(1500); // ISI (Adaptive)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isResponded = useRef(false);

  const spawnTarget = useCallback((setScore: any, nextRound: any) => {
    // 1. Omission Check (Missed a GO target)
    if (target && target.isGo && !isResponded.current) {
      nextRound(false); // Log as error
    }

    isResponded.current = false;
    const isGo = Math.random() > 0.3; // 70% Go, 30% No-Go
    
    const newTarget = {
      id: Math.random(),
      x: Math.random() * 70 + 15,
      y: Math.random() * 60 + 20,
      icon: isGo 
        ? GO_ICONS[Math.floor(Math.random() * GO_ICONS.length)] 
        : NOGO_ICONS[Math.floor(Math.random() * NOGO_ICONS.length)],
      isGo
    };

    setTarget(newTarget);

    // Target Persistence
    setTimeout(() => setTarget(null), 1000);

    // Next Trial
    timerRef.current = setTimeout(() => {
      spawnTarget(setScore, nextRound);
    }, speed);
  }, [target, speed]);

  const handleClick = (clickedGo: boolean, setScore: any, nextRound: any) => {
    if (isResponded.current || !target) return;
    isResponded.current = true;

    if (clickedGo) {
      setScore((s: number) => s + 15);
      play('success');
      nextRound(true);
      // Adaptive: Get faster
      setSpeed(prev => Math.max(700, prev - 50));
    } else {
      // Commission Error (Impulsivity)
      play('click');
      nextRound(false);
      // Adaptive: Slow down
      setSpeed(prev => Math.min(2500, prev + 100));
    }
    setTarget(null);
  };

  return (
    <ClinicalPlayerEngine
      title="فخ السرعة (Go/No-Go)"
      category="adhd_speed_trap"
      domainId="attention"
      description="تقييم عيادي للاستجابات الاندفاعية والقدرة على كبح الحركة (Response Inhibition)."
      instruction="المهمة: اضغط على الكائنات الفضائية 👾 بأسرع ما يمكن.. ولكن احذر القنابل 💣، لا تلمسها!"
      icon="⚡"
      color="rose"
      onComplete={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
      }}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full h-[40rem] relative overflow-hidden bg-slate-900/10 rounded-[4rem] border border-white/5 shadow-inner">
           {/* Space Background Elements */}
           <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute bottom-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-700" />
              <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
           </div>

           <AnimatePresence>
             {target && gameState === 'playing' && (
               <motion.button
                 key={target.id}
                 initial={{ scale: 0, opacity: 0, rotate: -45 }}
                 animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                 exit={{ scale: 0, opacity: 0 }}
                 whileHover={{ scale: 1.3 }}
                 whileTap={{ scale: 0.9 }}
                 style={{ left: `${target.x}%`, top: `${target.y}%` }}
                 className="absolute w-32 h-32 flex items-center justify-center text-7xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] z-20 cursor-crosshair"
                 onMouseDown={() => handleClick(target.isGo, setScore, nextRound)}
               >
                 {target.icon}
                 {/* Visual Hint for 'Go' targets in earlier trials could be added here if needed */}
               </motion.button>
             )}
           </AnimatePresence>
           
           <GameTrigger gameState={gameState} onStart={() => spawnTarget(setScore, nextRound)} />

           {/* Feedback Overlay (Optional) */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 font-bold uppercase tracking-widest text-xs">
              مؤشر السرعة: {(1000/speed).toFixed(1)} حزنة/ثانية
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
