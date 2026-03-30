'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function AuditoryLab() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      window.speechSynthesis.speak(u);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-cyan-500/20 shadow-2xl max-w-xl w-full text-center">
        <div className="text-7xl mb-6">👂</div>
        <h1 className="text-4xl font-black mb-6 text-cyan-400">مختبر التمييز السمعي</h1>
        <p className="text-slate-400 mb-10 italic">قياس دقة المعالجة السمعية وتمييز الأصوات المتشابهة.</p>
        
        {gameState === 'start' && (
          <button onClick={() => { setGameState('playing'); speak("استمع جيداً وحدد الكلمة المختلفة"); }} className="bg-cyan-600 px-12 py-5 rounded-2xl font-bold text-xl">بدء الفحص السمعي 🔊</button>
        )}

        {gameState === 'playing' && (
          <div className="space-y-6">
            <button onClick={() => speak("بيت . زيت . بيت")} className="bg-slate-800 p-8 rounded-full animate-pulse text-4xl">🔊 إعادة الاستماع</button>
            <div className="grid grid-cols-1 gap-4 mt-8">
              {['الكلمات متشابهة', 'هناك كلمة مختلفة'].map((opt) => (
                <button key={opt} onClick={() => setGameState('result')} className="bg-slate-800 p-6 rounded-2xl text-xl font-bold hover:bg-cyan-600 transition">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <h2 className="text-4xl font-bold mb-8">اكتمل التشخيص السمعي ✅</h2>
            <Link href="/diagnose" className="bg-slate-800 px-10 py-4 rounded-xl block">العودة للبوابة</Link>
          </div>
        )}
      </div>
    </main>
  );
}