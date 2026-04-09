'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function LetterAlchemyTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, sound: string, letter: string } | null>(null);
  const [options, setOptions] = useState<{ letter: string }[]>([]);
  const trialStartRef = useRef<number>(0);

  const ALPHABET = [
    { sound: 'أ', letter: 'أ' }, { sound: 'ب', letter: 'ب' }, { sound: 'ت', letter: 'ت' },
    { sound: 'ث', letter: 'ث' }, { sound: 'ج', letter: 'ج' }, { sound: 'ح', letter: 'ح' },
  ];

  const spawnRound = useCallback((gameState?: string) => {
    if (gameState && gameState !== 'playing') return;

    const t = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    setTarget({ ...t, id: Math.random() });
    
    let opts = [t];
    while (opts.length < 4) {
       const rand = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
       if (!opts.find(o => o.letter === rand.letter)) opts.push(rand);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    trialStartRef.current = Date.now();
  }, []);

  const handleAnswer = (choice: string, recordInteraction: any, gameState: string) => {
    if (!target) return;
    
    const isCorrect = choice === target.letter;
    if (isCorrect) play('coin');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: choice,
      metadata: { target: target.letter, choice, sound: target.sound }
    });

    setTimeout(() => {
      if (gameState === 'playing') spawnRound(gameState);
    }, 800);
  };

  return (
    <ClinicalPlayerEngine
      title="خيمياء الحروف (Letter Alchemy)"
      category="ld_alchemy"
      domainId="phonological-awareness-mapping"
      description="تقييم عيادي للمعالجة الصوتية والقدرة على ربط الرمز البصري بالصوت (Phoneme-Grapheme Mapping)."
      instruction="المهمة: اضغط على الحرف الذي تسمع صوته أو تراه في الخلية النشطة."
      icon="🔮"
      color="emerald"
      onComplete={() => {}}
    >
      {({ recordInteraction, gameState }) => (
        <div className="w-full flex flex-col items-center">
           <AnimatePresence mode="wait">
              {target && gameState === 'playing' && (
                <motion.div
                  key={target.id}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="mb-16 w-48 h-48 bg-emerald-500/10 border-4 border-emerald-500/50 rounded-[3rem] flex items-center justify-center text-8xl font-black text-white shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                >
                  {target.letter}
                </motion.div>
              )}
           </AnimatePresence>
 
           <div className="flex gap-6 flex-wrap justify-center max-w-2xl px-4">
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1, y: -10 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={gameState !== 'playing'}
                  onClick={() => handleAnswer(opt.letter, recordInteraction, gameState)}
                  className="w-24 h-24 md:w-32 md:h-32 bg-slate-900 border-4 border-slate-800 hover:border-emerald-500/50 rounded-[2.5rem] text-5xl flex items-center justify-center text-white transition-all shadow-xl"
                >
                  {opt.letter}
                </motion.button>
              ))}
           </div>
 
           <GameTrigger gameState={gameState} spawnRound={() => spawnRound(gameState)} />
           
           <div className="mt-20 text-emerald-800/30 text-[10px] uppercase tracking-[0.4em] font-mono">
              Phoneme-Grapheme Mapping Processor // ALCHEMY_V1
           </div>
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, spawnRound }: any) {
  useEffect(() => {
    if (gameState === 'playing') spawnRound();
  }, [gameState, spawnRound]);
  return null;
}
