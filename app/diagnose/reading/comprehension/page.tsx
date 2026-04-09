'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// PIRLS-inspired passages and questions
const PASSAGES = [
  {
    id: 1,
    difficulty: 1,
    text: "ذهب عادل إلى الشاطئ مع عائلته. بنى قصراً كبيراً من الرمل، ثم سبح في الماء البارد. كانت الشمس ساطعة والرياح هادئة.",
    questions: [
      { q: "ماذا بنى عادل في الشاطئ؟", options: ["بيت خشبي", "قصر رملي", "قارب صغير"], correct: 1 },
      { q: "كيف كان الجو في ذلك اليوم؟", options: ["عاصف وممطر", "مشمس وهادئ", "مثلج وبارد"], correct: 1 }
    ]
  },
  {
    id: 2,
    difficulty: 2,
    text: "في ليلة مقمرة، قرر البوم الصغير الطيران لأول مرة. خاف في البداية من ظلال الأشجار، لكنه سرعان ما وجد صديقه الأرنب يلعب تحت ضوء القمر، فشعر بالأمان.",
    questions: [
      { q: "لماذا خاف البوم في البداية؟", options: ["من صديقه الأرنب", "من ظلال الأشجار", "من ضوء القمر"], correct: 1 },
      { q: "ما الذي جعل البوم يشعر بالأمان؟", options: ["رؤية صديقه", "العودة للعش", "شروق الشمس"], correct: 0 }
    ]
  },
  {
    id: 3,
    difficulty: 3,
    text: "تعتبر النحلة من أنفع الحشرات للإنسان. فهي لا تكتفي بإنتاج العسل اللذيذ، بل تساهم في تلقيح الأزهار لتنمو الثمار. تعيش النحلة في خلية منظمة يحكمها التعاون والعمل الجاد.",
    questions: [
      { q: "ما هي الفائدة الإضافية للنحلة غير العسل؟", options: ["حماية الأزهار", "تلقيح الأزهار", "صناعة الشمع"], correct: 1 },
      { q: "ما هي الصفة الأبرز للخلية التي تعيش فيها النحلة؟", options: ["الفوضى", "النظام والتعاون", "العزلة"], correct: 1 }
    ]
  }
];

export default function ReadingComprehension() {
  const { play } = useSound();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const startPassage = useCallback(() => {
    setShowQuestions(false);
    setQIndex(0);
    setStartTime(Date.now());
  }, []);

  const handleFinishReading = () => {
    setShowQuestions(true);
    play('click');
  };

  const handleAnswer = (choiceIdx: number, setScore: any, nextRound: any) => {
    const isCorrect = choiceIdx === PASSAGES[currentLevel].questions[qIndex].correct;
    
    if (isCorrect) {
      setScore((s: number) => s + 20);
      play('success');
    } else {
      play('click');
    }

    if (qIndex + 1 < PASSAGES[currentLevel].questions.length) {
      setQIndex(prev => prev + 1);
    } else {
      // Advance level or finish
      if (currentLevel + 1 < PASSAGES.length) {
        setCurrentLevel(prev => prev + 1);
        startPassage();
        nextRound(isCorrect); // Trigger IRT scaling
      } else {
        // Final completion logic handled by ClinicalPlayerEngine
      }
    }
  };

  return (
    <ClinicalPlayerEngine
      title="فهم المقروء (Comprehension)"
      category="reading_comprehension"
      domainId="literacy"
      description="تقييم القدرة على استخلاص المعاني المباشرة وغير المباشرة من النص (معايير PIRLS)."
      instruction="المهمة: اقرأ القصة بتركيز، ثم أجب على الأسئلة التي تليها."
      icon="📖"
      color="blue"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, gameState }: any) => (
        <div className="w-full max-w-4xl px-4 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {!showQuestions ? (
              <motion.div
                key={`p-${currentLevel}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/50 p-12 rounded-[4rem] border border-white/10 shadow-2xl text-right w-full"
              >
                <div className="mb-8 flex justify-between items-center border-b border-white/5 pb-6">
                  <span className="text-blue-400 font-black text-xl uppercase tracking-widest">المستوى الدراسي: {currentLevel + 1}</span>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-slate-500 text-sm">جاري تسجيل زمن القراءة...</span>
                  </div>
                </div>
                
                <p className="text-4xl md:text-5xl font-bold leading-relaxed text-white mb-12 font-serif">
                  {PASSAGES[currentLevel].text}
                </p>

                <button
                  onClick={handleFinishReading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-[2.5rem] text-2xl shadow-xl transition-all active:scale-95"
                >
                  انتهيت من القراءة، أرني الأسئلة! 🎯
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`q-${currentLevel}-${qIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full"
              >
                <div className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-blue-500/20 mb-8 text-right">
                   <h3 className="text-slate-500 text-lg mb-4 font-bold flex justify-between">
                     <span>السؤال {qIndex + 1} من {PASSAGES[currentLevel].questions.length}</span>
                     <span className="text-blue-400 italic">اختبر فهمك...</span>
                   </h3>
                   <p className="text-4xl font-black text-white">
                     {PASSAGES[currentLevel].questions[qIndex].q}
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {PASSAGES[currentLevel].questions[qIndex].options.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(i, setScore, nextRound)}
                      className="p-8 bg-slate-900 border-2 border-white/5 hover:border-blue-500/50 rounded-[2.5rem] text-2xl font-bold text-white transition-all shadow-xl text-right"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <GameTrigger gameState={gameState} onStart={startPassage} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, onStart }: any) {
  useEffect(() => {
    if (gameState === 'playing') {
      onStart();
    }
  }, [gameState, onStart]);
  return null;
}