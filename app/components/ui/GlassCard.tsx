'use client';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'sleek' | 'playful';
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'white';
  className?: string;
  delay?: number;
}

export default function GlassCard({
  children,
  variant = 'sleek',
  color = 'cyan',
  className = '',
  delay = 0,
}: GlassCardProps) {

  const colorStyles = {
    cyan:    'border-cyan-500/20 shadow-cyan-500/5',
    emerald: 'border-emerald-500/20 shadow-emerald-500/5',
    amber:   'border-amber-500/20 shadow-amber-500/5',
    rose:    'border-rose-500/20 shadow-rose-500/5',
    indigo:  'border-indigo-500/20 shadow-indigo-500/5',
    white:   'border-white/10 shadow-white/5',
  };

  const transition: any = variant === 'playful'
    ? { type: 'spring' as const, stiffness: 200, damping: 20, delay }
    : { ease: 'easeInOut', duration: 0.5, delay };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={transition}
      whileHover={variant === 'playful' ? { scale: 1.02, y: -5 } : { y: -2 }}
      className={`
        relative bg-slate-900/60 backdrop-blur-xl border-2 
        ${colorStyles[color]}
        ${className}
      `}
      style={{
        borderRadius: variant === 'playful' ? '3rem' : '2.5rem',
      }}
    >
      {/* Decorative Border Glow */}
      <div 
        className={`absolute inset-0 rounded-[inherit] -z-1 opacity-20 pointer-events-none blur-2xl 
          ${color === 'cyan' ? 'bg-cyan-500' : ''}
          ${color === 'emerald' ? 'bg-emerald-500' : ''}
          ${color === 'amber' ? 'bg-amber-500' : ''}
          ${color === 'rose' ? 'bg-rose-500' : ''}
          ${color === 'indigo' ? 'bg-indigo-500' : ''}
          ${color === 'white' ? 'bg-white' : ''}
        `} 
      />
      
      {/* Content */}
      <div className="relative z-10 p-8 md:p-12">
        {children}
      </div>
    </motion.div>
  );
}
