'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getStudentProfile } from '@/lib/studentProfile';

const STEPS = [
  {
    id: 'profile',
    title: 'ملف الطفل',
    subtitle: 'البيانات الأساسية (الاسم، العمر، الصف)',
    icon: '👤',
    href: '/diagnose/profile',
    storageKey: 'studentProfile',
    color: 'cyan',
    duration: '2 دقيقة',
    required: true,
  },
  {
    id: 'labs',
    title: 'مختبرات التشخيص',
    subtitle: 'إكمال الألعاب التشخيصية المناسبة (5+ مختبرات)',
    icon: '🔬',
    href: '/diagnose',
    storageKey: 'testSessions',
    color: 'indigo',
    duration: '20–40 دقيقة',
    required: true,
  },
  {
    id: 'parent-hub',
    title: 'استبيان الأهل',
    subtitle: 'تقييم السلوك المنزلي (Conners-3)',
    icon: '👨‍👩‍👧',
    href: '/diagnose/parent-hub',
    storageKey: 'parentAssessment',
    color: 'amber',
    duration: '5 دقائق',
    required: false,
  },
  {
    id: 'teacher-form',
    title: 'استبيان المعلم',
    subtitle: 'تقييم الأداء الصفي (Conners-3 Teacher)',
    icon: '🏫',
    href: '/diagnose/teacher-form',
    storageKey: 'teacherFormScore',
    color: 'violet',
    duration: '3 دقائق',
    required: false,
  },
  {
    id: 'dev-history',
    title: 'التاريخ التطوري',
    subtitle: 'بيانات النمو والولادة والأسرة (DSM-5-TR)',
    icon: '🧬',
    href: '/diagnose/profile/developmental-history',
    storageKey: 'developmentalHistory',
    color: 'rose',
    duration: '7 دقائق',
    required: false,
  },
  {
    id: 'memory',
    title: 'اختبارات الذاكرة',
    subtitle: 'الأرقام الأمامية والمعكوسة (WISC-V)',
    icon: '🧠',
    href: '/diagnose/memory-test/digit-forward',
    storageKey: 'digitForwardScore',
    color: 'emerald',
    duration: '5 دقائق',
    required: false,
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/40',    text: 'text-cyan-400',    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]' },
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/40',  text: 'text-indigo-400',  glow: 'shadow-[0_0_30px_rgba(99,102,241,0.15)]' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-400',   glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/40',  text: 'text-violet-400',  glow: 'shadow-[0_0_30px_rgba(139,92,246,0.15)]' },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/40',    text: 'text-rose-400',    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' },
};

