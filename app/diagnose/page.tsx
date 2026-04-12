'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkBackground from '../components/layout/NetworkBackground';
import DailyDrillView from '../components/features/DailyDrillView';
import HeroMap from '../components/layout/HeroMap';
import { useLanguage } from '../components/LanguageContext';
import { useSound } from '@/hooks/useSound';
import OnboardingTour from '../components/features/OnboardingTour';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/ui/GlassCard';
import AnimatedWrapper from '../components/ui/AnimatedWrapper';
import AliCharacter from '../components/ui/AliCharacter';
import { 
  getStudentProfile, 
  getAllTestSessions, 
  StudentProfile, 
  TestSession,
} from '@/lib/studentProfile';
import { getDailyMissions, checkMissionProgress, claimMissionReward, DailyMission } from '@/lib/missions';

const LABS = [
  { id: 'math',      title: 'المنطق الرقمي',    icon: '🔢', tag: 'MATH',      color: 'indigo' as const },
  { id: 'visual',    title: 'البصر المكاني',     icon: '👁️', tag: 'VISUAL',    color: 'cyan' as const },
  { id: 'attention', title: 'التركيز العميق',    icon: '🎯', tag: 'ATTENTION', color: 'rose' as const },
  { id: 'social',    title: 'الذكاء الاجتماعي',   icon: '🎭', tag: 'SOCIAL',    color: 'amber' as const },
  { id: 'reading',   title: 'المهارات القرائية', icon: '📖', tag: 'READING',   color: 'emerald' as const },
  { id: 'motor',     title: 'التآزر الحركي',     icon: '🏃‍♂️', tag: 'MOTOR',     color: 'rose' as const },
  { id: 'language',  title: 'البناء اللغوي',     icon: '💬', tag: 'LANGUAGE',  color: 'indigo' as const },
  { id: 'auditory',  title: 'الرصد السمعي',      icon: '👂', tag: 'AUDITORY',  color: 'cyan' as const },
  { id: 'executive', title: 'الوظائف العليا',    icon: '⚙️', tag: 'EXECUTIVE', color: 'rose' as const },
  { id: 'cognitive', title: 'الإدراك العام',     icon: '🧠', tag: 'COGNITIVE', color: 'amber' as const },
  { id: 'writing',   title: 'التعبير الكتابي',   icon: '🖋️', tag: 'WRITING',   color: 'cyan' as const },
  { id: 'rapid-naming', title: 'تسمية الألوان (RAN)', icon: '⚡', tag: 'DYSLEXIA', color: 'rose' as const },
  { id: 'learning_dis/alchemy', title: 'خيمياء الحروف', icon: '🔮', tag: 'DYSLEXIA', color: 'emerald' as const },
  { id: 'social/social-recognition', title: 'تمييز المشاعر', icon: '🤖', tag: 'SOCIAL', color: 'amber' as const },
  { id: 'social/empathy-scenarios', title: 'مواقف التعاطف', icon: '🤝', tag: 'SOCIAL', color: 'amber' as const },
];

const FULL_DIAGNOSTICS_LABS = [
  { id: 'adhd',          title: 'اضطراب ADHD',  icon: '⚡', tag: 'CLINICAL', color: 'rose' as const },
  { id: 'attention',     title: 'مشاكل الانتباه', icon: '🎯', tag: 'CLINICAL', color: 'rose' as const },
  { id: 'auditory/auditory-memory', title: 'مشاكل الذاكرة', icon: '🧠', tag: 'CLINICAL', color: 'rose' as const },
  { id: 'visual',        title: 'مشاكل الإدراك', icon: '👁️', tag: 'CLINICAL', color: 'rose' as const },
  { id: 'language',      title: 'اضطراب اللغة', icon: '🗣️', tag: 'CLINICAL', color: 'rose' as const },
  { id: 'memory-test/digit-backward', title: 'الذاكرة المعكوسة', icon: '🔢', tag: 'WISC-V', color: 'rose' as const },
  { id: 'memory-test/digit-forward', title: 'الذاكرة الأمامية', icon: '➡️', tag: 'WISC-V', color: 'rose' as const },
];

