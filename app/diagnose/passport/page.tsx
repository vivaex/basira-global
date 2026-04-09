'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  buildLearningPassport,
  LearningPassport,
  SKILL_LEVEL_LABELS,
  DIFFICULTY_LEVEL_LABELS,
  getSkillLevelLabel,
  scoreToDifficultyLevel,
} from '@/lib/studentProfile';
import { useLanguage } from '@/app/components/LanguageContext';

// ────────────────────────────────────────────────
// Tiny Components
// ────────────────────────────────────────────────

function ProgressRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

const LEARNING_STYLE_ICONS: Record<string, string> = {
  visual: '👁️',
  auditory: '👂',
  kinesthetic: '🖐️',
  mixed: '🔀',
  unknown: '🔍',
};
const LEARNING_STYLE_LABELS: Record<string, string> = {
  visual: 'متعلم بصري',
  auditory: 'متعلم سمعي',
  kinesthetic: 'متعلم حركي',
  mixed: 'متعدد الأساليب',
  unknown: 'قيد الرصد',
};

// LAB_LABELS is used as a fallback if translation is missing
const LAB_LABELS: Record<string, { title: string; icon: string }> = {
  math:      { title: 'المنطق الرقمي',   icon: '🔢' },
  visual:    { title: 'البصر المكاني',   icon: '👁️' },
  attention: { title: 'التركيز',         icon: '🎯' },
  memory:    { title: 'الذاكرة',         icon: '🧠' },
  motor:     { title: 'التآزر الحركي',   icon: '✍️' },
  language:  { title: 'اللغة',           icon: '📖' },
  auditory:  { title: 'الرصد السمعي',    icon: '👂' },
  executive: { title: 'الوظائف العليا',  icon: '⚙️' },
  cognitive: { title: 'الإدراك',         icon: '💡' },
  writing:   { title: 'الكتابة',         icon: '🖋️' },
};

// ────────────────────────────────────────────────
// Main Passport Page
// ────────────────────────────────────────────────

