'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllTestSessions, getStudentProfile, TestSession } from '@/lib/studentProfile';
import ClinicalReport from '@/app/components/ClinicalReport';
import { useLanguage } from '@/app/components/LanguageContext';
import { useSound } from '@/hooks/useSound';
import GlassCard from '@/app/components/ui/GlassCard';
import NeonButton from '@/app/components/ui/NeonButton';
import AnimatedWrapper from '@/app/components/ui/AnimatedWrapper';

interface AIPill {
  category: string;
  title: string;
  desc: string;
  icon: string;
  link: string;
  color: string;
}

export default function ParentDashboard() {
  const { t, language, dir } = useLanguage();
  const { play } = useSound();
  
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [studentName, setStudentName] = useState(t('hero'));
  const [weakAreas, setWeakAreas] = useState<{ category: string, score: number, title: string }[]>([]);
  const [progressData, setProgressData] = useState<{ date: string, avgScore: number }[]>([]);
  const [emotionalStats, setEmotionalStats] = useState({ frustration: 0, impulsivity: 0, focusLoss: 0 });
  const [parentStats, setParentStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // AI Generated Pills State
  const [aiPills, setAIPills] = useState<AIPill[]>([]);
  const [aiEncouragement, setAiEncouragement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const prof = getStudentProfile();
    setProfile(prof);
    if (prof?.name) setStudentName(prof.name);
    else {
      const savedName = localStorage.getItem('studentName');
      if (savedName) setStudentName(savedName);
    }

    const savedParent = localStorage.getItem('parentAssessment');
    if (savedParent) {
      try { setParentStats(JSON.parse(savedParent)); } catch(e) {}
    }

    // Load previously generated AI Pills if available to save API calls
    const savedPills = localStorage.getItem('basira_ai_pills');
    if (savedPills) {
        try {
            const parsed = JSON.parse(savedPills);
            setAIPills(parsed.pills || []);
            setAiEncouragement(parsed.encouragement || '');
        } catch(e) {}
    }

    const allSessions = getAllTestSessions();
    setSessions(allSessions);

    // 1. Process Progress Data
    const groupedByDate: Record<string, number[]> = {};
    allSessions.forEach(s => {
      const d = new Date(s.completedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
      if (!groupedByDate[d]) groupedByDate[d] = [];
      if (s.rawScore > 0) groupedByDate[d].push(s.rawScore);
    });

    const progress = Object.entries(groupedByDate).map(([date, scores]) => ({
      date,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    }));
    setProgressData(progress.slice(-7));

    // 2. Identify Weak Areas
    const latestScores: Record<string, { score: number, title: string }> = {};
    allSessions.forEach(s => {
      if (s.rawScore > 0) {
        latestScores[s.testCategory] = { score: s.rawScore, title: s.testTitle };
      }
    });

    const weak = Object.entries(latestScores)
      .map(([cat, data]) => ({ category: cat, score: data.score, title: data.title }))
      .filter(item => item.score < 75)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
    setWeakAreas(weak);

    // 3. Emotional Stats
    let fEvents = 0, iEvents = 0, flEvents = 0;
    allSessions.forEach(s => {
      fEvents += s.emotional?.frustrationEvents || 0;
      iEvents += s.emotional?.impulsivityEvents || 0;
      flEvents += (s.attention?.tabSwitchCount || 0) + (s.attention?.inactivityCount || 0);
    });
    setEmotionalStats({ frustration: fEvents, impulsivity: iEvents, focusLoss: flEvents });
  }, [language, t]);

  const generateAIPills = async () => {
    play('click');
    setIsGenerating(true);
    setApiError('');
    try {
      const response = await fetch('/api/generate-pills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weakAreas,
          parentStats,
          emotionalStats
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate');
      
      const pills = Array.isArray(data.pills) ? data.pills : [];
      setAIPills(pills);
      setAiEncouragement(data.encouragement || '');

      localStorage.setItem('basira_ai_pills', JSON.stringify({
          pills,
          encouragement: data.encouragement || ''
      }));

    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFallbackPillRecommendation = (category: string) => {
    const recommendations: Record<string, { title: string, desc: string, icon: string, link: string, color: string }> = {
      attention: { title: t('rec_attention_title'), desc: t('rec_attention_desc'), icon: '🎯', link: '/diagnose/attention', color: 'from-red-500 to-rose-600' },
      memory: { title: t('rec_memory_title'), desc: t('rec_memory_desc'), icon: '🧠', link: '/diagnose/memory-test', color: 'from-emerald-400 to-teal-500' },
      motor: { title: t('rec_motor_title'), desc: t('rec_motor_desc'), icon: '✍️', link: '/diagnose/motor', color: 'from-orange-400 to-amber-500' },
      visual: { title: t('rec_visual_title'), desc: t('rec_visual_desc'), icon: '👁️', link: '/diagnose/visual', color: 'from-purple-500 to-indigo-500' },
      auditory: { title: t('rec_auditory_title'), desc: t('rec_auditory_desc'), icon: '👂', link: '/diagnose/auditory', color: 'from-cyan-400 to-blue-500' },
      math: { title: t('rec_math_title'), desc: t('rec_math_desc'), icon: '🔢', link: '/diagnose/math', color: 'from-blue-500 to-indigo-600' },
      language: { title: t('rec_language_title'), desc: t('rec_language_desc'), icon: '📖', link: '/diagnose/language', color: 'from-pink-500 to-rose-500' },
      executive: { title: t('rec_executive_title'), desc: t('rec_executive_desc'), icon: '⚙️', link: '/diagnose/executive', color: 'from-fuchsia-500 to-purple-600' }
    };
    return recommendations[category] || { title: `${t('rec_generic_title')}: ${category}`, desc: t('rec_generic_desc'), icon: '🧩', link: '/diagnose', color: 'from-slate-500 to-slate-600' };
  };

  const currentPillsToRender = (aiPills?.length || 0) > 0 ? aiPills : weakAreas.map(w => getFallbackPillRecommendation(w.category));

  const safeOverallAvg = progressData.length > 0 
    ? Math.round(progressData.reduce((acc, curr) => acc + curr.avgScore, 0) / progressData.length)
    : 0;

  return (
    <main className="min-h-screen bg-[#020617] overflow-x-hidden relative text-white">
      
      {/* ── Dashboard View (Hidden on Print) ── */}
      <AnimatedWrapper variant="sleek">
        <div className="p-6 md:p-12 print:hidden relative z-10 max-w-7xl mx-auto">
          
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight italic">
                {language === 'ar' ? 'لوحة التحكم' : 'PARENT'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{language === 'ar' ? 'للأهل' : 'DASHBOARD'}</span> 📊
              </h1>
              <p className="text-slate-400 text-xl font-medium">{t('ai_clinician_subtitle')} <span className="text-white font-bold">{studentName}</span></p>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <NeonButton variant="sleek" onClick={() => { play('click'); window.print(); }}>
                  {t('export_pdf')} 📄
               </NeonButton>
               <Link href="/diagnose/results">
                 <NeonButton variant="playful" color="indigo">
                    {dir === 'rtl' ? '◀' : '▶'} {t('back_to_reports')}
                 </NeonButton>
               </Link>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            
            <GlassCard className="lg:col-span-2 p-8 md:p-10">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-transparent opacity-50" />
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <span className="text-3xl">📈</span> {t('progress_timeline')}
              </h2>
              {progressData.length > 0 ? (
                <div className="h-72 flex items-end justify-around gap-2 mt-12 px-2 md:px-8">
                  {progressData.map((d, i) => {
                    const isHigh = d.avgScore >= 80;
                    const isLow = d.avgScore < 50;
                    const barColor = isHigh ? 'from-emerald-600 to-emerald-400' : isLow ? 'from-rose-600 to-rose-400' : 'from-cyan-600 to-cyan-300';
                    
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 group">
                        <div className="text-white font-black mb-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">{d.avgScore}%</div>
                        <div className="w-full max-w-[4rem] bg-slate-950/80 rounded-t-2xl relative overflow-hidden flex items-end justify-center transition-all group-hover:bg-slate-900 border-t border-r border-l border-white/5" style={{ height: '100%' }}>
                          <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: `${Math.max(d.avgScore, 5)}%` }} 
                            transition={{ duration: 1.2, delay: i * 0.1, type: 'spring' }}
                            className={`w-full bg-gradient-to-t ${barColor} rounded-t-2xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.3)]`} 
                          />
                        </div>
                        <div className="text-xs md:text-sm text-slate-500 font-bold mt-6 whitespace-nowrap">{d.date}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 italic bg-black/20 rounded-3xl border border-dashed border-slate-700/50">
                  <span className="text-4xl mb-4">📉</span>
                  <p>{t('no_data_chart')}</p>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-8 md:p-10 flex flex-col justify-center">
               <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent opacity-50" />
              <h2 className="text-2xl font-black mb-8 text-rose-400 flex items-center gap-3">
                 <span className="text-3xl">🚨</span> {t('behavior_emotional')}
              </h2>
              <div className="space-y-6">
                {[
                  { label: t('focus_loss'), value: emotionalStats.focusLoss, icon: '👀', color: 'text-white' },
                  { label: t('impulsivity'), value: emotionalStats.impulsivity, icon: '⚡', color: 'text-amber-400' },
                  { label: t('frustration'), value: emotionalStats.frustration, icon: '😤', color: 'text-rose-400' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between hover:bg-slate-900 transition-colors">
                    <div>
                      <div className="text-sm text-slate-400 font-bold mb-2">{stat.label}</div>
                      <div className={`text-3xl font-black ${stat.color}`}>{stat.value} <span className="text-sm font-bold text-slate-600">{t('events')}</span></div>
                    </div>
                    <div className="text-5xl drop-shadow-lg">{stat.icon}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* SECTION 2.5: Diagnostic Profile (Special Markers) */}
          {(profile?.preliminaryDiagnosis?.autismSpectrum || 
            profile?.preliminaryDiagnosis?.socialCommunication || 
            profile?.preliminaryDiagnosis?.anxietyDisorder || 
            profile?.preliminaryDiagnosis?.specialDisabilityNotes) && (
            <GlassCard className="mb-16 p-8 md:p-12">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500/50" />
              <h2 className="text-3xl font-black mb-8 flex items-center gap-4">
                 <span className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl border border-indigo-500/30">🩺</span>
                 {t('diagnostic_markers')}
              </h2>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {profile?.preliminaryDiagnosis?.autismSpectrum && (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 px-6 py-4 rounded-3xl flex items-center gap-3">
                    <span className="text-3xl">🧩</span>
                    <span className="font-black text-indigo-300">{t('autism_marker')}</span>
                  </div>
                )}
                {profile?.preliminaryDiagnosis?.socialCommunication && (
                  <div className="bg-blue-500/10 border border-blue-500/30 px-6 py-4 rounded-3xl flex items-center gap-3">
                    <span className="text-3xl">🗣️</span>
                    <span className="font-black text-blue-300">{t('social_comm_marker')}</span>
                  </div>
                )}
                {profile?.preliminaryDiagnosis?.anxietyDisorder && (
                  <div className="bg-amber-500/10 border border-amber-500/30 px-6 py-4 rounded-3xl flex items-center gap-3">
                    <span className="text-3xl">😟</span>
                    <span className="font-black text-amber-300">{t('anxiety_marker')}</span>
                  </div>
                )}
              </div>

              {profile?.preliminaryDiagnosis?.specialDisabilityNotes && (
                <div className="bg-slate-950/60 border border-slate-700/50 p-6 rounded-[2.5rem]">
                  <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">{t('special_notes')}</h4>
                  <p className="text-slate-200 text-lg italic leading-relaxed">
                    "{profile.preliminaryDiagnosis.specialDisabilityNotes}"
                  </p>
                </div>
              )}
            </GlassCard>
          )}

          {/* SECTION 3: AI Intervention Plan (Cognitive Pills) */}
          <GlassCard className="p-8 md:p-12 mb-20">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12 border-b border-indigo-500/20 pb-8">
               <div className="flex-1">
                 <div className="flex items-center gap-4 mb-4">
                   <span className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl border border-indigo-500/30">💊</span>
                   <h2 className="text-3xl md:text-4xl font-black">
                     {t('ai_intervention')}
                   </h2>
                 </div>
                 <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
                   {t('ai_intervention_desc')}
                 </p>
                 {aiEncouragement && (
                   <div className="mt-4 text-emerald-400 font-medium bg-emerald-900/20 p-4 rounded-2xl border border-emerald-500/20 inline-block">
                     ✨ {aiEncouragement}
                   </div>
                 )}
               </div>
               
               <div className="flex items-center gap-4 shrink-0">
                 <NeonButton 
                    onClick={generateAIPills}
                    disabled={isGenerating}
                    variant="sleek"
                 >
                   {isGenerating ? (
                     <><span className="animate-spin text-2xl mr-2">⏳</span> {t('generating')}</>
                   ) : (
                     <>{t('update_ai')} 🧠</>
                   )}
                 </NeonButton>
               </div>
            </div>

            {apiError && (
               <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-6 rounded-2xl mb-8">
                 AI Error: {apiError}
               </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {currentPillsToRender.length > 0 ? currentPillsToRender.map((rec: any, i: number) => (
                <GlassCard 
                  key={i} 
                  className="p-8 flex flex-col"
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${rec.color || 'from-indigo-500 to-purple-600'} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <span className="text-6xl drop-shadow-xl">{rec.icon}</span>
                    <span className="bg-slate-900 text-slate-300 px-4 py-2 rounded-full text-[10px] uppercase font-mono font-bold border border-white/10 tracking-wider">
                      {t(rec.category as any) || rec.category} {aiPills.length > 0 && <span className="text-indigo-400 ml-1">🤖 AI</span>}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 relative z-10">{rec.title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-loose mb-10 min-h-[140px] relative z-10">
                    {rec.desc}
                  </p>
                  
                  <Link href={rec.link} className="mt-auto block">
                    <NeonButton className="w-full" variant="sleek">
                      {t('start_dose')} 💊
                    </NeonButton>
                  </Link>
                </GlassCard>
              )) : (
                <div className="col-span-3 bg-gradient-to-br from-emerald-900/40 to-black/40 border border-emerald-500/30 rounded-[3rem] p-16 text-center shadow-2xl">
                  <span className="text-7xl mb-6 block drop-shadow-lg">🏆</span>
                  <h3 className="text-3xl font-black text-emerald-400 mb-4">{t('peak_performance')}</h3>
                  <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
                     {t('peak_performance_desc')}
                  </p>
                  <Link href="/diagnose" className="inline-block mt-8">
                    <NeonButton variant="playful" color="emerald">
                       {t('labs')} 🔬
                    </NeonButton>
                  </Link>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </AnimatedWrapper>

      {/* ── Clinical Print Layout (Visible only on Print) ── */}
      <div className="hidden print:block bg-white text-black min-h-screen">
          <ClinicalReport 
             studentName={studentName}
             age={profile?.age?.toString()}
             grade={profile?.grade}
             date={new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
             overallAvg={safeOverallAvg}
             weakAreas={weakAreas}
             emotionalStats={emotionalStats}
             aiPills={currentPillsToRender}
             progressData={progressData}
          />
      </div>

    </main>
  );
}
