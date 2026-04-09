'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicalPlayerEngine from '@/app/components/ui/ClinicalPlayerEngine';
import { useSound } from '@/hooks/useSound';

export default function ObjectTrackingTest() {
  const { play } = useSound();
  const [targets, setTargets] = useState<{ id: number, x: number, y: number, vx: number, vy: number }[]>([]);
  const requestRef = useRef<number>(0);

  const spawnTargets = useCallback(() => {
    const newTargets = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5
    }));
    setTargets(newTargets);
  }, []);

  const updatePositions = useCallback(() => {
    setTargets(prev => prev.map(t => {
      let nx = t.x + t.vx;
      let ny = t.y + t.vy;
      let nvx = t.vx;
      let nvy = t.vy;

      if (nx < 5 || nx > 95) nvx = -nvx;
      if (ny < 15 || ny > 85) nvy = -nvy;

      return { ...t, x: nx, y: ny, vx: nvx, vy: nvy };
    }));
    requestRef.current = requestAnimationFrame(updatePositions);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updatePositions]);

  return (
    <ClinicalPlayerEngine
      title="ملاح المسار (Object Tracking)"
      category="attention_prob_tracking"
      description="تقييم عيادي للانتباه المستدام وقدرة الدماغ على تتبع الأهداف المتحركة في الفضاء."
      instruction="المهمة: ابقِ تركيزك على الأقمار الصناعية 🛰️، واضغط عليها لجمع البيانات (كلما ضغطت أكثر زادت النتيجة)."
      icon="🛰️"
      color="indigo"
      onComplete={() => {}}
    >
      {({ setScore, gameState }) => (
        <div className="w-full h-full relative overflow-hidden bg-slate-950/50 rounded-[4rem] border border-white/5 shadow-2xl">
           {targets.map(t => (
             <motion.button
               key={t.id}
               whileHover={{ scale: 1.2 }}
               whileTap={{ scale: 0.8 }}
               style={{ left: `${t.x}%`, top: `${t.y}%`, position: 'absolute' }}
               onClick={() => {
                 setScore(s => s + 10);
                 play('coin');
               }}
               className="w-20 h-20 flex items-center justify-center text-4xl cursor-pointer z-20"
             >
               🛰️
             </motion.button>
           ))}
           
           <GameTrigger gameState={gameState} spawnTargets={spawnTargets} />
        </div>
      )}
    </ClinicalPlayerEngine>
  );
}

function GameTrigger({ gameState, spawnTargets }: any) {
  useEffect(() => {
    if (gameState === 'playing') spawnTargets();
  }, [gameState, spawnTargets]);
  return null;
}
