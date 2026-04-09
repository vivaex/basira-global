'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getStudentProfile, saveStudentProfile } from '@/lib/studentProfile';

export default function FingerTappingTest() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'RESULT'>('START');
  
  const [timeLeft, setTimeLeft] = useState(10);
  const [taps, setTaps] = useState(0);
  
  const [clickAnim, setClickAnim] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0) {
      // Award coins
      const profile = getStudentProfile();
      if (profile) {
         const virtualScore = Math.min(100, taps * 2); 
         profile.coins = (profile.coins || 0) + Math.floor(virtualScore / 10);
         saveStudentProfile(profile);
      }
      setGameState('RESULT');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleTap = () => {
    if (gameState !== 'PLAYING') return;
    setTaps(t => t + 1);
    
    // Quick visual pop
    setClickAnim(true);
    setTimeout(() => setClickAnim(false), 50);
  };

  const startGame = () => {
    setTaps(0);
    setTimeLeft(10);
    setGameState('PLAYING');
  };

  // Diagnostic calc
  const speedScore = taps; // Taps per 10 seconds

  return (
    <main className="min-h-screen bg-[#110522] flex flex-col items-center justify-center p-6 select-none font-sans" dir="rtl">
      
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#110522] to-[#110522] opacity-80" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        
        {/* === INTRO SCREEN === */}
        {gameState === 'START' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/80 backdrop-blur-2xl border border-purple-500/30 p-12 rounded-[3rem] shadow-[0_0_80px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <h1 className="text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-indigo-300 italic">السرعة الحركية ⚡</h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed border-r-4 border-purple-500 pr-6 text-right">
              اختبار النقر السريع (Finger Tapping Task). يقيس هذا التحدي "سرعة المعالجة الحركية البحتة" دون أي تفكير معقد!
              <br/><br/>
              لديك <strong className="text-amber-400">10 ثوانٍ فقط</strong>.
              <br/>
              انقر على الزر الرئيسي بأقصى سرعة ممكنة باستخدام إصبع السبابة. لا تتوقف حتى ينتهي الوقت!
            </p>

            <button 
              onClick={startGame}
              className="px-14 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-3xl rounded-[2rem] shadow-[0_0_40px_rgba(168,85,247,0.4)] transition transform hover:scale-105 active:scale-95"
            >
              شحن الطاقة 🔋
            </button>
            <div className="mt-8">
               <Link href="/diagnose" className="text-slate-500 hover:text-purple-400 transition font-bold">
                 ◀ العودة للعيادات
               </Link>
            </div>
          </motion.div>
        )}

        {/* === GAME SCREEN === */}
        {gameState === 'PLAYING' && (
          <div className="flex flex-col items-center w-full">
             
             <div className="flex justify-between w-full max-w-md mb-12 bg-slate-900/80 border border-slate-700 px-8 py-6 rounded-3xl backdrop-blur-md shadow-2xl">
               <div className="flex flex-col items-center gap-1">
                 <span className="text-slate-400 font-bold text-sm tracking-widest">الوقت المتبقي</span>
                 <span className={`text-5xl font-black ${timeLeft <= 3 ? 'text-red-500 animate-bounce' : 'text-purple-400'}`}>{timeLeft}s</span>
               </div>
               <div className="w-px bg-slate-700 mx-4" />
               <div className="flex flex-col items-center gap-1">
                 <span className="text-slate-400 font-bold text-sm tracking-widest">عدد النقرات</span>
                 <span className="text-5xl font-black text-white">{taps}</span>
               </div>
             </div>

             <button
               onMouseDown={handleTap}
               onTouchStart={handleTap}
               className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-[10px] flex items-center justify-center text-7xl shadow-[0_0_80px_rgba(168,85,247,0.3)] transition-all select-none touch-manipulation ${
                 clickAnim ? 'bg-purple-400 border-white scale-95' : 'bg-purple-600 border-purple-400 scale-100 hover:bg-purple-500'
               }`}
             >
               👇
             </button>
             
             <p className="mt-12 text-slate-400 font-black animate-pulse text-2xl uppercase tracking-widest">انقر بأقصى سرعة!</p>
          </div>
        )}

        {/* === RESULTS SCREEN === */}
        {gameState === 'RESULT' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/90 backdrop-blur-3xl border border-purple-500/30 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(168,85,247,0.1)] text-center relative overflow-hidden">
            <h2 className="text-4xl font-black text-white mb-2">اكتمل تحليل السرعة العصبية ⏱️</h2>
            <p className="text-slate-400 mb-10">تحليل سرعة المعالجة الحركية الصافية (Motor Processing Speed)</p>
            
            <div className="grid grid-cols-1 gap-6 mb-10 max-w-sm mx-auto">
              <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="text-slate-500 text-sm font-black tracking-widest mb-2">معدل التردد الحركي (Taps/10s)</div>
                <div className={`text-6xl font-black ${speedScore > 40 ? 'text-emerald-400' : 'text-amber-400'}`}>{speedScore}</div>
              </div>
            </div>

            {/* Diagnostic Insight */}
            <div className={`p-8 rounded-3xl text-right mb-10 border ${speedScore < 30 ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
               <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                 {speedScore < 30 ? '⚠️ مؤشر بطء المعالجة (Processing Sluggishness)' : '⚡ سرعة نقل عصبي ممتازة'}
               </h4>
               <p className="leading-relaxed">
                 {speedScore < 30
                   ? `سجلت (${speedScore}) نقرة فقط. المعدل الطبيعي للأطفال هو 35-50. البطء في هذه المهمة البسيطة جداً يعني وجود بطء عام في سرعة الإشارات العصبية (Processing Speed)، وهذا قد يفسر لماذا يتأخر الطفل في إنجاز الواجبات المدرسي رغم ذكائه.` 
                   : `رائع! (${speedScore}) نقرة تعني أن نظامك العصبي الحركي ينقل الإشارات من قشرة الدماغ وإليها بسرعة البرق. لا يوجد أي مؤشر لبطء المعالجة الإدراكية أو الحركية.`}
               </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link 
                href="/diagnose"
                className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xl rounded-2xl transition shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              >
                العودة للتقرير الشامل
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
