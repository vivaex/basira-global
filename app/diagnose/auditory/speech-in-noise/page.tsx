'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';

/**
 * Speech-in-Noise (CAPD) - Clinical Protocol
 * -----------------------------------------
 * Measures Auditory Figure-Ground (AFG) - the ability to hear speech in noise.
 * Telemetry: Signal-to-Noise Ratio (SNR) threshold, RT, Error type.
 */

const SIN_STIMULI = [
  { target: 'تفاحة', distractors: ['فلاحة', 'تمساح', 'مساحة'], noiseLevel: 0.1 },
  { target: 'سيارة', distractors: ['طيارة', 'زيارة', 'منارة'], noiseLevel: 0.15 },
  { target: 'طائرة', distractors: ['دائرة', 'سائرة', 'طاولة'], noiseLevel: 0.2 },
  { target: 'قلم', distractors: ['علم', 'ألم', 'سلم'], noiseLevel: 0.25 },
  { target: 'مفتاح', distractors: ['تمساح', 'تفاح', 'مصباح'], noiseLevel: 0.3 },
  { target: 'بطريق', distractors: ['طريق', 'أبريق', 'مضيق'], noiseLevel: 0.4 },
  { target: 'مدرسة', distractors: ['همسة', 'مِكنسة', 'هندسة'], noiseLevel: 0.5 },
  { target: 'ساعة', distractors: ['قاعة', 'طاعة', 'براعة'], noiseLevel: 0.6 },
  { target: 'كتاب', distractors: ['ذباب', 'باب', 'شراب'], noiseLevel: 0.7 },
  { target: 'برتقال', distractors: ['أثقال', 'جبال', 'رمال'], noiseLevel: 0.8 },
  { target: 'سكين', distractors: ['تين', 'عجين', 'يقين'], noiseLevel: 0.9 },
  { target: 'حليب', distractors: ['قريب', 'غريب', 'صليب'], noiseLevel: 0.95 },
];

export default function SpeechInNoiseTest() {
  const { play } = useSound();
  const { speak } = useTTS();
  
  const [currentStimulus, setCurrentStimulus] = useState<typeof SIN_STIMULI[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const trialStartRef = useRef<number>(0);

  // Generate White Noise Buffer
  const generateNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    return buffer;
  };

  const playRound = useCallback(async (difficulty: number, gameState?: string) => {
    if (typeof window === 'undefined' || (gameState && gameState !== 'playing')) return;
    
    // Selection logic: Pick from a range around the difficulty level for variety
    // Difficulty is 1-5 from engine. Scale it to our 12 stimuli.
    const baseIdx = Math.floor((difficulty - 1) * (SIN_STIMULI.length / 5));
    const rangeSize = 3;
    const idx = Math.min(SIN_STIMULI.length - 1, baseIdx + Math.floor(Math.random() * rangeSize));
    const stimulus = SIN_STIMULI[idx];
    setCurrentStimulus(stimulus);
    setOptions([stimulus.target, ...stimulus.distractors].sort(() => 0.5 - Math.random()));
    
    setIsPlayingAudio(true);
    trialStartRef.current = Date.now();

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const noiseBuffer = generateNoiseBuffer(ctx);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const gainNode = ctx.createGain();
    // Adaptive noise level based on difficulty
    gainNode.gain.value = Math.min(1.0, stimulus.noiseLevel + (difficulty * 0.05)); 

    noiseSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start();
    noiseNodeRef.current = noiseSource;
    gainNodeRef.current = gainNode;

    // Play Target Word
    setTimeout(() => {
      speak(stimulus.target);
    }, 1000);

    // Stop noise after speech (approx)
    setTimeout(() => {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current = null;
      }
      setIsPlayingAudio(false);
    }, 2500);

  }, [speak]);

  const handleAnswer = (word: string, recordInteraction: any, gameState: string, difficulty: number) => {
    if (isPlayingAudio || !currentStimulus) return;
    
    const isCorrect = word === currentStimulus.target;
    if (isCorrect) play('success');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: word,
      metadata: {
        target: currentStimulus.target,
        noiseLevel: currentStimulus.noiseLevel,
        difficulty: currentStimulus.noiseLevel > 0.6 ? 'hard' : 'easy'
      }
    });

    setTimeout(() => {
      // Logic fix: pass the CURRENT difficulty prop from parent so it uses the right word index
      if (gameState === 'playing') playRound(difficulty, gameState);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) noiseNodeRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <ClinicalPlayerEngine
      title="الاستماع في الضوضاء (CAPD)"
      category="auditory_speech_noise"
      domainId="auditory-processing"
      description="تقييم عيادي لقدرة القشرة السمعية على فصل الكلام عن الضجيج (Auditory Figure-Ground)."
      instruction="المهمة: استمع للكلمة وسط الضجيج بأسرع ما يمكن، ثم اختر الكلمة الصحيحة."
      icon="👂"
      color="cyan"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="relative mb-20 flex items-center justify-center">
             {/* Sound Wave Visualization */}
             <div className="flex gap-2 items-center h-32 opacity-20">
                {[...Array(20)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={isPlayingAudio ? { height: [20, 80, 20] } : { height: 20 }}
                     transition={{ repeat: Infinity, duration: Math.random() * 0.5 + 0.2 }}
                     className="w-2 bg-cyan-500 rounded-full"
                   />
                ))}
             </div>
             <div className={`absolute w-40 h-40 rounded-full border-4 flex items-center justify-center text-6xl transition-all duration-500 bg-slate-900 ${isPlayingAudio ? 'border-cyan-500 scale-110 shadow-[0_0_50px_rgba(6,182,212,0.4)]' : 'border-slate-800 scale-100'}`}>
                {isPlayingAudio ? '🔊' : '🔈'}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
             {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isPlayingAudio || gameState !== 'playing'}
                  onClick={() => handleAnswer(opt, recordInteraction, gameState, difficulty)}
                  className={`h-24 bg-slate-900 border-4 border-slate-800 hover:border-cyan-500 rounded-[2rem] text-4xl font-black text-white transition-all shadow-xl ${isPlayingAudio ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {opt}
                </motion.button>
             ))}
          </div>

          <GameTrigger 
            gameState={gameState} 
            onStart={() => playRound(difficulty, gameState)} 
          />
          
          <div className="mt-12 text-cyan-600 text-[10px] uppercase tracking-[0.4em] font-mono opacity-30">
            SNR Threshold Analysis // CAPD_PROTOCOL_V4
          </div>
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, onStart }: any) {
  const started = useRef(false);
  useEffect(() => {
    if (gameState === 'playing' && !started.current) {
      started.current = true;
      onStart();
    }
  }, [gameState, onStart]);
  return null;
}
