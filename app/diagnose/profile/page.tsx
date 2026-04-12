'use client';

export const metadata = {
  title: 'الملف الشخصي | بَصيرة',
  description: 'قم بإعداد ملفك الشخصي لبدء رحلة التشخيص الذكي.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  StudentProfile,
  createEmptyProfile,
  saveStudentProfile,
  getAllProfiles,
  setCurrentProfileId,
  getStudentProfile,
  YesNoSometimes,
  AcademicLevel,
  getLevelFromXP,
} from '@/lib/studentProfile';
import { useLanguage } from '@/app/components/LanguageContext';
import { useSound } from '@/hooks/useSound';
import AliCharacter from '@/app/components/ui/AliCharacter';

// ────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────

const GRADES_AR = [
  'الروضة', 'الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي',
  'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي',
  'الأول المتوسط', 'الثاني المتوسط', 'الثالث المتوسط',
  'الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي',
];

const GRADES_EN = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6',
  'Middle 1', 'Middle 2', 'Middle 3',
  'High 1', 'High 2', 'High 3',
];

const SUBJECTS_AR = ['القراءة', 'الكتابة', 'الرياضيات', 'العلوم', 'اللغة الإنجليزية', 'التربية الإسلامية', 'الاجتماعيات'];
const SUBJECTS_EN = ['Reading', 'Writing', 'Math', 'Science', 'English', 'Religion', 'Social Studies'];

// ────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────

// Form components replaced by Stable components from @/app/components/ui/FormElements

// ────────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────────

