'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTTS } from '@/hooks/useTTS';
import { useLanguage } from '../LanguageContext';

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SpeakButton({ text, className = '', size = 'md' }: SpeakButtonProps) {
  const { speak, isSpeaking, stop } = useTTS();
  const { language } = useLanguage();

  const sizeClasses = {
    sm: 'w-10 h-10 text-xl rounded-xl',
    md: 'w-14 h-14 text-2xl rounded-2xl',
    lg: 'w-20 h-20 text-4xl rounded-[2rem]',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      speak(text, language);
    }
  };

  return (
    <span className={`relative inline-block ${className}`}>
      {isSpeaking && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className={`absolute inset-0 bg-white/20 rounded-full z-0`}
        />
      )}
      <button
        onClick={handleClick}
        className={`relative z-10 font-bold transition-all duration-300 flex items-center justify-center 
          ${sizeClasses[size]} 
          ${isSpeaking 
            ? 'bg-white text-slate-950 scale-110 shadow-[0_0_30px_rgba(255,255,255,0.4)]' 
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
          }`}
        title={isSpeaking ? "Stop" : "Read Aloud"}
      >
        <span className={isSpeaking ? 'animate-pulse' : ''}>
          {isSpeaking ? '🔊' : '🔈'}
        </span>
      </button>
    </span>
  );
}
