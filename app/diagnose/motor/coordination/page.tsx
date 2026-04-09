'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function MotorCoordinationTest() {
  const { play } = useSound();
  const [path, setPath] = useState<{ x: number, y: number }[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isTracing, setIsTracing] = useState(false);
  const [deviationPoints, setDeviationPoints] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const trialStartTime = useRef<number>(0);

  const generatePath = useCallback((difficulty: number) => {
    // Standard Beery-VMI Path Complexity
    const points = [];
    const segments = 12 + (difficulty * 4);
    for (let i = 0; i <= segments; i++) {
        const x = 10 + (i / segments) * 80;
        // Sinusoidal complexity increases with difficulty
        const amplitude = 12 + (difficulty * 3.5);
        const frequency = 0.5 + (difficulty * 0.1);
        const y = 50 + Math.sin(i * frequency) * amplitude;
        points.push({ x, y });
    }
    setPath(points);
    setIsTracing(false);
    setDeviationPoints(0);
    trialStartTime.current = performance.now();
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsTracing(true);
    play('click');
  };

  const handlePointerMove = (e: React.PointerEvent, recordInteraction: any, difficulty: number) => {
    if (!isTracing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCursorPos({ x, y });

    // Precise Collision Detection
    let minDist = 100;
    path.forEach(p => {
        const d = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
        if (d < minDist) minDist = d;
    });

    const threshold = Math.max(1.8, 7.5 - difficulty * 0.6); 
    if (minDist > threshold) {
        setDeviationPoints(prev => prev + 1);
    }

    // Check if reached end
    if (x > 85) {
        const now = performance.now();
        const accuracy = Math.max(0, 100 - (deviationPoints / 5));
        const isCorrect = accuracy > 70;

        recordInteraction({
          isCorrect,
          timestampDisplayed: trialStartTime.current,
          timestampResponded: now,
          responseDuration: now - trialStartTime.current,
          itemDifficulty: difficulty,
          metadata: { accuracy, deviations: deviationPoints }
        });

        play('success');
        setIsTracing(false);
        setTimeout(() => generatePath(difficulty), 1200);
    }
  };

  return (
    <ClinicalPlayerEngine
      title="التآزر الحركي البصري (Beery-VMI Coordination)"
      category="motor_coordination"
      domainId="motor"
      description="تقييم دقة التحكم الحركي الدقيق والتكامل بين الإدراك البصري والاستجابة الحركية."
      instruction="المهمة: ارسم خطاً متصلاً داخل المسار المظلل من نقطة البداية إلى النهاية. حاول البقاء في المنتصف بدقة."
      icon="✍️"
      color="emerald"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           
           <div 
             ref={containerRef}
             onPointerDown={handlePointerDown}
             onPointerMove={(e) => handlePointerMove(e, recordInteraction, difficulty)}
             onPointerUp={() => setIsTracing(false)}
             className="relative w-full max-w-5xl h-[36rem] bg-slate-950 border-4 border-slate-900 rounded-[5rem] shadow-[inset_0_0_150px_rgba(0,0,0,1)] overflow-hidden cursor-none touch-none"
           >
              {/* Guidance Path Shade */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path 
                  d={`M ${path.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.08)"
                  strokeWidth={Math.max(3.5, 8.5 - difficulty * 0.6) + "%"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path 
                  d={`M ${path.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.25)"
                  strokeWidth="2"
                  strokeDasharray="12 12"
                />
              </svg>

              {/* Start/End Terminals */}
              <div className="absolute left-[8%] top-[50%] -translate-y-1/2 w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center animate-pulse">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              </div>
              <div className="absolute right-[8%] top-[50%] -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                <div className="w-2 h-2 bg-slate-700 rounded-full" />
              </div>

              {/* Stylus Cursor */}
              {isTracing && (
                <motion.div
                  className="absolute w-12 h-12 rounded-full bg-emerald-400/20 border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.5)] pointer-events-none"
                  style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%`, x: '-50%', y: '-50%' }}
                />
              )}

              {/* High-Contrast Telemetry Overlays */}
              <div className="absolute top-10 right-14 flex flex-col items-end gap-2 text-slate-800 font-bold text-[0.6rem] uppercase tracking-[0.3em]">
                 <div className="flex items-center gap-2">
                    <span>Precision_Engine</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                 </div>
                 <div>VMI_CORE_v2.4</div>
              </div>
           </div>

           <GameTrigger gameState={gameState} onStart={() => generatePath(difficulty)} />

           <div className="mt-12 flex gap-12 items-center px-12 py-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <div className="flex flex-col items-center">
                 <span className="text-slate-500 text-[0.6rem] font-bold mb-2 uppercase tracking-widest">معدل الانحياز</span>
                 <span className={`text-4xl font-black ${deviationPoints > 20 ? 'text-rose-500' : 'text-emerald-500'}`}>{deviationPoints}</span>
              </div>
              <div className="w-[1px] h-12 bg-white/5" />
              <div className="flex flex-col items-center">
                 <span className="text-slate-500 text-[0.6rem] font-bold mb-2 uppercase tracking-widest">الدقة الحركية</span>
                 <span className="text-4xl font-black text-white">{Math.max(0, Math.round(100 - (deviationPoints / 5)))}%</span>
              </div>
           </div>

           <div className="mt-16 text-slate-700 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic text-center">
             Clinical Motor Integration Protocol | Deviation Analysis x{difficulty}
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
