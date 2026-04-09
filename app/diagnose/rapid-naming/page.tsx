'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useLanguage } from '@/app/components/LanguageContext';
import { getStudentProfile, saveTestSession } from '@/lib/studentProfile';
import { ClinicalScoringEngine } from '@/lib/domain/scoring/engine';
import { TestSession } from '@/lib/types';
import MicButton from '@/app/components/ui/MicButton';

const RAN_STIMULI = [
  { name: 'أزرق', english: 'blue', icon: '🟦', color: 'blue' },
  { name: 'أحمر', english: 'red', icon: '🟥', color: 'red' },
  { name: 'أصفر', english: 'yellow', icon: '🟨', color: 'yellow' },
  { name: 'أخضر', english: 'green', icon: '🟩', color: 'green' },
  { name: 'برتقالي', english: 'orange', icon: '🟧', color: 'orange' },
  { name: 'أرجواني', english: 'purple', icon: '🟪', color: 'purple' },
];

export default function RapidNamingTest() {
  const handleComplete = (score: number, metrics: any) => {
    const student = getStudentProfile();
    const session: TestSession = {
      id: `ran-${Date.now()}`,
      testId: 'rapid-naming',
      testCategory: 'rapid_naming',
      testTitle: 'التسمية السريعة (Rapid Naming)',
      domainId: 'processing-speed-ran',
      interactions: metrics.interactions,
      rawScore: score,
      completedAt: new Date().toISOString(),
      preTestReadiness: null,
      rounds: [],
      attention: { tabSwitchCount: 0, inactivityCount: 0, totalTestDurationMs: 60000 },
      emotional: { frustrationEvents: 0, impulsivityEvents: 0 },
      postAnalysis: null,
    };

    session.postAnalysis = ClinicalScoringEngine.analyze(session, student);
    saveTestSession(session);
  };

  return (
    <ClinicalPlayerEngine
      title="التسمية السريعة (Rapid Naming)"
      category="rapid_naming"
      domainId="processing-speed-ran"
      description="تقييم عيادي لطلاقة استرجاع المعلومة وسرعة المعالجة البصرية (معيار CTOPP-2)."
      instruction="المهمة: انطق اللون الذي تراه ثم اضغط على زر 'التالي' أو انتظر التعرف التلقائي."
      icon="⚡"
      color="amber"
      duration={60}
      onComplete={handleComplete}
    >
      {(engineProps: any) => <RapidNamingModule {...engineProps} />}
    </ClinicalPlayerEngine>
  );
}

function RapidNamingModule({ recordInteraction, gameState, finishTest, setScore }: any) {
  const { language } = useLanguage();
  const { play } = useSound();
  const [items, setItems] = useState<{ id: number, icon: string, name: string, english: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const trialStartRef = useRef<number>(0);
  const started = useRef(false);

  const spawnRound = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const sequence = Array.from({ length: 20 }, (_, i) => ({
      id: i + Math.random(),
      ...RAN_STIMULI[Math.floor(Math.random() * RAN_STIMULI.length)]
    })) as any[];
    
    setItems(sequence);
    setCurrentIndex(0);
    trialStartRef.current = Date.now();
  }, [gameState]);

  const handleNext = useCallback((transcript?: string) => {
    if (gameState !== 'playing' || !items[currentIndex]) return;
    
    const now = Date.now();
    const rt = now - trialStartRef.current;
    
    const target = language === 'ar' ? items[currentIndex].name : items[currentIndex].english;
    const isVoiceTriggered = !!transcript;
    
    recordInteraction({
      isCorrect: true, 
      timestampDisplayed: trialStartRef.current,
      timestampResponded: now,
      responseValue: transcript || 'manual_next',
      metadata: { 
        index: currentIndex, 
        target,
        transcript: transcript || null,
        voiceTriggered: isVoiceTriggered,
        hesitation: rt > 2000 
      }
    });

    play('click');

    if (currentIndex < items.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setScore(Math.round((nextIdx / items.length) * 100));
      trialStartRef.current = Date.now();
    } else {
      setScore(100);
      play('success');
    }
  }, [items, currentIndex, language, play, gameState, recordInteraction, setScore]);

  useEffect(() => {
    if (gameState === 'playing' && !started.current) {
      started.current = true;
      spawnRound();
    }
  }, [gameState, spawnRound]);

  return (
    <div className="w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {items[currentIndex] && (
            <motion.div
              key={items[currentIndex].id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="mb-8 flex flex-col items-center"
            >
              <div className="text-[12rem] md:text-[14rem] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {items[currentIndex].icon}
              </div>
              <h3 className="text-4xl font-black text-amber-400 italic mt-4 uppercase tracking-tighter">
                {language === 'ar' ? items[currentIndex].name : items[currentIndex].english}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-10">
          <MicButton 
            lang={language === 'ar' ? 'ar' : 'en'}
            label={language === 'ar' ? "انطق اللون" : "Say Color"}
            onTranscript={(text) => handleNext(text)}
            className={gameState !== 'playing' ? 'opacity-20 pointer-events-none' : ''}
          />

          <button 
            onClick={() => {
              if (currentIndex < items.length - 1) {
                handleNext();
              } else {
                setScore(100);
                finishTest('manual_finish');
              }
            }}
            disabled={gameState !== 'playing'}
            className="group relative bg-white/10 hover:bg-white/20 text-white px-20 py-6 rounded-[2rem] text-2xl font-black transition-all hover:scale-105 active:scale-95 border border-white/10"
          >
            {currentIndex < items.length - 1 
              ? (language === 'ar' ? 'التالي ⏭️' : 'Next ⏭️')
              : (language === 'ar' ? 'إنهاء الاختبار ✅' : 'Finish Test ✅')
            }
          </button>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="w-64 h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                animate={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              />
           </div>
           <div className="text-slate-500 font-black text-xs tracking-[0.3em] uppercase">
              Item {currentIndex + 1} of {items.length}
           </div>
        </div>

        <div className="mt-16 text-slate-800 text-[8px] font-black uppercase tracking-[0.5em] italic text-center max-w-xs">
           RAN-Latency Engine // v4.2 // Clinical Baseline Standardized
        </div>
    </div>
  );
}
