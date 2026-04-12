'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AliCharacter from '@/app/components/ui/AliCharacter';

// ══════════════════════════════════════════════════════════
// Digit Span Backward — Conforms to WISC-V Digit Span Subtest
// Clinical Mapping: Working Memory Index (WMI)
// Scoring: 2 trials per span length (3→8 digits), max SS=19
// ══════════════════════════════════════════════════════════

type Phase = 'intro' | 'listen' | 'input' | 'feedback' | 'done';

interface Trial {
  span: number;
  sequence: number[];
}

// نفس الأرقام المستخدمة في WISC-V (معيار عالمي)
const TRIALS: Trial[] = [
  { span: 3, sequence: [3, 7, 1] },
  { span: 3, sequence: [6, 2, 9] },
  { span: 4, sequence: [5, 9, 2, 6] },
  { span: 4, sequence: [1, 8, 4, 7] },
  { span: 5, sequence: [8, 3, 7, 1, 5] },
  { span: 5, sequence: [4, 6, 9, 2, 8] },
  { span: 6, sequence: [7, 2, 5, 9, 4, 1] },
  { span: 6, sequence: [3, 8, 1, 6, 5, 9] },
  { span: 7, sequence: [9, 4, 1, 7, 3, 6, 2] },
  { span: 7, sequence: [5, 1, 8, 4, 2, 9, 7] },
];

// نقاط عربية للأرقام
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toArabic = (n: number) => n.toString().split('').map(d => arabicDigits[parseInt(d)]).join('');

