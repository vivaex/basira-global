'use client';
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AliState = 'idle' | 'success' | 'focus' | 'thinking';

interface AliCharacterProps {
  name?: string;
  state: AliState;
  variant?: 'compact' | 'full';
  className?: string;
}

const AliCharacter: React.FC<AliCharacterProps> = ({ 
  name = 'بطلنا', 
  state = 'idle', 
  variant = 'compact',
  className = ''
}) => {
  // Animation Variants
  const containerVariants: any = {
    idle: {
      y: [0, -10, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    success: {
      rotate: [0, 360],
      scale: [1, 1.2, 1],
      transition: { duration: 0.8, ease: "circOut" }
    },
    focus: {
      scale: 1.05,
      transition: { duration: 0.3 }
    },
    thinking: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  const ringVariants: any = {
    idle: { rotate: 360 },
    focus: { rotate: 720, scale: 1.1 },
    success: { scale: 1.5, opacity: 0 }
  };

  const bubbleText = useMemo(() => {
    switch(state) {
      case 'success': return `أحسنت يا ${name}!`;
      case 'focus': return `ركز يا ${name}...`;
      case 'thinking': return `ممم، دعنا نفكر...`;
      default: return `أهلاً بك يا ${name}`;
    }
  }, [state, name]);

  const stateColor = state === 'focus' ? 'var(--accent-cyan)' : 
                   state === 'success' ? '#10b981' : 
                   'var(--accent-cyan-light)';

  return (
    <div className={`relative flex flex-col items-center ${className} ${variant === 'compact' ? 'scale-75' : 'scale-110'}`}>
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bubbleText}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          className="mb-4 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-[0.7rem] font-black text-white shadow-xl whitespace-nowrap"
        >
          {bubbleText}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/10 border-r border-b border-white/20 rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Main Character Body */}
      <motion.div
        variants={containerVariants}
        animate={state}
        className="relative w-24 h-32 flex items-center justify-center"
      >
        {/* Antigravity Rings */}
        <motion.div 
          animate={state === 'focus' ? ringVariants.focus : ringVariants.idle}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-10px] border border-cyan-500/10 rounded-full"
        />

        {/* Character Illustration (CSS/SVG) */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          {/* Head */}
          <motion.div 
            animate={state === 'thinking' ? { x: [0, 2, -2, 0] } : {}}
            className="w-14 h-14 bg-slate-200 rounded-[1.5rem] shadow-inner relative overflow-hidden flex items-center justify-center"
          >
            {/* Hair */}
            <div className="absolute top-0 inset-x-0 h-5 bg-slate-800" />
            <div className="absolute top-0 right-2 w-3 h-6 bg-amber-400 rotate-12" /> {/* Golden Streak */}
            
            {/* Eyes */}
            <div className="flex gap-3 mt-2">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full relative">
                {state === 'focus' && <motion.div animate={{ opacity: [0, 1] }} className="absolute inset-0 bg-cyan-400 rounded-full blur-[2px]" />}
              </div>
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full relative">
                {state === 'focus' && <motion.div animate={{ opacity: [0, 1] }} className="absolute inset-0 bg-cyan-400 rounded-full blur-[2px]" />}
              </div>
            </div>
            {/* Mouth */}
            <motion.div 
              animate={state === 'success' ? { scaleY: 1.5 } : { scaleY: 1 }}
              className="mt-2 w-4 h-1 bg-slate-400 rounded-full" 
            />
          </motion.div>

          {/* Suit Body */}
          <div className="mt-1 w-12 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-t-[1.5rem] rounded-b-[1rem] flex flex-col items-center justify-start pt-2">
             <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" style={{ backgroundColor: stateColor }} />
             <div className="mt-2 w-8 h-0.5 bg-white/5" />
             <div className="mt-1 w-8 h-0.5 bg-white/5" />
          </div>

          {/* Floating Holographic Memory Drive */}
          <motion.div
            animate={{ 
              rotateY: [0, 360],
              y: [-25, -20, -25]
            }}
            transition={{ 
              rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -right-8 top-12 w-6 h-6 flex items-center justify-center pointer-events-none"
          >
             {/* The Core */}
             <div className="w-3 h-3 bg-amber-400/40 border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.8)] rounded-sm transform rotate-45" />
             
             {/* Orbital Data Bits */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border border-amber-500/20 rounded-full scale-150"
             >
                <div className="absolute top-0 left-1/2 w-1 h-1 bg-amber-300 rounded-full shadow-[0_0_5px_white]" />
             </motion.div>
             
             {/* Scanlines Effect */}
             <div className="absolute inset-x-[-10px] top-1/2 h-[1px] bg-cyan-400/30 blur-[1px] animate-pulse" />
          </motion.div>
        </div>

        {/* Energy Aura (Success) */}
        <AnimatePresence>
          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 2 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AliCharacter;
