'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import NeonButton from './NeonButton';
import { useLanguage } from '../LanguageContext';
import SpeakButton from './SpeakButton';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';
import { ResponseRecord, StudentProfile } from '@/lib/types';
import { getStudentProfile, saveTestSession, generateSessionId } from '@/lib/studentProfile';
import Link from 'next/link';
import AliCharacter, { AliState } from './AliCharacter';

interface ClinicalPlayerEngineProps {
  title: string;
  category: string;
  domainId: string; // Map to WISC/CTOPP domains
  description: string;
  instruction: string;
  icon: string;
  color: 'rose' | 'cyan' | 'amber' | 'emerald' | 'indigo' | 'fuchsia' | 'pink' | 'violet' | 'blue';
  onComplete: (score: number, metrics: { 
    interactions: ResponseRecord[], 
    difficulty: number, 
    finalTheta: number, 
    finalTrial: number, 
    reason: string 
  }) => void;
  children: (props: { 
    score: number, 
    setScore: React.Dispatch<React.SetStateAction<number>>,
    isGameOver: boolean,
    gameState: 'intro' | 'playing' | 'result',
    speak: (text: string, lang?: 'ar' | 'en') => void,
    isSpeaking: boolean,
    difficulty: number,
    trialNumber: number,
    ageVersion: 'A' | 'B' | 'C',
    recordInteraction: (data: Partial<ResponseRecord>) => void,
    nextRound: (data: boolean | { isCorrect: boolean }) => void,
    finishTest: (reason?: string) => void
  }) => React.ReactNode;
  duration?: number;
}

