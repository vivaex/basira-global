'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getAllTestSessions, TestSession, DOMAIN_MAPPING, getStudentProfile } from '@/lib/studentProfile';

// ── Radar Chart (pure SVG — no external library) ─────────────────────────────

const AXES = [
  { key: 'literacy',  label: 'القراءة',   angle: -90 },
  { key: 'cognition', label: 'الإدراك',   angle: -30 },
  { key: 'social',    label: 'التواصل',   angle: 30  },
  { key: 'motor',     label: 'الحركة',    angle: 90  },
  { key: 'attention', label: 'الانتباه',  angle: 150 },
  { key: 'memory',    label: 'الذاكرة',   angle: 210 },
];

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function RadarChart({ data }: { data: Record<string, number> }) {
  const cx = 160, cy = 160, maxR = 120;
  const rings = [0.25, 0.5, 0.75, 1];

  const points = AXES.map(ax => {
    const val = (data[ax.key] ?? 0) / 100;
    return polarToXY(cx, cy, maxR * val, ax.angle);
  });

  const polyStr = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto">
      {/* Rings */}
      {rings.map((r, i) => (
        <polygon key={i}
          points={AXES.map(ax => {
            const p = polarToXY(cx, cy, maxR * r, ax.angle);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Axes */}
      {AXES.map((ax, i) => {
        const end = polarToXY(cx, cy, maxR, ax.angle);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}

      {/* Filled area */}
      <polygon points={polyStr}
        fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="2"
        strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4"
          fill="#06b6d4" stroke="#020617" strokeWidth="2" />
      ))}

      {/* Labels */}
      {AXES.map((ax, i) => {
        const lp = polarToXY(cx, cy, maxR + 22, ax.angle);
        return (
          <text key={i} x={lp.x} y={lp.y + 4}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="rgba(148,163,184,0.9)" fontWeight="700">
            {ax.label}
          </text>
        );
      })}

      {/* Center ring label */}
      {rings.map((r, i) => {
        const p = polarToXY(cx, cy, maxR * r, -30);
        return (
          <text key={`label-${i}`} x={p.x + 2} y={p.y} fontSize="7"
            fill="rgba(100,116,139,0.6)">{Math.round(r * 100)}%</text>
        );
      })}
    </svg>
  );
}

// ── Timeline entry ────────────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, { name: string; icon: string }> = {
  literacy: { name: 'القراءة والكتابة', icon: '📖' },
  cognition: { name: 'الإدراك المعرفي', icon: '💡' },
  social: { name: 'التواصل الاجتماعي', icon: '🤝' },
  motor: { name: 'التآزر الحركي', icon: '✍️' },
  attention: { name: 'الانتباه', icon: '🎯' },
  memory: { name: 'الذاكرة', icon: '🧠' },
};

const DOMAIN_COLORS: Record<string, string> = {
  literacy: '#10b981', cognition: '#3b82f6', social: '#ec4899',
  motor: '#f43f5e', attention: '#f59e0b', memory: '#8b5cf6',
};

function getMappedDomain(session: TestSession): string {
  return DOMAIN_MAPPING[session.testId] || DOMAIN_MAPPING[session.testCategory] || 'cognition';
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [domainData, setDomainData] = useState<Record<string, number>>({});
  const [timeline, setTimeline] = useState<{ date: string; sessions: TestSession[] }[]>([]);
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] = useState<'radar' | 'timeline' | 'compare'>('radar');
  const [aiTip, setAiTip] = useState('');
  const profile = typeof window !== 'undefined' ? getStudentProfile() : null;

  useEffect(() => {
    const all = getAllTestSessions().sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    setSessions(all);

    // Domain averages
    const domainMap: Record<string, number[]> = {};
    all.forEach(s => {
      const d = getMappedDomain(s);
      if (!domainMap[d]) domainMap[d] = [];
      domainMap[d].push(s.rawScore);
    });
    const domainAvg: Record<string, number> = {};
    for (const [k, v] of Object.entries(domainMap)) {
      domainAvg[k] = Math.round(v.reduce((a, b) => a + b, 0) / v.length);
    }
    setDomainData(domainAvg);

    // Group by date
    const byDate: Record<string, TestSession[]> = {};
    all.forEach(s => {
      const date = s.completedAt.split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(s);
    });
    setTimeline(Object.entries(byDate).reverse().map(([date, ss]) => ({ date, sessions: ss })));

    // Streak: count consecutive unique days backwards from today
    const dates = Array.from(new Set(all.map(s => s.completedAt.split('T')[0]))).sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (dates[i] === expected.toISOString().split('T')[0]) streak++;
      else break;
    }
    setStreak(streak);

    // Dynamic AI tip based on worst domain
    const sorted = Object.entries(domainAvg).sort((a, b) => a[1] - b[1]);
    const weakest = sorted[0];
    if (weakest) {
      const tips: Record<string, string> = {
        literacy: 'ركز هذا الأسبوع على ألعاب الوعي الصوتي والكلمات المتقطعة.',
        cognition: 'جرب ألعاب المنطق البصري والتسلسلات الرقمية يومياً لمدة 10 دقائق.',
        attention: 'قسّم جلسات العمل لـ 10 دقائق مع استراحة قصيرة بينها.',
        memory: 'العب ألعاب الذاكرة البصرية والأرقام المعكوسة 3 مرات أسبوعياً.',
        motor: 'تمرينات الخط الإيقاعي ومسك القلم الصحيح يومياً.',
        social: 'اجعل نشاطاً اجتماعياً تفاعلياً يومياً مع الأقران.',
      };
      setAiTip(tips[weakest[0]] || 'واصل التدريب لجمع بيانات أكثر.');
    } else {
      setAiTip('ابدأ بإكمال عدة مختبرات لتفعيل التوصيات الذكية.');
    }
  }, []);

  const totalSessions = sessions.length;
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((s, x) => s + x.rawScore, 0) / sessions.length)
    : 0;
  const bestDomain = Object.entries(domainData).sort((a, b) => b[1] - a[1])[0];
  const worstDomain = Object.entries(domainData).sort((a, b) => a[1] - b[1])[0];

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cyan-600/4 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-600/4 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-6 mb-10">
          <div>
            <div className="text-[0.6rem] font-mono tracking-[0.4em] text-cyan-400 mb-2 uppercase">
              Basira · Progress Intelligence Dashboard
            </div>
            <h1 className="text-4xl font-black italic text-white mb-1">
              لوحة <span className="text-cyan-400">التقدم والتحليل</span> 📈
            </h1>
            <p className="text-slate-400 text-sm">
              {profile?.name ? `تتبع أداء ${profile.name} عبر الزمن مقارنةً بالمعايير السريرية.` : 'تتبع الأداء عبر الجلسات مقارنةً بالمعايير السريرية.'}
            </p>
          </div>
          <Link href="/diagnose"
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl text-sm font-black transition-all">
            ← المختبرات
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'إجمالي الجلسات', val: totalSessions, icon: '🧪', color: 'text-cyan-400' },
            { label: 'المعدل العام', val: `${avgScore}%`, icon: '📊', color: avgScore >= 75 ? 'text-emerald-400' : avgScore >= 50 ? 'text-amber-400' : 'text-rose-400' },
            { label: 'أيام متواصلة', val: streak, icon: '🔥', color: 'text-orange-400' },
            { label: 'أضعف مجال', val: worstDomain ? (DOMAIN_LABELS[worstDomain[0]]?.name || worstDomain[0]) : '—', icon: '⚠️', color: 'text-rose-400', small: true },
          ].map(card => (
            <div key={card.label} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className={`text-2xl font-black ${card.color} ${(card as any).small ? 'text-base' : ''}`}>
                {card.val}
              </div>
              <div className="text-slate-500 text-xs font-mono mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* AI Smart Tip */}
        {aiTip && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-900/30 border border-indigo-500/30 rounded-[2rem] p-7 mb-10 flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🤖</div>
            <div>
              <div className="text-indigo-300 font-black text-sm mb-1">توصية المحرك الذكي</div>
              <p className="text-slate-300 leading-relaxed">{aiTip}</p>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-900/40 border border-white/5 p-1.5 rounded-2xl w-fit">
          {[
            { id: 'radar', label: '🕸️ Radar الشامل' },
            { id: 'timeline', label: '📅 التسلسل الزمني' },
            { id: 'compare', label: '📊 مقارنة المجالات' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* ── RADAR TAB ── */}
          {activeTab === 'radar' && (
            <motion.div key="radar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8 items-center">
              <div className="bg-slate-900/60 border border-white/5 rounded-[3rem] p-8">
                {Object.keys(domainData).length > 0 ? (
                  <RadarChart data={domainData} />
                ) : (
                  <div className="text-center py-16 text-slate-600">
                    <div className="text-4xl mb-4">🔬</div>
                    <p className="font-mono text-sm">أكمل مختبرات لعرض الرادار</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black italic mb-6">ملخص المجالات</h2>
                {Object.entries(domainData).sort((a, b) => b[1] - a[1]).map(([domain, score]) => (
                  <div key={domain} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{DOMAIN_LABELS[domain]?.icon || '🔬'}</span>
                        <span className="font-black text-sm">{DOMAIN_LABELS[domain]?.name || domain}</span>
                      </div>
                      <span className={`text-lg font-black ${
                        score >= 75 ? 'text-emerald-400' :
                        score >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>{score}%</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: DOMAIN_COLORS[domain] || '#06b6d4' }} />
                    </div>
                    <div className="flex justify-between text-xs font-mono text-slate-600 mt-1">
                      <span>{score >= 75 ? 'أداء طبيعي' : score >= 50 ? 'يحتاج متابعة' : 'يستلزم تدخلاً'}</span>
                      <span>WNL: ≥75%</span>
                    </div>
                  </div>
                ))}
                {Object.keys(domainData).length === 0 && (
                  <p className="text-slate-600 text-sm italic text-center py-8">لا توجد بيانات بعد. ابدأ مختبراً!</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TIMELINE TAB ── */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}>
              {timeline.length === 0 ? (
                <div className="text-center py-20 text-slate-600">
                  <div className="text-5xl mb-4">📅</div>
                  <p className="font-mono">لا توجد جلسات محفوظة بعد.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute right-[1.75rem] top-0 bottom-0 w-0.5 bg-white/5" />

                  <div className="space-y-6">
                    {timeline.map((day, di) => (
                      <motion.div key={day.date}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: di * 0.05 }}
                        className="relative flex items-start gap-6">
                        {/* Date dot */}
                        <div className="flex-shrink-0 w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-xs font-mono text-slate-400 text-center leading-tight shadow-xl z-10">
                          {new Date(day.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                        </div>
                        {/* Sessions for this day */}
                        <div className="flex-1 space-y-2">
                          {day.sessions.map((s, si) => {
                            const domain = getMappedDomain(s);
                            const color = DOMAIN_COLORS[domain] || '#06b6d4';
                            return (
                              <div key={si} className="bg-slate-900/60 border border-white/5 rounded-2xl px-5 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span>{DOMAIN_LABELS[domain]?.icon || '🔬'}</span>
                                  <div>
                                    <div className="font-black text-sm text-white">{s.testTitle}</div>
                                    <div className="text-xs text-slate-500 font-mono">
                                      {DOMAIN_LABELS[domain]?.name} · {new Date(s.completedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-black" style={{ color }}>{s.rawScore}%</div>
                                  <div className={`text-xs font-mono ${
                                    s.rawScore >= 75 ? 'text-emerald-400' :
                                    s.rawScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                                  }`}>
                                    {s.rawScore >= 75 ? 'WNL ✓' : s.rawScore >= 50 ? 'متابعة' : 'تدخل'}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── COMPARE TAB ── */}
          {activeTab === 'compare' && (
            <motion.div key="compare" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}>
              {Object.keys(domainData).length === 0 ? (
                <div className="text-center py-20 text-slate-600">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="font-mono">أكمل مختبرات لعرض المقارنة.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <h2 className="text-2xl font-black italic">مقارنة المجالات بالمعايير السريرية</h2>

                  {/* Bar chart visual */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8">
                    <div className="grid gap-6">
                      {Object.entries(domainData).sort((a, b) => b[1] - a[1]).map(([domain, score]) => {
                        const color = DOMAIN_COLORS[domain] || '#06b6d4';
                        // Clinical benchmarks for each domain
                        const benchmarks: Record<string, { normal: number; concern: number }> = {
                          literacy:  { normal: 75, concern: 50 },
                          cognition: { normal: 70, concern: 50 },
                          attention: { normal: 75, concern: 55 },
                          memory:    { normal: 70, concern: 50 },
                          motor:     { normal: 80, concern: 60 },
                          social:    { normal: 75, concern: 55 },
                        };
                        const bm = benchmarks[domain] || { normal: 75, concern: 50 };
                        return (
                          <div key={domain}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{DOMAIN_LABELS[domain]?.icon || '🔬'}</span>
                                <span className="font-black text-sm">{DOMAIN_LABELS[domain]?.name || domain}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs font-mono">
                                <span className="text-slate-600">المعيار: {bm.normal}%</span>
                                <span className={`font-black text-base ${
                                  score >= bm.normal ? 'text-emerald-400' :
                                  score >= bm.concern ? 'text-amber-400' : 'text-rose-400'
                                }`}>{score}%</span>
                              </div>
                            </div>
                            <div className="relative h-5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                              {/* Normal zone */}
                              <div className="absolute inset-y-0 bg-emerald-500/5"
                                style={{ left: `${bm.normal}%`, right: 0 }} />
                              {/* Concern zone */}
                              <div className="absolute inset-y-0 bg-amber-500/5"
                                style={{ left: `${bm.concern}%`, right: `${100 - bm.normal}%` }} />
                              {/* Score bar */}
                              <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="absolute inset-y-0 rounded-full"
                                style={{ backgroundColor: color, opacity: 0.8 }} />
                              {/* Benchmark marker */}
                              <div className="absolute inset-y-0 w-0.5 bg-white/20"
                                style={{ left: `${bm.normal}%` }} />
                            </div>
                            <div className="flex gap-4 mt-1 text-xs font-mono text-slate-600">
                              <span>🔴 تدخل: &lt;{bm.concern}%</span>
                              <span>🟡 متابعة: {bm.concern}–{bm.normal}%</span>
                              <span>🟢 طبيعي: ≥{bm.normal}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Session trend per domain (last 5 sessions each) */}
                  {Object.entries(domainData).length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.keys(domainData).map(domain => {
                        const domainSessions = sessions.filter(s => getMappedDomain(s) === domain);
                        if (domainSessions.length < 2) return null;
                        const last5 = domainSessions.slice(-5);
                        const first = last5[0].rawScore;
                        const last = last5[last5.length - 1].rawScore;
                        const trend = last - first;
                        return (
                          <div key={domain} className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <span>{DOMAIN_LABELS[domain]?.icon || '🔬'}</span>
                                <span className="font-black text-sm">{DOMAIN_LABELS[domain]?.name}</span>
                              </div>
                              <span className={`text-sm font-black ${
                                trend > 0 ? 'text-emerald-400' :
                                trend === 0 ? 'text-slate-400' : 'text-rose-400'
                              }`}>
                                {trend > 0 ? `↑ +${trend}%` : trend < 0 ? `↓ ${trend}%` : '→ ثابت'}
                              </span>
                            </div>
                            {/* Mini sparkline */}
                            <svg viewBox={`0 0 ${last5.length * 40} 60`} className="w-full h-12">
                              <polyline
                                points={last5.map((s, i) => `${i * 40 + 20},${60 - (s.rawScore / 100) * 50}`).join(' ')}
                                fill="none" stroke={DOMAIN_COLORS[domain] || '#06b6d4'}
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              {last5.map((s, i) => (
                                <circle key={i}
                                  cx={i * 40 + 20} cy={60 - (s.rawScore / 100) * 50}
                                  r="3" fill={DOMAIN_COLORS[domain] || '#06b6d4'} />
                              ))}
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer CTAs */}
        <div className="flex flex-wrap gap-4 mt-12">
          <Link href="/diagnose/results"
            className="flex-1 text-center bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl font-black transition-all hover:scale-105">
            🧠 توليد التقرير الكامل بالذكاء الاصطناعي
          </Link>
          <Link href="/diagnose"
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-black text-slate-300 text-sm transition-all">
            + إضافة جلسة جديدة
          </Link>
        </div>

      </div>
    </main>
  );
}
