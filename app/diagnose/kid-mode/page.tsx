'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { buildLearningPassport } from '@/lib/studentProfile';

// ── Badge definitions ─────────────────────────────────────────────────────────
const BADGES = [
  { id: 'star1',   icon: '⭐', label: 'نجمة أولى',       unlocked: (avg: number) => avg >= 30,  color: '#f59e0b' },
  { id: 'star2',   icon: '🌟', label: 'نجمة التركيز',    unlocked: (avg: number) => avg >= 50,  color: '#f59e0b' },
  { id: 'star3',   icon: '💫', label: 'نجمة الذكاء',     unlocked: (avg: number) => avg >= 70,  color: '#6366f1' },
  { id: 'rocket',  icon: '🚀', label: 'بطل الفضاء',      unlocked: (avg: number) => avg >= 85,  color: '#06b6d4' },
  { id: 'crown',   icon: '👑', label: 'ملك المختبرات',   unlocked: (avg: number) => avg >= 95,  color: '#f59e0b' },
];

const DOMAIN_KID: Record<string, { name: string; icon: string; color: string }> = {
  math:      { name: 'الأرقام', icon: '🔢', color: '#3b82f6' },
  visual:    { name: 'البصريات', icon: '👁️', color: '#ec4899' },
  attention: { name: 'التركيز', icon: '🎯', color: '#f59e0b' },
  memory:    { name: 'الذاكرة', icon: '🧠', color: '#8b5cf6' },
  motor:     { name: 'الحركة', icon: '✍️', color: '#10b981' },
  language:  { name: 'اللغة', icon: '📖', color: '#f43f5e' },
  auditory:  { name: 'السمع', icon: '👂', color: '#06b6d4' },
  executive: { name: 'التخطيط', icon: '⚙️', color: '#6366f1' },
  cognitive: { name: 'الذكاء', icon: '💡', color: '#f59e0b' },
  writing:   { name: 'الكتابة', icon: '🖋️', color: '#10b981' },
};

const MOTIVATIONAL_MESSAGES = [
  { min: 0,  max: 40,  msg: 'أنت بطل في التدريب! كل بطل يبدأ من الصفر 💪', emoji: '🌱' },
  { min: 40, max: 65,  msg: 'رائع! كل يوم أفضل من أمس 🌟', emoji: '📈' },
  { min: 65, max: 80,  msg: 'ممتاز! أنت تتقدم بسرعة كبيرة 🚀', emoji: '⚡' },
  { min: 80, max: 101, msg: 'بطل حقيقي! استمر هكذا! 🏆', emoji: '👑' },
];

// Star rating (1-5) from score
function getStars(score: number) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex justify-center gap-1 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xl ${i <= count ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'text-slate-700'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function KidMode() {
  const [passport, setPassport] = useState<any>(null);
  const [name, setName] = useState('البطل');
  const [avgScore, setAvgScore] = useState(0);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const p = buildLearningPassport();
    setPassport(p);
    if (p.studentProfile?.name) setName(p.studentProfile.name);
    const allScores = Object.values(p.progressByCategory as Record<string, number[]>).flat();
    const avg = allScores.length
      ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
      : 0;
    setAvgScore(avg);
    if (avg >= 70) {
      setTimeout(() => setConfetti(true), 500);
      setTimeout(() => setConfetti(false), 4000);
    }
  }, []);

  const earnedBadges = BADGES.filter(b => b.unlocked(avgScore));
  const motivational = MOTIVATIONAL_MESSAGES.find(m => avgScore >= m.min && avgScore < m.max)
    || MOTIVATIONAL_MESSAGES[0];

  const domains = Object.entries(passport?.progressByCategory || {})
    .map(([key, scores]: [string, any]) => ({
      key,
      score: scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0,
      ...DOMAIN_KID[key],
    }))
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-[#020617] to-violet-950 text-white overflow-hidden" dir="rtl">

      {/* Confetti particles */}
      <AnimatePresence>
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div key={i}
                initial={{ y: -20, x: `${Math.random() * 100}vw`, opacity: 1, scale: Math.random() * 1.5 + 0.5 }}
                animate={{ y: '110vh', opacity: 0 }}
                transition={{ duration: Math.random() * 2 + 1.5, delay: Math.random() * 0.5 }}
                className="absolute text-3xl">
                {['🌟', '⭐', '🎉', '✨', '🎊', '💫'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10">
          <div className="text-8xl mb-4 animate-bounce">🦸</div>
          <h1 className="text-5xl font-black italic mb-2">
            مرحباً <span className="text-cyan-400">{name}!</span>
          </h1>
          <p className="text-slate-400 text-lg">شاهد إنجازاتك وبطولاتك هنا 🚀</p>
        </motion.div>

        {/* Overall score — big & playful */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border-2 border-cyan-500/40 rounded-[3rem] p-8 mb-8 text-center shadow-[0_0_60px_rgba(6,182,212,0.2)]">
          <div className="text-[0.6rem] font-mono tracking-widest text-cyan-400 mb-3 uppercase">
            نقاط البطولة الكلية
          </div>
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
            className={`text-8xl font-black mb-2 ${
              avgScore >= 75 ? 'text-emerald-400' :
              avgScore >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
            {avgScore}%
          </motion.div>
          <div className="text-4xl mb-3">{motivational.emoji}</div>
          <p className="text-white text-xl font-bold leading-relaxed">{motivational.msg}</p>
        </motion.div>

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8">
            <h2 className="text-2xl font-black italic text-center mb-6">
              🏆 أوسمتك الشرفية
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {BADGES.map((b, i) => {
                const earned = b.unlocked(avgScore);
                return (
                  <motion.div key={b.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: earned ? 1 : 0.7, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    className={`flex flex-col items-center gap-2 rounded-3xl p-5 border-2 transition-all ${
                      earned
                        ? 'border-amber-400/60 bg-amber-400/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                        : 'border-white/5 bg-white/2 opacity-30 grayscale'
                    }`}>
                    <span className={`text-5xl ${earned ? 'drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]' : ''}`}>
                      {b.icon}
                    </span>
                    <span className={`text-xs font-black ${earned ? 'text-amber-400' : 'text-slate-600'}`}>
                      {b.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Domain stars */}
        {domains.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8">
            <h2 className="text-2xl font-black italic text-center mb-6">
              ✨ مهاراتك وقدراتك
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {domains.map((d, i) => (
                <motion.div key={d.key}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="rounded-[2.5rem] p-6 text-center border-2 transition-all"
                  style={{
                    borderColor: `${d.color}40`,
                    backgroundColor: `${d.color}10`,
                    boxShadow: `0 0 20px ${d.color}10`,
                  }}>
                  <div className="text-4xl mb-2">{d.icon}</div>
                  <div className="font-black text-white text-base mb-1">{d.name}</div>
                  <div className="text-2xl font-black mb-1" style={{ color: d.color }}>
                    {d.score}%
                  </div>
                  <StarRow count={getStars(d.score)} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty state */}
        {domains.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-slate-400 text-lg font-black">ابدأ المختبرات لتظهر نجومك!</p>
          </div>
        )}

        {/* Next challenge CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 space-y-4">
          <Link href="/diagnose"
            className="block w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 px-8 py-6 rounded-[2.5rem] font-black text-2xl transition-all hover:scale-105 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
            🎮 ابدأ مغامرة جديدة!
          </Link>
          <div className="flex gap-3">
            <Link href="/diagnose/passport"
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-2xl font-black text-sm transition-all text-center">
              🎫 جوازي
            </Link>
            <Link href="/diagnose/results"
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-2xl font-black text-sm transition-all text-center">
              📊 تقريري
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
