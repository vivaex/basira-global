// app/components/OnboardingTour.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BasirRobot from './BasirRobot';
import { useLanguage } from './LanguageContext';
import { useSound } from '@/hooks/useSound';

export default function OnboardingTour() {
  const { t, language, dir } = useLanguage();
  const { play } = useSound();
  const [step, setStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('basira_onboarding_seen');
    if (!hasSeen) {
      setTimeout(() => {
        setIsVisible(true);
        setStep(0);
        play('success');
      }, 2000);
    }
  }, [play]);

  const tourSteps = [
    { message: t('tour_welcome'), mood: 'happy' },
    { message: t('tour_labs'),    mood: 'thinking' },
    { message: t('tour_shop'),    mood: 'happy' },
    { message: t('tour_parent'),  mood: 'thinking' },
    { message: t('tour_start'),   mood: 'happy' },
  ];

  const handleNext = () => {
    play('click');
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    play('click');
    setIsVisible(false);
    localStorage.setItem('basira_onboarding_seen', 'true');
  };

  if (!isVisible || step === -1) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center bg-black/40">
      <div className="pointer-events-auto">
        <BasirRobot 
          mood={tourSteps[step].mood as any} 
          message={tourSteps[step].message} 
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-10 flex gap-3 z-[210] pointer-events-auto ${
            language === 'ar' ? 'left-10' : 'right-44'
          }`}
        >
          <button 
            onClick={handleFinish}
            className="bg-slate-800/80 backdrop-blur-md text-slate-400 px-6 py-3 rounded-2xl font-bold text-sm border border-white/10 hover:text-white transition-all"
          >
            {t('skip')}
          </button>
          
          <button 
            onClick={handleNext}
            className="bg-white text-slate-900 px-10 py-3 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-slate-200"
          >
            {step === tourSteps.length - 1 ? t('finish') : t('next')} 
            <span className="text-xl">{language === 'ar' ? '←' : '→'}</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
