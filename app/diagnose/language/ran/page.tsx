'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// RAN/RAS Standard Stimuli Sets
const RAN_LEVELS = [
  { id: 'colors', name: 'الألوان (Colors)', pool: ['🟥', '🟦', '🟩', '🟨', '🟧'], size: 10, difficulty: 1 },
  { id: 'objects', name: 'الأشياء (Objects)', pool: ['🚗', '🍎', '🐱', '👟', '🎈'], size: 15, difficulty: 2 },
  { id: 'letters', name: 'الحروف (Letters)', pool: ['أ', 'ب', 'ج', 'د', 'هـ'], size: 20, difficulty: 3 },
  { id: 'digits', name: 'الأرقام (Digits)', pool: ['1', '2', '3', '4', '5'], size: 20, difficulty: 4 },
];

export default function RANTest() {
  const { play } = useSound();
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [grid, setGrid] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  const levelStartTime = useRef<number>(0);
  const lastItemTime = useRef<number>(0);
  const itemLatencies = useRef<number[]>([]);

  const generateGrid = useCallback(() => {
    const level = RAN_LEVELS[currentLevelIdx];
    const newGrid = Array.from({ length: level.size }, () => 
      level.pool[Math.floor(Math.random() * level.pool.length)]
    );
    setGrid(newGrid);
    setCurrentIdx(0);
    levelStartTime.current = performance.now();
    lastItemTime.current = performance.now();
    itemLatencies.current = [];
    setHasStarted(true);
  }, [currentLevelIdx]);

  const handleStimulusClick = (index: number, recordInteraction: any, difficulty: number) => {
    if (index !== currentIdx) return; // Must name in order

    const now = performance.now();
    const latency = now - lastItemTime.current;
    itemLatencies.current.push(latency);
    lastItemTime.current = now;

    play('click');
    
    // Record interaction for every naming event to capture naming speed/hesitation
    recordInteraction({
      isCorrect: true,
      timestampDisplayed: levelStartTime.current,
      timestampResponded: now,
      responseValue: grid[index],
      itemDifficulty: difficulty,
      metadata: { 
        latency,
        level: RAN_LEVELS[currentLevelIdx].id,
        itemPos: index 
      }
    });

    if (currentIdx + 1 === grid.length) {
      play('success');
      
      if (currentLevelIdx + 1 < RAN_LEVELS.length) {
        setTimeout(() => {
           setCurrentLevelIdx(prev => prev + 1);
           setHasStarted(false);
        }, 1000);
      } else {
        // ClinicalPlayerEngine will handle final completion
      }
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  return (
    <ClinicalPlayerEngine
      title="التسمية السريعة (RAN/RAS Test)"
      category="language_ran"
      domainId="language"
      description="قياس سرعة استرجاع المعلومات البصرية واللفظية (معيار RAN/RAS لتشخيص عسر القراءة)."
      instruction="المهمة: انطق اسم كل رمز تراه في الجدول بالترتيب من اليمين لليسار، واضغط عليه فور نطقه بأسرع ما يمكن!"
      icon="⏱️"
      color="cyan"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="mb-12 flex justify-between w-full max-w-5xl items-center bg-slate-950/50 p-10 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-xl">
             <div className="flex flex-col items-start gap-1">
                <span className="text-blue-400 font-black text-[0.6rem] uppercase tracking-[0.3em]">المستوى الحالي</span>
                <span className="text-3xl font-bold text-white font-arabic">
                  {RAN_LEVELS[currentLevelIdx].name}
                </span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-slate-500 font-black text-[0.6rem] uppercase tracking-[0.3em]">التقدم</span>
                <span className="text-4xl font-black text-blue-500 font-mono tracking-tighter">
                   {String(currentIdx + 1).padStart(2, '0')} / {String(grid.length).padStart(2, '0')}
                </span>
             </div>
             <div className="hidden md:flex flex-col items-end gap-1">
                <span className="text-emerald-500 font-black text-[0.6rem] uppercase tracking-[0.3em]">متوسط السرعة</span>
                <span className="text-xl font-bold text-slate-300">
                  {itemLatencies.current.length > 0 
                    ? (itemLatencies.current.reduce((a, b) => a + b, 0) / itemLatencies.current.length / 1000).toFixed(2)
                    : '0.00'} ms
                </span>
             </div>
          </div>

          <div className="grid grid-cols-5 gap-6 bg-slate-900/20 p-10 rounded-[4rem] border border-white/5 shadow-inner w-full max-w-5xl">
            <AnimatePresence mode="popLayout">
              {grid.map((stim, i) => (
                <motion.button
                  key={`${currentLevelIdx}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: i < currentIdx ? 0.3 : 1, 
                    scale: i === currentIdx ? 1.1 : 1,
                    filter: i < currentIdx ? 'grayscale(100%)' : 'none'
                  }}
                  whileHover={i === currentIdx ? { scale: 1.15 } : {}}
                  whileTap={i === currentIdx ? { scale: 0.95 } : {}}
                  onClick={() => handleStimulusClick(i, recordInteraction, difficulty)}
                  className={`aspect-square text-6xl rounded-3xl transition-all duration-300 flex items-center justify-center border-4 relative overflow-hidden
                    ${i === currentIdx ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.4)] z-10' : 
                      i < currentIdx ? 'bg-slate-900 border-white/5 grayscale pointer-events-none' : 
                      'bg-slate-900 border-white/10 opacity-80'}`}
                >
                   <span className={isNaN(Number(stim)) ? 'text-7xl' : 'text-7xl font-black text-white font-mono'}>
                     {stim}
                   </span>
                   {i === currentIdx && <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-16 flex items-center gap-10">
             <div className="flex flex-col items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                <span className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[0.6rem]">Processing Speed Telemetry: Active</span>
             </div>
          </div>

          <GameTrigger gameState={gameState} hasStarted={hasStarted} onStart={generateGrid} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, hasStarted, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing' && !hasStarted) {
      onStart();
    }
  }, [gameState, hasStarted, onStart]);
  return null;
}