export default function DigitSpanBackwardPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [trialIndex, setTrialIndex] = useState(0);
  const [showDigitIndex, setShowDigitIndex] = useState(-1);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ trial: Trial; correct: boolean; userAnswer: number[] }[]>([]);
  const [consecutiveFails, setConsecutiveFails] = useState(0);
  const [maxSpan, setMaxSpan] = useState(0);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = (text: string) => {
    if (!synthRef.current) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'ar-SA';
    utt.rate = 0.75;
    utt.pitch = 1.0;
    synthRef.current.speak(utt);
  };

  const startListening = async (trial: Trial) => {
    setPhase('listen');
    setShowDigitIndex(-1);
    setUserInput([]);
    await new Promise(r => setTimeout(r, 600));
    for (let i = 0; i < trial.sequence.length; i++) {
      setShowDigitIndex(i);
      speak(trial.sequence[i].toString());
      await new Promise(r => setTimeout(r, 1700));
    }
    setShowDigitIndex(-1);
    await new Promise(r => setTimeout(r, 400));
    setPhase('input');
  };

  const handleDigitPress = (digit: number) => {
    if (userInput.length >= TRIALS[trialIndex].span) return;
    setUserInput(prev => [...prev, digit]);
  };

  const handleBackspace = () => setUserInput(prev => prev.slice(0, -1));

  const handleSubmit = () => {
    const trial = TRIALS[trialIndex];
    const correct_answer = [...trial.sequence].reverse();
    const isCorrect = JSON.stringify(userInput) === JSON.stringify(correct_answer);
    const newResults = [...results, { trial, correct: isCorrect, userAnswer: userInput }];
    setResults(newResults);
    setFeedbackCorrect(isCorrect);
    setPhase('feedback');

    if (isCorrect) {
      setScore(s => s + 1);
      setMaxSpan(Math.max(maxSpan, trial.span));
      setConsecutiveFails(0);
    } else {
      const newFails = consecutiveFails + 1;
      setConsecutiveFails(newFails);
      // إيقاف عند فشلين متتاليين نفس الـ span (مثل WISC-V)
      if (newFails >= 2) {
        setTimeout(() => finishTest(newResults, score + (isCorrect ? 1 : 0)), 1500);
        return;
      }
    }

    setTimeout(() => {
      if (trialIndex < TRIALS.length - 1) {
        setTrialIndex(i => i + 1);
        setPhase('listen');
      } else {
        finishTest(newResults, score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  const finishTest = (finalResults: typeof results, finalScore: number) => {
    // حفظ النتائج — Digit Span Backward SS تقريبي
    const rawPercent = Math.round((finalScore / TRIALS.length) * 100);
    localStorage.setItem('digitBackwardScore', rawPercent.toString());
    localStorage.setItem('digitBackwardMaxSpan', maxSpan.toString());
    localStorage.setItem('digitBackwardRawScore', finalScore.toString());
    setPhase('done');
  };

  useEffect(() => {
    if (phase === 'listen') {
      startListening(TRIALS[trialIndex]);
    }
  }, [trialIndex, phase === 'listen' ? phase : null]);

  const currentTrial = TRIALS[trialIndex];
  const progress = (trialIndex / TRIALS.length) * 100;

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-mono mb-4">
            WISC-V · DIGIT SPAN BACKWARD · الذاكرة العاملة اللفظية
          </div>
          <h1 className="text-4xl font-black text-white mb-2">الأرقام <span className="text-indigo-400">المعكوسة</span></h1>
          <p className="text-slate-400 text-lg">استمع للأرقام… ثم قلها <strong className="text-indigo-300">بالعكس</strong>!</p>
        </header>

        {/* Progress */}
        {phase !== 'intro' && phase !== 'done' && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-slate-500 font-mono mb-2">
              <span>المحاولة {trialIndex + 1} / {TRIALS.length}</span>
              <span>Span: {currentTrial.span} أرقام</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-indigo-500 rounded-full" />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── المقدمة ── */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-slate-900/60 border border-indigo-500/30 rounded-[3rem] p-10 text-center">
              <AliCharacter name="" state="thinking" variant="compact" />
              <div className="mt-6 space-y-4 text-slate-300 text-lg leading-relaxed">
                <p>سأقول لك <strong className="text-indigo-300">سلسلة أرقام</strong>.</p>
                <p>مهمتك: قلها <strong className="text-white">بالعكس تماماً!</strong></p>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-left text-sm font-mono">
                  <span className="text-indigo-400">مثال:</span> أقول <strong>(3 ← 7 ← 1)</strong><br />
                  أنت تقول: <strong className="text-emerald-400">(1 ← 7 ← 3)</strong>
                </div>
              </div>
              <button onClick={() => setPhase('listen')}
                className="mt-8 w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                ابدأ الاختبار! 🚀
              </button>
            </motion.div>
          )}

          {/* ── الاستماع ── */}
          {phase === 'listen' && (
            <motion.div key="listen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-slate-900/60 border border-slate-700/40 rounded-[3rem] p-10 text-center">
              <div className="text-slate-400 text-sm font-mono mb-8">👂 استمع بتركيز...</div>
              <div className="flex justify-center gap-4 min-h-[80px] items-center">
                {currentTrial.sequence.map((digit, i) => (
                  <motion.div key={i}
                    animate={{
                      scale: showDigitIndex === i ? 1.4 : 0.8,
                      opacity: showDigitIndex === i ? 1 : 0.15,
                    }}
                    className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black">
                    {showDigitIndex === i ? toArabic(digit) : '?'}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── الإدخال ── */}
          {phase === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-slate-900/60 border border-indigo-500/30 rounded-[3rem] p-8">
              <p className="text-center text-slate-300 text-lg mb-6 font-bold">
                🔄 اكتب الأرقام <span className="text-indigo-400">بالعكس</span>
                <span className="text-slate-500 text-sm block mt-1">({currentTrial.span} أرقام)</span>
              </p>

              {/* عرض المدخلات */}
              <div className="flex justify-center gap-3 mb-6 min-h-[64px]">
                {Array.from({ length: currentTrial.span }).map((_, i) => (
                  <div key={i}
                    className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                      userInput[i] !== undefined
                        ? 'border-indigo-400 bg-indigo-600/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-700'
                    }`}>
                    {userInput[i] !== undefined ? toArabic(userInput[i]) : '_'}
                  </div>
                ))}
              </div>

              {/* لوحة المفاتيح */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => (
                  <button key={d} onClick={() => handleDigitPress(d)}
                    className="h-14 bg-slate-800 hover:bg-indigo-600 border border-white/10 rounded-xl text-xl font-black transition-all hover:scale-105 active:scale-95">
                    {toArabic(d)}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={handleBackspace}
                  className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold transition-all">
                  ← مسح
                </button>
                <button onClick={handleSubmit}
                  disabled={userInput.length < currentTrial.span}
                  className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  تأكيد ✓
                </button>
              </div>
            </motion.div>
          )}

          {/* ── النتيجة الفورية ── */}
          {phase === 'feedback' && (
            <motion.div key="feedback" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`text-center p-12 rounded-[3rem] border-2 ${feedbackCorrect
                ? 'bg-emerald-500/10 border-emerald-500'
                : 'bg-rose-500/10 border-rose-500'}`}>
              <div className="text-7xl mb-4">{feedbackCorrect ? '✅' : '❌'}</div>
              <p className="text-2xl font-black">{feedbackCorrect ? 'ممتاز!' : 'حاول مرة أخرى'}</p>
              {!feedbackCorrect && (
                <p className="text-slate-400 mt-2 text-sm">
                  الإجابة الصحيحة: <strong className="text-white">{[...currentTrial.sequence].reverse().map(toArabic).join(' ← ')}</strong>
                </p>
              )}
            </motion.div>
          )}

          {/* ── انتهى ── */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border border-indigo-500/30 rounded-[3rem] p-10 text-center">
              <AliCharacter name="" state={score >= 6 ? 'success' : 'idle'} variant="compact" />
              <h2 className="text-4xl font-black mt-6 mb-2">
                اكتمل الاختبار! {score >= 7 ? '🏆' : score >= 5 ? '⭐' : '💪'}
              </h2>
              <div className="mt-6 space-y-3">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                  <div className="text-slate-400 text-sm mb-1 font-mono">الأرقام المتتالية الصحيحة</div>
                  <div className="text-5xl font-black text-indigo-400">{score} / {TRIALS.length}</div>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-4">
                  <div className="text-slate-500 text-xs font-mono mb-1">أقصى Span صحيح</div>
                  <div className="text-3xl font-black text-white">{maxSpan} أرقام</div>
                </div>
                <div className="text-slate-500 text-xs mt-2 font-mono">
                  المعدل الطبيعي (عمر 8 سنوات): 4-5 أرقام معكوسة
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => router.back()}
                  className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold transition-all">
                  رجوع
                </button>
                <button onClick={() => router.push('/diagnose/results')}
                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black transition-all hover:scale-105">
                  عرض النتائج الكاملة 📊
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
