'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useTTS } from '@/hooks/useTTS';

/**
 * Empathy Scenarios (Social Intelligence) - Clinical Adaptation
 * -----------------------------------------------------------
 * Measures affective and cognitive empathy.
 * Task: Identify others' feelings and choose the best pro-social action.
 */

const SCENARIOS = [
  {
    id: 1,
    scenario: 'كسر صديقك لعبته المفضلة وهو الآن يبكي.',
    emotion: 'حزين',
    choices: [
      { text: 'أذهب لمساعدته ومواساته', isCorrect: true, emoji: '🤝' },
      { text: 'أضحك عليه وعلى لعبته', isCorrect: false, emoji: '😂' },
      { text: 'أتجاهله وأذهب للعب', isCorrect: false, emoji: '🏃' },
      { text: 'آخذ اللعبة المكسورة منه', isCorrect: false, emoji: '😠' }
    ]
  },
  {
    id: 2,
    scenario: 'رأيت طفلاً جديداً في المدرسة يجلس وحيداً في وقت الاستراحة.',
    emotion: 'وحيد/حزين',
    choices: [
      { text: 'أدعوه للعب معنا', isCorrect: true, emoji: '⚽' },
      { text: 'أقول له لا يمكنك اللعب هنا', isCorrect: false, emoji: '🚫' },
      { text: 'أرمي عليه الكرة بقوة', isCorrect: false, emoji: '☄️' },
      { text: 'أنظر إليه وأضحك مع أصحابي', isCorrect: false, emoji: '🤐' }
    ]
  },
  {
    id: 3,
    scenario: 'أختك الصغيرة وقعت وأصابت ركبتها وهي تصرخ من الألم.',
    emotion: 'متألمة',
    choices: [
      { text: 'أنادي أمي لمساعدتها', isCorrect: true, emoji: '👩' },
      { text: 'أقول لها توقفي عن الصراخ', isCorrect: false, emoji: '🤫' },
      { text: 'أبدأ بالصراخ معها', isCorrect: false, emoji: '😫' },
      { text: 'آخذ أغراضها وهي مشغولة', isCorrect: false, emoji: '🎒' }
    ]
  },
  {
    id: 4,
    scenario: 'دخل معلم جديد الفصل، وبعض الطلاب بدأوا بالهمس والضحك.',
    emotion: 'غير مرتاح',
    choices: [
      { text: 'أجلس بهدوء وأستمع للمعلم', isCorrect: true, emoji: '👨‍🏫' },
      { text: 'أشاركهم الهمس والضحك', isCorrect: false, emoji: '🤭' },
      { text: 'أقوم من مكاني وأصرخ', isCorrect: false, emoji: '📢' },
      { text: 'أرمي ورقة على المعلم', isCorrect: false, emoji: '📄' }
    ]
  },
  {
    id: 5,
    scenario: 'خسر فريقك المفضل في مباراة اليوم، وزميلك يمزح معك عن ذلك.',
    emotion: 'محبط/مستاء',
    choices: [
      { text: 'أبتسم وأقول: "كانت مباراة جيدة"', isCorrect: true, emoji: '🤝' },
      { text: 'أصرخ في وجهه بغضب', isCorrect: false, emoji: '😠' },
      { text: 'أبدأ بالبكاء بصوت عالٍ', isCorrect: false, emoji: '😭' },
      { text: 'أدفعه بقوة بعيداً عني', isCorrect: false, emoji: '👋' }
    ]
  }
];

export default function EmpathyScenariosTest() {
  const { play } = useSound();
  const { speak } = useTTS();
  const [current, setCurrent] = useState<typeof SCENARIOS[0] | null>(null);
  const trialStartRef = useRef<number>(0);

  const spawnTrial = useCallback(() => {
    const random = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrent(random);
    trialStartRef.current = Date.now();
    
    // Clinical: Read scenario
    setTimeout(() => {
        speak(random.scenario);
    }, 500);
  }, [speak]);

  const handleAnswer = (choice: any, recordInteraction: any) => {
    if (!current) return;
    
    const isCorrect = choice.isCorrect;
    if (isCorrect) play('success');
    else play('click');

    recordInteraction({
      isCorrect,
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: choice.text,
      metadata: { 
        scenarioId: current.id,
        isProSocial: isCorrect,
        hesitation: (Date.now() - trialStartRef.current) > 6000 // Complex social decision threshold
      }
    });

    setTimeout(() => spawnTrial(), 1500);
  };

  return (
    <ClinicalPlayerEngine
      title="مواقف التعاطف (Theory of Mind)"
      category="social_empathy"
      domainId="social-cognition"
      description="تقييم عيادي للذكاء الاجتماعي والتعاطف (Pro-social behavior screening)."
      instruction="المهمة: اقرأ الموقف بعناية، وفكر في مشاعر الآخرين.. ما هو أفضل تصرف تفعله الآن؟"
      icon="🤝"
      color="violet"
      onComplete={() => {}}
    >
      {({ recordInteraction, gameState }) => (
        <div className="w-full flex flex-col items-center">
          
          <AnimatePresence mode="wait">
            {current && gameState === 'playing' && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mb-12 w-full max-w-3xl"
              >
                <div className="bg-slate-900/60 backdrop-blur-xl border-4 border-violet-500/20 rounded-[3rem] p-10 text-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <button onClick={() => speak(current.scenario)} className="text-4xl">🔊</button>
                   </div>
                   <div className="text-6xl mb-6 scale-125">🤝</div>
                   <h2 className="text-4xl font-black text-white leading-relaxed font-arabic italic">
                     {current.scenario}
                   </h2>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
            {current?.choices.map((choice, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(choice, recordInteraction)}
                className="bg-slate-900 border-4 border-slate-800 hover:border-violet-500 rounded-[2.5rem] p-8 text-2xl font-black text-white transition-all shadow-xl flex items-center justify-between text-right"
              >
                <span className="flex-1 pr-4">{choice.text}</span>
                <span className="text-4xl bg-slate-800 p-3 rounded-2xl shadow-inner">{choice.emoji}</span>
              </motion.button>
            ))}
          </div>

          <GameTrigger 
            gameState={gameState} 
            onStart={() => spawnTrial()} 
          />
          
          <div className="mt-12 text-violet-600/30 text-[9px] uppercase tracking-[0.4em] font-mono">
            Social Cognition Unit // EMP_DECISION_PROTO
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