export default function StartHere() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const profileData = getStudentProfile();
    setProfile(profileData);
    const status: Record<string, boolean> = {};
    for (const step of STEPS) {
      const raw = localStorage.getItem(step.storageKey);
      if (raw) {
        if (step.storageKey === 'testSessions') {
          try {
            const arr = JSON.parse(raw);
            status[step.id] = Array.isArray(arr) && arr.length >= 3;
          } catch { status[step.id] = false; }
        } else if (step.storageKey === 'studentProfile') {
          try {
            const p = JSON.parse(raw);
            status[step.id] = !!(p?.name);
          } catch { status[step.id] = false; }
        } else {
          status[step.id] = true;
        }
      } else {
        status[step.id] = false;
      }
    }
    setDone(status);
  }, []);

  const completedCount = Object.values(done).filter(Boolean).length;
  const totalCount = STEPS.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const requiredDone = STEPS.filter(s => s.required).every(s => done[s.id]);

  const readyForAI = completedCount >= 3;

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-indigo-600/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14">
          <div className="text-[0.6rem] font-mono tracking-[0.4em] text-cyan-400 mb-3 uppercase">
            Basira Global · Onboarding Protocol
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic mb-4">
            ابدأ <span className="text-cyan-400">من هنا</span> 🚀
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            {profile?.name
              ? `مرحباً، ${profile.name} في نظام بصيرة. أكمل الخطوات التالية للحصول على أدق تقرير سريري ممكن.`
              : 'اتبع هذا المرشد خطوة بخطوة للحصول على أدق تقرير سريري لطفلك.'}
          </p>
        </motion.header>

        {/* Overall progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 border border-white/8 rounded-[2.5rem] p-8 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-black text-white">{completedCount} / {totalCount} خطوات مكتملة</div>
              <div className="text-slate-500 text-sm font-mono mt-1">اكتمال التقييم الشامل</div>
            </div>
            <div className={`text-5xl font-black ${
              progress >= 80 ? 'text-emerald-400' :
              progress >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>{progress}%</div>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] rounded-full" />
          </div>
          <div className="flex gap-4 mt-4 text-xs font-mono">
            <span className="text-emerald-400">
              {STEPS.filter(s => done[s.id]).length} مكتملة ✓
            </span>
            <span className="text-slate-500">
              {STEPS.filter(s => !done[s.id]).length} متبقية
            </span>
            {readyForAI && (
              <span className="text-indigo-400 mr-auto">جاهز للتحليل بالذكاء الاصطناعي ✓</span>
            )}
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4 mb-12">
          {STEPS.map((step, i) => {
            const c = COLOR_MAP[step.color];
            const isDone = done[step.id];
            return (
              <motion.div key={step.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}>
                <Link href={step.href}
                  className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all group ${
                    isDone
                      ? 'bg-emerald-500/8 border-emerald-500/30 hover:border-emerald-500/50'
                      : `${c.bg} ${c.border} hover:border-opacity-70 ${c.glow}`
                  }`}>
                  {/* Step number + icon */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl relative ${
                    isDone ? 'bg-emerald-500/20 border-emerald-500/40' : `${c.bg} ${c.border}`
                  }`}>
                    {isDone ? '✅' : step.icon}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      isDone ? 'bg-emerald-500 text-white' : 'bg-slate-800 border border-white/10 text-slate-400'
                    }`}>{i + 1}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg font-black ${isDone ? 'text-emerald-400' : 'text-white'}`}>
                        {step.title}
                      </span>
                      {step.required && (
                        <span className="text-[0.55rem] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">مطلوب</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{step.subtitle}</p>
                  </div>

                  {/* Duration + arrow */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-xs font-mono mb-1 ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isDone ? 'مكتمل ✓' : step.duration}
                    </div>
                    <div className={`text-sm transition-transform group-hover:-translate-x-1 ${c.text}`}>←</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA — Generate report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`rounded-[3rem] p-10 text-center border-2 transition-all ${
            readyForAI
              ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-500/50 shadow-[0_0_60px_rgba(99,102,241,0.2)]'
              : 'bg-slate-900/40 border-white/5 opacity-70'
          }`}>
          {readyForAI ? (
            <>
              <div className="text-5xl mb-4">🧠</div>
              <h2 className="text-3xl font-black italic text-white mb-2">
                أنت جاهز للتقرير السريري!
              </h2>
              <p className="text-slate-400 mb-6">
                تم جمع بيانات كافية. اضغط لتوليد التقرير الكامل بالذكاء الاصطناعي.
              </p>
              <Link href="/diagnose/results"
                className="inline-block bg-indigo-600 hover:bg-indigo-500 px-12 py-5 rounded-3xl font-black text-xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                🚀 عرض التقرير وتوليد التحليل
              </Link>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-2xl font-black text-slate-400 mb-2">
                أكمل خطوتين على الأقل للمتابعة
              </h2>
              <p className="text-slate-600 text-sm">
                أنجز ملف الطفل ومختبراً واحداً على الأقل لبدء التقييم.
              </p>
            </>
          )}
        </motion.div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Link href="/clinician/dashboard"
            className="bg-white/4 hover:bg-white/8 border border-white/8 rounded-2xl p-4 text-center transition-all">
            <div className="text-lg mb-1">🩺</div>
            <div className="text-xs font-black text-slate-400">لوحة الأخصائي</div>
          </Link>
          <Link href="/diagnose/passport"
            className="bg-white/4 hover:bg-white/8 border border-white/8 rounded-2xl p-4 text-center transition-all">
            <div className="text-lg mb-1">🎫</div>
            <div className="text-xs font-black text-slate-400">الجواز التعليمي</div>
          </Link>
          <Link href="/diagnose/progress"
            className="bg-white/4 hover:bg-white/8 border border-white/8 rounded-2xl p-4 text-center transition-all">
            <div className="text-lg mb-1">📈</div>
            <div className="text-xs font-black text-slate-400">التقدم عبر الزمن</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