export default function StudentProfilePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { play } = useSound();
  
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile>(createEmptyProfile());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const all = getAllProfiles();
    setProfiles(all);
    if (all.length === 0) {
      setIsEditing(true);
    }
  }, []);

  const STEP_TITLES = [
    { icon: '👤', label: t('personal_data'), tag: 'PERSONAL' },
    { icon: '🏥', label: t('health_data'), tag: 'HEALTH' },
    { icon: '📚', label: t('academic_data'), tag: 'ACADEMIC' },
    { icon: '🎯', label: t('behavioral_data'), tag: 'BEHAVIORAL' },
    { icon: '👨‍👩‍👧', label: t('family_data'), tag: 'FAMILY' },
    { icon: '🩺', label: t('preliminary_diagnosis'), tag: 'CLINICAL' },
  ];

  const update = (partial: Partial<StudentProfile>) =>
    setCurrentProfile(p => ({ ...p, ...partial }));

  const handleSave = () => {
    play('levelUp');
    saveStudentProfile(currentProfile);
    setSaved(true);
    setTimeout(() => {
      router.push('/diagnose');
    }, 1200);
  };

  const handleSelectProfile = (p: StudentProfile) => {
    play('click');
    setCurrentProfileId(p.id);
    router.push('/diagnose');
  };

  const handleEditProfile = (p: StudentProfile) => {
    play('click');
    setCurrentProfile(p);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    play('click');
    setCurrentProfile(createEmptyProfile());
    setIsEditing(true);
  };

  const canProceedStep0 = currentProfile.name.trim().length > 0;

  if (!isEditing && profiles.length > 0) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.12), transparent 70%)' }} />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl text-center z-10">
           <h1 className="text-4xl font-black mb-10 italic">
             {language === 'ar' ? 'اختر ' : 'CHOOSE '} 
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
               {language === 'ar' ? 'البطل' : 'HERO'}
             </span>
           </h1>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {profiles.map(p => {
                const { level } = getLevelFromXP(p.xp || 0);
                return (
                  <motion.div 
                    key={p.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900/60 border-2 border-slate-800 rounded-3xl p-6 flex flex-col items-center relative group cursor-pointer hover:border-indigo-500/50 transition-all"
                    onClick={() => handleSelectProfile(p)}
                  >
                     <div className="mb-6">
                        <AliCharacter name={p.name} state="idle" variant="compact" />
                     </div>
                     <h3 className="text-xl font-black">{p.name}</h3>
                     <div className="mt-2 flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-widest uppercase">LVL {level}</span>
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${(p.xp % 1000) / 10}%` }} />
                        </div>
                     </div>
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleEditProfile(p); }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                     >
                        ⚙️
                     </button>
                  </motion.div>
                );
              })}
              
              <button 
                onClick={handleCreateNew}
                className="bg-slate-950/40 border-2 border-dashed border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center hover:border-white/20 transition-all group"
              >
                 <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                    ➕
                 </div>
                 <span className="text-sm font-bold text-slate-500">{t('create_profile')}</span>
              </button>
           </div>
           
           <button onClick={() => router.push('/diagnose')} className="text-slate-500 text-sm italic hover:text-slate-300 underline underline-offset-4">
              {t('back_to_reports')}
           </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-start pb-20 px-4 pt-8">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.12), transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="inline-block text-[0.6rem] font-mono tracking-[0.25em] text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-3 py-1 rounded-full mb-3">
             {currentProfile.id ? 'UPDATE_HERO' : 'INITIALIZE_HERO'} // SECURED
          </span>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tight uppercase">
             {language === 'ar' ? 'ملف ' : 'HERO '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
               {language === 'ar' ? 'البطل' : 'PROFILE'}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 italic">
            {t('optional_data_tip')}
          </p>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-4 no-scrollbar">
          {STEP_TITLES.map((s, i) => (
            <button key={i} onClick={() => { play('click'); if (i < step || (i === step)) setStep(i); }} className="flex flex-col items-center gap-1 shrink-0 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                i === step ? 'bg-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.6)] scale-110' : i < step ? 'bg-indigo-500/40 text-indigo-300' : 'bg-slate-800 text-slate-600'
              }`}>
                {i < step ? '✓' : s.icon}
              </div>
              <span className={`text-[8px] font-mono tracking-wider uppercase ${i === step ? 'text-indigo-400' : 'text-slate-700'}`}>
                {s.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
          <motion.div animate={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }} transition={{ type: 'spring', stiffness: 200 }} className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" />
        </div>

        {/* Step Card */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
            className="bg-slate-900/70 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] p-7 md:p-10 shadow-2xl overflow-hidden relative"
          >
            <div className="flex items-center gap-6 mb-7">
              <div className="scale-75 -ml-4">
                <AliCharacter name={currentProfile.name} state={step === 5 ? 'focus' : 'idle'} variant="compact" />
              </div>
              <div>
                <p className="text-[0.6rem] font-mono tracking-widest text-indigo-400">{STEP_TITLES[step].tag}</p>
                <h2 className="text-xl font-black italic text-white leading-none">{STEP_TITLES[step].label}</h2>
              </div>
            </div>

            {/* ── Step 0: Personal ── */}
            {step === 0 && (
              <div>
                <FieldInput label={t('student_name')} value={currentProfile.name} onChange={v => update({ name: v })} placeholder="Mohamed Ali" />
                <FieldInput label={t('age')} value={currentProfile.age ?? ''} type="number" onChange={v => update({ age: Number(v) || null })} placeholder="9" />

                <div className="mb-5">
                   <p className="text-slate-300 font-bold mb-2 text-sm">{t('gender')}</p>
                   <div className="flex gap-2">
                     {[{ v: 'male' as const, l: '👦 ' + t('male') }, { v: 'female' as const, l: '👧 ' + t('female') }].map(o => (
                       <button key={o.v} type="button" onClick={() => update({ gender: o.v })}
                         className={`flex-1 py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                           currentProfile.gender === o.v ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500'
                         }`}>{o.l}</button>
                     ))}
                   </div>
                </div>

                <div className="mb-5">
                  <label className="block text-slate-300 font-bold mb-2 text-sm">{t('academic_grade')}</label>
                  <select value={currentProfile.grade} onChange={e => update({ grade: e.target.value })}
                    className="w-full bg-slate-800/60 border-2 border-slate-700 hover:border-slate-500 focus:border-cyan-500/60 text-white rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                  >
                    <option value="">Choose grade...</option>
                    {(language === 'ar' ? GRADES_AR : GRADES_EN).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ── Step 1: Health ── */}
            {step === 1 && (
              <div>
                <TriChoice label={t('hearing_issues')} value={currentProfile.hasHearingIssues} onChange={v => update({ hasHearingIssues: v })} t={t} />
                <TriChoice label={t('vision_issues')} value={currentProfile.hasVisionIssues} onChange={v => update({ hasVisionIssues: v })} t={t} />
                <YesNo label={t('wears_glasses')} value={currentProfile.wearsGlasses} onChange={v => update({ wearsGlasses: v })} t={t} />
                <YesNo label={t('seizure_history')} value={currentProfile.hasSeizureHistory} onChange={v => update({ hasSeizureHistory: v })} t={t} />
                <YesNo label={t('takes_medication')} value={currentProfile.takesMedication} onChange={v => update({ takesMedication: v })} t={t} />
              </div>
            )}

            {/* ── Step 2: Academic ── */}
            {step === 2 && (
              <div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {([
                    ['reading', '📖 ' + t('reading')],
                    ['writing', '✍️ ' + t('writing')],
                    ['math', '🔢 ' + t('math_prob')],
                    ['comprehension', '🧠 ' + t('comprehension')],
                    ['attention', '🎯 ' + t('attention_prob')],
                  ] as [keyof StudentProfile['difficultiesIn'], string][]).map(([k, label]) => (
                    <button key={k} type="button" onClick={() => update({ difficultiesIn: { ...currentProfile.difficultiesIn, [k]: !currentProfile.difficultiesIn[k] } })}
                      className={`py-3 px-4 rounded-2xl text-sm font-bold border-2 transition-all ${
                        currentProfile.difficultiesIn[k] ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <p className="text-slate-300 font-bold mb-2 text-sm">{t('academic_level')}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {([
                    ['excellent', 'Excellent', 'emerald'],
                    ['good', 'Good', 'teal'],
                    ['average', 'Average', 'amber'],
                    ['weak', 'Weak', 'orange'],
                    ['very_weak', 'Critical', 'rose'],
                  ] as [AcademicLevel, string, string][]).map(([v, l, c]) => (
                    <button key={v} type="button" onClick={() => update({ currentAcademicLevel: v })}
                      className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${
                        currentProfile.currentAcademicLevel === v ? `bg-${c}-500/20 border-${c}-500 text-${c}-300` : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Behavioral ── */}
            {step === 3 && (
              <div>
                <TriChoice label={t('impulsivity_q')} value={currentProfile.excessiveMovement} onChange={v => update({ excessiveMovement: v })} t={t} />
                <TriChoice label={t('focus_loss_q')} value={currentProfile.losesConcentrationQuickly} onChange={v => update({ losesConcentrationQuickly: v })} t={t} />
                <TriChoice label={t('forgets_instructions')} value={currentProfile.forgetsInstructions} onChange={v => update({ forgetsInstructions: v })} t={t} />
              </div>
            )}

            {/* ── Step 4: Family ── */}
            {step === 4 && (
              <div>
                <YesNo label={t('family_history')} value={currentProfile.familyLearningDifficulties} onChange={v => update({ familyLearningDifficulties: v })} t={t} />
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-3xl p-6 mt-4">
                  <p className="text-indigo-300 font-black mb-1 text-sm uppercase tracking-widest">{t('verification')}</p>
                   <p className="text-slate-400 text-xs italic">
                     Hero: <span className="text-white font-bold">{currentProfile.name}</span> <br/>
                     Level Initiation: <span className="text-white font-bold">1 // NEW_ENTITY</span>
                   </p>
                </div>
              </div>
            )}

            {/* ── Step 5: Clinical / Preliminary Diagnosis ── */}
            {step === 5 && (
              <div>
                <p className="text-slate-400 text-xs mb-6 italic leading-relaxed">
                   {language === 'ar' 
                     ? 'إذا تم تشخيص الطفل مسبقاً من مركز مختص، يرجى تفعيل المؤشرات أدناه لمساعدة الذكاء الاصطناعي في بناء خطة التدخل.'
                     : 'If the child has been previously diagnosed by a specialist, please activate the markers below to help the AI build the intervention plan.'}
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { id: 'autismSpectrum', label: t('autism_marker'), icon: '🧩' },
                    { id: 'socialCommunication', label: t('social_comm_marker'), icon: '🗣️' },
                    { id: 'anxietyDisorder', label: t('anxiety_marker'), icon: '😟' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => update({ 
                        preliminaryDiagnosis: { 
                          ...currentProfile.preliminaryDiagnosis, 
                          [m.id]: !(currentProfile.preliminaryDiagnosis as any)[m.id] 
                        } 
                      })}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        (currentProfile.preliminaryDiagnosis as any)[m.id]
                           ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                           : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-3">
                        <span className="text-xl">{m.icon}</span>
                        {m.label}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        (currentProfile.preliminaryDiagnosis as any)[m.id] ? 'bg-indigo-500 border-indigo-400' : 'border-slate-600'
                      }`}>
                         {(currentProfile.preliminaryDiagnosis as any)[m.id] && <span className="text-[10px] text-white">✓</span>}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mb-2">
                   <label className="block text-slate-300 font-bold mb-2 text-sm">{t('special_notes')}</label>
                   <textarea
                     value={currentProfile.preliminaryDiagnosis.specialDisabilityNotes}
                     onChange={e => update({ 
                       preliminaryDiagnosis: { 
                         ...currentProfile.preliminaryDiagnosis, 
                         specialDisabilityNotes: e.target.value 
                       } 
                     })}
                     placeholder="..."
                     rows={3}
                     className="w-full bg-slate-800/60 border-2 border-slate-700 hover:border-slate-500 focus:border-cyan-500/60 text-white rounded-2xl px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-600 resize-none"
                   />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => { play('click'); setStep(s => s - 1); }} className="flex-1 py-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-300 font-black text-lg hover:bg-slate-700 transition-all active:scale-95">
               {language === 'ar' ? '◀ السابق' : 'PREV'}
            </button>
          )}
          {step < STEP_TITLES.length - 1 ? (
             <button onClick={() => { play('click'); if (step === 0 && !canProceedStep0) return; setStep(s => s + 1); }} disabled={step === 0 && !canProceedStep0}
               className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 ${
                 step === 0 && !canProceedStep0 ? 'bg-slate-800 text-slate-600 border-2 border-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_24px_rgba(99,102,241,0.4)]'
               }`}
             >
               {language === 'ar' ? 'التالي ▶' : 'NEXT'}
             </button>
          ) : (
            <button onClick={handleSave} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-lg transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
               {saved ? 'AUTHENTICATED...' : t('save_start')}
            </button>
          )}
        </div>
        
        <button onClick={() => setIsEditing(false)} className="mt-8 text-slate-600 hover:text-white transition-colors text-xs font-bold w-full text-center">
           {t('back_to_reports')}
        </button>
      </div>
    </main>
  );
}
