'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { getStudentProfile, saveTestSession } from '@/lib/studentProfile';
import { ClinicalScoringEngine } from '@/lib/domain/scoring/engine';
import { TestSession } from '@/lib/types';

export default function VisualTrackingTest() {
  const handleComplete = (score: number, metrics: any) => {
    const student = getStudentProfile();
    const session: TestSession = {
      id: `visual-${Date.now()}`,
      testId: 'visual-tracking',
      testCategory: 'visual',
      testTitle: 'التتبع البصري الحركي (Smooth Pursuit)',
      domainId: 'visual',
      interactions: metrics.interactions,
      rawScore: score,
      completedAt: new Date().toISOString(),
      preTestReadiness: null,
      rounds: [],
      attention: { tabSwitchCount: 0, inactivityCount: 0, totalTestDurationMs: 120000 },
      emotional: { frustrationEvents: 0, impulsivityEvents: 0 },
      postAnalysis: null,
    };

    session.postAnalysis = ClinicalScoringEngine.analyze(session, student);
    saveTestSession(session);
  };

  return (
    <ClinicalPlayerEngine
      title="التتبع البصري الحركي (Smooth Pursuit)"
      category="visual_tracking"
      domainId="visual"
      description="تقييم القدرة على مطاردة هدف متحرك بدقة وتنسيق العين واليد (Smooth Pursuit Logic)."
      instruction="المهمة: حاول إبقاء المؤشر (أو إصبعك) بدقة فوق الكرة المضيئة المتحركة لأطول فترة ممكنة. لا تجعلها تبتعد عنك!"
      icon="👁️‍🗨️"
      color="cyan"
      onComplete={handleComplete}
      duration={120}
    >
      {(engineProps: any) => <TrackingModule {...engineProps} />}
    </ClinicalPlayerEngine>
  );
}

function TrackingModule({ recordInteraction, difficulty, gameState, finishTest, setScore, nextRound }: any) {
  const { play } = useSound();
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const trialStartTime = useRef<number>(0);
  const speedRef = useRef(0.015);

  const moveTarget = useCallback(() => {
    setTargetPos(prev => {
      const time = performance.now() / 1000;
      const x = 50 + Math.sin(time * speedRef.current * 120) * 38;
      const y = 50 + Math.cos(time * speedRef.current * 100) * 32;
      return { x, y };
    });
    animationRef.current = requestAnimationFrame(moveTarget);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current || gameState !== 'playing') return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;

    const dist = Math.sqrt(Math.pow(cx - targetPos.x, 2) + Math.pow(cy - targetPos.y, 2));
    const hitRadius = Math.max(6.5, 12 - difficulty * 0.8);

    if (dist >= hitRadius) {
       play('click');
       nextRound({
         isCorrect: false,
         responseValue: 'miss',
         metadata: { dist, missType: 'click_outside' }
       });
    } else {
       handlePointerMove(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || gameState !== 'playing') return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * 100;
    const cy = ((e.clientY - rect.top) / rect.height) * 100;

    const dist = Math.sqrt(Math.pow(cx - targetPos.x, 2) + Math.pow(cy - targetPos.y, 2));
    const hitRadius = Math.max(6.5, 12 - difficulty * 0.8);
    
    speedRef.current = 0.012 + (difficulty * 0.008);

    if (dist < hitRadius) {
      if (!isFollowing) {
        setIsFollowing(true);
        play('click');
      }
      const newHitCount = hitCount + 1;
      setHitCount(newHitCount);
      
      if (newHitCount % 8 === 0) {
        nextRound({
          isCorrect: true,
          timestampDisplayed: trialStartTime.current,
          timestampResponded: performance.now(),
          responseValue: 'tracking_active',
          itemDifficulty: difficulty,
          metadata: { dist, precision: 1 - (dist/hitRadius) }
        });
      }
    } else {
      setIsFollowing(false);
    }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      trialStartTime.current = performance.now();
      animationRef.current = requestAnimationFrame(moveTarget);
    } else {
       if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [gameState, moveTarget]);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setTimeout(() => {
        finishTest('duration_limit');
      }, 45000);
      return () => clearTimeout(timer);
    }
  }, [gameState, finishTest]);

  return (
    <div className="w-full flex flex-col items-center">
       <div 
         ref={containerRef}
         onPointerMove={handlePointerMove}
         onPointerDown={handlePointerDown}
         className="relative w-full max-w-5xl h-[38rem] bg-slate-950 border-4 border-slate-900 rounded-[5rem] shadow-[inset_0_0_150px_rgba(0,0,0,1)] overflow-hidden cursor-crosshair touch-none"
       >
          <motion.div
            className={`absolute w-16 h-16 rounded-full flex items-center justify-center ${
              isFollowing ? 'bg-cyan-400 shadow-[0_0_80px_30px_rgba(34,211,238,0.5)] scale-110' : 'bg-slate-800 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-100'
            } transition-[transform,shadow] duration-150`}
            style={{ 
              left: `${targetPos.x}%`, 
              top: `${targetPos.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
             <div className={`w-6 h-6 bg-white rounded-full ${isFollowing ? 'animate-pulse' : 'opacity-20'}`} />
             {isFollowing && <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-ping" />}
          </motion.div>

          <div className="absolute top-12 left-14 flex flex-col gap-1 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-cyan-900">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isFollowing ? 'bg-cyan-500 animate-pulse' : 'bg-slate-800'}`} />
                <span>Lock: {isFollowing ? 'Engaged' : 'Searching'}</span>
             </div>
             <div>Module: SmoothPursuit_v1</div>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[length:60px_60px]" />
       </div>

       <div className="mt-16 flex items-center justify-center gap-16 px-16 py-8 bg-slate-900/40 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center">
             <div className="text-slate-400 text-[0.7rem] font-black uppercase tracking-[0.2em] mb-3">Oculomotor Precision</div>
             <div className={`text-5xl font-black transition-all ${isFollowing ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'text-slate-700 opacity-40'}`}>
                {Math.min(100, Math.round(hitCount / 12))}%
             </div>
          </div>
          <div className="w-[2px] h-14 bg-white/5" />
          <div className="flex flex-col items-center">
             <div className="text-slate-400 text-[0.7rem] font-black uppercase tracking-[0.2em] mb-3 font-arabic">سرعة المتتبع</div>
             <div className="text-5xl font-black text-white">
                x{difficulty.toFixed(1)}
             </div>
          </div>
       </div>

       <div className="mt-20 text-slate-700 text-[0.6rem] font-black uppercase tracking-[0.5em] italic text-center">
         Vigilance Tracking Protocol Enabled // Signal Stable
       </div>
    </div>
  );
}