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

  const OBJECTS = [
    { name: 'كرة', icon: '⚽' }, { name: 'شمس', icon: '☀️' }, { name: 'بيت', icon: '🏠' },
    { name: 'سيارة', icon: '🚗' }, { name: 'تفاحة', icon: '🍎' }, { name: 'قطة', icon: '🐱' },
  ];

  const spawnRound = useCallback(() => {
    const newItems = Array.from({ length: 10 }, () => ({
      id: Math.random(),
      ...OBJECTS[Math.floor(Math.random() * OBJECTS.length)]
    }));
    setItems(newItems);
    setCurrentIndex(0);
  }, []);

  const handleNext = (setScore: any) => {
    setScore((s: any) => s + 10);
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
      title="تسمية الصور (Rapid Naming)"
      category="simple_lang_naming"
      description="تقييم عيادي للطلاقة اللفظية وسرعة استحضار المسميات اللغوية من الذاكرة."
      instruction="المهمة: قم بتسمية الشيء الذي يظهر في الصورة بسرعة، ثم اضغط على 'التالي'."
      icon="🖼️"
      color="amber"
      onComplete={() => {}}
    >
      {({ setScore, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
           <AnimatePresence mode="wait">
             {items[currentIndex] && (
                <motion.div
                  key={items[currentIndex].id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="bg-slate-900 border-4 border-white/5 p-16 rounded-[4rem] shadow-2xl flex flex-col items-center"
                >
                   <span className="text-[12rem] mb-4">{items[currentIndex].icon}</span>
                   <h3 className="text-4xl font-black text-white italic">{items[currentIndex].name}</h3>
                </motion.div>
             )}
           </AnimatePresence>

           <button 
             onClick={() => handleNext(setScore)}
             className="mt-12 bg-amber-500 text-slate-950 px-24 py-8 rounded-[3rem] text-4xl font-black hover:scale-110 active:scale-95 transition-all shadow-amber-500/30 shadow-2xl"
           >
             {language === 'ar' ? 'التالي ⏭️' : 'Next ⏭️'}
           </button>

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