export default function SovereignPassport() {
  const { t } = useLanguage();
  const [passport, setPassport] = useState<LearningPassport | null>(null);
  const [heroClass, setHeroClass] = useState('بطل صاعد');
  const [topSkill, setTopSkill] = useState('الذكاء العام');

  useEffect(() => {
    const p = buildLearningPassport();
    setPassport(p);

    // Determine hero class from best category
    const entries = Object.entries(p.progressByCategory)
      .map(([cat, scores]) => ({ 
        cat, 
        avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0 
      }))
      .sort((a, b) => b.avg - a.avg);

    if (entries.length > 0) {
      const top = entries[0];
      const lab = LAB_LABELS[top.cat];
      if (top.cat === 'visual')    { setHeroClass('بطل بصري سيادي');  setTopSkill('الإدراك المكاني'); }
      else if (top.cat === 'math') { setHeroClass('إستراتيجي منطقي');  setTopSkill('التحليل الرقمي'); }
      else if (top.cat === 'memory') { setHeroClass('حارس الذاكرة');   setTopSkill('الاستدعاء الفائق'); }
      else if (top.cat === 'language') { setHeroClass('فارس اللغة');   setTopSkill('البناء اللغوي'); }
      else if (top.cat === 'auditory') { setHeroClass('مستكشف سمعي'); setTopSkill('المعالجة الصوتية'); }
      else { setHeroClass('مستكشف سيادي'); setTopSkill(lab?.title ?? 'تعدد المواهب'); }
    }
  }, []);

  const name = passport?.studentProfile?.name ?? localStorage?.getItem?.('studentName') ?? 'البطل';
  const completedLabs = passport ? Object.keys(passport.progressByCategory).length : 0;
  // Overall average calculation
  const allScores = passport
    ? Object.values(passport.progressByCategory).flat()
    : [];
  const safeOverallAvg = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  const isValid = (n: any): n is number => typeof n === 'number' && !isNaN(n);

  // --- Badge Logic ---
  const badgeList = [
    { id: 'att', title: 'صقر الانتباه', icon: '🦅', desc: 'للحصول على 85% في التركيز', met: (passport?.progressByCategory?.attention?.[0] ?? 0) >= 85 },
    { id: 'mat', title: 'عبقري الأرقام', icon: '🔢', desc: 'للتفوق في المنطق الرياضي', met: (passport?.progressByCategory?.math?.[0] ?? 0) >= 85 },
    { id: 'mem', title: 'ذاكرة الفيل', icon: '🐘', desc: 'لتحقيق 85% في اختبار الذاكرة', met: (passport?.progressByCategory?.memory?.[0] ?? 0) >= 85 },
    { id: 'exp', title: 'المستكشف النشط', icon: '🧭', desc: 'لإكمال أكثر من 5 مختبرات', met: completedLabs >= 5 },
    { id: 'emo', title: 'بطل الثبات', icon: '🛡️', desc: 'لأداء هادئ بدون اندفاعية', met: passport?.sessions?.slice(-1)[0]?.emotional?.impulsivityEvents === 0 && (passport?.sessions?.length ?? 0) > 0 },
    { id: 'sov', title: 'الطفل السيادي', icon: '👑', desc: 'للمعدل العام المتفوق جداً', met: safeOverallAvg >= 90 },
  ];

  const earnedCount = badgeList.filter(b => b.met).length;

  return (
    <main className="min-h-screen bg-[#020617] text-white pb-20 px-4 pt-8 relative overflow-hidden" dir="rtl">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse at top, rgba(6,182,212,0.1), transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at bottom right, rgba(139,92,246,0.06), transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">
            الجواز <span className="text-cyan-400">التعليمي السيادي</span>
          </h1>
          <p className="text-slate-500 italic text-sm">
            البطاقة الرسمية المعتمدة من منظومة بَصيرة العالمية
          </p>
        </motion.header>

        {/* ── Passport Card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full group cursor-pointer mb-12"
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[2.5rem] border-2 border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden group-hover:border-cyan-500/50 transition-all duration-500 p-8 md:p-12">

            {/* Carbon fibre texture overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 10px)' }} />

            {/* Glow */}
            <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-cyan-500/5 rotate-45 blur-[100px]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

              {/* Left: Avatar + Name */}
              <div className="flex flex-col items-center gap-4 min-w-[160px]">
                <div className="relative">
                  <div className="w-32 h-32 bg-slate-800 rounded-3xl border-4 border-cyan-500/30 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    🤖
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-black font-black text-xs border-4 border-slate-900 shadow-xl">
                    V2
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-cyan-500 font-mono tracking-[0.4em] uppercase mb-1">CITIZEN_HERO</p>
                  <h3 className="text-2xl md:text-3xl font-black italic text-white">{name}</h3>
                  {passport?.studentProfile?.grade && (
                    <p className="text-slate-500 text-sm font-mono mt-1">{passport.studentProfile.grade}</p>
                  )}
                </div>
              </div>

              {/* Middle: Stats */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 rounded-2xl p-4 text-center border border-slate-700/40">
                  <div className="text-2xl font-black text-cyan-400">{completedLabs}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">مختبر مكتمل</div>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-4 text-center border border-slate-700/40">
                  <div className="text-2xl font-black text-emerald-400">{isValid(safeOverallAvg) ? safeOverallAvg : 0}%</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">المعدل العام</div>
                </div>
                <div className="bg-slate-800/60 rounded-2xl p-4 text-center border border-slate-700/40 col-span-2 md:col-span-1">
                  <div className="text-xl font-black text-violet-400">{LEARNING_STYLE_ICONS[passport?.learningStyleGuess ?? 'unknown']} {LEARNING_STYLE_LABELS[passport?.learningStyleGuess ?? 'unknown']}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">نمط التعلم</div>
                </div>
              </div>

              {/* Right: Hero Class + QR */}
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1">HERO_CLASS</p>
                  <p className="text-xl font-black text-cyan-400 italic">{heroClass}</p>
                  <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-3 mb-1">PRIMARY_SKILL</p>
                  <p className="text-lg font-bold text-white italic">{topSkill}</p>
                </div>

                {/* QR */}
                <div className="bg-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                  <div className="w-16 h-16 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Basira_Report_Verified')] bg-cover bg-center grayscale contrast-200" />
                </div>
              </div>
            </div>

            {/* Bottom stamp */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between opacity-30">
              <span className="text-[8px] font-mono tracking-[0.8em] uppercase text-slate-400">
                Basira_Sovereign_Protocol // 2026
              </span>
              <span className="text-[8px] font-mono text-slate-500">{new Date().toLocaleDateString('ar-SA')}</span>
            </div>

            {/* Holographic shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-[2.5rem] group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>
        </motion.div>

        {/* ── Badges & Achievements Section ── */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black italic flex items-center gap-3">
              <span className="text-4xl text-amber-400">🏆</span> لوحة الأوسمة الشرفية
            </h2>
            <div className="bg-slate-800/80 px-6 py-2 rounded-full border border-slate-700/50 text-amber-400 font-bold">
              مجموع الأوسمة: {earnedCount} / {badgeList.length}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {badgeList.map((badge, idx) => (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative group rounded-[2.5rem] p-6 text-center border-4 transition-all duration-500 ${
                  badge.met 
                    ? 'bg-slate-900 border-amber-500/50 shadow-[0_10px_40px_rgba(245,158,11,0.15)] scale-100' 
                    : 'bg-slate-950 border-slate-800 opacity-40 grayscale blur-[1px]'
                }`}
              >
                {badge.met && (
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }} 
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-amber-500 rounded-[2.5rem] blur-2xl z-0" 
                  />
                )}
                
                <div className="relative z-10">
                  <div className={`text-6xl mb-4 group-hover:scale-125 transition-transform duration-300 ${badge.met ? 'drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]' : ''}`}>
                    {badge.icon}
                  </div>
                  <h4 className={`text-sm font-black mb-1 ${badge.met ? 'text-amber-400' : 'text-slate-600'}`}>{badge.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">{badge.desc}</p>
                </div>

                {badge.met && (
                  <div className="absolute top-2 right-2 text-amber-500 text-xs">⭐</div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Progress by Category ── */}
        {passport && Object.keys(passport.progressByCategory).length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span> الأداء عبر المختبرات
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(passport.progressByCategory).map(([cat, scores]) => {
                const latestScore = scores[scores.length - 1] ?? 0;
                const lab = LAB_LABELS[cat];
                const skillLevel = getSkillLevelLabel(latestScore);
                const diffLevel  = scoreToDifficultyLevel(latestScore);
                return (
                  <div key={cat} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 text-center">
                    <div className="flex justify-center mb-2">
                      <div className="relative">
                        <ProgressRing score={latestScore} />
                        <span className="absolute inset-0 flex items-center justify-center text-2xl">
                          {lab?.icon ?? '🔬'}
                        </span>
                      </div>
                    </div>
                    <div className="font-black text-white text-lg">{isValid(latestScore) ? latestScore : 0}%</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{t(cat as any) || t(`cat_${cat}` as any) || lab?.title || cat}</div>
                    <div className={`text-[9px] mt-2 font-bold rounded-full px-2 py-0.5 inline-block ${
                      diffLevel === 'none'     ? 'bg-emerald-500/20 text-emerald-400' :
                      diffLevel === 'mild'     ? 'bg-amber-500/20 text-amber-400' :
                      diffLevel === 'moderate' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {DIFFICULTY_LEVEL_LABELS[diffLevel]}
                    </div>
                    {/* History sparkline */}
                    {scores.length > 1 && (
                      <div className="flex items-end gap-0.5 mt-3 h-6 justify-center">
                        {scores.slice(-5).map((s, i) => (
                          <div key={i}
                            style={{ height: `${Math.max(4, (s / 100) * 24)}px`, width: '6px' }}
                            className="bg-cyan-500/60 rounded-sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Learning Style + Motivators ── */}
        {passport && (
          <section className="mb-12 grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-7">
              <h3 className="text-lg font-black mb-4 text-cyan-400">
                {LEARNING_STYLE_ICONS[passport.learningStyleGuess]} نمط التعلم المرصود
              </h3>
              <div className="text-3xl font-black text-white mb-2">
                {LEARNING_STYLE_LABELS[passport.learningStyleGuess]}
              </div>
              <p className="text-slate-500 text-sm italic">
                {passport.learningStyleGuess === 'visual' && 'يستوعب المعلومات بشكل أفضل عبر الصور والمخططات والألوان.'}
                {passport.learningStyleGuess === 'auditory' && 'يتعلم أفضل عبر الاستماع والأصوات والموسيقى.'}
                {passport.learningStyleGuess === 'kinesthetic' && 'يحتاج للحركة والتطبيق المباشر للتعلم الفعّال.'}
                {passport.learningStyleGuess === 'mixed' && 'يستفيد من مزيج متوازن من أساليب التعلم المختلفة.'}
                {passport.learningStyleGuess === 'unknown' && 'يحتاج مزيدًا من الاختبارات لتحديد النمط الأمثل.'}
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-7">
              <h3 className="text-lg font-black mb-4 text-violet-400">⭐ محفزات الطالب المرصودة</h3>
              {passport.motivators.length > 0 ? (
                <ul className="space-y-2">
                  {passport.motivators.map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                      <span className="text-emerald-400">✓</span> {m}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600 italic text-sm">تحتاج مزيد من الجلسات لرصد المحفزات.</p>
              )}
            </div>
          </section>
        )}

        {/* ── Treatment Progress ── */}
        {passport && (
          <section className="mb-12">
            <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
              <span className="text-3xl">🗺️</span> خطة العلاج والتقدم
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Completed */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6">
                <h4 className="text-emerald-400 font-black mb-4 flex items-center gap-2">
                  <span>✅</span> تم إنجازه
                </h4>
                {passport.treatmentProgress.completedGoals.length > 0 ? (
                  <ul className="space-y-2">
                    {passport.treatmentProgress.completedGoals.map((g, i) => (
                      <li key={i} className="text-slate-300 text-sm bg-slate-900/50 rounded-xl p-2">{g}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 text-sm italic">لم يتم إنجاز أهداف بعد.</p>
                )}
              </div>

              {/* Current Focus */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6">
                <h4 className="text-amber-400 font-black mb-4 flex items-center gap-2">
                  <span>🎯</span> يحتاج التركيز
                </h4>
                {passport.treatmentProgress.currentFocus.length > 0 ? (
                  <ul className="space-y-2">
                    {passport.treatmentProgress.currentFocus.map((f, i) => (
                      <li key={i} className="text-slate-300 text-sm bg-slate-900/50 rounded-xl p-2">{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 text-sm italic">لا توجد مهام معلقة حاليًا.</p>
                )}
              </div>

              {/* Sessions history */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-3xl p-6">
                <h4 className="text-indigo-400 font-black mb-4 flex items-center gap-2">
                  <span>📅</span> آخر الجلسات
                </h4>
                {passport.sessions.length > 0 ? (
                  <ul className="space-y-2">
                    {passport.sessions.slice(-5).reverse().map((s: any, i: number) => (
                      <li key={i} className="text-slate-300 text-xs bg-slate-900/50 rounded-xl p-2 flex justify-between items-center">
                        <span>{s.testTitle}</span>
                        <span className="text-cyan-400 font-black">{s.rawScore}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 text-sm italic">لا توجد جلسات محفوظة بعد.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Profile Data shown on passport */}
        {passport?.studentProfile && (
          <section className="mb-12 bg-slate-800/30 border border-slate-700/40 rounded-3xl p-7">
            <h2 className="text-xl font-black mb-5 text-slate-300 flex items-center gap-2">
              <span>👤</span> بيانات الملف
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'الاسم',    val: passport.studentProfile.name },
                { label: 'العمر',    val: passport.studentProfile.age ? `${passport.studentProfile.age} سنة` : '—' },
                { label: 'الصف',     val: passport.studentProfile.grade || '—' },
                { label: 'اللغة',    val: passport.studentProfile.primaryLanguage },
              ].map(({ label, val }) => (
                <div key={label} className="bg-slate-900/50 rounded-2xl p-3 border border-slate-700/40">
                  <div className="text-[10px] text-slate-500 font-mono mb-1">{label}</div>
                  <div className="text-white font-bold">{val}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => window.print()}
            className="px-10 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-2xl active:scale-95">
            طباعة الجواز 📄
          </button>
          <Link href="/diagnose/results"
            className="px-10 py-5 bg-slate-900 text-white font-black text-xl rounded-2xl border border-white/10 hover:bg-slate-800 transition-all text-center">
            العودة للتقرير ◀
          </Link>
          <Link href="/diagnose"
            className="px-10 py-5 bg-slate-900 text-white font-black text-xl rounded-2xl border border-white/10 hover:bg-slate-800 transition-all text-center">
            المختبرات 🔬
          </Link>
        </div>

        <div className="mt-10 text-slate-700 font-mono text-[10px] uppercase tracking-widest italic animate-pulse text-center">
          Encrypted_Digital_Hero_ID // SECURED_BY_BASIRA_2026
        </div>
      </div>
    </main>
  );
}