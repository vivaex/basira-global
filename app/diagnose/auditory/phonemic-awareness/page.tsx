'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

/**
 * Phonemic Awareness (Elision) - CTOPP-2 Clinical Standard
 * ------------------------------------------------------
 * Measures the ability to remove phonemes from words.
 * Telemetry: Initial Reaction Time (IRT), Hesitation, Accuracy.
 */

const ELISION_STIMULI = [
  // Level 1: Compound & Simple Syllables (Diff 1)
  { word: 'فراشة', instruction: 'قول "فراشة" بدون "فرا"', correct: 'شة', options: ['شة', 'فة', 'رشة', 'راشة'], difficulty: 1 },
  { word: 'سيارة', instruction: 'قول "سيارة" بدون "سي"', correct: 'يارة', options: ['يارة', 'سارة', 'يارة', 'ارة'], difficulty: 1 },
  { word: 'برتقال', instruction: 'قول "برتقال" بدون "بر"', correct: 'تقال', options: ['تقال', 'برقان', 'بقال', 'رتقال'], difficulty: 1 },
  { word: 'كمبيوتر', instruction: 'قول "كمبيوتر" بدون "كم"', correct: 'بيوتر', options: ['بيوتر', 'موتر', 'بيتر', 'كمبيو'], difficulty: 1 },
  { word: 'نافذة', instruction: 'قول "نافذة" بدون "نافـ"', correct: 'ذة', options: ['ذة', 'فاذة', 'ناذة', 'نافـ'], difficulty: 1 },
  { word: 'تمساح', instruction: 'قول "تمساح" بدون "تمـ"', correct: 'ساح', options: ['ساح', 'تمسا', 'مساح', 'سا'], difficulty: 1 },
  
  // Level 2: Multiple Syllables (Diff 2)
  { word: 'مكتبة', instruction: 'قول "مكتبة" بدون "مك"', correct: 'تبة', options: ['تبة', 'كتة', 'كبة', 'متبة'], difficulty: 2 },
  { word: 'مسجد', instruction: 'قول "مسجد" بدون "مـ"', correct: 'سجد', options: ['سجد', 'مجد', 'سد', 'مسد'], difficulty: 2 },
  { word: 'بستان', instruction: 'قول "بستان" بدون "بس"', correct: 'تان', options: ['تان', 'ستان', 'بسـ', 'بان'], difficulty: 2 },
  { word: 'ميزان', instruction: 'قول "ميزان" بدون "ميـ"', correct: 'زان', options: ['زان', 'ميزا', 'ريزان', 'يزان'], difficulty: 2 },
  { word: 'طائرة', instruction: 'قول "طائرة" بدون "طـ"', correct: 'ائرة', options: ['ائرة', 'طيرة', 'طارة', 'ئرة'], difficulty: 2 },

  // Level 3: Initial Phonemes (Diff 3)
  { word: 'فول', instruction: 'قول "فول" بدون حرف "ف"', correct: 'ول', options: ['ول', 'فل', 'لو', 'وو'], difficulty: 3 },
  { word: 'قلم', instruction: 'قول "قلم" بدون حرف "ق"', correct: 'لم', options: ['لم', 'قل', 'قم', 'امل'], difficulty: 3 },
  { word: 'سحاب', instruction: 'قول "سحاب" بدون حرف "س"', correct: 'حاب', options: ['حاب', 'سحا', 'حا', 'حسب'], difficulty: 3 },
  { word: 'كتاب', instruction: 'قول "كتاب" بدون حرف "ك"', correct: 'تاب', options: ['تاب', 'با', 'كتب', 'كات'], difficulty: 3 },
  { word: 'شجرة', instruction: 'قول "شجرة" بدون حرف "ش"', correct: 'جرة', options: ['جرة', 'شج', 'شة', 'رجة'], difficulty: 3 },
  { word: 'كرسي', instruction: 'قول "كرسي" بدون حرف "ك"', correct: 'رسي', options: ['رسي', 'كورس', 'كور', 'سي'], difficulty: 3 },

  // Level 4: Medial & Final Phonemes (Diff 4-5)
  { word: 'سماء', instruction: 'قول "سماء" بدون حرف "س"', correct: 'ماء', options: ['ماء', 'سما', 'ماء', 'ام'], difficulty: 4 },
  { word: 'مدرسه', instruction: 'قول "مدرسه" بدون حرف "د"', correct: 'مرسه', options: ['مرسه', 'مدسة', 'درسة', 'مدسه'], difficulty: 5 }
];

