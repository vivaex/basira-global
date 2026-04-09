'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useLanguage } from '@/app/components/LanguageContext';

export default function RapidNamingTest() {
  const { language } = useLanguage();
  const { play } = useSound();
  const [items, setItems] = useState<{ id: number, icon: string, name: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const POOL = [
    { name: 'أزرق', icon: '🟦' }, { name: 'أحمر', icon: '🟥' }, { name: 'أصفر', icon: '🟨' },
    { name: 'أخضر', icon: '🟩' }, { name: 'برتقالي', icon: '🟧' }, { name: 'أرجواني', icon: '🟪' },
  ];

  const spawnRound = useCallback(() => {
    const newItems = Array.from({ length: 15 }, () => ({
      id: Math.random(),
      ...POOL[Math.floor(Math.random() * POOL.length)]
    }));
    setItems(newItems);
    setCurrentIndex(0);
  }, []);

  const handleNext = (setScore: any) => {
    setScore((s: any) => s + 7);
    play('click');
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      play('success');
      spawnRound();
    }
  };

  return (
    <ClinicalPlayerEngine
      title="التسمية السريعة (Rapid Naming)"
      category="ld_ran"
      description="تقييم عيادي لسرعة المعالجة والطلاقة الافتتاحية (RAN)."
      instruction="المهمة: قم بتسمية الألوان التي تظهر بسرعة فائقة، واضغط على 'التالي' بعد كل لون."
      icon="🗯️"
      color="amber"
      duration={30}
      onComplete={() => {}}
    >
      {({ setScore, gameState }: any) => (
        <div className="w-full h-full flex flex-col items-center justify-center">
           <AnimatePresence mode="wait">
             {items[currentIndex] && (
               <motion.div
                 key={items[currentIndex].id}
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 1.2, opacity: 0 }}
                 className="flex flex-col items-center"
               >
                 <div className="text-[12rem] bg-slate-900 border-4 border-white/10 p-12 rounded-[4rem] shadow-2xl mb-8">
                    {items[currentIndex].icon}
                 </div>
                 <h3 className="text-4xl font-black text-white italic">{items[currentIndex].name}</h3>
               </motion.div>
             )}
           </AnimatePresence>

           <button 
             onClick={() => handleNext(setScore)}
             className="mt-12 bg-amber-500 text-slate-950 px-20 py-8 rounded-[3rem] text-3xl font-black hover:scale-110 active:scale-95 transition-all shadow-amber-500/30 shadow-2xl"
           >
             {language === 'ar' ? 'التالي ⏭️' : 'Next ⏭️'}
           </button>

           <div className="mt-8 text-slate-500 font-mono text-sm tracking-widest">
              STEP: {currentIndex + 1} / {items.length}
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
