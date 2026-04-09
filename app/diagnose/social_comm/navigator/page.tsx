'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

// --- THEORY OF MIND SCENARIOS ---
const SCENARIOS = [
  {
    id: 1,
    type: 'false_belief',
    story: 'سالي وضعت لعبتها في الصندوق الأحمر وخرجت. دخلت نورة ونقلت اللعبة إلى الصندوق الأزرق. عندما تعود سالي، أين ستفكر أن اللعبة موجودة؟',
    choices: [
      { text: 'في الصندوق الأحمر (مكانها الأصلي)', correct: true },
      { text: 'في الصندوق الأزرق (مكانها الجديد)', correct: false }
    ]
  },
  {
    id: 2,
    type: 'sarcasm',
    story: 'سقطت حقيبة أحمد وتناثرت الكتب. قالت له مريم بصوت ساخر: "يا لك من شخص منظم جداً!". ماذا تقصد مريم؟',
    choices: [
      { text: 'تقصد أنه فوضوي في الحقيقة', correct: true },
      { text: 'تقصد أنه مرتب فعلاً وتحب تنظيمه', correct: false }
    ]
  },
  {
    id: 3,
    type: 'intent',
    story: 'سامي كسر زهرية أمه بالخطأ وهو يلعب. بدأ بالبكاء واعتذر فوراً. كيف يشعر سامي تجاه ما حدث؟',
    choices: [
      { text: 'يشعر بالندم لأنه لم يقصد كسرها', correct: true },
      { text: 'يشعر بالسعادة لأنه أراد تخريبها', correct: false }
    ]
  },
  {
    id: 4,
    type: 'social_blunder',
    story: 'دعت ريم صديقتها لغداء طبخته بنفسها. قالت الصديقة: "هذا الطعام لا يصلح للأكل أبداً!". كيف سيكون شعور ريم؟',
    choices: [
      { text: 'ستشعر بالإحراج والحزن', correct: true },
      { text: 'ستشعر بالفخر والسعادة', correct: false }
    ]
  }
];

export default function TheoryOfMindTest() {
  const { play } = useSound();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  const scenario = SCENARIOS[currentIdx];

  const handleChoice = (isCorrect: boolean, setScore: any, nextRound: any, difficulty: number) => {
    if (feedback !== 'none') return;

    if (isCorrect) {
      setScore((s: number) => s + 75);
      play('success');
      setFeedback('correct');
      nextRound(true);
    } else {
      play('click');
      setFeedback('wrong');
      nextRound(false);
    }

    setTimeout(() => {
      setFeedback('none');
      setCurrentIdx(prev => (prev + 1) % SCENARIOS.length);
    }, 1200);
  };

  return (
    <ClinicalPlayerEngine
      title="ملاح القصص (Theory of Mind)"
      category="social_navigator"
      domainId="social"
      description="تقييم القدرة على إدراك الحالة الذهنية للآخرين وفهم السياقات الاجتماعية غير المباشرة."
      instruction="المهمة: اقرأ الموقف الاجتماعي بذكاء، وحاول أن تضع نفسك مكان الشخصيات لتفهم ما يدور في أذهانهم."
      icon="🧠"
      color="indigo"
      onComplete={() => {}}
    >
      {({ setScore, nextRound, difficulty, gameState }: any) => (
        <div className="w-full flex flex-col items-center max-w-4xl">
           
           <AnimatePresence mode="wait">
             <motion.div
               key={currentIdx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="mb-12 p-12 bg-slate-900/50 border border-white/5 rounded-[4rem] shadow-2xl relative overflow-hidden"
             >
                {/* Decorative ToM Icon */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 blur-[60px] rounded-full" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                   <div className="mb-4 px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-[0.6rem] font-bold uppercase tracking-widest">
                     SCENARIO #{currentIdx + 1} | {scenario.type.toUpperCase()}
                   </div>
                   <p className="text-3xl font-black text-white leading-relaxed mb-6">
                      {scenario.story}
                   </p>
                </div>
             </motion.div>
           </AnimatePresence>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {scenario.choices.map((choice, i) => (
                <motion.button
                  key={`${currentIdx}-${i}`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChoice(choice.correct, setScore, nextRound, difficulty)}
                  className={`p-10 bg-slate-900 border-2 rounded-[3rem] text-xl font-bold transition-all shadow-xl text-right ${
                    feedback === 'correct' && choice.correct ? 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20' :
                    feedback === 'wrong' && !choice.correct ? 'border-rose-500 shadow-rose-500/10' : 'border-white/5 hover:border-indigo-500/40 text-white'
                  }`}
                >
                  <span className="text-indigo-400 mr-2">✦</span> {choice.text}
                </motion.button>
              ))}
           </div>

           <div className="mt-16 text-slate-600 text-[0.6rem] font-bold uppercase tracking-[0.4em] italic">
             Social Cognition Protocol v4.0 | Mental Attribution Mode
           </div>
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}
