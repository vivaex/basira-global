'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSTT } from '@/hooks/useSTT';

interface MicButtonProps {
  onTranscript: (text: string) => void;
  lang?: 'ar' | 'en';
  label?: string;
  className?: string;
}

export default function MicButton({ onTranscript, lang = 'ar', label, className }: MicButtonProps) {
  const { isListening, transcript, startListening, stopListening } = useSTT(lang);
  const [lastEmitted, setLastEmitted] = useState('');

  useEffect(() => {
    if (transcript && transcript !== lastEmitted) {
      onTranscript(transcript);
      setLastEmitted(transcript);
    }
  }, [transcript, onTranscript, lastEmitted]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening 
            ? 'bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]' 
            : 'bg-slate-800 hover:bg-slate-700 shadow-xl'
        } border-2 border-white/10`}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="stop"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-3xl"
            >
              ⏹️
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-3xl"
            >
              🎤
            </motion.div>
          )}
        </AnimatePresence>

        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.2 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-rose-400 rounded-full"
          />
        )}
      </motion.button>
      
      {label && <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{label}</span>}
      
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-xl font-bold text-cyan-400 max-w-xs text-center"
          >
             {transcript}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
