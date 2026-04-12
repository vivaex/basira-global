'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSound } from '@/hooks/useSound';

/**
 * Digit Span Forward — WISC-V Compliant
 * Presents 2→9 digit sequences at 1 digit/second.
 * Saves: digitForwardScore (0-100), digitForwardMaxSpan to localStorage.
 */

const DIGIT_SEQUENCES: number[][] = [
  [3, 8],
  [6, 1],
  [5, 2, 9],
  [4, 7, 3],
  [7, 2, 8, 6],
  [1, 9, 5, 3],
  [4, 8, 1, 5, 2],
  [6, 3, 9, 7, 4],
  [7, 2, 8, 3, 6, 1],
  [5, 4, 9, 1, 8, 3],
  [3, 8, 2, 9, 4, 6, 7],
  [1, 5, 7, 3, 2, 8, 6],
  [4, 7, 3, 8, 1, 9, 6, 2],
  [2, 6, 1, 5, 8, 3, 7, 9],
];

type Phase = 'intro' | 'showing' | 'input' | 'feedback' | 'done';

export default function DigitForwardTest() {
  const { play } = useSound();
  const [phase, setPhase] = useState<Phase>('intro');
  const [trialIdx, setTrialIdx] = useState(0);
  const [digitIdx, setDigitIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [maxSpan, setMaxSpan] = useState(0);
  const [score, setScore] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSeq = DIGIT_SEQUENCES[trialIdx] ?? [];

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA'; u.rate = 0.85; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }, []);

  const startTrial = useCallback(() => {
    if (trialIdx >= DIGIT_SEQUENCES.length) return;
    setPhase('showing');
    setDigitIdx(0);
    setUserInput('');
    play('click');
  }, [trialIdx, play]);

  useEffect(() => {
    if (phase !== 'showing') return;
    const seq = DIGIT_SEQUENCES[trialIdx] ?? [];
    let step = 0;
    speak(seq[0]?.toString() ?? '');
    intervalRef.current = setInterval(() => {
      step++;
      if (step < seq.length) {
        setDigitIdx(step);
        speak(seq[step].toString());
      } else {
        clearInterval(intervalRef.current!);
        setDigitIdx(-1);
        setTimeout(() => {
          setPhase('input');
          setTimeout(() => inputRef.current?.focus(), 100);
        }, 600);
      }
    }, 1100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, trialIdx, speak]);

  const submitAnswer = () => {
    const correct = userInput.trim() === currentSeq.join('');
    const isCorrect = correct;
    setLastCorrect(isCorrect);
    play(isCorrect ? 'success' : 'click');

    if (isCorrect) {
      setTotalCorrect(p => p + 1);
      setMaxSpan(prev => Math.max(prev, currentSeq.length));
      setConsecutiveErrors(0);
    } else {
      setConsecutiveErrors(p => p + 1);
    }

    setPhase('feedback');

    if (consecutiveErrors + (isCorrect ? 0 : 1) >= 2 || trialIdx >= DIGIT_SEQUENCES.length - 1) {
      // End test
      const finalMaxSpan = isCorrect ? Math.max(maxSpan, currentSeq.length) : maxSpan;
      const pct = Math.round((finalMaxSpan / 9) * 100);
      const rawScore = Math.min(100, pct);
      setTimeout(() => {
        setScore(rawScore);
        if (typeof window !== 'undefined') {
          localStorage.setItem('digitForwardScore', String(rawScore));
          localStorage.setItem('digitForwardMaxSpan', String(finalMaxSpan));
        }
        setPhase('done');
      }, 1500);
      return;
    }

    setTimeout(() => {
      setTrialIdx(p => p + 1);
      setPhase('intro'); // brief rest
      setTimeout(startTrial, 800);
    }, 1500);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submitAnswer();
  };

  const finalScore = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem('digitForwardScore') || '0') : score;

  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-[0.6rem] font-mono tracking-[0.4em] text-cyan-400 mb-3 uppercase">
            WISC-V · Digit Span Forward
          </div>
          <h1 className="text-4xl font-black italic text-white mb-2">
            تسلسل الأرقام <span className="text-cyan-400">الأمامي</span>
          </h1>
          <p className="text-slate-400 text-sm">استمع للأرقام، ثم اكتبها بنفس الترتيب</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-10">
          {DIGIT_SEQUENCES.slice(0, 14).map((seq, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${
              i < trialIdx ? 'bg-emerald-500 w-5' :
              i === trialIdx ? 'bg-cyan-400 w-8 animate-pulse' :
              'bg-white/10 w-3'
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* INTRO */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center">
              <div className="text-8xl mb-8">🔢</div>
              <p className="text-slate-300 text-xl mb-8 leading-relaxed">
                ستسمع سلسلة من الأرقام. بعد الانتهاء اكتبها بنفس الترتيب.
              </p>
              <button onClick={startTrial}
                className="bg-cyan-600 hover:bg-cyan-500 px-12 py-4 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                ابدأ الاختبار 🚀
              </button>
            </motion.div>
          )}

          {/* SHOWING DIGIT */}
          {phase === 'showing' && (
            <motion.div key={`show-${digitIdx}`} initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
              className="text-center">
              <div className="bg-slate-900/60 border border-cyan-500/30 rounded-[3rem] p-16 shadow-[0_0_60px_rgba(6,182,212,0.1)]">
                <div className="text-[0.6rem] font-mono text-cyan-400 tracking-widest mb-4 uppercase">
                  رقم {(digitIdx + 1)} من {currentSeq.length}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={digitIdx}
                    initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="text-[8rem] font-black text-white leading-none tracking-tighter font-mono">
                    {digitIdx >= 0 ? currentSeq[digitIdx] : ''}
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center gap-2 mt-8">
                  {currentSeq.map((_, i) => (
                    <div key={i} className={`h-2 w-2 rounded-full transition-all ${
                      i <= digitIdx ? 'bg-cyan-400' : 'bg-white/10'
                    }`} />
                  ))}
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-6 font-mono">استمع بتركيز...</p>
            </motion.div>
          )}

          {/* INPUT */}
          {phase === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center">
              <div className="bg-slate-900/60 border border-indigo-500/30 rounded-[3rem] p-12 mb-6">
                <p className="text-indigo-300 text-lg font-black mb-6 italic">
                  ✏️ اكتب الأرقام التي سمعتها بالترتيب
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handleKey}
                  className="w-full text-center text-5xl font-black font-mono bg-slate-800 border border-white/10 focus:border-cyan-500 rounded-2xl px-4 py-5 text-white outline-none tracking-[0.3em]"
                  placeholder="_ _ _"
                  maxLength={9}
                />
                <p className="text-slate-500 text-sm mt-4 font-mono">
                  ↩ اضغط Enter أو الزر للتأكيد
                </p>
              </div>
              <button onClick={submitAnswer} disabled={!userInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-10 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105">
                تأكيد الإجابة ✓
              </button>
            </motion.div>
          )}

          {/* FEEDBACK */}
          {phase === 'feedback' && lastCorrect !== null && (
            <motion.div key="feedback" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center">
              <div className={`rounded-[3rem] p-16 border ${
                lastCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}>
                <div className="text-8xl mb-4">{lastCorrect ? '✅' : '❌'}</div>
                <div className={`text-3xl font-black ${lastCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lastCorrect ? 'ممتاز! +1 نقطة' : `الصحيح: ${currentSeq.join('')}`}
                </div>
              </div>
            </motion.div>
          )}

          {/* DONE */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-900/40 border border-indigo-500/30 rounded-[3rem] p-12 mb-8">
                <div className="text-6xl mb-6">🏆</div>
                <h2 className="text-4xl font-black text-white mb-2 italic">اكتمل الاختبار</h2>
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="bg-black/30 rounded-2xl p-6">
                    <div className="text-slate-400 text-xs font-mono mb-2">SCORE</div>
                    <div className="text-5xl font-black text-cyan-400">{score}%</div>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-6">
                    <div className="text-slate-400 text-xs font-mono mb-2">MAX SPAN</div>
                    <div className="text-5xl font-black text-indigo-400">{maxSpan}</div>
                  </div>
                </div>
                <div className={`mt-6 text-sm font-mono px-4 py-2 rounded-full inline-block ${
                  score >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                  score >= 50 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {score >= 75 ? 'ذاكرة أمامية ممتازة' :
                   score >= 50 ? 'ذاكرة أمامية متوسطة' :
                   'يحتاج تقييماً إضافياً'}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/diagnose/memory-test/digit-backward"
                  className="bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl font-black text-lg text-center transition-all hover:scale-105">
                  التالي: الأرقام المعكوسة ↩️
                </Link>
                <Link href="/diagnose/results"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-2xl font-bold text-sm text-center text-slate-300 transition-all">
                  عرض التقرير الكامل 📊
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