const SUPERVISOR_TOOLS = [
  { id: '/clinician/dashboard', title: 'مركز الأخصائي', icon: '🏢', tag: 'ADMIN', color: 'indigo' as const, isExternal: true },
  { id: '/diagnose/teacher-form', title: 'استبيان المعلم', icon: '🏫', tag: 'SOCIAL', color: 'emerald' as const, isExternal: true },
  { id: '/diagnose/profile/developmental-history', title: 'التاريخ التطوري', icon: '👶', tag: 'CLINICAL', color: 'indigo' as const, isExternal: true },
  { id: '/diagnose/start', title: 'دليل الأهل', icon: '🗺️', tag: 'GUIDE', color: 'cyan' as const, isExternal: true },
  { id: '/diagnose/progress', title: 'لوحة التقدم', icon: '📈', tag: 'ANALYTICS', color: 'indigo' as const, isExternal: true },
  { id: '/diagnose/kid-mode', title: 'وضع الطفل', icon: '🦸', tag: 'KID', color: 'amber' as const, isExternal: true },
];

const PRELIMINARY_LABS = [
  { id: 'autism',      title: 'طيف التوحد',   icon: '🧩', tag: 'MARKER',   color: 'amber' as const },
  { id: 'social_comm', title: 'تواصل اجتماعي', icon: '🤝', tag: 'MARKER',   color: 'amber' as const },
  { id: 'anxiety',     title: 'اضطراب القلق', icon: '😟', tag: 'MARKER',   color: 'amber' as const },
];

