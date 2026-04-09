'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getStudentProfile, saveStudentProfile, saveTestSession, generateSessionId, TestSession } from '@/lib/studentProfile';

const SHAPES_TO_COPY = [
  { id: 'square', name: 'المربع', emoji: '🟩' },
  { id: 'triangle', name: 'المثلث', emoji: '🔺' },
  { id: 'star', name: 'النجمة', emoji: '⭐' },
];

export default function ShapeCopyingTest() {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'RESULT'>('START');
  const [currentShapeIdx, setCurrentShapeIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [strokesCount, setStrokesCount] = useState(0);
  const [isDoneShape, setIsDoneShape] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Track metrics for motor stability
  const [drawnPath, setDrawnPath] = useState<{x:number, y:number}[]>([]);

  useEffect(() => {
    if (gameState === 'PLAYING' && canvasRef.current) {
      const cvs = canvasRef.current;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;

      // Clear for new completely blank canvas
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      setStrokesCount(0);
      setDrawnPath([]);
    }
  }, [currentShapeIdx, gameState]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setIsDoneShape(true);
    setStrokesCount(s => s + 1);

    const pos = getCoordinates(e);
    setDrawnPath(prev => [...prev, pos]);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#f59e0b';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getCoordinates(e);
    setDrawnPath(prev => [...prev, pos]);
    
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setStrokesCount(0);
      setDrawnPath([]);
      setIsDoneShape(false);
    }
  };

  const evaluateAndNext = () => {
    let score = 100;
    if (strokesCount > 10) score -= 30; // Dyspraxia penalty
    else if (strokesCount > 5) score -= 15;

    // Geometric analysis to prevent 100% on wrong drawings
    if (drawnPath.length > 5) {
       let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
       let totalLength = 0;
       
       for (let i = 0; i < drawnPath.length; i++) {
           if (drawnPath[i].x < minX) minX = drawnPath[i].x;
           if (drawnPath[i].x > maxX) maxX = drawnPath[i].x;
           if (drawnPath[i].y < minY) minY = drawnPath[i].y;
           if (drawnPath[i].y > maxY) maxY = drawnPath[i].y;
           if (i > 0) {
               totalLength += Math.sqrt(Math.pow(drawnPath[i].x - drawnPath[i-1].x, 2) + Math.pow(drawnPath[i].y - drawnPath[i-1].y, 2));
           }
       }
       
       const width = Math.max(1, maxX - minX);
       const height = Math.max(1, maxY - minY);
       const area = width * height;
       
       if (width < 20 || height < 20 || totalLength < 50) {
           // It's a dot or tiny scribble
           score = 10;
       } else {
           const ratio = (totalLength * totalLength) / area;
           const targetShape = SHAPES_TO_COPY[currentShapeIdx].id;
           
           if (targetShape === 'square') {
               // Ideal ratio is 16. Circle is ~12.5. 
               if (ratio < 14) score -= 40; // Probably a circle or straight line
               if (ratio > 25) score -= 30; // Too jagged
               const aspectRatio = Math.max(width/height, height/width);
               if (aspectRatio > 1.5) score -= 30; // A rectangle, not a square
           } else if (targetShape === 'triangle') {
               // Ideal ratio is ~20
               if (ratio < 16) score -= 40; 
               if (ratio > 35) score -= 30;
           } else if (targetShape === 'star') {
               // Ideal ratio is >> 30
               if (ratio < 25) score -= 50; // Drew a circle or square instead of a star
           }
       }
    } else {
       score = 0;
    }

    setScores(prev => [...prev, Math.max(0, score)]);

    if (currentShapeIdx < SHAPES_TO_COPY.length - 1) {
       setCurrentShapeIdx(i => i + 1);
       setIsDoneShape(false);
       setDrawnPath([]);
    } else {
       // Award coins
       const profile = getStudentProfile();
        if (profile) {
          const avg = Math.round(scores.reduce((a,b)=>a+b, 0) / (scores.length + 1)); // including current
          profile.coins = (profile.coins || 0) + Math.floor(avg / 10);
          saveStudentProfile(profile);

          // Save for Results page
          if (typeof window !== 'undefined') {
            localStorage.setItem('motorPrecisionScore', avg.toString());
          }

          // Save as TestSession for Dashboard
          const session: TestSession = {
            id: generateSessionId('shape-copying'),
            testId: 'shape-copying',
            testCategory: 'motor',
            testTitle: 'النسخ الحر للأشكال',
            preTestReadiness: null,
            rounds: scores.map((s, i) => ({
              roundIndex: i,
              isCorrect: s > 50,
              errorType: s <= 50 ? 'wrong_answer' : null,
              timeSpentMs: 5000,
            })),
            attention: { tabSwitchCount: 0, inactivityCount: 0, totalTestDurationMs: 15000 },
            emotional: { frustrationEvents: scores.filter(s => s < 40).length, impulsivityEvents: 0 },
            rawScore: avg,
            postAnalysis: null,
            completedAt: new Date().toISOString(),
          };
          saveTestSession(session);
        }
        setGameState('RESULT');
    }
  };

  const startGame = () => {
    setScores([]);
    setCurrentShapeIdx(0);
    setIsDoneShape(false);
    setGameState('PLAYING');
  };

  const finalAvgScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;

  return (
    <main className="min-h-screen bg-[#180a0a] flex flex-col items-center justify-center p-6 select-none font-sans" dir="rtl">
      
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#180a0a] to-[#180a0a] opacity-80" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        
        {/* === INTRO SCREEN === */}
        {gameState === 'START' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/80 backdrop-blur-2xl border border-amber-500/30 p-12 rounded-[3rem] shadow-[0_0_80px_rgba(245,158,11,0.15)] relative overflow-hidden">
            <h1 className="text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-300 italic">النسخ الحر للأشكال 📐</h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed border-r-4 border-amber-500 pr-6 text-right">
              هنا لن تجد مساراً لترسم عليه! سنعرض لك شكلاً هندسياً، وعليك محاولة نسخه تماماً في المساحة الفارغة.
              <br/><br/>
              هذا الاختبار (Visual-Motor Integration Free Copy) يقيس مستوى استقلالية الحركة الدقيقة لأصابعك، وقدرتك على استنساخ الزوايا.
            </p>

            <button 
              onClick={startGame}
              className="px-14 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-3xl rounded-[2rem] shadow-[0_0_40px_rgba(245,158,11,0.4)] transition transform hover:scale-105 active:scale-95"
            >
              فتح لوحة النسخ ✏️
            </button>
            <div className="mt-8">
               <Link href="/diagnose" className="text-slate-500 hover:text-amber-400 transition font-bold">
                 ◀ العودة لعيادات التشخيص
               </Link>
            </div>
          </motion.div>
        )}

        {/* === GAME SCREEN === */}
        {gameState === 'PLAYING' && (
          <div className="flex flex-col items-center w-full">
             
             <div className="flex justify-between w-full max-w-2xl mb-6 bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-2xl backdrop-blur-md">
               <span className="text-slate-400 font-bold tracking-widest">تكوين النمط</span>
               <span className="text-xl font-black text-amber-400">{currentShapeIdx + 1} / {SHAPES_TO_COPY.length}</span>
             </div>

             <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl items-center justify-center">
                 
                 {/* TARGET SHAPE */}
                 <div className="bg-slate-800 border-4 border-slate-700 w-48 h-48 rounded-[2rem] flex items-center justify-center text-8xl shadow-lg">
                    {SHAPES_TO_COPY[currentShapeIdx].emoji}
                 </div>

                 {/* USER CANVAS */}
                 <div className="relative bg-[#ffffff] border-8 border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-[400px]">
                   <div className="absolute top-2 right-4 text-slate-300 font-bold text-sm pointer-events-none">ارسم هنا</div>
                   <canvas
                     ref={canvasRef}
                     width={400}
                     height={350}
                     className="touch-none cursor-crosshair w-full h-[350px]"
                     onMouseDown={startDrawing}
                     onMouseMove={draw}
                     onMouseUp={stopDrawing}
                     onMouseLeave={stopDrawing}
                     onTouchStart={startDrawing}
                     onTouchMove={draw}
                     onTouchEnd={stopDrawing}
                   />
                 </div>
             </div>
             
             <div className="mt-10 flex gap-4">
                <button
                  onClick={clearCanvas}
                  className="px-8 py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 font-bold text-slate-300 rounded-2xl transition"
                >
                  مسح 🧽
                </button>
                <button
                  onClick={evaluateAndNext}
                  disabled={!isDoneShape}
                  className="px-10 py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:bg-slate-800 text-slate-900 font-black rounded-2xl transition shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:shadow-none"
                >
                  {currentShapeIdx < SHAPES_TO_COPY.length - 1 ? 'انتقال للشكل التالي ➡️' : 'إنهاء الفحص ✔️'}
                </button>
             </div>
          </div>
        )}

        {/* === RESULTS SCREEN === */}
        {gameState === 'RESULT' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900/90 backdrop-blur-3xl border border-amber-500/30 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(245,158,11,0.1)] text-center relative overflow-hidden">
            <h2 className="text-4xl font-black text-white mb-2">اكتمل التقييم החركي الحر 📝</h2>
            <p className="text-slate-400 mb-10">تحليل الاستقلالية البصرية الحركية وانسيابية الحركة (Dyspraxia Test)</p>
            
            <div className="grid grid-cols-1 gap-6 mb-10 max-w-sm mx-auto">
              <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="text-slate-500 text-sm font-black tracking-widest mb-2">مؤشر الاستقرار الحركي (Stability)</div>
                <div className={`text-6xl font-black ${finalAvgScore > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{finalAvgScore}%</div>
              </div>
            </div>

            {/* Diagnostic Insight */}
            <div className={`p-8 rounded-3xl text-right mb-10 border ${finalAvgScore < 75 ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'}`}>
               <h4 className="font-black text-xl mb-2 flex items-center gap-2">
                 {finalAvgScore < 75 ? '⚠️ اشتباه بصعوبة الحركة الدقيقة' : '💪 استقلالية حركية وصلابة عصبية ممتازة'}
               </h4>
               <p className="leading-relaxed">
                 {finalAvgScore < 75
                   ? `سجلنا وتيرة عالية من رفع وإسقاط الأصابع/القلم (Stroke Fragmentation) والتردد أثناء النسخ. الأطفال ذوو "عسر الكتابة" غالباً ما يفتقرون لصورة حركية واضحة فيدمجونها من خطوط صغيرة متقطعة بدلاً من خط انسيابي مستمر.` 
                   : `رسم انسيابي وواثق. لقد استخدمت عدد ضربات قياسي، مما يعني أن "المخطط الحركي" (Motor Schema) في دماغك يتواصل مع عضلات يدك بكفاءة وسلاسة تامة.`}
               </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Link 
                href="/diagnose"
                className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xl rounded-2xl transition shadow-[0_0_30px_rgba(245,158,11,0.4)]"
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
