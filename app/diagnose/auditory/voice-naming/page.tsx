'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechAnalysis } from '@/app/hooks/useSpeechAnalysis';
import { calculateVoiceMatchScore } from '@/lib/voice-utils';
import { DIAGNOSTIC_TESTS } from '@/lib/testsData';
import { saveTestSession, generateUUID } from '@/lib/storage';
import { useLanguage } from '@/app/components/LanguageContext';
import { useSound } from '@/hooks/useSound';
import AliCharacter from '@/app/components/ui/AliCharacter';
import GlassCard from '@/app/components/ui/GlassCard';
import NeonButton from '@/app/components/ui/NeonButton';
import AnimatedWrapper from '@/app/components/ui/AnimatedWrapper';
import NetworkBackground from '@/app/components/layout/NetworkBackground';

export default function VoiceNamingLab() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { play } = useSound();
  const { isListening, transcript, startListening, stopListening } = useSpeechAnalysis();

  const testConfig = DIAGNOSTIC_TESTS['voice-naming'];
  const [currentRound, setCurrentRound] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'feedback' | 'finished'>('intro');
  const [results, setResults] = useState<{ target: string; spoken: string; score: number }[]>([]);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [aliState, setAliState] = useState<'idle' | 'thinking' | 'success' | 'sad'>('idle');

  // Handle Speech Results
  useEffect(() => {
    if (gameState === 'playing' && transcript) {
      const target = testConfig.rounds[currentRound].correct as string;
      const score = calculateVoiceMatchScore(transcript, target);

      // If confidence is high or match is strong
      if (score >= 0.8) {
        handleCorrectAnswer(transcript, score);
      }
    }
  }, [transcript, gameState, currentRound, testConfig.rounds]);

  const handleStart = () => {
    setGameState('playing');
    setAliState('thinking');
    startListening();
    play('click');
  };

  const handleCorrectAnswer = (spoken: string, score: number) => {
    stopListening();
    play('success');
    setAliState('success');
    setFeedbackType('success');
    
    const newResult = {
      target: testConfig.rounds[currentRound].correct as string,
      spoken,
      score
    };
    
    setResults(prev => [...prev, newResult]);
    setGameState('feedback');

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentRound < testConfig.rounds.length - 1) {
        setCurrentRound(prev => prev + 1);
        setGameState('playing');
        setAliState('thinking');
        setFeedbackType(null);
        startListening();
      } else {
        finishTest([...results, newResult]);
      }
    }, 2000);
  };

  const finishTest = (finalResults: any[]) => {
    setGameState('finished');
    setAliState('success');
    
    const totalScore = Math.round(
      (finalResults.reduce((acc, curr) => acc + curr.score, 0) / testConfig.rounds.length) * 100
    );

    saveTestSession({
      id: generateUUID(),
      testId: 'voice-naming',
      testCategory: 'AUDITORY',
      testDate: new Date().toISOString(),
      rawScore: totalScore,
      notes: `Voice evaluation (Auditory context). Transcripts: ${finalResults.map(r => `${r.target}->${r.spoken}`).join(', ')}`
    });
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-950 text-white p-6">
      <NetworkBackground />
      <div className="fixed inset-0 grid-bg opacity-20 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto pt-12">
        <AnimatedWrapper variant="playful">
          
          {/* Header */}
          <header className="text-center mb-12">
             <div className="flex justify-between items-center mb-8">
               <NeonButton size="sm" color="slate" onClick={() => router.push('/diagnose/auditory')}>
                 ◀ {language === 'ar' ? 'رجوع' : 'Back'}
               </NeonButton>
               <h1 className="text-2xl font-black italic tracking-tighter text-cyan-400">
                {t('voice-naming' as any)} 🎙️
              </h1>
              <div className="w-20" /> {/* Spacer */}
             </div>
            <div className="flex justify-center gap-2">
              {testConfig.rounds.map((_, i) => (
                <div 
                  key={i}
                  className={`h-2 w-8 rounded-full transition-all duration-500 ${
                    i < currentRound ? 'bg-emerald-500 shadow-[0_0_10px_emerald]' : 
                    i === currentRound ? 'bg-cyan-500 w-12' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </header>

          <AnimatePresence mode="wait">
            {gameState === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                <GlassCard variant="playful" color="indigo" className="text-center p-12">
                   <div className="flex justify-center mb-8 scale-110">
                      <AliCharacter state="idle" variant="default" />
                   </div>
                   <h2 className="text-2xl font-black mb-4 italic">{t('start_test')}</h2>
                   <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                     {testConfig.instructions}
                   </p>
                   <NeonButton size="lg" color="cyan" onClick={handleStart}>
                     {t('start_test')} 🚀
                   </NeonButton>
                </GlassCard>
              </motion.div>
            )}

            {(gameState === 'playing' || gameState === 'feedback') && (
              <motion.div key="playing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Ali Side */}
                  <div className="flex flex-col items-center">
                    <AliCharacter state={aliState as any} variant="default" />
                    <div className="mt-8 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] text-center w-full">
                      <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">Ali is Listening...</p>
                      <h3 className="text-xl font-black italic">{testConfig.rounds[currentRound].prompt}</h3>
                    </div>
                  </div>

                  {/* Stimulus Side */}
                  <GlassCard 
                    variant="playful" 
                    color={feedbackType === 'success' ? 'emerald' : 'cyan'} 
                    className={`aspect-square flex flex-col items-center justify-center p-12 transition-all duration-500 ${feedbackType === 'success' ? 'scale-105 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : ''}`}
                  >
                    <span className="text-[10rem] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-4">
                      {testConfig.rounds[currentRound].stimulus}
                    </span>
                    
                    <div className="h-20 flex flex-col items-center justify-center">
                      {isListening ? (
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <motion.div 
                              key={i}
                              animate={{ height: [10, 30, 10] }}
                              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                              className="w-1.5 bg-cyan-500 rounded-full"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-400 font-black text-3xl italic animate-bounce">
                          {transcript} ✨
                        </p>
                      )}
                    </div>
                  </GlassCard>

                </div>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div key="finished" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}>
                <GlassCard variant="playful" color="emerald" className="text-center p-12">
                   <div className="flex justify-center mb-8">
                      <AliCharacter state="success" variant="default" />
                   </div>
                   <h2 className="text-4xl font-black mb-4 italic text-emerald-400">أداء مذهل! ✨</h2>
                   <p className="text-slate-400 mb-10">
                     لقد أكملت جميع جولات مختبر النطق بدقة عالية. تم حفظ نتائجك في ملفك الشخصي.
                   </p>
                   <NeonButton color="emerald" onClick={() => router.push('/diagnose/auditory')}>
                     العودة للمختبرات 🗺️
                   </NeonButton>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

        </AnimatedWrapper>
      </div>

      <style jsx global>{`
        .grid-bg {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </main>
  );
}
