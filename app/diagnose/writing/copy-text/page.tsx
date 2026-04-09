'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';
import { useLanguage } from '@/app/components/LanguageContext';

const COPY_SENTENCES = [
  { text: 'ذهب الولد إلى المدرسة مبكراً.', difficulty: 1 },
  { text: 'السماء صافية والجو جميل في هذا اليوم.', difficulty: 1 },
  { text: 'القراءة مفتاح المعرفة وتنمي مهارات التفكير.', difficulty: 2 },
  { text: 'تتميز الغابة بأشجارها العالية وحيواناتها المتنوعة.', difficulty: 3 },
  { text: 'العلماء يبذلون جهداً كبيراً لاكتشاف أسرار الكون.', difficulty: 4 },
  { text: 'المواظبة على الرياضة تحسن الصحة البدنية والعقلية بشكل ملحوظ.', difficulty: 5 },
];

export default function CopyTextTest() {
  return (
    <ClinicalPlayerEngine
      title="نسخ النصوص (Copying)"
      category="writing_copy"
      domainId="written-expression-speed"
      description="تقييم عيادي لسرعة النسخ، الدقة الإملائية، والتحكم الحركي الدقيق."
      instruction="المهمة: اكتب الجملة التي تراها بأسرع ما يمكن وبدقة عالية في الصندوق بالأسفل."
      icon="📝"
      color="blue"
      duration={120}
      onComplete={() => {}}
    >
      {(engineProps: any) => <CopyTextModule {...engineProps} />}
    </ClinicalPlayerEngine>
  );
}

function CopyTextModule({ recordInteraction, difficulty, gameState }: any) {
  const { play } = useSound();
  const [current, setCurrent] = useState<typeof COPY_SENTENCES[0] | null>(null);
  const [inputVal, setInputVal] = useState('');
  const trialStartRef = useRef<number>(0);
  const firstCharRef = useRef<number>(0);
  const started = useRef(false);

  const spawnTrial = useCallback((diff: number) => {
    if (gameState !== 'playing') return;
    
    const pool = COPY_SENTENCES.filter(s => s.difficulty <= Math.ceil(diff));
    const random = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrent(random);
    setInputVal('');
    trialStartRef.current = Date.now();
    firstCharRef.current = 0;
  }, [gameState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing' || !current) return;
    
    const val = e.target.value;
    if (firstCharRef.current === 0 && val.length === 1) {
      firstCharRef.current = Date.now();
    }
    
    setInputVal(val);

    if (val.trim() === current.text.trim()) {
      const now = Date.now();
      play('success');
      
      recordInteraction({
        isCorrect: true,
        timestampDisplayed: trialStartRef.current,
        timestampResponded: now,
        responseValue: val,
        metadata: { 
          target: current.text, 
          wpm: Math.round((current.text.length / 5) / ((now - trialStartRef.current) / 60000)),
          latencyToStart: firstCharRef.current - trialStartRef.current
        }
      });

      setTimeout(() => spawnTrial(1.5), 800);
    }
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
          {current && gameState === 'playing' && (
            <motion.div
              key={current.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl"
            >
              <div className="bg-slate-900 border-2 border-white/5 rounded-[3rem] p-12 mb-10 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
                <p className="text-5xl font-black text-white leading-relaxed text-center font-arabic italic">
                  {current.text}
                </p>
              </div>

              <div className="relative group">
                <input 
                  autoFocus
                  type="text"
                  dir="rtl"
                  value={inputVal}
                  onChange={handleInputChange}
                  placeholder="ابدأ الكتابة هنا..."
                  className="w-full bg-slate-800 border-4 border-slate-700 focus:border-blue-500 rounded-[2.5rem] p-10 text-4xl text-white text-center outline-none transition-all shadow-2xl font-arabic placeholder:text-slate-600"
                />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.4em] text-blue-500/40 font-black">
                   Realtime Processor // WPM_MONITORING_ACTIVE
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-20 flex gap-4 text-slate-600 font-black text-[10px] uppercase tracking-widest italic">
           <span>Visual-Motor Integration Lab</span>
           <span className="opacity-30">|</span>
           <span>Processing Speed Unit</span>
        </div>
    </div>
  );
}
