'use client';
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoiceWaveformProps {
  data: Uint8Array;
  emotion: 'confident' | 'stressed' | 'hesitant' | 'neutral';
  isRecording: boolean;
}

export default function VoiceWaveform({ data, emotion, isRecording }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getEmotionColor = () => {
    switch (emotion) {
      case 'confident': return '#22d3ee'; // Cyan 400
      case 'stressed':  return '#fb7185'; // Rose 400
      case 'hesitant':  return '#fbbf24'; // Amber 400
      case 'neutral':   return '#818cf8'; // Indigo 400
      default:          return '#475569'; // Slate 600
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !isRecording) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const color = getEmotionColor();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / data.length) * 2.5;
      let barHeight;
      let x = 0;

      // Draw mirrored wave for center alignment
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < data.length; i++) {
        barHeight = (data[i] / 255) * (height / 1.5);
        
        // Add some jitter for the 'stressed' emotion
        const jitter = emotion === 'stressed' ? (Math.random() - 0.5) * 10 : 0;
        
        ctx.fillStyle = color;
        ctx.shadowBlur = isRecording ? 15 : 0;
        ctx.shadowColor = color;
        
        const yPos = (height / 2) - (barHeight / 2) + jitter;
        ctx.fillRect(x, yPos, barWidth - 1, barHeight);

        x += barWidth + 1;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [data, emotion, isRecording]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full h-32 rounded-3xl overflow-hidden bg-slate-900/50 backdrop-blur-sm border border-white/5 flex items-center justify-center"
    >
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-slate-700 mx-1" />
          <div className="w-1 h-3 rounded-full bg-slate-700 mx-1" />
          <div className="w-1 h-1 rounded-full bg-slate-700 mx-1" />
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={128} 
        className="w-full h-full"
      />
      
      {/* Visual Indicator of Emotion Status (Glow) */}
      <div 
        className="absolute inset-x-0 bottom-0 h-1 transition-colors duration-1000"
        style={{ backgroundColor: getEmotionColor(), boxShadow: `0 0 20px ${getEmotionColor()}` }}
      />
    </motion.div>
  );
}
