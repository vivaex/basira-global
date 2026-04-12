'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getStudentProfile } from '@/lib/studentProfile';
import { interpretDigitSpan, getDigitSpanNorm } from '@/lib/arabicNormTable';

// ── Letter-Number Sequencing Test (WISC-V WMI) ─────────────────────────────
// المصدر: WISC-V Technical Manual (Wechsler, 2014) — Modified for Arabic
// المبدأ: يُقرأ تسلسل من الأحرف والأرقام، والمفحوص يعيد ترتيبهم (أرقام أولاً ثم أحرف)

type Phase = 'intro' | 'ready' | 'display' | 'response' | 'result';

interface SequenceLevel {
  level: number;
  sequence: string[];  // e.g. ['ب', '2', 'س', '1']
  expectedNumbers: string[];
  expectedLetters: string[];
}

// WISC-V Arabic adapted sequences — numbers (0-9) + Arabic letters
const SEQUENCES: SequenceLevel[] = [
  { level: 1, sequence: ['3', 'ب'],          expectedNumbers: ['3'],    expectedLetters: ['ب'] },
  { level: 2, sequence: ['س', '2', 'م'],      expectedNumbers: ['2'],    expectedLetters: ['م', 'س'] },
  { level: 3, sequence: ['1', 'ك', '4', 'ر'], expectedNumbers: ['1','4'], expectedLetters: ['ك', 'ر'] },
  { level: 4, sequence: ['7', 'ه', '2', 'د', '5'],       expectedNumbers: ['2','5','7'],    expectedLetters: ['د','ه'] },
  { level: 5, sequence: ['9', 'ن', '3', 'ل', '1', 'ع'],  expectedNumbers: ['1','3','9'],    expectedLetters: ['ع','ل','ن'] },
  { level: 6, sequence: ['4', 'ف', '8', 'ت', '2', 'ج', '6'],    expectedNumbers: ['2','4','6','8'],  expectedLetters: ['ت','ج','ف'] },
  { level: 7, sequence: ['5','ق','1','ز','9','ب','3'],             expectedNumbers: ['1','3','5','9'], expectedLetters: ['ب','ز','ق'] },
  { level: 8, sequence: ['7','و','4','ش','1','خ','9','ذ'],          expectedNumbers: ['1','4','7','9'], expectedLetters: ['ذ','ش','و','خ'] },
];

const DISPLAY_MS = 900; // وقت عرض كل عنصر بالمللي ثانية

