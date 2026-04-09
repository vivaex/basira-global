'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function EchoMatchTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, char: string, color: string } | null>(null);
  const [options, setOptions] = useState<{ char: string, color: string }[]>([]);

  const CHARS = [
    { char: 'أ', color: 'bg-rose-500' },
    { char: 'ب', color: 'bg-blue-500' },
    { char: 'ت', color: 'bg-emerald-500' },
    { char: 'ث', color: 'bg-amber-500' },
  ];

  const spawnRound = useCallback(() => {
    const t = CHARS[Math.floor(Math.random() * CHARS.length)];
    setTarget({ ...t, id: Math.random() });
    setOptions(CHARS.sort(() => Math.random() - 0.5));
  }, []);

  return (
    <ClinicalPlayerEngine
      title="صدى الحروف (Echo Match)"
      category="simple_lang_echo"
      domainId="language"
      description="تقييم عيادي للمطاوعة الصوتية والارتباط بين الرموز البصرية والأصوات اللغوية."
      instruction="المهمة: انظر للحرف الكبير في المركز، ثم اختر الحرف المماثل له من الخيارات أدناه."
      icon="🗣️"
      color="rose"
      onComplete={() => {}}
    >
      {({ setScore, gameState }) => (
        <div className="w-full flex flex-col items-center">
           <AnimatePresence mode="wait">
             {target && (
               <motion.div 
                 key={target.id}
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className={`mb-20 w-48 h-48 ${target.color} rounded-[3rem] flex items-center justify-center text-9xl font-black text-white shadow-2xl`}
               >
                 {target.char}
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex gap-6">
             {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (opt.char === target?.char) {
                      setScore(s => s + 25);
                      play('coin');
                    } else {
                      setScore(s => Math.max(0, s - 10));
                      play('click');
                    }
                    spawnRound();
                  }}
                  className={`w-32 h-32 ${opt.color} rounded-3xl flex items-center justify-center text-6xl font-black text-white shadow-lg`}
                >
                  {opt.char}
                </motion.button>
             ))}
           </div>

           <GameTrigger gameState={gameState} spawnRound={spawnRound} />
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
