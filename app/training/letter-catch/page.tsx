'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  saveTestSession, 
  generateSessionId, 
  getStudentProfile, 
  saveStudentProfile, 
  TestSession 
} from '@/lib/studentProfile';
import { useLanguage } from '@/app/components/LanguageContext';
import { useSound } from '@/hooks/useSound';

type LetterItem = {
  id: string;
  char: string;
  x: number;
  y: number;
  speed: number;
  isTarget: boolean;
};

const CONFUSING_GROUPS = [
  ['ب', 'ت', 'ث', 'ن', 'ي'],
  ['ح', 'ج', 'خ'],
  ['د', 'ذ'],
  ['ر', 'ز', 'و'],
  ['س', 'ش'],
  ['ص', 'ض'],
  ['ط', 'ظ'],
  ['ع', 'غ'],
  ['ف', 'ق']
];

export default function LetterCatch() {
  const { t, language, dir } = useLanguage();
  const { play } = useSound();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);

  const [activeGroup, setActiveGroup] = useState<string[]>(['ب', 'ت', 'ث', 'ن']);
  const [targetChar, setTargetChar] = useState<string>('ب');
  
  const [fallingLetters, setFallingLetters] = useState<LetterItem[]>([]);
  
  const animationRef = useRef<number>(null);
  const lastSpawnTime = useRef<number>(0);
  const gameSpeedMuliplier = useRef<number>(1);
  const MAX_STRIKES = 5;

  const startGame = () => {
    play('click');
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStrikes(0);
    setFallingLetters([]);
    gameSpeedMuliplier.current = 1;
    pickNewTarget();
    lastSpawnTime.current = performance.now();
    gameLoop(performance.now());
  };

  const pickNewTarget = () => {
    const group = CONFUSING_GROUPS[Math.floor(Math.random() * CONFUSING_GROUPS.length)];
    setActiveGroup(group);
    setTargetChar(group[Math.floor(Math.random() * group.length)]);
  };

  const spawnLetter = (time: number) => {
    const isTarget = Math.random() > 0.6; // 40% chance it's the target
    const char = isTarget 
      ? targetChar 
      : activeGroup.filter(c => c !== targetChar)[Math.floor(Math.random() * (activeGroup.length - 1))];
    
    const finalChar = char || activeGroup[0] || 'ب';

    const newLetter: LetterItem = {
      id: Math.random().toString(36).substr(2, 9),
      char: finalChar,
      x: 10 + Math.random() * 80, 
      y: -10, // Start above the container
      speed: (1.2 + Math.random() * 1.5) * gameSpeedMuliplier.current,
      isTarget
    };

    setFallingLetters(prev => [...prev, newLetter]);
  };

  const gameLoop = useCallback((time: number) => {
    if (!isPlaying) return;

    gameSpeedMuliplier.current += 0.0001;

    const spawnInterval = Math.max(700, 1500 - (gameSpeedMuliplier.current * 200));
    if (time - lastSpawnTime.current > spawnInterval) {
      spawnLetter(time);
      lastSpawnTime.current = time;
    }

    setFallingLetters(prev => {
      const remaining: LetterItem[] = [];
      let newStrikes = 0;

      for (const item of prev) {
        const nextY = item.y + item.speed;
        
        if (nextY > 105) {
          if (item.isTarget) {
            newStrikes++;
            play('click'); // Feedback for miss
          }
        } else {
          remaining.push({ ...item, y: nextY });
        }
      }

      if (newStrikes > 0) {
        setStrikes(s => {
          const updated = s + newStrikes;
          if (updated >= MAX_STRIKES) {
            setGameOver(true);
            setIsPlaying(false);
          }
          return updated;
        });
      }

      return remaining;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, targetChar, activeGroup, play]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, gameOver, gameLoop]);

  const handleCatch = (id: string, isTarget: boolean) => {
    if (isTarget) {
      play('success');
      setScore(s => s + 10);
      if (score > 0 && score % 100 === 0) {
        pickNewTarget(); 
      }
    } else {
      play('click');
      setStrikes(s => {
        const updated = s + 1;
        if (updated >= MAX_STRIKES) {
          setGameOver(true);
          setIsPlaying(false);
        }
        return updated;
      });
    }

    setFallingLetters(prev => prev.filter(l => l.id !== id));
  };

  useEffect(() => {
    if (gameOver && score > 0) {
      play('levelUp');
      const session: TestSession = {
        id: generateSessionId('letter-catch'),
        testId: 'letter-catch',
        testCategory: 'visual',
        testTitle: 'صائد الحروف / Letter Catch',
        preTestReadiness: null,
        rounds: [], 
        attention: { tabSwitchCount: 0, inactivityCount: 0, totalTestDurationMs: 30000 },
        emotional: { frustrationEvents: strikes, impulsivityEvents: 0 },
        rawScore: Math.min(100, score),
        postAnalysis: null,
        completedAt: new Date().toISOString(),
      };
      saveTestSession(session);

      const profile = getStudentProfile();
      if (profile) {
        profile.coins += Math.floor(score / 5);
        profile.xp += Math.floor(score * 2);
        saveStudentProfile(profile);
      }
    }
  }, [gameOver, score, strikes, play]);


  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans pt-24" dir={dir}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/30 blur-[120px] rounded-full" />
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/30 blur-[120px] rounded-full" />
      </div>

      {/* Target UI Top Bar */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-28 left-0 right-0 px-8 flex justify-between items-start z-20 pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-3xl flex gap-6 items-center shadow-2xl pointer-events-auto">
              <div className="text-slate-400 font-black text-xs uppercase tracking-widest">{t('target')}</div>
              <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center font-black text-6xl text-white shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                {targetChar}
              </div>
            </div>

            <div className="flex gap-4 pointer-events-auto">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-8 py-4 rounded-3xl flex flex-col items-center shadow-2xl">
                 <span className="text-slate-500 font-bold text-[10px] uppercase tracking-tighter mb-1">{t('points')}</span>
                 <span className="text-3xl font-black text-emerald-400 leading-none">{score}</span>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-md border border-rose-900/30 px-8 py-4 rounded-3xl flex flex-col items-center shadow-2xl">
                 <span className="text-slate-500 font-bold text-[10px] uppercase tracking-tighter mb-1">{t('errors')}</span>
                 <span className="text-2xl font-black text-rose-500 leading-none">{strikes} <span className="text-xs opacity-40">/ {MAX_STRIKES}</span></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Falling Entities Container - Pushed down to avoid header overlap */}
      {isPlaying && (
        <div className="absolute inset-x-0 bottom-10 top-[42%] z-10 pointer-events-none">
          {fallingLetters.map(letter => (
            <motion.button
              key={letter.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onMouseDown={() => handleCatch(letter.id, letter.isTarget)}
              onTouchStart={() => handleCatch(letter.id, letter.isTarget)}
              className="absolute pointer-events-auto bg-slate-800 border-b-8 border-slate-950 w-20 h-20 rounded-[2rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl hover:bg-slate-700 active:scale-90 transition-all"
              style={{
                left: `${letter.x}%`,
                top: `${letter.y}%`,
              }}
            >
              {letter.char}
            </motion.button>
          ))}
        </div>
      )}

      {/* Intro Screen */}
      <div className="relative z-30 w-full max-w-xl text-center">
        {!isPlaying && !gameOver && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/80 backdrop-blur-2xl border border-blue-500/30 p-12 rounded-[3.5rem] shadow-2xl">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-8 italic">
               {t('letter_catch_title')}
            </h1>
            <p className="text-xl text-slate-300 mb-4 font-bold">
               {t('letter_catch_desc')}
            </p>
            <p className="text-sm text-slate-400 mb-10 leading-relaxed">
               {t('letter_catch_goal')}
            </p>
            <button 
              onClick={startGame}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-3xl rounded-3xl shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-[1.02] transition active:scale-95"
            >
              {t('start_catching')}
            </button>
            <div className="mt-10">
               <Link href="/diagnose" className="text-slate-600 hover:text-cyan-400 transition font-black uppercase text-xs tracking-widest no-underline">
                 ◀ {t('back_to_lounge')}
               </Link>
            </div>
          </motion.div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-rose-500/20 p-12 rounded-[3.5rem] shadow-2xl text-center">
            <h2 className="text-5xl font-black text-white mb-6 uppercase italic">{t('game_over')}</h2>
            <div className="bg-slate-950 p-10 rounded-[3rem] border-2 border-blue-500/20 w-full max-w-xs mx-auto mb-10">
              <div className="text-[10px] text-slate-500 mb-2 font-black uppercase tracking-widest">{t('points')}</div>
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 leading-none">{score}</div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={startGame}
                className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-[2rem] transition active:scale-95 shadow-lg shadow-blue-500/20"
              >
                {t('try_again')}
              </button>
              <Link 
                href="/diagnose"
                className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xl rounded-[2rem] transition active:scale-95 no-underline"
              >
                {t('main_lounge')}
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-[10px] font-mono text-slate-800 tracking-[0.5em] uppercase pointer-events-none">
        Basira Sovereign Training // v.4.0
      </div>
    </main>
  );
}