export default function LabsDashboard() {
  const { t, language, dir } = useLanguage();
  const { play } = useSound();
  const [profileName, setProfileName] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [showDailyDrill, setShowDailyDrill] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [labProgress, setLabProgress] = useState<Record<string, number>>({});
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [allSessions, setAllSessions] = useState<TestSession[]>([]);

  useEffect(() => {
    const p = getStudentProfile();
    setStudentProfile(p);
    if (p?.name) setProfileName(p.name);

    const sessions = getAllTestSessions();
    setAllSessions(sessions);
    const prog: Record<string, number> = {};
    sessions.forEach(s => {
      const cat = s.testCategory;
      prog[cat] = Math.max(prog[cat] || 0, s.rawScore);
      prog[s.testId] = Math.max(prog[s.testId] || 0, s.rawScore);
    });
    setLabProgress(prog);
    setMissions(getDailyMissions());
  }, []);

  const handleClaimReward = (m: DailyMission) => {
    if (claimMissionReward(m)) {
      setStudentProfile(getStudentProfile());
      setMissions([...getDailyMissions()]);
      play('success');
    }
  };

  const renderLabGrid = (labs: any[], sectorKey: string) => (
    <div className="mb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h3 className="text-xl font-black italic text-slate-400 uppercase tracking-[0.2em]">
          {t(sectorKey as any)}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {labs.map((lab, i) => (
           <Link 
             key={lab.id} 
             href={`/diagnose/${lab.id}`} 
             className="no-underline" 
             onClick={() => play('click')}
           >
              <GlassCard 
                variant="playful" 
                color={lab.color} 
                className="h-full flex flex-col justify-center p-8 group !border-white/5 hover:!border-inherit"
                delay={i * 0.05}
              >
                 <div className="flex flex-col items-center gap-4 text-center">
                    <span className="text-5xl group-hover:scale-125 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{lab.icon}</span>
                    <span className="font-black italic text-sm text-white group-hover:text-cyan-400 transition-colors">{t(`cat_${lab.id}` as any)}</span>
                    <span className="text-[0.6rem] font-mono opacity-30 uppercase tracking-widest">{lab.tag}</span>
                    {labProgress[lab.id] > 0 && (
                       <div className="mt-2 bg-emerald-500/10 text-emerald-400 text-[0.6rem] font-black px-3 py-1 rounded-full border border-emerald-500/20 italic">
                          {labProgress[lab.id]}%
                       </div>
                    )}
                 </div>
              </GlassCard>
           </Link>
        ))}
      </div>
    </div>
  );

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      dir={dir}
      style={{ 
        fontFamily: language === 'ar' ? 'var(--font-arabic)' : 'var(--font-sans)', 
        color: 'var(--text-primary)' 
      }}
    >
      {/* <NetworkBackground /> */}
      <OnboardingTour />
      <div className="fixed inset-0 grid-bg opacity-30 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-32 pt-12">
        <AnimatedWrapper variant="playful" stagger={0.1}>
          {/* Top Bar Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-10">
            <Link href="/diagnose/profile" className="no-underline">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 py-2 px-6 rounded-full flex items-center gap-3 transition-colors hover:border-cyan-500/30">
                <span className="text-xl">{profileName ? '✅' : '👤'}</span>
                <span className="text-xs font-black italic text-cyan-400">
                  {profileName ? `${t('hero')}: ${profileName}` : t('add_profile')}
                </span>
              </div>
            </Link>
            
            <Link href="/diagnose/shop" className="no-underline">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 py-2 px-6 rounded-full flex items-center gap-3 transition-colors hover:border-amber-500/30">
                <span className="text-xl">💰</span>
                <span className="text-xs font-black italic text-amber-400">
                  {t('reward_shop')}: {studentProfile?.coins || 0}
                </span>
              </div>
            </Link>
            
            <Link href="/diagnose/case-study" className="no-underline">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 py-2 px-6 rounded-full flex items-center gap-3 transition-colors hover:border-indigo-500/30">
                <span className="text-xl">📋</span>
                <span className="text-xs font-black italic text-indigo-400">{t('clinical_case')}</span>
              </div>
            </Link>

            <Link href="/diagnose/report-pro" className="no-underline">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 py-2 px-6 rounded-full flex items-center gap-3 transition-colors hover:border-emerald-500/30">
                <span className="text-xl">🧾</span>
                <span className="text-xs font-black italic text-emerald-400">{t('reports')}</span>
              </div>
            </Link>

            <Link href="/clinician/dashboard" className="no-underline">
              <div className="bg-slate-950/80 backdrop-blur-xl border border-violet-500/30 py-2 px-6 rounded-full flex items-center gap-3 transition-all hover:bg-violet-500/20 hover:border-violet-500 group shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                <span className="text-xl group-hover:scale-110 transition-transform">🏢</span>
                <span className="text-xs font-black italic text-violet-400">{t('clinician_hub')}</span>
              </div>
            </Link>
          </div>

          {/* Hero Labs Title */}
          <header className="text-center mb-16">
            <h1 className="text-[clamp(3rem,8vw,5.5rem)] font-black italic tracking-tighter mb-4">
              {language === 'ar' ? 'مختبرات' : 'BASIRA'} {' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                {language === 'ar' ? 'بَصيرة' : 'LABS'}
              </span>
            </h1>
            <p className="text-xl text-slate-400 italic font-medium">{t('labs_subtitle')}</p>
          </header>

          {/* Daily Missions */}
          <GlassCard variant="playful" color="indigo" className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="scale-75 -ml-8 -mr-4">
                   <AliCharacter 
                     name={profileName || undefined} 
                     state={missions.every(m => checkMissionProgress(m, allSessions).current >= m.requiredCount) ? 'success' : 'idle'} 
                     variant="compact" 
                   />
                </div>
                <div>
                  <span className="text-[0.6rem] font-mono tracking-[0.4em] text-cyan-400 block mb-2">PROTOCOL: daily_synergy_v3</span>
                  <h2 className="text-3xl font-black text-white italic">{t('daily_missions')} 📋</h2>
                </div>
              </div>
              <div className="flex gap-4">
                 <Link href="/diagnose/progress">
                   <NeonButton size="sm" color="cyan">
                    {t('progress_chart')} 📈
                   </NeonButton>
                 </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {missions.map(m => {
                const { current, total, isClaimed } = checkMissionProgress(m, allSessions);
                const isDone = current >= total;
                return (
                  <div key={m.id} className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 flex flex-col h-full hover:border-cyan-500/30 transition-all duration-500 group">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{m.icon}</span>
                      <span className={`text-[0.6rem] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                        {isDone ? t('status_completed') : t('status_in_progress')}
                      </span>
                    </div>
                    <h4 className="text-white font-black text-sm mb-1 italic">{t(m.titleKey)}</h4>
                    <p className="text-slate-500 text-[0.65rem] mb-6 leading-relaxed flex-1">{t(m.descKey)}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between text-[0.6rem] font-mono text-slate-600 mb-2">
                        <span>{current}/{total}</span>
                        <span>{Math.round((current/total)*100)}%</span>
                      </div>
                      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(current/total)*100}%` }} className={`h-full ${isDone ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-cyan-500'}`} />
                      </div>
                      
                      <div className="mt-6">
                        {isDone && !isClaimed ? (
                          <NeonButton size="sm" color="emerald" className="w-full" onClick={() => handleClaimReward(m)}>
                             {t('claim_reward')} ({m.rewardCoins} 💰)
                          </NeonButton>
                        ) : !isDone ? (
                          <Link href={m.path || '#'} onClick={() => play('click')} className="no-underline">
                            <div className="w-full bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 py-3 rounded-2xl text-[0.65rem] font-black transition-all border border-cyan-500/20 flex items-center justify-center gap-2 italic">
                              {t('play_mission')}
                            </div>
                          </Link>
                        ) : (
                           <div className="text-center py-2 text-[0.65rem] font-black text-emerald-400 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 italic">
                             ✨ {t('missions_claimed')}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* View Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-900/60 p-2 rounded-[2rem] border border-white/5 flex gap-2 backdrop-blur-xl">
              <button 
                onClick={() => { setViewMode('grid'); play('click'); }}
                className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white text-black shadow-2xl' : 'text-slate-500 hover:text-white'}`}
              >
                {t('grid_view')} 📱
              </button>
              <button 
                onClick={() => { setViewMode('map'); play('click'); }}
                className={`px-8 py-3 rounded-[1.5rem] font-black text-sm transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-white'}`}
              >
                {t('hero_map')} 🗺️
              </button>
            </div>
          </div>

          {/* Labs Grid / Map */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div 
                key="grid" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              >
                {renderLabGrid(LABS, 'sector_interactive')}
                {renderLabGrid(FULL_DIAGNOSTICS_LABS, 'sector_clinical')}
                {renderLabGrid(PRELIMINARY_LABS, 'sector_preliminary')}

                {/* Supervisor Hub Section */}
                <div className="mt-24 mb-10 relative">
                   <div className="absolute inset-0 bg-violet-600/5 blur-[100px] -z-10" />
                   <div className="flex items-center gap-4 mb-10">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                      <h3 className="text-2xl font-black italic text-violet-400 uppercase tracking-[0.2em] flex items-center gap-3">
                         <span>🛠️</span> {t('supervisor_tools')}
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {SUPERVISOR_TOOLS.map((tool, i) => (
                         <Link key={tool.id} href={tool.id} onClick={() => play('click')} className="no-underline">
                            <GlassCard variant="playful" color={tool.color} className="p-8 border-violet-500/20 hover:border-violet-500/50 transition-all group">
                               <div className="flex items-center gap-6">
                                  <span className="text-5xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                                  <div className="text-right">
                                     <h4 className="text-white font-black text-lg italic mb-1">{t(tool.id.includes('dashboard') ? 'clinician_hub' : tool.id.includes('teacher') ? 'teacher_form_short' : 'dev_history_short')}</h4>
                                     <span className="text-[0.6rem] font-mono text-violet-400/60 uppercase tracking-widest">{tool.tag}</span>
                                  </div>
                               </div>
                            </GlassCard>
                         </Link>
                      ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="map" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}>
                 <HeroMap labs={LABS as any} progress={labProgress} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily Drill Modal */}
          <AnimatePresence>
            {showDailyDrill && <DailyDrillView onClose={() => setShowDailyDrill(false)} />}
          </AnimatePresence>
        </AnimatedWrapper>
      </div>
    </main>
  );
}