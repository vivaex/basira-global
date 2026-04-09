'use client';
import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'sleek' | 'playful';
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'fuchsia' | 'pink' | 'violet' | 'blue';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export default function NeonButton({
  children,
  onClick,
  variant = 'sleek',
  color = 'cyan',
  className = '',
  size = 'md',
  disabled = false,
}: NeonButtonProps) {
  const { play } = useSound();

  const colorStyles = {
    cyan:    'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 shadow-cyan-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 shadow-emerald-500/20',
    amber:   'bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-slate-950 shadow-amber-500/20',
    rose:    'bg-rose-500/10 border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-slate-950 shadow-rose-500/20',
    indigo:  'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500 hover:text-slate-950 shadow-indigo-500/20',
    fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-slate-950 shadow-fuchsia-500/20',
    pink:    'bg-pink-500/10 border-pink-500/50 text-pink-400 hover:bg-pink-500 hover:text-slate-950 shadow-pink-500/20',
    violet:  'bg-violet-500/10 border-violet-500/50 text-violet-400 hover:bg-violet-500 hover:text-slate-950 shadow-violet-500/20',
    blue:    'bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-slate-950 shadow-blue-500/20',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3 text-sm rounded-2xl',
    lg: 'px-10 py-4 text-base rounded-[1.5rem]',
    xl: 'px-12 py-5 text-xl font-black rounded-[2rem]',
  };

  const handleClick = () => {
    if (disabled) return;
    play('click');
    if (onClick) onClick();
  };

  const transition: any = variant === 'playful' 
    ? { type: 'spring', stiffness: 300, damping: 15 } 
    : { ease: 'easeInOut', duration: 0.3 };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={transition}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-2 border-2 
        font-black italic uppercase tracking-wider transition-colors duration-300
        ${colorStyles[color]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10 opacity-50 pointer-events-none" />
      
      {/* Glow Effect */}
      <div className="absolute inset-0 -z-1 border-4 border-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {children}
    </motion.button>
  );
}
