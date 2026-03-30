'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const LEVELS = [
  { question: "ما هو الحرف الأول في كلمة (بحر)؟", word: "بحر", options: ["ب", "ح", "ر"], correct: "ب", difficulty: "بسيط" },
  { question: "أي كلمة تبدأ بنفس صوت (تـفاح)؟", word: "تفاح", options: ["تـمر", "مـوز", "عـنب"], correct: "تـمر", difficulty: "بسيط" },
  { question: "ماذا تبقى من كلمة (سماء) إذا حذفنا حرف (س)؟", word: "سماء", options: ["ماء", "سما", "مأ"], correct: "ماء", difficulty: "متوسط" },
  { question: "ادمج الأصوات (قـ - لـ - مـ) لتكوين كلمة:", word: "ق ل م", options: ["قلم", "لقم", "ملق"], correct: "قلم", difficulty: "متوسط" },
  { question: "ما هو الصوت الأوسط في كلمة (سيف)؟", word: "سيف", options: ["ي", "س", "ف"], correct: "ي", difficulty: "متقدم" },
  { question: "كلمة (خروف) تنتهي بصوت:", word: "خروف", options: ["ف", "خ", "ر"], correct: "ف", difficulty: "متقدم" },
];

export default function PhonologyTest() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // دالة النطق باللغة العربية
  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // إلغاء أي نطق سابق
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // لغة عربية
      utterance.rate = 0.9; // سرعة هادئة لتناسب الأطفال
      utterance.pitch = 1.1; // نبرة ودودة
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // نطق السؤال تلقائياً عند تغيير المستوى
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setTimeout(() => {
        speak(LEVELS[currentIdx].question);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, gameState, speak]);

  const handleAnswer = (option: string) => {
    if (option === LEVELS[currentIdx].correct) {
      setScore(s => s + 1);
    }
    
    if (currentIdx + 1 < LEVELS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('languagePhonologyScore', Math.round((score / LEVELS.length) * 100).toString());
      }
      setGameState('result');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border-4 border-indigo-500/20 shadow-2xl max-w-2xl w-full text-center">
        
        {gameState === 'start' && (
          <div className="animate-in zoom-in">
            <div className="text-7xl mb-6">🗣️</div>
            <h1 className="text-4xl font-black mb-6 text-indigo-400 font-sans italic">مختبر تحليل الأصوات</h1>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-right mb-10 space-y-4">
                <p className="text-blue-400 font-bold">🎯 المعيار العالمي:</p>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                    هذا الاختبار يعتمد على التمييز السمعي (Auditory Discrimination). تأكد من رفع مستوى الصوت ليتمكن الطفل من سماع الكلمات بوضوح.
                </p>
                <p className="text-xl text-white">المهمة: استمع للسؤال جيداً واختر الإجابة الصحيحة.</p>
            </div>
            <button onClick={() => setGameState('playing')} className="bg-indigo-600 hover:bg-indigo-500 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-95">
                ابدأ التشخيص الصوتي 🚀
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between mb-8 items-center">
               <span className="text-slate-500 font-bold bg-slate-800 px-4 py-1 rounded-full text-sm">{LEVELS[currentIdx].difficulty}</span>
               
               {/* زر إعادة الاستماع */}
               <button 
                 onClick={() => speak(LEVELS[currentIdx].question)}
                 className={`p-4 rounded-full transition-all ${isSpeaking ? 'bg-indigo-500 animate-pulse' : 'bg-slate-800 hover:bg-slate-700'}`}
               >
                 {isSpeaking ? '🔊 يقرأ الآن...' : '🔈 استمع مرة أخرى'}
               </button>

               <span className="text-indigo-400 font-black">{currentIdx + 1} / {LEVELS.length}</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-12 text-white leading-snug min-h-[100px] flex items-center justify-center">
                {LEVELS[currentIdx].question}
            </h2>

            <div className="grid gap-4">
              {LEVELS[currentIdx].options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAnswer(opt)} 
                  className="bg-slate-800 hover:bg-indigo-600 p-6 rounded-3xl text-3xl font-black transition-all active:scale-90 border-2 border-slate-700 shadow-lg text-center group"
                >
                  <span className="group-hover:scale-110 transition-transform block">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-in zoom-in">
            <div className="text-8xl mb-6">🦅</div>
            <h2 className="text-5xl font-black text-indigo-400 mb-6 italic">نتائج المعالجة السمعية</h2>
            <div className="bg-slate-950 p-10 rounded-[2.5rem] mb-10 border border-indigo-500/20 shadow-inner">
               <p className="text-slate-500 mb-2 font-bold uppercase tracking-widest">مستوى الوعي الفونولوجي</p>
               <div className="text-9xl font-black text-white">
                 {Math.round((score / LEVELS.length) * 100)}%
               </div>
            </div>
            <Link href="/diagnose/language">
              <button className="bg-slate-800 hover:bg-slate-700 px-12 py-4 rounded-xl font-bold transition">العودة لمختبر اللغة</button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}