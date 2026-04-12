'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getCaseById, ClinicalCase, RISK_LABELS, RISK_COLORS, RISK_ICON, saveCase } from '@/lib/clinicianStorage';
import { getAllTestSessions } from '@/lib/studentProfile';

interface Props { params: { id: string } }

const domainIcons: Record<string, string> = {
  math: '🔢', visual: '👁️', attention: '🎯', memory: '🧠',
  motor: '✍️', language: '📖', auditory: '👂', executive: '⚙️',
  cognitive: '💡', writing: '🖋️', adhd: '⚡', autism: '🧩',
  anxiety: '🌿', social_comm: '🤝',
};

export default function ClinicalCasePage({ params }: Props) {
  const [caseData, setCaseData] = useState<ClinicalCase | null>(null);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const c = getCaseById(params.id);
    if (c) { setCaseData(c); setNote(c.notes || ''); }
  }, [params.id]);

  if (!caseData) return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-black text-slate-400">الحالة غير موجودة</h2>
        <Link href="/clinician/dashboard" className="mt-6 inline-block text-cyan-400 hover:underline">
          ← العودة للوحة الأخصائي
        </Link>
      </div>
    </main>
  );

  const scores = Object.entries(caseData.domainScores).filter(([, v]) => v > 0);
  const avgScore = scores.length
    ? Math.round(scores.reduce((s, [, v]) => s + v, 0) / scores.length)
    : 0;

  const snapshots = [...(caseData.snapshots || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const saveNote = () => {
    const updated = { ...caseData, notes: note, lastUpdated: new Date().toISOString() };
    saveCase(updated);
    setCaseData(updated);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const generateAI = async () => {
    setAiLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: caseData.childName,
          childResults: scores.map(([id, score]) => ({ id, score })),
          parentStats: [],
          studentProfile: {
            name: caseData.childName,
            age: caseData.childAge,
            grade: caseData.childGrade,
            gender: caseData.gender,
          },
          sessions: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في الذكاء الاصطناعي');
      const summary = data.diagnosisSummary || 'تم توليد التقييم بنجاح.';
      setAiSummary(summary);
      // Save AI summary to latest snapshot
      const updated: ClinicalCase = {
        ...caseData,
        snapshots: caseData.snapshots.map((s, i) =>
          i === caseData.snapshots.length - 1
            ? { ...s, aiSummary: summary }
            : s
        ),
      };
      saveCase(updated);
      setCaseData(updated);
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/clinician/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-mono">
          ← لوحة الأخصائي
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black italic text-white mb-2">{caseData.childName}</h1>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {caseData.childAge && <span className="bg-white/5 px-3 py-1 rounded-full">{caseData.childAge} سنة</span>}
              {caseData.childGrade && <span className="bg-white/5 px-3 py-1 rounded-full">{caseData.childGrade}</span>}
              <span className="bg-white/5 px-3 py-1 rounded-full">
                {caseData.gender === 'male' ? '👦 ذكر' : caseData.gender === 'female' ? '👧 أنثى' : '—'}
              </span>
              <span className="bg-white/5 px-3 py-1 rounded-full">
                منذ {new Date(caseData.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
          <div className={`px-5 py-3 rounded-2xl border text-lg font-black ${RISK_COLORS[caseData.overallRisk]}`}>
            {RISK_ICON[caseData.overallRisk]} {RISK_LABELS[caseData.overallRisk]}
          </div>
        </div>

        {/* Overall score stat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'المعدل العام', val: `${avgScore}%`, color: 'text-cyan-400' },
            { label: 'المجالات المُقيَّمة', val: scores.length, color: 'text-indigo-400' },
            { label: 'الجلسات المسجلة', val: caseData.snapshots.length, color: 'text-violet-400' },
            { label: 'آخر تحديث', val: new Date(caseData.lastUpdated).toLocaleDateString('ar-SA'), color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-center">
              <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
              <div className="text-slate-500 text-xs mt-1 font-mono">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ AI GENERATION BUTTON ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/40 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h2 className="text-2xl font-black italic text-white mb-1">
                🧠 التوليد السري بالذكاء الاصطناعي
              </h2>
              <p className="text-slate-400 text-sm">توليد تقرير سريري كامل لهذه الحالة بناءً على جميع النتائج</p>
            </div>
            <button
              onClick={generateAI}
              disabled={aiLoading || scores.length === 0}
              className={`px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] ${
                aiLoading ? 'bg-indigo-800 animate-pulse cursor-wait' :
                'bg-indigo-600 hover:bg-indigo-500 hover:scale-105'
              } disabled:opacity-40`}
            >
              {aiLoading ? '⏳ جاري التحليل...' : '🚀 توليد التقرير الآن'}
            </button>
          </div>
          {apiError && <p className="text-rose-400 text-sm mt-4">⚠️ {apiError}</p>}

          <AnimatePresence>
            {aiSummary && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 bg-slate-950/80 rounded-2xl p-6 border border-indigo-500/20">
                <div className="text-indigo-400 font-mono text-xs mb-3 uppercase tracking-widest">AI · Clinical Summary</div>
                <p className="text-slate-200 leading-relaxed">{aiSummary}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Domain scores */}
        <section className="mb-10">
          <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
            <span className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">📊</span>
            نتائج المجالات
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scores.map(([id, val]) => (
              <div key={id} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <div className="text-2xl mb-2">{domainIcons[id] || '🔬'}</div>
                <div className="text-xs text-slate-400 font-mono mb-1">{id}</div>
                <div className={`text-2xl font-black ${
                  val >= 75 ? 'text-emerald-400' : val >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>{val}%</div>
                <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }}
                    className={`h-full rounded-full ${
                      val >= 75 ? 'bg-emerald-500' : val >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Progress across sessions */}
        {snapshots.length > 1 && (
          <section className="mb-10">
            <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
              <span className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">📈</span>
              مقارنة الجلسات عبر الزمن
            </h2>
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="text-slate-500 font-mono text-xs">
                    <th className="pb-4">الجلسة</th>
                    <th className="pb-4">التاريخ</th>
                    <th className="pb-4">المعدل</th>
                    <th className="pb-4">التغيير</th>
                    <th className="pb-4">ملخص AI</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s, i) => {
                    const sc = Object.values(s.domainScores).filter(v => v > 0);
                    const avg = sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : 0;
                    const prev = i > 0 ? (() => {
                      const ps = Object.values(snapshots[i - 1].domainScores).filter(v => v > 0);
                      return ps.length ? Math.round(ps.reduce((a, b) => a + b, 0) / ps.length) : 0;
                    })() : null;
                    const diff = prev !== null ? avg - prev : null;
                    return (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-3 font-mono text-slate-300">#{i + 1}</td>
                        <td className="py-3 text-slate-400">{new Date(s.date).toLocaleDateString('ar-SA')}</td>
                        <td className={`py-3 font-black ${avg >= 75 ? 'text-emerald-400' : avg >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {avg}%
                        </td>
                        <td className="py-3">
                          {diff !== null && (
                            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                              diff > 0 ? 'bg-emerald-500/10 text-emerald-400' :
                              diff < 0 ? 'bg-rose-500/10 text-rose-400' :
                              'bg-slate-800 text-slate-500'
                            }`}>
                              {diff > 0 ? '+' : ''}{diff}%
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-slate-500 text-xs max-w-[200px] truncate">
                          {s.aiSummary ? s.aiSummary.slice(0, 60) + '…' : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Assessment completeness */}
        <section className="mb-10">
          <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
            <span className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">✅</span>
            اكتمال التقييم
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'تقييم الأهل', done: caseData.parentAssessmentDone, href: '/diagnose/parent-hub', icon: '👨‍👩‍👧' },
              { label: 'تقييم المعلم', done: caseData.teacherAssessmentDone, href: '/diagnose/teacher-form', icon: '🏫' },
              { label: 'التاريخ التطوري', done: caseData.devHistoryDone, href: '/diagnose/profile/developmental-history', icon: '👶' },
            ].map(item => (
              <div key={item.label} className={`rounded-2xl p-5 border text-center ${
                item.done ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/50 border-white/5'
              }`}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className={`font-black text-sm mb-3 ${item.done ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {item.done ? '✅ مكتمل' : '⬜ لم يُكمل'}
                </div>
                <div className="text-xs text-slate-500 mb-3">{item.label}</div>
                {!item.done && (
                  <Link href={item.href}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-full text-slate-300 transition-all">
                    أضف الآن ←
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Clinical Notes */}
        <section className="mb-10">
          <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
            <span className="w-9 h-9 bg-amber-600 rounded-xl flex items-center justify-center">📝</span>
            ملاحظات الأخصائي
          </h2>
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={5}
              placeholder="أضف ملاحظاتك السريرية هنا..."
              className="w-full bg-transparent text-white text-sm leading-relaxed resize-none outline-none placeholder:text-slate-600"
            />
            <div className="flex justify-end mt-4">
              <button onClick={saveNote}
                className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${
                  noteSaved
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                }`}>
                {noteSaved ? '✅ تم الحفظ' : 'حفظ الملاحظات'}
              </button>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/diagnose/results"
            className="flex-1 text-center bg-cyan-600 hover:bg-cyan-500 px-6 py-4 rounded-2xl font-black text-sm transition-all">
            📊 إعادة الفحص الكامل
          </Link>
          <Link href="/clinician/dashboard"
            className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-4 rounded-2xl font-black text-sm text-slate-300 transition-all">
            ← العودة للوحة الأخصائي
          </Link>
        </div>
      </div>
    </main>
  );
}
