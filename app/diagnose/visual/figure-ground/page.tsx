'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

const ICONS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🏀', '⚽', '🎾', '🎸', '✈️', '🚗', '🚢', '🧸', '🎮', '💡'];
const DISTRACTORS = ['📍', '📌', '📦', '🖊️', '🧶', '🧵', '🧷', '🖇️', '📰', '🧳', '📎', '👓', '🧢', '🧶'];

export default function FigureGroundTest() {
  const { play } = useSound();
  const [target, setTarget] = useState('');
  const [grid, setGrid] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  
  const spawnGrid = useCallback((difficulty: number) => {
    // difficulty 1-10
    const size = Math.min(64, 16 + difficulty * 6);
    const newTarget = ICONS[Math.floor(Math.random() * ICONS.length)];
    const newGrid = Array.from({ length: size }, () => DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]);
    
    const targetIdx = Math.floor(Math.random() * size);
    newGrid[targetIdx] = newTarget;
    
    setTarget(newTarget);
    setGrid(newGrid);
    setFeedback('none');
  }, []);

  const handlePick = (emoji: string, setScore: any, recordInteraction: any, difficulty: number) => {
    if (feedback !== 'none') return;

    const isCorrect = emoji === target;
    
    recordInteraction({
      isCorrect,
      timestampDisplayed: Date.now(),
      timestampResponded: Date.now(),
      responseDuration: 0,
      itemDifficulty: difficulty,
      responseValue: emoji,
      metadata: { targetEmoji: target, clickedEmoji: emoji }
    });

    if (isCorrect) {
      setScore((s: number) => s + 50);
      play('success');
      setFeedback('correct');
    } else {
      play('click');
      setFeedback('wrong');
    }

    setTimeout(() => spawnGrid(difficulty), 800);
  };

  return (
    <ClinicalPlayerEngine
      title="الإدراك البصري (الشكل والأرضية)"
      category="figure_ground"
      domainId="visual"
      description="تقييم التمييز بين الشكل والخلفية والبحث البصري المنظم."
      instruction="المهمة: ابحث عن الشكل المطلوب والموجود في أعلى الشاشة داخل مجموعة الأشكال المزدحمة بالأسفل."
      icon="🕵️‍♂️"
      color="orange"
      onComplete={() => {}}
    >
      {({ setScore, recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full h-full relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">المطلوب</span>
              <div className="w-32 h-32 bg-slate-900 rounded-3xl border-4 border-orange-500/30 flex items-center justify-center text-6xl shadow-2xl">
                {target}
              </div>
           </div>

           <div className="mt-48 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-w-2xl mx-auto">
             {grid.map((emoji, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePick(emoji, setScore, recordInteraction, difficulty)}
                  className={`aspect-square bg-slate-900/40 rounded-xl flex items-center justify-center text-3xl border border-white/5 hover:border-orange-500/40 transition-all ${
                    feedback === 'correct' && emoji === target ? 'bg-emerald-500/20 border-emerald-500 !text-4xl' : 
                    feedback === 'wrong' && emoji !== target ? 'opacity-20' : ''
                  }`}
                >
                  {emoji}
                </motion.button>
             ))}
           </div>
           
           <div className="mt-12 text-slate-700 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic text-center">
             Visual Search Density: {grid.length} items | Clinical Protocol v2.4
           </div>

           <GameTrigger gameState={gameState} onStart={() => spawnGrid(difficulty)} />
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
