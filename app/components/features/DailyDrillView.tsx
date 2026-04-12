'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../LanguageContext';
import { useSound } from '@/hooks/useSound';
import { 
  getStudentProfile, 
  buildLearningPassport, 
  StudentProfile, 
  LearningPassport,
  getAllTestSessions
} from '@/lib/studentProfile';
import { getDailyMissions, checkMissionProgress, DailyMission } from '@/lib/missions';
import BasirRobot from './BasirRobot';
import Link from 'next/link';
import GlassCard from '../ui/GlassCard';
import NeonButton from '../ui/NeonButton';

export default function DailyDrillView({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { play } = useSound();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const p = getStudentProfile();
    const sessions = getAllTestSessions();
    const dailyMissions = getDailyMissions();
    
    if (p) setProfile(p);
    setMissions(dailyMissions);

    // Show modal if mission not completed today
    const lastSeen = localStorage.getItem('basira_drill_last_seen');
    const today = new Date().toDateString();
    if (lastSeen !== today && p) {
      setTimeout(() => {
        setShowModal(true);
        try { play('success'); } catch(e) { play('click'); }
      }, 1500);
      localStorage.setItem('basira_drill_last_seen', today);
    }
  }, [play]);

  if (!profile || missions.length === 0) return null;

  const sessions = getAllTestSessions();
  const activeMission = missions.find(m => {
    const { isClaimed, current, total } = checkMissionProgress(m, sessions);
    return !isClaimed && current < total;
  }) || missions[0];

  const { current, total } = checkMissionProgress(activeMission, sessions);

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/60">
            <GlassCard 
              variant="playful" 
              color="cyan" 
              className="w-full max-w-2xl shadow-[0_0_100px_rgba(6,182,212,0.2)]"
            >
              <div className="text-center relative">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl text-slate-500 hover:text-white transition-all border border-white/5"
                >
                  ✕
                </button>

                <div className="mb-10">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block p-6 bg-cyan-500/10 rounded-[2rem] mb-6 border border-cyan-500/20 shadow-inner"
                  >
                    <span className="text-6xl">{activeMission.icon}</span>
                  </motion.div>
                  <h2 className="text-4xl font-black text-white italic mb-2 uppercase tracking-tight">
                    {t('daily_mission_title' as any)}
                  </h2>
                  <p className="text-cyan-400 font-mono text-[0.6rem] tracking-[0.4em] uppercase opacity-70">
                    Neural Operational Objective
                  </p>
                </div>

                <div className="bg-black/30 rounded-[2.5rem] p-10 border border-white/5 mb-10 text-right" dir="rtl">
                  <h3 className="text-2xl font-black text-white mb-3 italic">{t(activeMission.titleKey)}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8 font-medium italic">
                    {t(activeMission.descKey)}
                  </p>
                  
                  <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-[2rem] border border-white/5">
                    <div className="flex items-center gap-4">
                       <span className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">💎</span>
                       <div>
                         <p className="text-[0.6rem] text-amber-500 font-black uppercase tracking-widest">{t('reward' as any)}</p>
                         <p className="text-white font-black text-lg">+{activeMission.rewardCoins} 🪙</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[0.6rem] text-cyan-500 font-black uppercase tracking-widest mb-1">{t('progress' as any) || 'التطور'}</p>
                       <p className="text-white font-black text-lg font-mono">{current} / {total}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <NeonButton 
                    variant="playful" 
                    color="indigo" 
                    className="flex-1" 
                    onClick={() => {
                        setShowModal(false);
                        if (onClose) onClose();
                    }}
                  >
                    {t('later' as any)}
                  </NeonButton>
                  
                  <NeonButton 
                    variant="playful" 
                    color="cyan" 
                    className="flex-1 text-xl" 
                    onClick={() => {
                        setShowModal(false);
                        if (onClose) onClose();
                        router.push(activeMission.path);
                    }}
                  >
                    <span>{t('start_mission' as any)}</span>
                    <span className="text-2xl">🚀</span>
                  </NeonButton>
                </div>
              </div>

              {/* Bouncy Progress Bar bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(current/total)*100}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                  className="h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,1)]"
                />
              </div>
            </GlassCard>

            <BasirRobot 
              mood="happy" 
              message={`تحياتي يا ${profile.name}! هل أنت مستعد لمهام اليوم؟ 🤖✨`} 
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
