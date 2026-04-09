'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function FigureGroundTest() {
  const { play } = useSound();
  const [grid, setGrid] = useState<string[]>([]);
  const [target, setTarget] = useState<string>('');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  
  const ICONS = ['🎯', '💎', '🔑', '⭐', '🍀', '🍎', '🐱', '🚀'];
  const DISTRACTORS = ['🌿', '🍂', '🌾', '🌱', '🌵', '🌴', '🌻', '🍃', '🌫️', '☁️', '❄️'];

  const spawnGrid = useCallback((difficulty: number) => {
    const size = Math.min(64, 16 + difficulty * 6);
    const newTarget = ICONS[Math.floor(Math.random() * ICONS.length)];
    const newGrid = Array.from({ length: size }, () => DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]);
    
    const targetIdx = Math.floor(Math.random() * size);
    newGrid[targetIdx] = newTarget;
    
    setTarget(newTarget);
    setGrid(newGrid);
    setFeedback('none');
  }, []);

  const handlePick = (emoji: string, setScore: any, nextRound: any, difficulty: number) => {
    if (feedback !== 'none') return;

    if (emoji === target) {
      setScore((s: number) => s + 50);
      play('success');
      setFeedback('correct');
      nextRound(true);
    } else {
      play('click');
      setFeedback('wrong');
      nextRound(false);
    }

    setTimeout(() => spawnGrid(difficulty), 800);
  };

  return (
    <ClinicalPlayerEngine
      title="الإدراك بين الشكل والأرضية (Figure-Ground)"
      category="visual_figure_ground"
      domainId="visual"
      description="تقييم القدرة على عزل المثير البصري المستهدف عن الخلفية المزدحمة وتحديد موقعه."
      instruction="المهمة: ابحث عن الشكل المطلوب الموضح في الأعلى وسط الغابة الكبيرة المزدحمة واضغط عليه بأسرع ما يمكن."
      icon="🕵️‍♂️"
      color="rose"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           
           <div className="mb-10 p-6 bg-slate-900/60 border-2 border-rose-500/30 rounded-[3rem] shadow-2xl flex items-center gap-6 animate-bounce">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">ابحـث عـن:</span>
              <span className="text-6xl">{target}</span>
           </div>

           <div className="w-full max-w-4xl bg-slate-950/80 border-4 border-slate-900 rounded-[4rem] p-10 shadow-[inset_0_0_100px_rgba(0,0,0,1)] overflow-hidden relative">
              <div className="flex flex-wrap justify-center gap-4">
                 {grid.map((emoji, i) => (
                    <motion.button
                      key={`${difficulty}-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handlePick(emoji, setScore, nextRound, difficulty)}
                      className={`text-4xl md:text-5xl p-2 transition-all filter drop-shadow-lg ${
                        feedback === 'correct' && emoji === target ? 'bg-emerald-500/20 rounded-2xl scale-150' :
                        feedback === 'wrong' && emoji !== target ? 'opacity-20 blur-[2px]' : ''
                      }`}
                    >
                       {emoji}
                    </motion.button>
                 ))}
              </div>
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
           </div>

           <GameTrigger gameState={gameState} onStart={() => spawnGrid(difficulty)} />
           
           <div className="mt-12 text-slate-700 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic text-center">
             Visual Search Density: {grid.length} items | Clinical Protocol v2.4
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