export default function ClinicalPlayerEngine({ 
  title, category, domainId, description, instruction, icon, color, onComplete, children, duration = 120 
}: ClinicalPlayerEngineProps) {
  const { t, language } = useLanguage();
  const { play } = useSound();
  const { speak, isSpeaking, stop } = useTTS();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [difficulty, setDifficulty] = useState(1);
  const [trialNumber, setTrialNumber] = useState(1);
  const [theta, setTheta] = useState(0); // Ability estimate
  const [interactions, setInteractions] = useState<ResponseRecord[]>([]);
  const [streak, setStreak] = useState({ correct: 0, incorrect: 0 });
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Rule 5: Age Adaptation
  const [ageVersion, setAgeVersion] = useState<'A' | 'B' | 'C'>('B');
  const [aliState, setAliState] = useState<AliState>('idle');

  useEffect(() => {
    if (gameState === 'intro') setAliState('idle');
    else if (gameState === 'playing') setAliState('focus');
    else if (gameState === 'result') {
      if (score >= 70) setAliState('success');
      else setAliState('idle');
    }
  }, [gameState, score]);

  useEffect(() => {
    const p = getStudentProfile();
    if (p) {
      setProfile(p);
      const age = p.age || 10;
      if (age <= 7) setAgeVersion('A');
      else if (age <= 12) setAgeVersion('B');
      else setAgeVersion('C');
    }
  }, []);

  // Auto-read instructions when intro starts
  useEffect(() => {
    if (gameState === 'intro') {
      const timer = setTimeout(() => {
        speak(`${title}. ${instruction}`, language);
      }, 1000);
      return () => {
        clearTimeout(timer);
        stop();
      };
    }
  }, [gameState, title, instruction, language, speak, stop]);

  const onGameOver = useCallback((reason: string = 'time') => {
    setGameState('result');
    play('success');
    stop();
    
    // Save to localStorage (Raw Data)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${category}Score`, score.toString());
      localStorage.setItem(`${category}Interactions`, JSON.stringify(interactions));
      localStorage.setItem(`${category}Theta`, theta.toString());

      // SAVE AS FORMAL TEST SESSION for Reporting & AI Analysis
      const sessionId = generateSessionId(category || 'lab');
      const sessionScore = Math.min(100, Math.max(0, score));
      
      // Clinical Standardization Check: 
      // Rule 6: Enforce minimum item counts (80% of target)
      const minItemsMap = { A: 10, B: 15, C: 20 };
      const isReliable = trialNumber - 1 >= minItemsMap[ageVersion];

      try {
        saveTestSession({
          id: sessionId,
          testId: category,
          testCategory: domainId || 'general',
          testTitle: title,
          rawScore: sessionScore,
          preTestReadiness: null,
          rounds: [],
          interactions: interactions,
          completedAt: new Date().toISOString(),
          attention: {
            tabSwitchCount: 0,
            inactivityCount: 0,
            totalTestDurationMs: duration * 1000
          },
          emotional: {
            frustrationEvents: streak.incorrect > 2 ? 1 : 0,
            impulsivityEvents: 0
          },
          postAnalysis: {
            skillLevel: 'average',
            difficultyLevel: 'none',
            difficultyType: [],
            errorPatterns: !isReliable ? ["النتيجة غير مستقرة بسبب قلة عدد المحاولات المنفذة"] : [],
            strengths: [],
            weaknesses: [],
            standardScore: 100, // Placeholder, ScoringEngine will calculate properly
            percentile: 50,
            classification: 'Average',
            clinicalSource: `Clinical lab completion via Standardized Engine. Reliability: ${isReliable ? 'PASS' : 'FAIL'}.`
          }
        });
      } catch (err) {
        console.error("Clinical Data Persistence Failed:", err);
      }
    }

    // Final Adaptive Score Calculation (Weighted Accuracy & Competence)
    const accuracy = interactions.length > 0 ? (interactions.filter(i => i.isCorrect).length / interactions.length) : 0;
    
    // Competence derived from IRT Theta (-1.5 to 1.5)
    const competence = Math.min(100, Math.max(0, Math.round((theta + 1.5) / 3 * 100)));
    
    // User wants precision: Accuracy is the most "honest" metric for the UI
    const finalScore = Math.round(accuracy * 100); 
    
    setScore(finalScore);
    
    // Pass full record to completion handler
    onComplete(finalScore, { 
      interactions, 
      difficulty, 
      finalTheta: theta,
      finalTrial: trialNumber - 1,
      reason 
    });
  }, [category, score, interactions, difficulty, theta, trialNumber, play, onComplete, stop, domainId, duration, timeLeft, streak.incorrect, title, ageVersion]);

  const recordInteraction = useCallback((data: Partial<ResponseRecord>) => {
    const isCorrect = data.isCorrect ?? false;
    const now = Date.now();
    
    // Rule 2: Complete Data Collection
    const record: ResponseRecord = {
      gameId: title,
      domainId: domainId || category,
      trialNumber: trialNumber,
      itemDifficulty: difficulty,
      timestampDisplayed: data.timestampDisplayed || (now - 2000), // Fallback
      timestampFirstTouch: data.timestampFirstTouch || (now - 500),
      timestampResponded: data.timestampResponded || now,
      responseValue: data.responseValue,
      isCorrect: isCorrect,
      hesitationDuration: data.hesitationDuration || 0,
      responseDuration: data.responseDuration || 0,
      selfCorrected: data.selfCorrected || false,
      metadata: data.metadata || {},
    };

    // Calculate auto durations if missing
    if (!record.hesitationDuration) record.hesitationDuration = record.timestampFirstTouch - record.timestampDisplayed;
    if (!record.responseDuration) record.responseDuration = record.timestampResponded - record.timestampFirstTouch;

    const newInteractions = [...interactions, record];
    setInteractions(newInteractions);
    
    // Rule 3: IRT Adaptive (Rasch simple theta update)
    let nextTheta = theta;
    const expected = (1 / (1 + Math.exp(-theta + difficulty - 3))); // Sigmoid centered at difficulty
    
    if (isCorrect) {
      nextTheta += (0.5 / trialNumber) * (1 - expected);
      setScore(s => s + 1);
      const nextCorrect = streak.correct + 1;
      if (nextCorrect >= 2 && difficulty < 5) {
        setDifficulty(d => d + 1);
        setStreak({ correct: 0, incorrect: 0 });
      } else {
        setStreak({ correct: nextCorrect, incorrect: 0 });
      }
    } else {
      nextTheta += (0.5 / trialNumber) * (0 - expected);
      setScore(s => Math.max(0, s - 1));
      const nextIncorrect = streak.incorrect + 1;
      if (nextIncorrect >= 2 && difficulty > 1) {
        setDifficulty(d => d - 1);
        setStreak({ correct: 0, incorrect: 0 });
      } else {
        setStreak({ correct: 0, incorrect: nextIncorrect });
      }
    }
    
    setTheta(nextTheta);
    // trialNumber incremented below only once

    // Stop Conditions: Reduced counts for better UX
    const maxItemsMap = { A: 10, B: 15, C: 20 };
    if (trialNumber >= maxItemsMap[ageVersion]) {
      onGameOver('max_items');
      return;
    }
    setTrialNumber(t => t + 1);
  }, [trialNumber, difficulty, streak, theta, title, domainId, category, ageVersion, interactions, onGameOver]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      onGameOver('timeout');
    }
  }, [gameState, timeLeft, onGameOver]);

  const startTest = () => {
    setGameState('playing');
    setScore(0);
    setTheta(0);
    setDifficulty(1);
    setStreak({ correct: 0, incorrect: 0 });
    setTimeLeft(duration);
    setTrialNumber(1);
    setInteractions([]);
    play('click');
  };

  const colorStyles = {
    rose:    'border-rose-500/30 text-rose-400 bg-rose-500/10 shadow-rose-500/20',
    cyan:    'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 shadow-cyan-500/20',
    amber:   'border-amber-500/30 text-amber-400 bg-amber-500/10 shadow-amber-500/20',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/20',
    indigo:  'border-indigo-500/30 text-indigo-400 bg-indigo-500/10 shadow-indigo-500/20',
    fuchsia: 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/10 shadow-fuchsia-500/20',
    pink:    'border-pink-500/30 text-pink-400 bg-pink-500/10 shadow-pink-500/20',
    violet:  'border-violet-500/30 text-violet-400 bg-violet-500/10 shadow-violet-500/20',
    blue:    'border-blue-500/30 text-blue-400 bg-blue-500/10 shadow-blue-500/20',
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden flex items-center justify-center font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Dynamic Background Blurs */}
      <div className={`fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none opacity-20 ${((colorStyles[color] || colorStyles.indigo).split(' ')[1] || 'text-indigo-400').replace('text', 'bg')}`} />
      <div className={`fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none opacity-10 bg-slate-800`} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full relative z-10"
      >
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <GlassCard variant="playful" className="p-12 text-center rounded-[4rem] border-2">
                <div className="absolute top-10 right-10 flex gap-4">
                  <SpeakButton text={`${title}. ${instruction}`} size="md" />
                </div>
                <div className="flex justify-center mb-8">
                  <AliCharacter name={profile?.name} state={aliState} variant="full" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tight">{title}</h1>
                <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">{description}</p>
                
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-right mb-12">
                   <h3 className="text-cyan-400 font-black text-xs uppercase tracking-[0.2em] mb-4">تعليمات المهمة:</h3>
                   <p className="text-2xl text-white font-medium diagnostic-stimulus high-contrast-text">{instruction}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                   <NeonButton size="lg" color={color} onClick={startTest} className="px-16 py-8 text-2xl">
                      {t('start_test')} 🚀
                   </NeonButton>
                   <Link href="/diagnose" className="text-slate-500 hover:text-white font-bold transition-all px-8 py-4">
                      {t('back_to_lounge')}
                   </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="flex justify-between items-center mb-8 bg-slate-900/60 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">{icon}</div>
                    <div>
                       <h4 className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-display">
                         {title}
                         <button 
                            onClick={() => speak(`${title}. ${instruction}`, language)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] transition-all ${isSpeaking ? 'bg-white text-slate-950 scale-110 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                           {isSpeaking ? '🔊' : '🔈'}
                         </button>
                       </h4>
                       <div className="text-xs font-bold text-white">{t('status_in_progress')}</div>
                    </div>
                 </div>

                  <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 text-[0.65rem] font-black text-cyan-400 font-mono tracking-widest uppercase">
                    Stage {trialNumber} / {({ A: 12, B: 20, C: 25 } as any)[ageVersion]}
                  </div>

                 <div className="flex-1 flex justify-center scale-50 -my-8">
                    {/* Mascot removed during active gameplay per user request */}
                 </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                       <div className="text-[0.6rem] font-black text-slate-500 uppercase">{t('points')}</div>
                       <div className={`text-4xl font-black italic ${color === 'rose' ? 'text-rose-400' : 'text-cyan-400'}`}>{score}</div>
                    </div>
                    {/* Timing Invisibility - Timer hidden from user but active in background */}
                 </div>
              </div>

              <div className="relative min-h-[500px] flex items-center justify-center">
                {children({ 
                  score, 
                  setScore, 
                  isGameOver: timeLeft === 0, 
                  gameState, 
                  speak, 
                  isSpeaking,
                  difficulty,
                  trialNumber,
                  ageVersion,
                  recordInteraction,
                  nextRound: (data: boolean | { isCorrect: boolean }) => {
                    const finalData = typeof data === 'boolean' ? { isCorrect: data } : data;
                    recordInteraction(finalData);
                  },
                  finishTest: onGameOver
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
              <GlassCard variant="playful" className="p-16 text-center rounded-[4rem] border-2">
                <div className="flex justify-center mb-8">
                  <AliCharacter name={profile?.name} state={aliState} variant="full" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 italic">{t('game_over')}</h2>
                <p className="text-slate-400 text-xl mb-12">أداء رائع! تم إرسال البيانات للمركز السريري للتحليل.</p>
                
                <div className="flex justify-center flex-wrap gap-8 items-center mb-16">
                   <div className="text-center">
                      <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">SCORE_CAPTURED</div>
                      <div className={`text-8xl font-black italic bg-clip-text text-transparent bg-gradient-to-r ${color === 'rose' ? 'from-rose-400 to-rose-600' : 'from-cyan-400 to-blue-600'}`}>
                         {score}
                      </div>
                      <div className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-tighter">Clinical Competence Score</div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                   <NeonButton size="lg" color={color} onClick={() => setGameState('intro')} className="px-12 py-5 text-xl">
                      {t('try_again')} 🔄
                   </NeonButton>
                   <Link href="/diagnose" className="px-12 py-5 rounded-2xl bg-white text-black font-black text-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                      {t('my_results')} 📊
                   </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
