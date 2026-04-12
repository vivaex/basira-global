'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AliCharacter from '../../components/ui/AliCharacter';
import { getStudentProfile } from '@/lib/studentProfile';

// ─── Conners-3 inspired parent questions, grouped by phase ───────────────────

const PHASES = [
  {
    key: 'attention',
    title: 'الانتباه',
    icon: '🎯',
    color: 'cyan',
    desc: 'مدى الانتباه والتركيز اليومي',
    questions: [
      { id: 1, text: 'هل يجد صعوبة في إكمال الواجبات والمهام التي تتطلب تركيزاً مستمراً؟' },
      { id: 2, text: 'هل يتشتت انتباهه بسهولة بسبب مؤثرات خارجية بسيطة؟' },
      { id: 3, text: 'هل ينسى التعليمات اليومية بشكل متكرر؟' },
    ],
  },
  {
    key: 'behavior',
    title: 'السلوك والانفعال',
    icon: '🌊',
    color: 'rose',
    desc: 'ردود الفعل الانفعالية والسلوك اليومي',
    questions: [
      { id: 4, text: 'هل يظهر ردود فعل مبالغ فيها عند تغيير الروتين المعتاد؟' },
      { id: 5, text: 'هل يواجه صعوبة في الانتظار أو التحكم بالدوافع الفورية؟' },
      { id: 6, text: 'هل يتعرض لنوبات غضب متكررة غير مبررة؟' },
    ],
  },
  {
    key: 'social',
    title: 'التواصل الاجتماعي',
    icon: '🤝',
    color: 'amber',
    desc: 'التفاعل مع الأقران والبيئة الاجتماعية',
    questions: [
      { id: 7, text: 'هل يتجنب التواصل البصري أثناء الحديث؟' },
      { id: 8, text: 'هل يجد صعوبة في اللعب التعاوني مع الأقران؟' },
      { id: 9, text: 'هل يجد صعوبة في فهم مشاعر الآخرين؟' },
    ],
  },
  {
    key: 'sensory',
    title: 'المعالجة الحسية',
    icon: '👂',
    color: 'violet',
    desc: 'استجابة الطفل للمحفزات الحسية اليومية',
    questions: [
      { id: 10, text: 'هل يبدي انزعاجاً مفرطاً من الأصوات العالية أو الأضواء الساطعة؟' },
      { id: 11, text: 'هل يرفض ملامس معينة للطعام أو الملابس؟' },
      { id: 12, text: 'هل يبحث بشكل مبالغ عن مدخلات حسية (تحريك مستمر، لمس كل شيء)؟' },
    ],
  },
];

const OPTIONS = [
  { label: 'لا تنطبق أبداً', score: 0, color: 'hover:bg-emerald-600' },
  { label: 'نادراً', score: 1, color: 'hover:bg-teal-600' },
  { label: 'أحياناً', score: 2, color: 'hover:bg-amber-600' },
  { label: 'غالباً', score: 3, color: 'hover:bg-orange-600' },
  { label: 'دائماً', score: 4, color: 'hover:bg-rose-600' },
];

const COLOR_MAP: Record<string, string> = {
  cyan: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400',
  rose: 'border-rose-500/40 bg-rose-500/5 text-rose-400',
  amber: 'border-amber-500/40 bg-amber-500/5 text-amber-400',
  violet: 'border-violet-500/40 bg-violet-500/5 text-violet-400',
};

const ALL_QUESTIONS = PHASES.flatMap(p => p.questions.map(q => ({ ...q, phase: p.key })));

