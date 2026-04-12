'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function SocialIntentTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, scene: string, options: string[], correct: number } | null>(null);

  const SCENES = [
    {
      scene: 'صديقك يبكي لأنه أضاع لعبته. ماذا تفعل؟',
      options: ['أضحك عليه', 'أساعده في البحث عنها', 'أتجاهله وأذهب للعب'],
      correct: 1
    },
    {
      scene: 'المعلم يتحدث في الفصل. ماذا تفعل؟',
      options: ['أتحدث مع زميلي', 'أستمع بهدوء', 'أصرخ بصوت عالٍ'],
      correct: 1
    },
    {
      scene: 'أحدهم يحييك ويقول "مرحباً". ماذا ترد؟',
      options: ['أقول له مرحباً وأبتسم', 'أهرب بعيداً', 'أغلق أذني'],
      correct: 0
    }
  ];

  const spawnRound = useCallback(() => {
    const t = SCENES[Math.floor(Math.random() * SCENES.length)];
    setTarget({ ...t, id: Math.random() });
  }, []);

  return (
    <ClinicalPlayerEngine
      title="المشهد الاجتماعي (Social Intent)"
      category="autism_social"
      domainId="social"
      description="تقييم عيادي لفهم النوايا الاجتماعية والقواعد السلوكية."
      instruction="المهمة: اقرأ الموقف الاجتماعي واختر التصرف الأنسب."
      icon="🤝"
      color="indigo"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full max-w-4xl px-4 text-center">
           <AnimatePresence mode="wait">
             {target && (
               <motion.div 
                 key={target.id}
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="mb-12"
               >
                 <div className="bg-indigo-500/10 border-2 border-indigo-500/30 p-10 rounded-[3rem] shadow-2xl">
                    <h3 className="text-3xl font-black text-white italic leading-relaxed">{target.scene}</h3>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              {target?.options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                     const isCorrect = i === target.correct;
                     if (isCorrect) {
                       setScore((s: number) => s + 35);
                       play('success');
                     } else {
                       setScore((s: number) => Math.max(0, s - 10));
                       play('click');
                     }
                     nextRound(isCorrect);
                     spawnRound();
                  }}
                  className="p-6 bg-slate-900 border-2 border-white/5 hover:border-indigo-500/50 rounded-2xl text-xl font-bold text-white text-right"
                >
                  {opt}
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
