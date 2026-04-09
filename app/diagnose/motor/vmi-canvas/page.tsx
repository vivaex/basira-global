'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ResponseRecord, TestSession } from '@/lib/types';
import { ClinicalScoringEngine } from '@/lib/domain/scoring/engine';
import { getStudentProfile, saveTestSession } from '@/lib/studentProfile';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';

/**
 * VMI Canvas (Visual-Motor Integration) Redesign
 * ---------------------------------------------
 * Rule 1: Beery-VMI standard shapes.
 * Rule 2: Precision telemetry (avg distance error).
 * Rule 4: Timing Invisibility.
 */

const SHAPES = [
  { id: 'ZigZag', path: [{x:50, y:150}, {x:100, y:50}, {x:150, y:150}, {x:200, y:50}, {x:250, y:150}] },
  { id: 'Box', path: [{x:50, y:50}, {x:250, y:50}, {x:250, y:150}, {x:50, y:150}, {x:50, y:50}] },
  { id: 'Triangle', path: [{x:150, y:50}, {x:250, y:150}, {x:50, y:150}, {x:150, y:50}] },
];

function distanceToSegment(p: {x:number, y:number}, v: {x:number, y:number}, w: {x:number, y:number}) {
  const l2 = (v.x - w.x)**2 + (v.y - w.y)**2;
  if (l2 == 0) return Math.sqrt((p.x - v.x)**2 + (p.y - v.y)**2);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt((p.x - (v.x + t * (w.x - v.x)))**2 + (p.y - (v.y + t * (w.y - v.y)))**2);
}

export default function VMICanvasTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawnPath, setDrawnPath] = useState<{x:number, y:number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const trialStartTime = useRef<number>(0);

  const drawTarget = useCallback((idx: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 300, 200);
    
    // Draw target
    const target = SHAPES[idx % SHAPES.length];
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.moveTo(target.path[0].x, target.path[0].y);
    target.path.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const handleComplete = (score: number, metrics: any) => {
    const student = getStudentProfile();
    const session: TestSession = {
      id: `vmi-${Date.now()}`,
      testId: 'vmi-canvas',
      testCategory: 'motor',
      testTitle: 'التآزر البصري الحركي (Beery-VMI)',
      domainId: 'dysgraphia-motor',
      interactions: metrics.interactions,
      rawScore: score,
      theta: metrics.finalTheta,
      completedAt: new Date().toISOString(),
      preTestReadiness: null,
      rounds: [],
      attention: { tabSwitchCount: 0, inactivityCount: 0, totalTestDurationMs: 300000 },
      emotional: { frustrationEvents: 0, impulsivityEvents: 0 },
      postAnalysis: null,
    };
    session.postAnalysis = ClinicalScoringEngine.analyze(session, student);
    saveTestSession(session);
  };

  return (
    <ClinicalPlayerEngine
      title="التآزر الحركي (VMI)"
      category="motor"
      domainId="dysgraphia-motor"
      description="تقييم التآزر بين العين واليد. مؤشر رئيسي للديسجرافيا."
      instruction="تتبع الشكل المنقط بدقة شديدة دون أن ترفع يدك."
      icon="✍️"
      color="rose"
      onComplete={handleComplete}
    >
      {({ recordInteraction, difficulty, trialNumber }) => {
        useEffect(() => {
          drawTarget(trialNumber - 1);
          setDrawnPath([]);
          trialStartTime.current = performance.now();
        }, [trialNumber, drawTarget]);

        const getPos = (e: any) => {
          const rect = canvasRef.current!.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const clientY = e.touches ? e.touches[0].clientY : e.clientY;
          return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const onDraw = (e: any) => {
          if (!isDrawing) return;
          const pos = getPos(e);
          setDrawnPath(prev => [...prev, pos]);
          const ctx = canvasRef.current!.getContext('2d')!;
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 4;
          ctx.stroke();
        };

        const onEnd = () => {
          if (!isDrawing) return;
          setIsDrawing(false);
          const target = SHAPES[(trialNumber - 1) % SHAPES.length].path;
          let error = 0;
          drawnPath.forEach(p => {
             let minD = Infinity;
             for (let i = 0; i < target.length - 1; i++) {
                minD = Math.min(minD, distanceToSegment(p, target[i], target[i+1]));
             }
             error += minD;
          });
          const avgError = error / Math.max(1, drawnPath.length);
          const isCorrect = avgError < 10;
          
          recordInteraction({
            isCorrect,
            timestampDisplayed: trialStartTime.current,
            timestampResponded: performance.now(),
            responseValue: drawnPath,
            metadata: { avgError, shape: SHAPES[(trialNumber - 1) % SHAPES.length].id }
          });
        };

        return (
          <div className="flex flex-col items-center gap-8">
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              className="bg-slate-900 rounded-[2rem] border-4 border-slate-800 touch-none cursor-crosshair"
              onMouseDown={(e) => { setIsDrawing(true); const p = getPos(e); setDrawnPath([p]); canvasRef.current!.getContext('2d')!.beginPath(); canvasRef.current!.getContext('2d')!.moveTo(p.x, p.y); }}
              onMouseMove={onDraw}
              onMouseUp={onEnd}
              onTouchStart={(e) => { setIsDrawing(true); const p = getPos(e); setDrawnPath([p]); canvasRef.current!.getContext('2d')!.beginPath(); canvasRef.current!.getContext('2d')!.moveTo(p.x, p.y); }}
              onTouchMove={onDraw}
              onTouchEnd={onEnd}
            />
            <p className="text-slate-500 font-medium diagnostic-stimulus">دقة التتبع الحالية: {drawnPath.length} نقطة</p>
          </div>
        );
      }}
    </ClinicalPlayerEngine>
  );
}
