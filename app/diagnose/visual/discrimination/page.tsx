'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import DiscriminationGrid from '@/app/components/visuals/DiscriminationGrid';
import NeuralNetwork from '@/app/components/visuals/NeuralNetwork';

type SymbolType = 'torus' | 'octahedron' | 'dodecahedron' | 'icosahedron' | 'sphere';
const SYMBOLS: SymbolType[] = ['torus', 'octahedron', 'dodecahedron', 'icosahedron', 'sphere'];
const COLORS = ['#3b82f6', '#a855f7', '#22d3ee', '#10b981', '#f43f5e', '#f59e0b'];

export default function VisualDiscriminationTest() {
  const { play } = useSound();
  const [trialData, setTrialData] = useState<{
    targets: Array<{ type: SymbolType, color: string }>;
    options: Array<{ type: SymbolType, color: string, isMatch: boolean }>;
  } | null>(null);
  
  const trialStartTime = useRef<number>(0);

  const generateTrial = useCallback((difficulty: number) => {
    // Standard WISC-V Symbol Search Complexity
    const numTargets = difficulty < 4 ? 1 : 2;
    const numOptions = Math.min(6, 3 + Math.floor(difficulty / 2));
    
    const targets = Array.from({ length: numTargets }).map(() => ({
      type: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    const matchIdx = Math.floor(Math.random() * numOptions);
    const options = Array.from({ length: numOptions }).map((_, i) => {
      if (i === matchIdx) return { ...targets[Math.floor(Math.random() * targets.length)], isMatch: true };
      
      let type: SymbolType, color: string;
      do {
        type = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        color = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (targets.some(t => t.type === type && t.color === color));
      
      return { type, color, isMatch: false };
    });

    setTrialData({ targets, options });
    trialStartTime.current = performance.now();
  }, []);

  const handleSelect = (isMatch: boolean, recordInteraction: any, difficulty: number) => {
    if (!trialData) return;
    
    const now = performance.now();
    const rt = now - trialStartTime.current;
    
    recordInteraction({
      isCorrect: isMatch,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseDuration: rt,
      itemDifficulty: difficulty,
      responseValue: isMatch ? 'hit' : 'miss',
      metadata: { numTargets: trialData.targets.length, numOptions: trialData.options.length }
    });

    if (isMatch) {
      play('success');
    } else {
      play('click');
    }

    // Standard Processing Speed feedback: keep pulse minimal to maintain flow
    setTimeout(() => generateTrial(difficulty), 400);
  };

  return (
    <ClinicalPlayerEngine
      title="التمييز البصري وسرعة المعالجة (Symbol Search)"
      category="visual_discrimination"
      domainId="visual"
      description="قياس سرعة المعالجة البصرية والتمييز بين الأشكال المعقدة (WISC-V)."
      instruction="المهمة: ابحث عن أحد الرموز في المجموعة 'العلوية' المرجعية داخل المجموعة 'السفلية' واضغط عليه بأسرع ما يمكن."
      icon="⚡"
      color="cyan"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full h-full relative">
           {/* 3D Scene Background & Game Layer */}
           <div className="absolute inset-x-0 top-0 h-[48rem] bg-slate-950/40 rounded-[5rem] overflow-hidden border-2 border-white/5 z-0">
              <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Suspense fallback={null}>
                    <NeuralNetwork count={40} />
                    {trialData && gameState === 'playing' && (
                      <DiscriminationGrid
                        targets={trialData.targets}
                        options={trialData.options}
                        onSelect={(isMatch) => handleSelect(isMatch, recordInteraction, difficulty)}
                        difficulty={difficulty / 10}
                      />
                    )}
                </Suspense>
              </Canvas>
              
              {/* Overlay for Target Group Labelling (Ambient UI) */}
              <div className="absolute top-[32%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-50">
                 <div className="text-cyan-500 font-bold text-[0.6rem] uppercase tracking-[0.4em]">Reference_Set</div>
                 <div className="w-[30rem] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              </div>

              <div className="absolute top-[68%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-50">
                 <div className="text-slate-600 font-bold text-[0.6rem] uppercase tracking-[0.4em]">Action_Set</div>
                 <div className="w-[45rem] h-[1px] bg-gradient-to-r from-transparent via-slate-500/10 to-transparent" />
              </div>
           </div>

           <GameTrigger gameState={gameState} onStart={() => generateTrial(difficulty)} />
           
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-700 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic text-center w-full">
             WISC-PSI standard Integration | 3D Space processing v4.1
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