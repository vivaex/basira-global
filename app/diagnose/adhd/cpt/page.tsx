'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { TestSession } from '@/lib/types';
import { getStudentProfile, saveTestSession } from '@/lib/studentProfile';
import { ClinicalScoringEngine } from '@/lib/domain/scoring/engine';

export default function CPTTest() {
  const handleComplete = (score: number, metrics: any) => {
    const student = getStudentProfile();
    const session: TestSession = {
      id: `cpt-${Date.now()}`,
      testId: 'adhd-cpt',
      testCategory: 'adhd',
      testTitle: 'اختبار اليقظة المستمرة (CPT-3)',
      domainId: 'attention-vigilance',
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
      title="اختبار اليقظة (CPT-3)"
      category="adhd"
      domainId="attention-vigilance"
      description="تقييم عيادي لليقظة وكبح الاستجابة. (DSM-5 Standard)"
      instruction="المهمة: اضغط على الشاشة لكل الحروف .. ما عدا حرف 'X' لا تضغط عليه!"
      icon="🎯"
      color="rose"
      onComplete={handleComplete}
      duration={120}
    >
      {(engineProps: any) => <CPTModule {...engineProps} />}
    </ClinicalPlayerEngine>
  );
}

function CPTModule({ recordInteraction, difficulty, gameState, finishTest, setScore }: any) {
  const { play } = useSound();
  const [letter, setLetter] = useState<{ id: number, text: string, isX: boolean } | null>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const MAX_TRIALS = 30;
  
  const trialStartRef = useRef<number>(0);
  const touchTimeRef = useRef<number>(0);

  const handlePress = () => {
    if (!letter || hasResponded || gameState !== 'playing') return;
    setHasResponded(true);
    touchTimeRef.current = Date.now();
    
    const isCorrect = !letter.isX; 
    
    play('click');

    if (isCorrect) {
       setScore((s: number) => Math.min(100, s + 4)); 
    } else {
       setScore((s: number) => Math.max(0, s - 5));
    }

    recordInteraction({
       isCorrect: isCorrect,
       timestampDisplayed: trialStartRef.current,
       timestampFirstTouch: touchTimeRef.current,
       timestampResponded: touchTimeRef.current,
       responseValue: 'press',
       metadata: { 
         letter: letter.text, 
         wasX: letter.isX, 
         errorType: isCorrect ? null : 'commission',
         trial: currentTrial
       }
    });
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (currentTrial >= MAX_TRIALS) {
      finishTest('max_trials_reached');
      return;
    }

    const isi = Math.max(800, 2000 - (difficulty * 250));
    
    const timeout = setTimeout(() => {
      // Record Omission if no response for non-X
      if (letter && !hasResponded && !letter.isX) {
        recordInteraction({
          isCorrect: false,
          timestampDisplayed: trialStartRef.current,
          timestampResponded: Date.now(),
          responseValue: 'no_press',
          metadata: { letter: letter.text, errorType: 'omission', trial: currentTrial }
        });
        setScore((s: number) => Math.max(0, s - 2)); 
      }

      const isX = Math.random() < 0.20;
      const nonXs = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'J', 'K', 'L'];
      
      setLetter({
        id: Math.random(),
        text: isX ? 'X' : nonXs[Math.floor(Math.random() * nonXs.length)],
        isX
      });
      setHasResponded(false);
      trialStartRef.current = Date.now();
      setCurrentTrial(prev => prev + 1);

    }, isi);

    return () => clearTimeout(timeout);
  }, [gameState, currentTrial, difficulty, finishTest, letter, hasResponded, recordInteraction, setScore]);

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center cursor-pointer relative"
      onClick={handlePress}
    >
       <AnimatePresence mode="wait">
         {letter && gameState === 'playing' && (
           <motion.div
             key={letter.id}
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.2 }}
             className={`text-[12rem] font-black high-contrast-text diagnostic-stimulus font-dyslexic ${
               hasResponded 
                 ? (letter.isX ? 'text-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)]' : 'text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]') 
                 : 'text-white'
             }`}
           >
             {letter.text}
           </motion.div>
         )}
       </AnimatePresence>

       <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30">
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-cyan-400">Clinical Telemetry Active</div>
          </div>
          <div className="text-[0.5rem] font-bold text-white/50 lowercase tracking-widest">Trial {currentTrial} / {MAX_TRIALS}</div>
       </div>
    </div>
  );
}
