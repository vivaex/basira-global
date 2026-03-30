'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

export default function WritingTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center" dir="rtl">
      <h1 className="text-4xl font-black mb-8 text-teal-400 font-sans">مختبر الكتابة والرسم</h1>
      <p className="mb-6 text-slate-500">حاول رسم "دائرة" داخل المربع الأبيض</p>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="bg-white rounded-3xl cursor-crosshair shadow-2xl"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={() => setIsDrawing(false)}
      />
      <div className="mt-10 flex gap-4">
        <button onClick={() => {
            const ctx = canvasRef.current?.getContext('2d');
            ctx?.clearRect(0,0,400,400);
        }} className="bg-slate-800 px-8 py-3 rounded-xl font-bold">مسح</button>
        <Link href="/diagnose" className="bg-teal-600 px-8 py-3 rounded-xl font-bold font-sans">تم الإنجاز ✅</Link>
      </div>
    </main>
  );
}