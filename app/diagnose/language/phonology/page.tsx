'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// CTOPP-2 inspired stimuli (Elision, Blending & Phoneme Isolation)
// Standard: Auditory-Only. Text is for the TTS engine.
const PHONO_STIMULI = [
  // ELISION - Simple
  { type: 'elision', prompt: "قل 'بحر' بدون حرف 'ب'", word: "بحر", remove: "ب", options: ["حر", "بح", "بر"], correct: 0, difficulty: 1 },
  { type: 'elision', prompt: "قل 'سماء' بدون حرف 'س'", word: "سماء", remove: "س", options: ["ماء", "سما", "مأ"], correct: 0, difficulty: 1 },
  { type: 'elision', prompt: "قل 'مكتب' بدون الـ 'م'", word: "مكتب", remove: "م", options: ["كتب", "تكت", "كبت"], correct: 0, difficulty: 2 },
  
  // BLENDING - CVC & CVVC
  { type: 'blending', prompt: "ما هي الكلمة: قـ... لـ... مـ...", sounds: ["ق", "ل", "م"], options: ["قلم", "لقم", "ملق"], correct: 0, difficulty: 2 },
  { type: 'blending', prompt: "ما هي الكلمة: سـ... مـ... كـ...", sounds: ["س", "م", "ك"], options: ["سمك", "كمس", "مسك"], correct: 0, difficulty: 2 },
  { type: 'blending', prompt: "ما هي الكلمة: كـ... تـ... ا... بـ...", sounds: ["ك", "ت", "ا", "ب"], options: ["كاتب", "كتاب", "تكات"], correct: 1, difficulty: 3 },
  
  // PHONEME ISOLATION
  { type: 'isolation_first', prompt: "ما هو الصوت الأول في كلمة 'فراشة'؟", word: "فراشة", options: ["فـ", "ر", "ش"], correct: 0, difficulty: 2 },
  { type: 'isolation_last', prompt: "ما هو الصوت الأخير في كلمة 'بيت'؟", word: "بيت", options: ["ب", "ي", "ت"], correct: 2, difficulty: 3 },
  
  // ELISION - Compound & Middle
  { type: 'elision', prompt: "قل 'فارس' بدون حرف 'ر'", word: "فارس", remove: "ر", options: ["فاس", "فار", "أرس"], correct: 0, difficulty: 3 },
  { type: 'elision', prompt: "قل 'كرسي' بدون حرف 'س'", word: "كرسي", remove: "س", options: ["كري", "كرو", "كرس"], correct: 0, difficulty: 4 },
  { type: 'elision', prompt: "قل 'شمعدان' بدون الـ 'شمع'", word: "شمعدان", remove: "شمع", options: ["دان", "عمد", "شمع"], correct: 0, difficulty: 5 },
];

