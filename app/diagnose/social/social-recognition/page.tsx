'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

/**
 * Social Recognition (Theory of Mind) - Clinical Adaptation
 * ---------------------------------------------------------
 * Measures social-emotional reciprocity and emotion recognition.
 * Telemetry: Recognition RT, Confusion Matrix, Hesitation.
 */

const EMOTION_STIMULI = [
  { id: 'happy', icon: '😊', label: 'سعيد', distractors: ['غاضب', 'حزين', 'قلق'], difficulty: 1 },
  { id: 'sad', icon: '😢', label: 'حزين', distractors: ['سعيد', 'بخير', 'متحمس'], difficulty: 1 },
  { id: 'angry', icon: '😠', label: 'غاضب', distractors: ['خائف', 'حزين', 'ملّان'], difficulty: 2 },
  { id: 'fear', icon: '😨', label: 'خائف', distractors: ['غاضب', 'مندهش', 'سعيد'], difficulty: 3 },
  { id: 'surprise', icon: '😲', label: 'مندهش', distractors: ['سعيد', 'خائف', 'بخير'], difficulty: 3 },
  { id: 'bored', icon: '😑', label: 'ملّان', distractors: ['حزين', 'هادئ', 'متعب'], difficulty: 4 },
  { id: 'thinking', icon: '🤔', label: 'يفكر', distractors: ['قلق', 'مندهش', 'ملّان'], difficulty: 5 },
];

export default function SocialRecognitionTest() {
  const { play } = useSound();
  const [current, setCurrent] = useState<typeof EMOTION_STIMULI[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const trialStartRef = useRef<number>(0);

  const spawnTrial = useCallback((difficulty: number) => {
    const pool = EMOTION_STIMULI.filter(s => s.difficulty <= Math.ceil(difficulty));
    const random = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrent(random);
    setOptions([random.label, ...random.distractors].sort(() => Math.random() - 0.5));
    trialStartRef.current = Date.now();
  }, []);

  const handleAnswer = (choice: string, recordInteraction: any, difficulty: number) => {
    if (!current) return;
    
    const isCorrect = choice === current.label;
    if (isCorrect) play('success');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: choice,
      metadata: { 
        target: current.id, 
        choice, 
        isComplex: current.difficulty > 3,
        hesitation: (Date.now() - trialStartRef.current) > 4000
      }
    });

    setTimeout(() => spawnTrial(difficulty), 1000);
  };

  return (
    <ClinicalPlayerEngine
      title="تمييز المشاعر (AI Robot)"
      category="social_recognition"
      domainId="social-cognition"
      description="اكتشف مشاعر الروبوت بصير من تعابير وجهه! تقييم عيادي شامل لمهارات التمييز الاجتماعي."
      instruction="المهمة: انظر لتعابير الروبوت 'بصير'.. ماذا يشعر الآن؟ اختر الشعور الصحيح."
      icon="🎭"
      color="pink"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="relative mb-16 h-64 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {current && gameState === 'playing' && (
                <motion.div
                  key={current.id}
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-[12rem] drop-shadow-[0_0_50px_rgba(244,114,182,0.3)] bg-slate-900/50 p-12 rounded-[5rem] border-4 border-white/5"
                >
                  {current.icon}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Clinical Scan Lines Animation */}
            <div className="absolute inset-0 pointer-events-none border-2 border-pink-500/10 rounded-[6rem] overflow-hidden">
               <motion.div 
                 animate={{ top: ['0%', '100%'] }} 
                 transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                 className="absolute left-0 right-0 h-1 bg-pink-500/20 blur-sm"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl px-4">
            {options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(opt, recordInteraction, difficulty)}
                className="bg-slate-900 border-4 border-slate-800 hover:border-pink-500 rounded-[2.5rem] p-10 text-4xl font-black text-white transition-all shadow-xl hover:shadow-pink-500/20"
              >
                {opt}
              </motion.button>
            ))}
          </div>

          <GameTrigger 
            gameState={gameState} 
            onStart={() => spawnTrial(difficulty)} 
          />
          
          <div className="mt-12 text-pink-600/30 text-[9px] uppercase tracking-[0.4em] font-mono">
            Affective Processing Unit // SOC_COG_V2
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
