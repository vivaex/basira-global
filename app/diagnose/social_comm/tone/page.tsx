'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function ToneRecognitionTest() {
  const { play } = useSound();
  const [target, setTarget] = useState<{ id: number, phrase: string, tone: string } | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const TONES = [
    { phrase: '"أوه، رائع جداً، لقد كسرت لعبتي المفضلة!"', tone: 'سخرية' },
    { phrase: '"أسرع! نحن سنتأخر عن موعد الطبيب!"', tone: 'عجلة' },
    { phrase: '"لا داعي للقلق، كل شيء سيكون على ما يرام."', tone: 'طمأنينة' },
    { phrase: '"لماذا فعلت هذا؟ لقد طلبت منك ألا تلمسها!"', tone: 'غضب' }
  ];

  const spawnRound = useCallback(() => {
    const t = TONES[Math.floor(Math.random() * TONES.length)];
    setTarget({ ...t, id: Math.random() });
    
    let opts = [t.tone];
    while (opts.length < 3) {
      const rand = TONES[Math.floor(Math.random() * TONES.length)].tone;
      if (!opts.includes(rand)) opts.push(rand);
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  }, []);

  return (
    <ClinicalPlayerEngine
      title="نبرة الصوت (Tone Recognition)"
      category="social_tone"
      domainId="social"
      description="تقييم عيادي لفهم النبرة، السخرية، والمعاني غير المباشرة في الكلام."
      instruction="المهمة: اقرأ الجملة بتمعن وحاول تخيل نبرة الصوت، ثم اختر الشعور أو الحالة المناسبة."
      icon="🎙️"
      color="rose"
      onComplete={() => {}}
    >
      {({ setScore, gameState }) => (
        <div className="w-full flex flex-col items-center">
           <AnimatePresence mode="wait">
             {target && (
               <motion.div 
                 key={target.id}
                 initial={{ opacity: 0, x: -50 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="mb-12 p-10 bg-slate-900 border-2 border-white/5 rounded-[4rem] shadow-2xl relative"
               >
                 <div className="absolute -top-6 -left-6 text-6xl text-rose-500 opacity-30">“</div>
                 <p className="text-3xl font-black text-rose-400 italic text-center max-w-2xl">{target.phrase}</p>
                 <div className="absolute -bottom-6 -right-6 text-6xl text-rose-500 opacity-30">”</div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex gap-4 flex-wrap justify-center">
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1, rotate: i % 2 === 0 ? 3 : -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (opt === target?.tone) {
                      setScore(s => s + 35);
                      play('coin');
                    } else {
                      setScore(s => Math.max(0, s - 10));
                      play('click');
                    }
                    spawnRound();
                  }}
                  className="px-12 py-6 bg-white/5 border border-white/10 rounded-3xl text-2xl font-black text-white hover:bg-rose-500 hover:text-black transition-all shadow-xl"
                >
                  {opt}
                </motion.button>
              ))}
           </div>

           <GameTrigger gameState={gameState} spawnRound={spawnRound} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, spawnRound }: any) {
  useEffect(() => {
    if (gameState === 'playing') spawnRound();
  }, [gameState, spawnRound]);
  return null;
}