export default function PhonologyTest() {
  const { play } = useSound();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedCurrent, setHasStartedCurrent] = useState(false);
  
  const trialStartTime = useRef<number>(0);
  const audioEndTimestamp = useRef<number>(0);

  const speakPrompt = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onstart = () => {
        setIsSpeaking(true);
        trialStartTime.current = performance.now();
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        audioEndTimestamp.current = performance.now();
      };
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleAnswer = (choiceIdx: number, recordInteraction: any, difficulty: number) => {
    if (isSpeaking) return; 

    const now = performance.now();
    const isCorrect = choiceIdx === PHONO_STIMULI[currentIdx].correct;
    
    // Clinical Telemetry: Process Metrics
    // Hesitation = Time from audio end to response
    const hesitation = now - audioEndTimestamp.current;

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: PHONO_STIMULI[currentIdx].options[choiceIdx],
      itemDifficulty: PHONO_STIMULI[currentIdx].difficulty,
      metadata: { 
        type: PHONO_STIMULI[currentIdx].type,
        hesitation,
        promptLength: audioEndTimestamp.current - trialStartTime.current
      }
    });

    if (isCorrect) {
      play('success');
    } else {
      play('click');
    }

    if (currentIdx + 1 < PHONO_STIMULI.length) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
        setHasStartedCurrent(false);
      }, 800);
    }
  };

  return (
    <ClinicalPlayerEngine
      title="الوعي الصوتي (Phonological Awareness)"
      category="language_phonology"
      domainId="language"
      description="تقييم القدرة على تفكيك ودمج أصوات اللغة (الوعي الفونولوجي - معايير CTOPP-2)."
      instruction="المهمة: استمع للمطلوب بدقة، ثم اختر الإجابة التي تمثل الكلمة الناتجة. اعتمد على أذنيك فقط!"
      icon="👂"
      color="indigo"
      onComplete={() => {}}
    >
      {({ recordInteraction, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="mb-16 flex flex-col items-center gap-10">
             <motion.button
               animate={{ 
                 scale: isSpeaking ? [1, 1.05, 1] : 1,
                 boxShadow: isSpeaking ? "0 0 70px rgba(99, 102, 241, 0.5)" : "0 0 20px rgba(0,0,0,0.1)"
               }}
               transition={{ repeat: isSpeaking ? Infinity : 0, duration: 1.2 }}
               onClick={() => speakPrompt(PHONO_STIMULI[currentIdx].prompt)}
               className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-8 ${
                 isSpeaking ? 'bg-indigo-600 border-indigo-400 rotate-12' : 'bg-slate-900 border-indigo-500/20'
               }`}
             >
                <div className="flex flex-col items-center gap-2">
                   <span className="text-8xl">{isSpeaking ? '🗣️' : '🔈'}</span>
                   {!isSpeaking && <span className="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-400">اضغط للاستماع</span>}
                </div>
             </motion.button>
             
             <div className="text-center group">
                <h3 className="text-slate-500 font-black text-[0.6rem] uppercase tracking-[0.4em] mb-3 group-hover:text-indigo-400 transition-colors">مستوى الوعي الفونولوجي</h3>
                <div className="flex items-center gap-4 text-3xl font-bold text-white font-arabic">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  {isSpeaking ? 'جاري قراءة المثير...' : 'المهمة جاهزة استمع لها'}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            {PHONO_STIMULI[currentIdx].options.map((opt, i) => (
              <motion.button
                key={`${currentIdx}-${i}`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(i, recordInteraction, difficulty)}
                className={`p-10 bg-slate-900/40 hover:bg-indigo-600/20 border-2 rounded-[3.5rem] text-4xl font-black text-white shadow-2xl transition-all h-32 flex items-center justify-center
                  ${isSpeaking ? 'opacity-30 cursor-not-allowed border-white/5' : 'opacity-100 border-white/10 hover:border-indigo-400'}`}
              >
                {opt}
              </motion.button>
            ))}
          </div>

          <div className="mt-16 flex items-center gap-6 text-slate-600 text-[0.65rem] font-bold uppercase tracking-[0.3em] font-sans">
             <div className="w-16 h-px bg-slate-800" />
             CTOPP-2 Standardized Protocol
             <div className="w-16 h-px bg-slate-800" />
          </div>

          {/* Clinical Visual Distractor (keeps engagement without helping with task) */}
          <div className="mt-8 flex gap-2">
             {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className={`w-1 h-1 rounded-full ${i < currentIdx + 1 ? 'bg-indigo-500 shadow-[0_0_10px_indigo]' : 'bg-slate-800'}`} />
             ))}
          </div>

          <GameTrigger 
            gameState={gameState} 
            currentIndex={currentIdx}
            isSpeaking={isSpeaking}
            onStart={() => {
              if (!hasStartedCurrent) {
                setHasStartedCurrent(true);
                speakPrompt(PHONO_STIMULI[currentIdx].prompt);
              }
            }} 
          />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, currentIndex, isSpeaking, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing' && !isSpeaking) {
      onStart();
    }
  }, [gameState, currentIndex, onStart, isSpeaking]);
  return null;
}