export default function ParentHub() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [view, setView] = useState<'test' | 'intro' | 'complete'>('intro');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const profile = getStudentProfile();

  const currentPhase = PHASES[phaseIdx];
  const currentQuestion = currentPhase?.questions[qIdx];
  const totalQuestions = ALL_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = (score: number) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);

    const nextQ = qIdx + 1;
    if (nextQ < currentPhase.questions.length) {
      setQIdx(nextQ);
    } else {
      const nextPhase = phaseIdx + 1;
      if (nextPhase < PHASES.length) {
        setPhaseIdx(nextPhase);
        setQIdx(0);
      } else {
        // Done — save and go to complete view
        localStorage.setItem('parentAssessment', JSON.stringify(newAnswers));
        setView('complete');
      }
    }
  };

  // Score per phase
  const phaseScore = (key: string) => {
    const phase = PHASES.find(p => p.key === key);
    if (!phase) return 0;
    const total = phase.questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
    const max = phase.questions.length * 4;
    return Math.round((total / max) * 100);
  };

  const generateHomeTips = async () => {
    setAiLoading(true);
    setApiError(null);
    const scores = PHASES.map(p => ({ domain: p.title, score: phaseScore(p.key) }));
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile?.name || 'الطفل',
          childResults: scores.map(s => ({ id: s.domain, score: 100 - s.score, title: s.domain })),
          parentStats: scores,
          studentProfile: profile,
          sessions: [],
          requestType: 'parent_home_tips',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في توليد التوصيات');
      const activities: string[] = data?.parentGuide?.homeActivities || [
        'خصص 10 دقائق يومية للقصص التفاعلية',
        'استخدم لعبة "ماذا لو؟" لتدريب التفكير المرن',
        'نظّم روتيناً صباحياً ثابتاً لتقليل القلق',
        'اجعل نشاطاً جماعياً يومياً لتعزيز التواصل',
        'خصص منطقة هادئة للمذاكرة بعيداً عن الشاشات',
      ];
      setAiTips(activities);
    } catch (e: any) {
      setApiError(e.message);
      // Fallback tips
      setAiTips([
        'خصص 10–15 دقيقة يومياً للقراءة المشتركة',
        'استخدم جداول بصرية لروتين الطفل اليومي',
        'اجعل وقت اللعب تعاونياً لا تنافسياً',
        'قدم التعليمات خطوة بخطوة مع الإيماء البصري',
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden" dir="rtl">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cyan-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">

        {/* INTRO */}
        {view === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="flex justify-center mb-8">
              <AliCharacter name={profile?.name} state="idle" variant="compact" />
            </div>
            <div className="text-[0.6rem] font-mono tracking-[0.4em] text-cyan-400 mb-3 uppercase">
              Parental Intelligence Protocol · Conners-3 Adapted
            </div>
            <h1 className="text-5xl font-black italic mb-4">
              مختبر <span className="text-cyan-400">الرصد الوالدي</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
              يساعدنا هذا الاستبيان في فهم سلوك الطفل في البيئة المنزلية. 
              سيستغرق حوالي <strong className="text-white">5 دقائق</strong>.
            </p>

            {/* Phase preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {PHASES.map(p => (
                <div key={p.key} className={`rounded-2xl p-4 border ${COLOR_MAP[p.color]}`}>
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-black text-sm">{p.title}</div>
                  <div className="text-xs opacity-60 mt-1">{p.questions.length} أسئلة</div>
                </div>
              ))}
            </div>

            <button onClick={() => setView('test')}
              className="bg-cyan-600 hover:bg-cyan-500 px-12 py-5 rounded-[2rem] font-black text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
              ابدأ التقييم الوالدي 🚀
            </button>
          </motion.div>
        )}

        {/* TEST */}
        {view === 'test' && currentPhase && currentQuestion && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/diagnose" className="text-slate-500 hover:text-white transition-colors text-sm font-mono">
                ← المختبرات
              </Link>
              <div className="text-xs font-mono text-slate-500">
                {answeredCount}/{totalQuestions} سؤال
              </div>
            </div>

            {/* Overall progress */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
                <span>{currentPhase.icon} {currentPhase.title}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
              </div>
              {/* Phase dots */}
              <div className="flex gap-2 mt-3 justify-center">
                {PHASES.map((p, i) => (
                  <div key={p.key} className={`h-1 rounded-full transition-all ${
                    i < phaseIdx ? 'bg-emerald-500 w-8' :
                    i === phaseIdx ? 'bg-cyan-400 w-12 animate-pulse' :
                    'bg-white/10 w-4'
                  }`} />
                ))}
              </div>
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div key={`${phaseIdx}-${qIdx}`}
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/8 rounded-[3rem] p-10 mb-8 min-h-[280px] flex flex-col justify-center shadow-2xl">
                <div className={`text-[0.6rem] font-mono tracking-[0.3em] uppercase mb-4 ${COLOR_MAP[currentPhase.color].split(' ').pop()}`}>
                  [{currentPhase.title}] · سؤال {qIdx + 1} من {currentPhase.questions.length}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-relaxed italic mb-2">
                  {currentQuestion.text}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Answer options */}
            <div className="grid grid-cols-1 gap-3">
              {OPTIONS.map(opt => (
                <button key={opt.score}
                  onClick={() => handleAnswer(opt.score)}
                  className={`py-4 px-6 bg-white/4 hover:bg-white/10 ${opt.color} border border-white/8 rounded-2xl font-black text-lg text-right transition-all active:scale-98 hover:border-white/20 flex items-center justify-between`}>
                  <span>{opt.label}</span>
                  <span className="text-slate-600 text-sm font-mono">{opt.score}/4</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* COMPLETE */}
        {view === 'complete' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-8">
              <AliCharacter name={profile?.name} state="success" variant="compact" />
            </div>

            <h1 className="text-4xl font-black italic text-center mb-2">اكتمل التقييم الوالدي! 🎉</h1>
            <p className="text-slate-400 text-center mb-10">شكراً على مساهمتكم في تقييم الطفل</p>

            {/* Phase scores */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {PHASES.map(p => {
                const s = phaseScore(p.key);
                return (
                  <div key={p.key} className={`rounded-2xl p-6 border ${COLOR_MAP[p.color]}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="font-black text-sm">{p.title}</span>
                      </div>
                      <span className={`text-xl font-black ${
                        s <= 30 ? 'text-emerald-400' : s <= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>{s}%</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s}%` }}
                        className={`h-full rounded-full ${
                          s <= 30 ? 'bg-emerald-500' : s <= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-mono">
                      {s <= 30 ? 'طبيعي — لا تدخل مطلوب' :
                       s <= 60 ? 'يُوصى بمتابعة' : 'يستلزم تقييماً إضافياً'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ═══ AI BUTTON — زر التوليد السري ═══ */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/40 rounded-[2.5rem] p-8 mb-8">
              <h2 className="text-2xl font-black italic text-white mb-2 text-center">
                🧠 التوليد السري بالذكاء الاصطناعي
              </h2>
              <p className="text-slate-400 text-sm text-center mb-6">
                احصل على توصيات منزلية مخصصة بناءً على إجاباتك
              </p>
              <button
                onClick={generateHomeTips}
                disabled={aiLoading}
                className={`w-full px-8 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] ${
                  aiLoading ? 'bg-indigo-800 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02]'
                }`}>
                {aiLoading ? '⏳ جاري التوليد...' : '🚀 ولّد التوصيات المنزلية الآن'}
              </button>
              {apiError && <p className="text-rose-400 text-sm mt-3 text-center">⚠️ {apiError}</p>}

              <AnimatePresence>
                {aiTips.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8">
                    <h3 className="text-indigo-300 font-black text-lg mb-4">🏠 أنشطة منزلية مقترحة:</h3>
                    <div className="space-y-3">
                      {aiTips.map((tip, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
                          <span className="text-indigo-400 text-lg mt-0.5">✅</span>
                          <p className="text-slate-200 leading-relaxed">{tip}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4">
              <Link href="/diagnose/results"
                className="w-full text-center bg-cyan-600 hover:bg-cyan-500 px-8 py-5 rounded-[2rem] font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                📊 عرض التقرير الكامل
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/diagnose/teacher-form"
                  className="text-center bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 px-6 py-4 rounded-2xl font-black text-sm text-violet-300 transition-all">
                  🏫 استبيان المعلم
                </Link>
                <Link href="/diagnose"
                  className="text-center bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl font-black text-sm text-slate-300 transition-all">
                  ← المختبرات
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}