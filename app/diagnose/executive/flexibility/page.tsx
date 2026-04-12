'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// --- STIMULI CONFIG ---
const SHAPES = ['▲', '■', '●', '★'];
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
const RULES = ['color', 'shape', 'count'] as const;

type Rule = typeof RULES[number];

export default function FlexibilityTest() {
  const { play } = useSound();
  const [target, setTarget] = useState({ shape: '', color: '', count: 1 });
  const [rule, setRule] = useState<Rule>('color');
  const [lastRule, setLastRule] = useState<Rule | null>(null);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [trialCount, setTrialCount] = useState(0);
  
  const correctInARow = useRef(0);
  const trialStartTime = useRef<number>(0);

  const generateTarget = useCallback(() => {
    setTarget({
      shape: SHAPES[Math.floor(Math.random() * 4)],
      color: COLORS[Math.floor(Math.random() * 4)],
      count: Math.floor(Math.random() * 4) + 1
    });
    setFeedback('none');
    trialStartTime.current = performance.now();
  }, []);

  const handleChoice = (choice: any, recordInteraction: any, difficulty: number) => {
    const now = performance.now();
    const isCorrect = 
      rule === 'color' ? choice.color === target.color :
      rule === 'shape' ? choice.shape === target.shape :
      choice.count === target.count;

    // Detect error type for WCST clinical scoring
    let errorType = 'none';
    if (!isCorrect) {
      const wasCorrectUnderLastRule = lastRule && (
        lastRule === 'color' ? choice.color === target.color :
        lastRule === 'shape' ? choice.shape === target.shape :
        choice.count === target.count
      );
      errorType = wasCorrectUnderLastRule ? 'perseverative' : 'random';
    }

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: JSON.stringify(choice),
      itemDifficulty: difficulty,
      metadata: { 
        activeRule: rule,
        errorType,
        correctInARow: correctInARow.current
      }
    });

    if (isCorrect) {
      play('success');
      setFeedback('correct');
      correctInARow.current += 1;
    } else {
      play('click');
      setFeedback('wrong');
      correctInARow.current = 0;
    }

    // Rule Shift Logic (WCST Standard: Shift after 5-8 correct in a row)
    const threshold = 5 + Math.floor(difficulty); 
    if (isCorrect && correctInARow.current >= threshold) {
      const otherRules = RULES.filter(r => r !== rule);
      const nextRule = otherRules[Math.floor(Math.random() * otherRules.length)];
      setLastRule(rule);
      setRule(nextRule);
      correctInARow.current = 0;
      // In a real clinical test, we DON'T tell them the rule changed, they must infer it from feedback
    }

    setTrialCount(prev => prev + 1);
    
    // Longer delay for errors to let child process the "Wrong" feedback
    const nextTrialDelay = isCorrect ? 800 : 1500;
    setTimeout(generateTarget, nextTrialDelay);
  };

  const options = [
    { shape: '▲', color: '#ef4444', count: 1 },
    { shape: '■', color: '#3b82f6', count: 2 },
    { shape: '●', color: '#22c55e', count: 3 },
    { shape: '★', color: '#eab308', count: 4 },
  ];

  return (
    <ClinicalPlayerEngine
      title="المرونة الذهنية (WCST Protocol)"
      category="executive_flexibility"
      domainId="executive"
      description="تقييم القدرة على التكيف مع القواعد المتغيرة وحل المشكلات (Wisconsin Card Sorting Test)."
      instruction="المهمة: اكتشف القاعدة السرية! اختر الصندوق الذي تعتقد أنه يناسب البطاقة العلوية. انتبه للتعليق (صحيح/خطأ) لتعرف إن كانت القاعدة قد تغيرت!"
      icon="🔄"
      color="fuchsia"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="h-80 mb-12 relative w-full flex items-center justify-center shrink-0">
             <AnimatePresence mode="wait">
                {gameState === 'playing' && target.shape && (
                  <motion.div
                    key={`${trialCount}-${target.shape}`}
                    initial={{ y: -50, opacity: 0, rotateY: 180 }}
                    animate={{ y: 0, opacity: 1, rotateY: 0 }}
                    exit={{ x: feedback === 'correct' ? 300 : -300, opacity: 0, rotate: feedback === 'correct' ? 20 : -20 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    className={`bg-slate-900 w-48 h-64 rounded-[2.5rem] border-4 flex flex-col items-center justify-center gap-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-6 z-20 transition-colors duration-300 ${
                      feedback === 'correct' ? 'border-emerald-500 shadow-emerald-500/20 bg-emerald-950/20' : 
                      feedback === 'wrong' ? 'border-rose-500 shadow-rose-500/20 bg-rose-950/20' : 'border-white/10'
                    }`}
                  >
                     <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: target.count }).map((_, i) => (
                          <span key={i} className="text-6xl drop-shadow-lg select-none" style={{ color: target.color }}>{target.shape}</span>
                        ))}
                     </div>
                     
                     {feedback !== 'none' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`absolute -bottom-10 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest ${feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
                        >
                          {feedback === 'correct' ? 'ممتاز!' : 'حاول مرة أخرى!'}
                        </motion.div>
                     )}
                  </motion.div>
                )}
             </AnimatePresence>
             
             {/* Visual HUD */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[30rem] h-[30rem] border border-white/5 rounded-full animate-spin-slow" />
                <div className="w-[20rem] h-[20rem] border border-fuchsia-500/10 rounded-full animate-reverse-spin" />
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl">
             {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(opt, recordInteraction, difficulty)}
                  className="bg-slate-900/40 border-2 border-white/5 p-8 rounded-[3rem] flex flex-col items-center justify-center gap-3 min-h-[14rem] hover:border-fuchsia-500/40 hover:bg-slate-900/60 transition-all shadow-xl group"
                >
                   <div className="grid grid-cols-2 gap-2 group-hover:scale-110 transition-transform duration-300">
                      {Array.from({ length: opt.count }).map((_, j) => (
                        <span key={j} className="text-4xl drop-shadow-md" style={{ color: opt.color }}>{opt.shape}</span>
                      ))}
                   </div>
                   <div className="mt-6 w-16 h-1.5 bg-white/5 rounded-full group-hover:bg-fuchsia-500/20 transition-colors" />
                </motion.button>
             ))}
          </div>

          <div className="mt-20 flex justify-center w-full">
             <div className="flex items-center gap-10 px-12 py-4 bg-slate-950/50 rounded-full border border-white/5 backdrop-blur-md">
                <div className="flex gap-3">
                   {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i < correctInARow.current ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-800'}`} />
                   ))}
                </div>
                <span className="text-slate-500 text-[0.6rem] font-black uppercase tracking-[0.4em] font-arabic">سلسلة النجاح الاستنتاجي</span>
             </div>
          </div>

          <GameTrigger gameState={gameState} trialCount={trialCount} onStart={generateTarget} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, trialCount, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing' && trialCount === 0) {
      onStart();
    }
  }, [gameState, onStart]);
  return null;
}