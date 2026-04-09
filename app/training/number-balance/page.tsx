'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Helper array of weights
const BLOCKS = [
  { id: 1, value: 1, color: 'bg-emerald-500', h: 'h-8' },
  { id: 2, value: 2, color: 'bg-blue-500', h: 'h-16' },
  { id: 3, value: 3, color: 'bg-purple-500', h: 'h-24' },
  { id: 5, value: 5, color: 'bg-amber-500', h: 'h-40' },
];

export default function NumberBalance() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetWeight, setTargetWeight] = useState(5);
  const [rightBlocks, setRightBlocks] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'SUCCESS' | 'OVERWEIGHT' | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    generateNewRound();
  };

  const generateNewRound = () => {
    // Generate a target weight between 3 and 15
    const newTarget = Math.floor(Math.random() * 12) + 4;
    setTargetWeight(newTarget);
    setRightBlocks([]);
    setFeedback(null);
  };

  const currentWeight = rightBlocks.reduce((a, b) => a + b, 0);
  
  // Calculate tilt angle (-15 to +15 degrees depending on weight difference)
  const diff = currentWeight - targetWeight;
  const maxTilt = 15;
  const tiltAngle = Math.max(-maxTilt, Math.min(maxTilt, diff * -2));

  // Handle adding a block
  const addBlock = (val: number) => {
    if (feedback) return; // Prevent clicking during feedback

    const newBlocks = [...rightBlocks, val];
    setRightBlocks(newBlocks);
    
    const newWeight = newBlocks.reduce((a, b) => a + b, 0);

    if (newWeight === targetWeight) {
      setFeedback('SUCCESS');
      setScore(s => s + 10);
      setTimeout(() => generateNewRound(), 1500);
    } else if (newWeight > targetWeight) {
      setFeedback('OVERWEIGHT');
      // They failed this round, clear it
      setTimeout(() => generateNewRound(), 1500);
    }
  };

  const removeLastBlock = () => {
    if (feedback || rightBlocks.length === 0) return;
    setRightBlocks(prev => prev.slice(0, -1));
  };


  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans" dir="rtl">
      
      {isPlaying && (
         <div className="absolute top-8 left-8 bg-slate-900 border border-slate-700 px-6 py-3 rounded-2xl shadow-xl z-20">
           <span className="text-slate-400 font-bold">النقاط مهارة الحساب: </span>
           <span className="text-2xl font-black text-amber-400">{score}</span>
         </div>
      )}

      {/* Intro Screen */}
      <div className="relative z-30 w-full max-w-xl text-center">
        {!isPlaying && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/80 backdrop-blur-xl border border-teal-500/30 p-10 rounded-[3rem] shadow-2xl">
            <h1 className="text-5xl font-black text-teal-400 mb-6 italic">ميزان الأرقام ⚖️</h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              تدريب المعالجة الكمية ولمس الأرقام (Sense of Quantity) لعلاج عسر الحساب (Dyscalculia).
              <br/><br/>
              ضع الكتل الملونة في الكفة اليمنى حتى <span className="text-teal-400 font-bold">تتساوى تماماً</span> مع الوزن في الكفة اليسرى. 
              <br/>
              إذا كان الوزن أثقل من اللازم ستخسر المحاولة!
            </p>
            <button 
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-2xl rounded-2xl shadow-teal-500/30 shadow-2xl hover:scale-105 transition"
            >
              بدء التوازن ⚖️
            </button>
            <div className="mt-8">
               <Link href="/training" className="text-slate-500 hover:text-teal-400 transition font-bold">
                 العودة للصالة
               </Link>
            </div>
          </motion.div>
        )}

        {/* Game UI */}
        {isPlaying && (
           <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
             
             {/* Feedback Overlay */}
             <AnimatePresence>
               {feedback && (
                 <motion.div
                   initial={{ opacity: 0, y: -50, scale: 0.5 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0 }}
                   className={`absolute -top-16 z-50 text-5xl font-black p-4 rounded-3xl bg-slate-900 shadow-2xl border ${feedback === 'SUCCESS' ? 'text-emerald-400 border-emerald-500/50' : 'text-rose-500 border-rose-500/50'}`}
                 >
                   {feedback === 'SUCCESS' ? '🏆 توازن مثالي!' : '💥 وزن زائد!'}
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Scale Illustration */}
             <div className="relative w-full h-[400px] mt-20 flex flex-col items-center">
                
                {/* Horizontal Beam */}
                <motion.div 
                   animate={{ rotate: tiltAngle }}
                   transition={{ type: "spring", stiffness: 60, damping: 10 }}
                   className="w-[80%] h-4 bg-slate-600 rounded-full relative z-10 origin-center"
                >
                   {/* Center Pin */}
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-400 rounded-full shadow-lg" />
                   
                   {/* Left Pan (Target) */}
                   <div className="absolute right-0 top-full -translate-y-1 -mt-8 flex flex-col items-center justify-end" style={{ height: '200px' }}>
                     <div className="w-[2px] h-full bg-slate-500" />
                     <div className="w-32 h-4 bg-slate-700 rounded-full flex justify-center items-end relative pb-4 shadow-xl">
                        {/* Target Display (Visual representation of target weight) */}
                        <div className="flex flex-col items-center justify-end">
                           <div className="bg-slate-800 border-2 border-dashed border-teal-500 flex items-center justify-center rounded-xl p-4 shadow-[0_0_30px_rgba(20,184,166,0.3)] min-w-[80px]">
                              <span className="text-4xl font-black text-teal-400">{targetWeight}</span>
                           </div>
                        </div>
                     </div>
                   </div>

                   {/* Right Pan (User Blocks) */}
                   <div className="absolute left-0 top-full -translate-y-1 -mt-8 flex flex-col items-center justify-end" style={{ height: '200px' }}>
                     <div className="w-[2px] h-full bg-slate-500" />
                     <div className="w-40 h-4 bg-slate-700 rounded-full flex justify-center items-end relative pb-4 shadow-xl px-2">
                        <div className="flex items-end justify-center gap-1">
                           <AnimatePresence>
                             {rightBlocks.map((b, i) => {
                               const conf = BLOCKS.find(bl => bl.value === b);
                               return (
                                 <motion.div
                                   key={`rb-${i}`}
                                   initial={{ y: -100, opacity: 0 }}
                                   animate={{ y: 0, opacity: 1 }}
                                   exit={{ opacity: 0, scale: 0.5 }}
                                   className={`w-10 ${conf?.h} ${conf?.color} rounded-t-lg border-b-4 border-black/30 flex items-center justify-center font-black text-white shadow-lg`}
                                 >
                                   {b}
                                 </motion.div>
                               );
                             })}
                           </AnimatePresence>
                        </div>
                     </div>
                   </div>
                </motion.div>

                {/* Vertical Stand */}
                <div className="w-6 h-64 bg-slate-700 rounded-t-full -mt-2 z-0" />
                <div className="w-48 h-8 bg-slate-800 rounded-t-3xl -mt-4 z-0 shadow-2xl border-t border-slate-700" />

             </div>

             {/* Controls (Block Selection) */}
             <div className="mt-12 bg-slate-900/80 p-8 rounded-[3rem] border border-slate-800 w-full shadow-2xl backdrop-blur-md">
                 <h3 className="text-center text-slate-400 font-bold mb-6">اختر الكتل للإضافة للكفة اليمنى:</h3>
                 <div className="flex justify-center items-end gap-6 mb-8">
                    {BLOCKS.map(block => (
                       <button
                         key={`btn-${block.id}`}
                         onClick={() => addBlock(block.value)}
                         disabled={feedback !== null}
                         className={`w-16 ${block.h} ${block.color} rounded-xl border-b-4 border-black/30 flex items-center justify-center font-black text-white text-2xl shadow-lg hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:translate-y-0 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                       >
                         {block.value}
                       </button>
                    ))}
                 </div>
                 
                 <div className="flex justify-center gap-4">
                   <button 
                     onClick={removeLastBlock} 
                     disabled={rightBlocks.length === 0 || feedback !== null}
                     className="px-6 py-2 bg-slate-800 border border-slate-700 text-rose-400 font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition"
                   >
                     تراجع (إزالة كتلة)
                   </button>
                   <button 
                     onClick={generateNewRound} 
                     disabled={feedback !== null}
                     className="px-6 py-2 bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition"
                   >
                     تخطي المحاولة
                   </button>
                 </div>
             </div>

           </div>
        )}
      </div>
    </main>
  );
}
