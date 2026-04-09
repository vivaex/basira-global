'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// import NetworkBackground from './components/layout/NetworkBackground';
import HeroMap from './components/layout/HeroMap';
import DailyDrillView from './components/features/DailyDrillView';
import OnboardingTour from './components/features/OnboardingTour';
import NeonButton from './components/ui/NeonButton';
import GlassCard from './components/ui/GlassCard';
import AnimatedWrapper from './components/ui/AnimatedWrapper';
import ThreeExperience from './components/visuals/ThreeExperience';
import AmbientBackground from './components/visuals/AmbientBackground';

const SECTIONS = [
  {
    id: 'who',
    title: 'مَن هي بَصيرة؟',
    icon: '🛡️',
    tag: 'MISSION',
    color: 'cyan' as const,
    content: 'نحن المركز الرقمي السيادي الأول من نوعه، انطلقنا برؤية وطنية لسد الفجوة بين التشخيص الميداني والحلول الرقمية. بَصيرة منظومة متكاملة صممت لتمكين الأطفال عبر تكنولوجيا رصينة ومحمية بالكامل.',
  },
  {
    id: 'what',
    title: 'ماذا نفعل للأبطال؟',
    icon: '⚡',
    tag: 'SOLUTIONS',
    color: 'indigo' as const,
    content: 'نقوم بتحويل رحلة التشخيص إلى تجربة ملهمة عبر مختبراتنا العشرة. نمنح كل طفل "الجواز التعليمي الرقمي الموحد" الذي يوثق تطوره ويرافقه في كل مراحل حياته الدراسية.',
  },
  {
    id: 'why',
    title: 'لماذا يختارنا الأهل؟',
    icon: '💎',
    tag: 'TRUST',
    color: 'rose' as const,
    content: 'دقة تصل لـ 70% في التنبؤ بالصعوبات، استخدام مستشعرات حيوية لتتبع استجابة الطفل اللحظية، وأمان سيادي يضمن تشفير كافة بيانات طفلك بخصوصية تامة لا يملك مفتاحها إلا أنت.',
  },
];

const STATS = [
  { value: '10', unit: '+', label: 'مختبر تشخيصي' },
  { value: '70', unit: '%', label: 'دقة التنبؤ' },
  { value: '100', unit: '%', label: 'أمان سيادي' },
  { value: '1', unit: 'st', label: 'الأول من نوعه' },
];

export default function HomePage() {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeSection = SECTIONS.find(s => s.id === active);

  return (
    <main
      className="min-h-screen overflow-x-hidden relative"
      dir="rtl"
      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-arabic)' }}
    >
      <ThreeExperience />
      <AmbientBackground />

      {/* Grid overlay - Handled by Cre8teraBackground now */}
      {/* <div className="fixed inset-0 z-0 grid-bg opacity-30" /> */}

      {/* Radial glow top - Handled by Cre8teraBackground now */}
      {/* <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse at center top, rgba(6,182,212,0.12) 0%, transparent 70%)',
        }}
      /> */}

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pb-32 pt-12">
        <AnimatedWrapper variant="sleek" stagger={0.15}>
          {/* ===== Hero ===== */}
          <header className="text-center mb-20">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[0.7rem] font-mono text-cyan-400 tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                SOVEREIGN AI PLATFORM · V7.0
              </span>
            </div>

            <h1 className="text-[clamp(3.5rem,10vw,6.5rem)] font-black leading-tight tracking-tight mb-6 italic">
              منظومة{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                بَصيرة
              </span>
            </h1>

            <p className="text-[clamp(1.1rem,2.5vw,1.4rem)] text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium italic">
              السيادة الرقمية في تشخیص وعلاج صعوبات التعلم بأدوات القرن الحادي والعشرين.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 px-6 py-4 rounded-3xl text-center min-w-[120px]">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-2xl font-black text-cyan-400 font-mono tracking-tighter">{stat.value}</span>
                    <span className="text-xs font-bold text-cyan-600 uppercase">{stat.unit}</span>
                  </div>
                  <div className="text-[0.65rem] text-slate-500 font-black mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </header>

          {/* ===== Info Sections ===== */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {SECTIONS.map((s) => (
              <GlassCard
                key={s.id}
                color={s.color}
                variant="sleek"
                className={`cursor-pointer transition-all duration-500 ${active === s.id ? 'ring-2 ring-offset-4 ring-offset-slate-950 ring-cyan-500/50' : ''}`}
              >
                <div onClick={() => setActive(active === s.id ? null : s.id)} className="flex flex-col items-center gap-6 text-center">
                  <span className="text-[0.6rem] font-mono tracking-[0.3em] text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                    {s.tag}
                  </span>
                  <span className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{s.icon}</span>
                  <h3 className="text-xl font-black italic text-white">{s.title}</h3>
                  <div className={`w-8 h-1 bg-cyan-500 transition-all duration-500 ${active === s.id ? 'w-16 opacity-100' : 'opacity-20'}`} />
                </div>
              </GlassCard>
            ))}
          </div>

          {/* ===== Expansion Panel ===== */}
          <div className="mb-20 min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeSection ? (
                <GlassCard
                  key={activeSection.id}
                  color={activeSection.color}
                  variant="sleek"
                  className="shadow-2xl"
                >
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-right">
                    <div className="text-7xl bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-inner">
                      {activeSection.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-mono text-cyan-400 tracking-[0.4em] mb-2 block">{activeSection.tag}</span>
                      <h2 className="text-4xl font-black italic text-white mb-6 underline decoration-cyan-500/30 decoration-4 underline-offset-8">
                        {activeSection.title}
                      </h2>
                      <p className="text-xl text-slate-300 leading-loose italic font-medium">
                        {activeSection.content}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-2 border-dashed border-white/5 rounded-[3rem] p-16 flex flex-col items-center justify-center gap-4 text-slate-600"
                >
                  <span className="text-4xl animate-bounce">👆</span>
                  <p className="text-lg font-bold italic">اضغط على أحد المحاور لاستكشاف التفاصيل السيادية</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {/* ===== CTAs ===== */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-20">
             <NeonButton 
               size="xl" 
               color="cyan" 
               onClick={() => router.push('/diagnose')}
               variant="sleek"
               className="min-w-[320px]"
             >
               <span>دخول المنظومة السيادية</span>
               <span className="text-2xl">🛡️</span>
             </NeonButton>

             <NeonButton 
               size="xl" 
               color="emerald" 
               onClick={() => router.push('/training')}
               variant="sleek"
               className="min-w-[320px]"
             >
               <span>صالة التدريب اليومي</span>
               <span className="text-2xl">🎮</span>
             </NeonButton>
          </div>

          <footer className="mt-32 text-center text-[0.6rem] font-mono tracking-[0.5em] text-slate-700 uppercase">
            Sovereignty // neural_basira_protocol // 2026
          </footer>
        </AnimatedWrapper>
      </div>
    </main>
  );
}