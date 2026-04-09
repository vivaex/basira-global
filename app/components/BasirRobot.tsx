'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudentProfile } from '@/lib/studentProfile';
import { useLanguage } from './LanguageContext';

export default function BasirRobot({ 
  mood = 'happy', 
  message = '', 
  customEquipped = null as any,
  demoSteps = null as { title: string, content: string }[] | null
}) {
  const { t, language } = useLanguage();
  const [name, setName] = useState('أيها البطل');
  const [showDemo, setShowDemo] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);
  const [equipped, setEquipped] = useState({ skin: 'default', hat: 'none', accessory: 'none' });

  useEffect(() => {
    if (customEquipped) {
      setEquipped(customEquipped);
      return;
    }
    const prof = getStudentProfile();
    if (prof?.name) setName(prof.name);
    if (prof?.equippedItems) setEquipped(prof.equippedItems);
  }, [customEquipped]);

  useEffect(() => {
    if (message && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const msg = message.replace('[NAME]', name);
        const utterance = new SpeechSynthesisUtterance(msg);
        
        // Voice selection based on language context
        const langStr = String(language);
        if (langStr === 'ar' || (message.match(/[\u0600-\u06FF]/))) {
           utterance.lang = 'ar-SA';
        } else if (langStr === 'fr') {
           utterance.lang = 'fr-FR';
        } else if (langStr === 'es') {
           utterance.lang = 'es-ES';
        } else {
           utterance.lang = 'en-US';
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }
  }, [message, name, language]);

  const getEyesColor = () => {
    switch (mood) {
      case 'happy':    return 'bg-emerald-400 shadow-[0_0_20px_#10b981]';
      case 'sad':      return 'bg-blue-400 shadow-[0_0_20px_#3b82f6]';
      case 'angry':    return 'bg-rose-500 shadow-[0_0_20px_#ef4444]';
      case 'thinking': return 'bg-violet-400 shadow-[0_0_20px_#8b5cf6]';
      default:         return 'bg-white shadow-[0_0_15px_white]';
    }
  };

  const getSkinGradient = () => {
    switch (equipped.skin) {
      case 'gold':   return 'from-amber-400 via-yellow-500 to-amber-600 border-amber-300';
      case 'pink':   return 'from-pink-400 via-rose-500 to-pink-600 border-pink-300';
      case 'cyan':   return 'from-cyan-400 via-blue-500 to-cyan-600 border-cyan-300';
      default:       return 'from-slate-800 to-slate-950 border-slate-700';
    }
  };

  const HatComponent = () => {
    if (equipped.hat === 'crown') return (
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] z-10">
        <span className="text-5xl">👑</span>
      </div>
    );
    if (equipped.hat === 'cap') return (
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-lg z-10">
        <span className="text-5xl">🧢</span>
      </div>
    );
    return null;
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col items-center gap-4 pointer-events-none">
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`text-slate-900 p-5 rounded-[2rem] rounded-br-none shadow-2xl border-4 font-black max-w-xs text-right relative mb-4 pointer-events-auto text-xl ${
               equipped.skin === 'gold' ? 'bg-amber-50 border-amber-400' : 'bg-white border-cyan-400'
            }`}
          >
            {message.replace('[NAME]', name)}
            <div className={`absolute -bottom-3 right-6 w-6 h-6 border-r-4 border-b-4 rotate-45 ${
               equipped.skin === 'gold' ? 'bg-amber-50 border-amber-400' : 'bg-white border-cyan-400'
            }`}></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={mood === 'happy' ? { y: [0, -20, 0] } : mood === 'angry' ? { x: [-2, 2, -2] } : { y: [0, -5, 0] }}
        transition={mood === 'angry' ? { duration: 0.1, repeat: Infinity } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-40 h-40 relative pointer-events-auto cursor-pointer group"
        onClick={() => demoSteps && setShowDemo(true)}
      >
        <HatComponent />
        
        {/* 3D Robot Render with fallback */}
        <div className="relative w-full h-full group">
          <motion.img 
            src="/assets/robot/basir_3d.png" 
            alt="Basir 3D"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
               // If image fails, revert to the CSS robot
               if (e.currentTarget) (e.currentTarget as any).style.display = 'none';
            }}
            className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all group-hover:scale-110"
          />
          
          {/* Default CSS Robot as Fallback/Underlay */}
          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br rounded-3xl shadow-2xl flex items-center justify-center border-4 transition-all duration-700 -z-10 ${getSkinGradient()} ${
            mood === 'happy' ? 'shadow-emerald-500/20' : 
            mood === 'angry' ? 'shadow-rose-500/20' : 
            mood === 'sad' ? 'shadow-blue-500/20' : 'shadow-black/40'
          }`}>
            <div className="flex gap-4">
              <motion.div 
                animate={mood === 'thinking' ? { rotate: 360 } : { scale: [1, 1.1, 1] }} 
                transition={mood === 'thinking' ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
                className={`w-5 h-5 rounded-full transition-all duration-500 ${getEyesColor()} ${mood === 'sad' ? 'h-2 mt-2' : ''}`}
              ></motion.div>
              <motion.div 
                animate={mood === 'thinking' ? { rotate: 360 } : { scale: [1, 1.1, 1] }} 
                transition={mood === 'thinking' ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
                className={`w-5 h-5 rounded-full transition-all duration-500 ${getEyesColor()} ${mood === 'sad' ? 'h-2 mt-2' : ''}`}
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Demo Indicator */}
        {demoSteps && !showDemo && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -right-2 top-0 bg-yellow-400 text-black text-[8px] font-black px-2 py-1 rounded-full shadow-lg border border-white"
          >
            {t('show_demo')} ❓
          </motion.div>
        )}
      </motion.div>

      {/* Demo Walkthrough Overlay */}
      <AnimatePresence>
        {showDemo && demoSteps && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto"
          >
            <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative">
               <button 
                 onClick={() => setShowDemo(false)}
                 className="absolute top-6 right-6 text-slate-400 hover:text-white text-2xl"
               >✕</button>
               
               <div className="text-center mb-8">
                  <span className="text-6xl mb-4 block">💡</span>
                  <h3 className="text-2xl font-black text-white italic mb-2">{demoSteps[currentDemoStep].title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{demoSteps[currentDemoStep].content}</p>
               </div>

               <div className="flex justify-between items-center gap-4">
                  <button 
                    disabled={currentDemoStep === 0}
                    onClick={() => setCurrentDemoStep((prev: number) => prev - 1)}
                    className="flex-1 bg-slate-800 disabled:opacity-30 text-white p-4 rounded-2xl font-black transition-all"
                  >
                    {t('prev')}
                  </button>
                  <button 
                    onClick={() => {
                      if (currentDemoStep < demoSteps.length - 1) {
                        setCurrentDemoStep((prev: number) => prev + 1);
                      } else {
                        setShowDemo(false);
                        setCurrentDemoStep(0);
                      }
                    }}
                    className="flex-1 bg-cyan-500 text-slate-950 p-4 rounded-2xl font-black transition-all shadow-xl hover:scale-105"
                  >
                    {currentDemoStep < demoSteps.length - 1 ? t('next' as any) : t('start_test')}
                  </button>
               </div>

               <div className="flex justify-center gap-2 mt-8">
                  {demoSteps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentDemoStep ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'}`} />
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}