export default function LetterNumberSequencing() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<{ level: number; correct: boolean; maxSpan: number }[]>([]);
  const [consecutiveFails, setConsecutiveFails] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [savedToStorage, setSavedToStorage] = useState(false);

  useEffect(() => {
    const p = getStudentProfile();
    setProfile(p);
  }, []);

  // كشف تسلسل العرض
  useEffect(() => {
    if (phase !== 'display') return;
    if (displayIndex >= SEQUENCES[currentLevel].sequence.length) {
      setTimeout(() => setPhase('response'), 500);
      return;
    }
    const t = setTimeout(() => setDisplayIndex(i => i + 1), DISPLAY_MS);
    return () => clearTimeout(t);
  }, [phase, displayIndex, currentLevel]);

  const startLevel = () => {
    setDisplayIndex(0);
    setUserInput('');
    setPhase('display');
  };

  const handleSubmit = () => {
    const seq = SEQUENCES[currentLevel];

    // تحقق: أرقام أولاً ثم حروف، مرتبة تصاعدياً وأبجدياً
    const userParts = userInput.trim().split(/\s+/);
    const correctAnswer = [
      ...seq.expectedNumbers.sort(),
      ...seq.expectedLetters.sort()
    ].join(' ');
    const userAnswer = userParts.join(' ');
    const correct = userAnswer === correctAnswer;

    const newResult = { level: currentLevel + 1, correct, maxSpan: seq.sequence.length };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    const fails = correct ? 0 : consecutiveFails + 1;
    setConsecutiveFails(fails);

    // توقف التلقائي: فشل 3 متتاليات أو وصل للمستوى الأخير
    if (!correct && fails >= 2) {
      finishTest(updatedResults, currentLevel + 1);
    } else if (currentLevel >= SEQUENCES.length - 1) {
      finishTest(updatedResults, SEQUENCES.length);
    } else {
      setCurrentLevel(l => l + 1);
      setPhase('ready');
    }
  };

  const finishTest = (results: { level: number; correct: boolean; maxSpan: number }[], maxLevel: number) => {
    const correctCount = results.filter(r => r.correct).length;
    const totalLevels = results.length;
    const rawScore = Math.round((correctCount / Math.max(1, totalLevels)) * 100);
    const maxSpanAchieved = Math.max(...results.filter(r => r.correct).map(r => r.maxSpan), 2);

    if (typeof window !== 'undefined') {
      localStorage.setItem('letterNumberScore', JSON.stringify({
        rawScore,
        maxSpanAchieved,
        maxLevel,
        correctCount,
        totalLevels,
        completedAt: new Date().toISOString(),
      }));

      // إضافة للجلسات
      const sessions = JSON.parse(localStorage.getItem('testSessions') || '[]');
      sessions.push({
        testId: 'memory-test/letter-number',
        testCategory: 'memory',
        testTitle: 'تسلسل الحروف والأرقام (WISC-V)',
        rawScore,
        completedAt: new Date().toISOString(),
      });
      localStorage.setItem('testSessions', JSON.stringify(sessions));
      setSavedToStorage(true);
    }
    setPhase('result');
  };

  const maxSpanAchieved = results.filter(r => r.correct).length > 0
    ? Math.max(...results.filter(r => r.correct).map(r => r.maxSpan), 2)
    : 2;
  const correctCount = results.filter(r => r.correct).length;
  const rawScore = Math.round((correctCount / Math.max(1, results.length)) * 100);

  const norm = getDigitSpanNorm(profile?.age || 9);
  const interpretation = phase === 'result'
    ? interpretDigitSpan(maxSpanAchieved, 'sequencing', profile?.age || 9)
    : null;

  const currentSeq = SEQUENCES[currentLevel];

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/6 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[0.6rem] font-mono tracking-[0.3em] text-violet-400 mb-2 uppercase">
            WISC-V · Working Memory Index · Letter-Number Sequencing
          </div>
          <h1 className="text-3xl font-black italic text-white mb-1">
            تسلسل الحروف والأرقام 🔡
          </h1>
          <p className="text-slate-500 text-sm">
            رتّب ما تسمعه: الأرقام تصاعدياً أولاً، ثم الحروف أبجدياً.
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border border-violet-500/20 rounded-[3rem] p-10 text-center">
              <div className="text-6xl mb-6">🧠</div>
              <h2 className="text-2xl font-black italic mb-4">كيف تلعب؟</h2>
              <div className="space-y-4 text-right mb-8">
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-violet-400 font-black">1.</span>
                  <p className="text-slate-300 text-sm">ستُعرض عليك عناصر واحدة تلو الأخرى (حروف وأرقام).</p>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-violet-400 font-black">2.</span>
                  <p className="text-slate-300 text-sm">اكتب الأرقام <strong className="text-white">تصاعدياً</strong> أولاً، ثم الحروف <strong className="text-white">أبجدياً</strong>، مفصولة بمسافات.</p>
                </div>
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4">
                  <p className="text-violet-300 text-sm font-black">مثال: إذا رأيت ب - 3 - أ - 1</p>
                  <p className="text-white text-sm mt-1">الجواب الصحيح: <strong>1 3 أ ب</strong></p>
                </div>
              </div>
              <button onClick={() => { setPhase('ready'); }}
                className="w-full bg-violet-600 hover:bg-violet-500 py-5 rounded-3xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
                ابدأ الاختبار 🚀
              </button>
              <Link href="/diagnose" className="block mt-4 text-slate-600 hover:text-slate-400 text-xs font-mono transition-all">
                ← العودة للمختبرات
              </Link>
            </motion.div>
          )}

          {/* ── READY ── */}
          {phase === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 border border-white/5 rounded-[3rem] p-10 text-center">
              <div className="text-slate-400 font-mono text-sm mb-2">المستوى {currentLevel + 1} / {SEQUENCES.length}</div>
              <div className="text-6xl mb-4">{currentSeq.sequence.length} عناصر</div>
              <p className="text-slate-400 mb-8">اضغط جاهز عندما تكون مستعداً للتركيز</p>
              <div className="flex gap-3 mb-4 justify-center flex-wrap">
                {Array.from({ length: currentSeq.sequence.length }).map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-600 font-black">?</div>
                ))}
              </div>
              <button onClick={startLevel}
                className="w-full bg-violet-600 hover:bg-violet-500 py-5 rounded-3xl font-black text-xl mt-6 transition-all hover:scale-105">
                جاهز ✓
              </button>
            </motion.div>
          )}

          {/* ── DISPLAY ── */}
          {phase === 'display' && (
            <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-slate-900/60 border border-violet-500/30 rounded-[3rem] p-10 text-center">
              <div className="text-slate-400 font-mono text-xs mb-8 uppercase tracking-widest">ركّز جيداً...</div>
              <AnimatePresence mode="wait">
                {displayIndex >= 0 && displayIndex < currentSeq.sequence.length ? (
                  <motion.div key={displayIndex}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-9xl font-black text-violet-400 my-8 drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                    {currentSeq.sequence[displayIndex]}
                  </motion.div>
                ) : (
                  <div className="text-9xl my-8 opacity-20">...</div>
                )}
              </AnimatePresence>
              <div className="flex justify-center gap-1">
                {currentSeq.sequence.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= displayIndex && displayIndex < currentSeq.sequence.length ? 'bg-violet-400' : 'bg-slate-700'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── RESPONSE ── */}
          {phase === 'response' && (
            <motion.div key="response" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border border-white/5 rounded-[3rem] p-10">
              <div className="text-center mb-6">
                <div className="text-violet-400 font-mono text-xs mb-2">✏️ اكتب الجواب</div>
                <p className="text-slate-400 text-sm">أرقام تصاعدياً ثم حروف أبجدياً، مفصولة بمسافات</p>
              </div>
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="مثال: 1 3 أ ب"
                autoFocus
                className="w-full bg-slate-800 border-2 border-violet-500/30 focus:border-violet-400 text-white text-2xl font-black text-center rounded-2xl px-6 py-5 outline-none transition-all placeholder:text-slate-700 mb-6 font-mono tracking-widest"
                dir="ltr"
              />
              <div className="text-xs text-slate-600 text-center mb-4 font-mono">
                كان التسلسل: {currentSeq.sequence.length} عناصر
              </div>
              <button onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 py-5 rounded-3xl font-black text-xl transition-all">
                تأكيد الإجابة ✓
              </button>
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && interpretation && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6">
              <div className={`rounded-[3rem] p-10 text-center border-2 ${
                interpretation.ss >= 90 ? 'bg-emerald-500/10 border-emerald-500/40' :
                interpretation.ss >= 80 ? 'bg-amber-500/10 border-amber-500/40' :
                'bg-rose-500/10 border-rose-500/40'
              }`}>
                <div className="text-2xl mb-3">
                  {interpretation.ss >= 90 ? '🌟' : interpretation.ss >= 80 ? '⚠️' : '🔴'}
                </div>
                <div className="text-6xl font-black text-white mb-2">{rawScore}%</div>
                <div className="text-3xl font-black text-violet-400 mb-2">SS = {interpretation.ss}</div>
                <div className="text-slate-300 font-bold mb-1">{interpretation.label}</div>
                <div className="text-slate-500 text-sm font-mono mb-4">
                  الفئة المئوية: {interpretation.percentile}% | الحد الأقصى: {maxSpanAchieved} عناصر
                </div>
                <div className="bg-black/30 rounded-2xl p-4 text-right">
                  <div className="text-[10px] font-mono text-slate-500 mb-1">تفسير WISC-V</div>
                  <div className={`text-sm font-bold ${
                    interpretation.ss >= 90 ? 'text-emerald-400' :
                    interpretation.ss >= 80 ? 'text-amber-400' : 'text-rose-400'
                  }`}>{interpretation.label.split('—')[0]}</div>
                </div>
              </div>

              {/* WISC-V Reference */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                <div className="text-[10px] font-mono text-slate-500 mb-3 uppercase">المعيار (WISC-V Arabic Adaptation 2024)</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'متوسط عمره', val: `${norm.sequencingMean.toFixed(1)} عناصر`, color: 'text-slate-300' },
                    { label: 'أداؤه', val: `${maxSpanAchieved} عناصر`, color: interpretation.ss >= 90 ? 'text-emerald-400' : 'text-rose-400' },
                    { label: 'الدرجة المعيارية', val: `SS ${interpretation.ss}`, color: 'text-violet-400' },
                  ].map(item => (
                    <div key={item.label} className="bg-black/20 rounded-xl p-3">
                      <div className={`text-lg font-black ${item.color}`}>{item.val}</div>
                      <div className="text-[9px] font-mono text-slate-600 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Levels breakdown */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                <div className="text-sm font-black text-slate-300 mb-4">تفاصيل المستويات</div>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-mono">المستوى {r.level}</span>
                      <span className="font-mono text-slate-400">{r.maxSpan} عناصر</span>
                      <span className={`font-black ${r.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.correct ? '✓ صحيح' : '✗ خطأ'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {savedToStorage && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <span className="text-emerald-400 font-black text-sm">✓ تم حفظ النتيجة في ملف الطفل</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Link href="/diagnose/results"
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-4 rounded-2xl font-black text-center transition-all hover:scale-105">
                  🧠 توليد التقرير
                </Link>
                <Link href="/diagnose"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl font-black text-center transition-all">
                  ← المختبرات
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
