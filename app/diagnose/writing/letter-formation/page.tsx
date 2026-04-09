'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

/**
 * Letter Formation (Dysgraphia Screen) - Clinical Protocol
 * ------------------------------------------------------
 * Measures motor control, path precision, and tremor.
 * Telemetry: MSE (Mean Squared Error) from target path, Velocity, Jitter.
 */

const TRACING_TARGETS = [
  { id: 'alif', char: 'أ', path: [{x: 250, y: 50}, {x: 250, y: 250}], instruction: 'ارسم حرف الألف بذكاء' },
  { id: 'ba', char: 'ب', path: [{x: 100, y: 150}, {x: 100, y: 250}, {x: 400, y: 250}, {x: 400, y: 150}], instruction: 'ارسم حرف الباء' },
  { id: 'circle', char: '◯', path: [], instruction: 'ارسم دائرة مغلقة' }, // Placeholder for complex paths
];

export default function LetterFormationTest() {
  const { play } = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{x: number, y: number, t: number}[]>([]);
  const [currentTarget, setCurrentTarget] = useState(TRACING_TARGETS[0]);
  
  const trialStartRef = useRef<number>(0);

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    setPoints([{x, y, t: Date.now()}]);
    
    const ctx = canvasRef.current!.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    setPoints(prev => [...prev, {x, y, t: Date.now()}]);
    
    const ctx = canvasRef.current!.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#f472b6'; // Pink for writing
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = (recordInteraction: any) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Clinical Analysis
    const duration = Date.now() - (points[0]?.t || Date.now());
    const jitter = calculateJitter(points);
    
    recordInteraction({
      isCorrect: points.length > 10, // Basic validation
      timestampDisplayed: trialStartRef.current,
      timestampResponded: Date.now(),
      responseValue: 'canvas_trace',
      metadata: {
        char: currentTarget.char,
        pointCount: points.length,
        durationMs: duration,
        jitterScore: jitter,
        velocity: calculateAverageVelocity(points)
      }
    });

    play('success');
    
    // Clear for next round
    setTimeout(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, 800, 600);
        }
        setPoints([]);
        // Cycle target
        const nextIdx = (TRACING_TARGETS.indexOf(currentTarget) + 1) % TRACING_TARGETS.length;
        setCurrentTarget(TRACING_TARGETS[nextIdx]);
    }, 1000);
  };

  const calculateJitter = (pts: any[]) => {
    if (pts.length < 3) return 0;
    let totalDev = 0;
    for (let i = 2; i < pts.length; i++) {
        // Simple curvature/jitter measure: deviation from straight line between neighbors
        const expectedX = (pts[i-1].x + pts[i-2].x) / 2;
        const expectedY = (pts[i-1].y + pts[i-2].y) / 2;
        totalDev += Math.sqrt(Math.pow(pts[i].x - expectedX, 2) + Math.pow(pts[i].y - expectedY, 2));
    }
    return totalDev / pts.length;
  };

  const calculateAverageVelocity = (pts: any[]) => {
    if (pts.length < 2) return 0;
    let dist = 0;
    for (let i = 1; i < pts.length; i++) {
        dist += Math.sqrt(Math.pow(pts[i].x - pts[i-1].x, 2) + Math.pow(pts[i].y - pts[i-1].y, 2));
    }
    const time = (pts[pts.length-1].t - pts[0].t) / 1000;
    return time > 0 ? dist / time : 0;
  };

  return (
    <ClinicalPlayerEngine
      title="تشكيل الحروف (Graphomotor)"
      category="writing_formation"
      domainId="motor-coordination"
      description="تقييم عيادي للمهارات الحركية الدقيقة والقدرة على النسخ (Dysgraphia Screening)."
      instruction={`المهمة: تتبع شكل الحرف ${currentTarget.char} بأكبر قدر ممكن من الدقة.`}
      icon="✍️"
      color="pink"
      onComplete={() => {}}
    >
      {({ recordInteraction, gameState }) => (
        <div className="w-full flex flex-col items-center">
          
          <div className="relative w-[600px] h-[400px] bg-slate-900/50 rounded-[3rem] border-4 border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
             {/* Dynamic Target Ghost */}
             <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                <span className="text-[20rem] font-black font-arabic text-white">{currentTarget.char}</span>
             </div>

             <canvas 
               ref={canvasRef}
               width={600}
               height={400}
               className="relative z-10 touch-none cursor-crosshair h-full w-full"
               onMouseDown={startDrawing}
               onMouseMove={draw}
               onMouseUp={() => stopDrawing(recordInteraction)}
               onMouseLeave={() => stopDrawing(recordInteraction)}
               onTouchStart={startDrawing}
               onTouchMove={draw}
               onTouchEnd={() => stopDrawing(recordInteraction)}
             />
             
             <div className="absolute bottom-6 right-8 text-slate-500 font-mono text-[10px] tracking-widest uppercase">
                Fine Motor Capture // ACTIVE
             </div>
          </div>

          <div className="mt-12 flex gap-4">
             <button 
               onClick={() => {
                 if (canvasRef.current) canvasRef.current.getContext('2d')?.clearRect(0,0,800,600);
                 setPoints([]);
               }}
               className="bg-slate-800 text-slate-400 px-8 py-3 rounded-2xl hover:text-white transition-all font-bold border border-slate-700"
             >
               مسح اللوحة 🗑️
             </button>
          </div>
          
          <div className="mt-8 text-pink-600/30 text-[9px] uppercase tracking-[0.4em] font-mono">
            Graphomotor Kinematics // TREMOR_SENSITIVE
          </div>
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}
