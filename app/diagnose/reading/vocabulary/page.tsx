'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// PPVT-5 inspired stimuli: Word prompt -> Semantic picture matching
const VOCAB_STIMULI = [
  { prompt: "وسيلة نقل تطير فوق السحاب", options: ["🚢", "✈️", "🚲", "🚗"], correct: 1, difficulty: 1, label: "Plane" },
  { prompt: "شيء نستخدمه لنعرف الوقت بدقة", options: ["👓", "⌚", "💍", "📱"], correct: 1, difficulty: 1, label: "Watch" },
  { prompt: "حيوان ضخم جداً له خرطوم طويل", options: ["🦁", "🐘", "🦒", "🐫"], correct: 1, difficulty: 1, label: "Elephant" },
  { prompt: "مكان نذهب إليه لطلب العلم ومقابلة المعلم", options: ["🏥", "🏫", "🎡", "🏢"], correct: 1, difficulty: 2, label: "School" },
  { prompt: "أداة معدنية نستخدمها لفتح الأبواب", options: ["🔑", "🔨", "🪛", "✂️"], correct: 0, difficulty: 2, label: "Key" },
  { prompt: "كوكب أزرق جميل هو موطننا جميعاً", options: ["🌑", "🌍", "☀️", "🪐"], correct: 1, difficulty: 3, label: "Earth" },
  { prompt: "آلة موسيقية خشبية لها أوتار رقيقة", options: ["🥁", "🎻", "🎺", "🎸"], correct: 1, difficulty: 3, label: "Violin" },
  { prompt: "طبق طعام إيطالي مستدير ومغطى بالجبن", options: ["🍔", "🍕", "🌭", "🥪"], correct: 1, difficulty: 2, label: "Pizza" },
  { prompt: "فاكهة صفراء طويلة يحبها القردة", options: ["🍎", "🍌", "🍇", "🍓"], correct: 1, difficulty: 1, label: "Banana" },
  { prompt: "جهاز ذكي نستخدمه للبحث والتواصل", options: ["📺", "💻", "📻", "📷"], correct: 1, difficulty: 2, label: "Laptop" }
];

export default function VocabularyTest() {
  return (
    <ClinicalPlayerEngine
      title="مخزون المفردات (Vocabulary Test)"
      category="reading_vocabulary"
      domainId="language"
      description="تقييم العمق المعرفي والربط الدلالي (معايير PPVT-5 للذكاء اللفظي)."
      instruction="المهمة: اقرأ الوصف بعناية، ثم اختر الرمز الذي يطابق هذا الوصف من الخيارات المتاحة."
      icon="📚"
      color="indigo"
      onComplete={() => {}}
    >
      {(engineProps: any) => <VocabularyModule {...engineProps} />}
    </ClinicalPlayerEngine>
  );
}

function VocabularyModule({ recordInteraction, difficulty, gameState }: any) {
  const { play } = useSound();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const trialStartTime = useRef<number>(0);
  const started = useRef(false);

  const startTrial = useCallback(() => {
    setFeedback('none');
    trialStartTime.current = performance.now();
  }, []);

  const handleAnswer = (choiceIdx: number) => {
    if (feedback !== 'none' || gameState !== 'playing') return;

    const now = performance.now();
    const isCorrect = choiceIdx === VOCAB_STIMULI[currentIdx].correct;

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartTime.current,
      timestampResponded: now,
      responseValue: VOCAB_STIMULI[currentIdx].options[choiceIdx],
      itemDifficulty: difficulty,
      metadata: { 
        targetWord: VOCAB_STIMULI[currentIdx].label,
        stimulusId: currentIdx 
      }
    });

    if (isCorrect) {
      play('success');
      setFeedback('correct');
    } else {
      play('click');
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (currentIdx + 1 < VOCAB_STIMULI.length) {
        setCurrentIdx(prev => prev + 1);
        startTrial();
      }
    }, 1200);
  };

  useEffect(() => {
    if (gameState === 'playing' && !started.current) {
      started.current = true;
      startTrial();
    }
  }, [gameState, startTrial]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-16 w-full max-w-5xl bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden min-h-[16rem] flex items-center justify-center">
         <AnimatePresence mode="wait">
           {gameState === 'playing' && (
             <motion.div
               key={currentIdx}
               initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
               animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
               exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
               className="text-center"
             >
               <span className="text-indigo-400 font-black text-[0.6rem] uppercase tracking-[0.4em] mb-4 block">السؤال {currentIdx + 1}</span>
               <h2 className="text-4xl md:text-5xl font-bold text-white font-arabic leading-relaxed">
                 "{VOCAB_STIMULI[currentIdx].prompt}"
               </h2>
             </motion.div>
           )}
         </AnimatePresence>
         
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px]" />
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-[80px]" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl">
        {VOCAB_STIMULI[currentIdx].options.map((opt, i) => (
          <motion.button
            key={`${currentIdx}-${i}`}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(i)}
            className={`h-48 rounded-[3rem] border-2 flex items-center justify-center text-7xl md:text-8xl transition-all duration-300 shadow-2xl relative group
              ${feedback === 'correct' && i === VOCAB_STIMULI[currentIdx].correct ? 'bg-emerald-600/20 border-emerald-500 shadow-emerald-500/30' : 
                feedback === 'wrong' && i !== VOCAB_STIMULI[currentIdx].correct ? 'bg-slate-900/50 border-white/5 opacity-50' :
                'bg-slate-900/40 border-white/10 hover:border-indigo-500/40 group-hover:bg-slate-900/60'}`}
          >
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100" />
             <span className="relative z-10">{opt}</span>
             
             {feedback === 'correct' && i === VOCAB_STIMULI[currentIdx].correct && (
                <motion.div 
                  layoutId="success-ring"
                  className="absolute inset-0 border-4 border-emerald-500 rounded-[3rem]"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                />
             )}
          </motion.button>
        ))}
      </div>

      <div className="mt-20 flex flex-col items-center gap-2">
         <div className="flex gap-1.5">
            {VOCAB_STIMULI.map((_, i) => (
               <div key={i} className={`w-12 h-1 rounded-full transition-all duration-500 ${i <= currentIdx ? 'bg-indigo-500' : 'bg-slate-800'}`} />
            ))}
         </div>
         <span className="text-slate-600 font-bold uppercase tracking-[0.4em] text-[0.5rem] mt-2">Semantic_Linkage_Protocol: ACTIVATED</span>
      </div>
    </div>
  );
}