export default function PhonemicAwarenessTest() {
  return (
    <ClinicalPlayerEngine
      title="الوعي الفونيمي (Elision)"
      category="auditory_elision"
      domainId="phonological-awareness"
      description="تقييم عيادي للقدرة على معالجة وتفكيك الأصوات اللغوية (معيار CTOPP-2)."
      instruction="المهمة: استمع للكلمة والتعليمات، ثم اختر الجزء المتبقي من الكلمة."
      icon="🧩"
      color="violet"
      onComplete={() => {}}
      duration={120}
    >
      {(engineProps: any) => <PhonemicAwarenessModule {...engineProps} />}
    </ClinicalPlayerEngine>
  );
}

function PhonemicAwarenessModule({ recordInteraction, difficulty, gameState }: any) {
  const { play } = useSound();
  const { speak } = useTTS();
  const [currentStimulus, setCurrentStimulus] = useState<typeof ELISION_STIMULI[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const trialStartRef = useRef<number>(0);
  const started = useRef(false);

  // Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => {
          setIsRecording(false);
          setMicError(true);
        };

        recognition.onresult = (event: any) => {
          const results = Array.from(event.results);
          const text = results.map((r: any) => r[0].transcript).join('').trim();
          setTranscript(text);
          
          // Auto-check if transcript matches correct answer
          if (currentStimulus && text.includes(currentStimulus.correct)) {
             handleAnswer(currentStimulus.correct);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setMicError(true);
      }
    }
  }, [currentStimulus]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Mic failed:", e);
      }
    }
  };

  const spawnTrial = useCallback((diff: number) => {
    if (gameState !== 'playing') return;

    const pool = ELISION_STIMULI.filter(s => s.difficulty <= Math.ceil(diff));
    const random = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrentStimulus(random);
    setOptions([...random.options].sort(() => Math.random() - 0.5));
    trialStartRef.current = Date.now();

    setTimeout(() => {
        speak(random.instruction);
    }, 500);
  }, [speak, gameState]);

  const handleAnswer = (choice: string) => {
    if (!currentStimulus || gameState !== 'playing') return;
    
    const isCorrect = choice === currentStimulus.correct;
    const rt = Date.now() - trialStartRef.current;

    if (isCorrect) play('success');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: choice,
      metadata: {
        word: currentStimulus.word,
        instruction: currentStimulus.instruction,
        expected: currentStimulus.correct,
        difficulty: currentStimulus.difficulty,
        hesitation: rt > 3000
      }
    });

    setTimeout(() => {
        spawnTrial(difficulty);
    }, 1000);
  };

  useEffect(() => {
    if (gameState === 'playing' && !started.current) {
      started.current = true;
      spawnTrial(difficulty);
    }
  }, [gameState, difficulty, spawnTrial]);

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        {currentStimulus && gameState === 'playing' && (
          <motion.div
            key={currentStimulus.word}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="mb-12 text-center w-full max-w-2xl"
          >
            <div className="bg-slate-900/60 backdrop-blur-xl border-2 border-white/10 p-12 rounded-[4rem] relative overflow-hidden">
               <div className="text-8xl mb-8 animate-float">🧩</div>
               <h2 className="text-8xl font-black text-white mb-6 font-dyslexic italic tracking-tighter drop-shadow-2xl">
                 {currentStimulus.word}
               </h2>
               
               <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => speak(currentStimulus.instruction)}
                      className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-8 py-3 rounded-2xl text-lg font-bold flex items-center gap-3 hover:bg-purple-500/30 transition-all active:scale-95"
                    >
                      <span>🔊 أعد التعليمات</span>
                    </button>

                    <button 
                      onClick={toggleRecording}
                      disabled={micError}
                      className={`px-8 py-3 rounded-2xl text-lg font-black flex items-center gap-3 transition-all active:scale-95 border-2 ${isRecording ? 'bg-rose-500 border-rose-400 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'}`}
                    >
                      {isRecording ? '⏹ توقف' : '🎤 قل الإجابة'}
                    </button>
                  </div>

                  {transcript && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 w-full">
                        <p className="text-purple-400 font-mono text-xl italic">"{transcript}"</p>
                     </motion.div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl px-4">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(opt)}
            className="bg-slate-900 border-4 border-slate-800 hover:border-purple-500 rounded-[2.5rem] p-10 text-4xl font-black text-white transition-all shadow-xl hover:shadow-purple-500/20 flex items-center justify-center min-h-[140px]"
          >
            {opt}
          </motion.button>
        ))}
      </div>

      <div className="mt-12 text-slate-500 text-[10px] uppercase tracking-[0.4em] font-mono opacity-30">
        CTOPP-2 Clinical Protocol // LATENCY_SENSITIVE
      </div>
    </div>
  );
}
