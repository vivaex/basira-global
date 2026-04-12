'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCaseStudy, saveCaseStudy, createEmptyCaseStudy, CaseStudy } from '@/lib/studentProfile';
import Link from 'next/link';
import { useLanguage } from '@/app/components/LanguageContext';
import { Suspense } from 'react';

function CaseStudyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const { t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CaseStudy | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const existing = getCaseStudy();
    setFormData(existing || createEmptyCaseStudy());

    // Context-aware starting step
    const INITIAL_STEPS: Record<string, number> = {
      'adhd': 4,
      'attention_prob': 4,
      'learning_dis': 6,
      'memory_prob': 6,
      'perception_prob': 6,
      'simple_lang': 2,
      'autism': 2,
      'social_comm': 2,
      'anxiety': 7,
    };

    if (type && INITIAL_STEPS[type] !== undefined) {
      setCurrentStep(INITIAL_STEPS[type]);
    }
  }, [type]);

  if (!formData) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">جاري التحميل...</div>;

  const steps = [
    { title: 'المعلومات العامة', icon: '👤' },
    { title: 'التاريخ الصحي والطبي', icon: '🏥' },
    { title: 'التاريخ النمائي', icon: '🌱' },
    { title: 'البيئة الأسرية', icon: '🏡' },
    { title: 'السلوك والانتباه', icon: '🧠' },
    { title: 'التاريخ الأكاديمي', icon: '📚' },
    { title: 'مؤشرات الصعوبات', icon: '🔍' },
    { title: 'الحالة النفسية والمجمل', icon: '❤️' }
  ];

  const updateSection = (section: keyof CaseStudy, field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      };
    });
  };

  const toggleChallenge = (challenge: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      const current = prev.finalQuestion?.top3Challenges || [];
      let nextChallenges;
      if (current.includes(challenge)) {
        nextChallenges = current.filter(c => c !== challenge);
      } else {
        if (current.length >= 3) return prev;
        nextChallenges = [...current, challenge];
      }
      return {
        ...prev,
        finalQuestion: {
          ...(prev.finalQuestion || { top3Challenges: [] }),
          top3Challenges: nextChallenges
        }
      };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      const finalData = { ...formData, completedAt: new Date().toISOString() };
      saveCaseStudy(finalData);
      setIsDone(true);
      setTimeout(() => {
        router.push('/diagnose');
      }, 3000);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans overflow-x-hidden" dir="rtl">
      {/* Background blobs */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
           <div>
             <div className="flex items-center gap-3 mb-2">
               <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[0.6rem] font-black uppercase tracking-widest rounded-full">
                 {type ? 'Personalized Assessment' : 'General Evaluation'}
               </span>
               {type && (
                 <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[0.6rem] font-black uppercase tracking-widest rounded-full">
                   Clinical Protocol: {type}
                 </span>
               )}
             </div>
             <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
               {type ? `${t(`cat_${type}` as any)}` : t('clinical_case')}
             </h1>
           </div>
           <Link href="/diagnose" className="text-slate-400 hover:text-white font-bold bg-slate-800 px-6 py-3 rounded-2xl transition-all border border-white/5 hover:border-white/10 shadow-xl">
             {t('back_to_reports')} ◀
           </Link>
        </div>

        {isDone ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-slate-900/80 p-12 rounded-[3rem] border border-slate-700">
            <div className="text-7xl mb-6">✅</div>
            <h2 className="text-4xl font-black text-emerald-400 mb-4">تم حفظ دراسة الحالة بنجاح!</h2>
            <p className="text-xl text-slate-300">سيساعد هذا التقييم الشامل في توجيه التمارين التشخيصية نحو مسار أدق.</p>
            <p className="text-slate-500 mt-8">جاري العودة للمختبر المركزي...</p>
          </motion.div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
            {/* Stepper Header */}
            <div className="flex justify-between items-center mb-12 relative">
               <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -z-10 translate-y-[-50%] rounded-full overflow-hidden">
                 <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                 />
               </div>
               {steps.map((step, i) => (
                 <div key={i} className="flex flex-col items-center">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black transition-all duration-300 border-4 ${i === currentStep ? 'bg-cyan-500 border-cyan-800 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-110 text-white' : i < currentStep ? 'bg-blue-600 border-blue-900 text-white' : 'bg-slate-800 border-slate-900 text-slate-500'}`}>
                     {step.icon}
                   </div>
                   <span className={`text-xs md:text-sm font-bold mt-3 text-center w-20 ${i === currentStep ? 'text-cyan-400' : 'text-slate-500'}`}>{step.title}</span>
                 </div>
               ))}
            </div>

            {/* Stepper Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px]"
              >
                <h2 className="text-3xl font-black text-white mb-8 border-b border-slate-700 pb-4">{steps[currentStep].title}</h2>
                
                <div className="space-y-6">
                  {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="اسم الطفل الكامل" placeholder="مثال: أحمد عبد الله" value={formData.generalInfo.fullName} onChange={v => updateSection('generalInfo', 'fullName', v)} />
                      <InputField label="العمر" type="number" placeholder="بالسنوات" value={formData.generalInfo.age} onChange={v => updateSection('generalInfo', 'age', v)} />
                      <div className="flex flex-col mb-4">
                         <label className="text-slate-300 font-bold mb-2 text-lg">الجنس</label>
                         <select 
                           value={formData.generalInfo.gender} 
                           onChange={(e) => updateSection('generalInfo', 'gender', e.target.value)}
                           className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500"
                         >
                           <option value="">اختر...</option>
                           <option value="male">ذكر</option>
                           <option value="female">أنثى</option>
                         </select>
                      </div>
                      <InputField label="الصف الدراسي" placeholder="مثال: الصف الثاني" value={formData.generalInfo.grade} onChange={v => updateSection('generalInfo', 'grade', v)} />
                      <InputField label="النظام التعليمي / المدرسة" placeholder="مثال: حكومي، أهلي، انترناشونال" value={formData.generalInfo.schoolSystem} onChange={v => updateSection('generalInfo', 'schoolSystem', v)} />
                      <InputField label="اللغات المحكية في المنزل" placeholder="مثال: عربية، إنجليزية" value={formData.generalInfo.homeLanguages} onChange={v => updateSection('generalInfo', 'homeLanguages', v)} />
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-cyan-400 font-bold text-xl mt-4">الحمل والولادة</h3>
                      <YesNoToggle label="هل حدثت مضاعفات أثناء الحمل؟" value={formData.medicalHistory.pregnancyComplications} onChange={v => updateSection('medicalHistory', 'pregnancyComplications', v)} />
                      <YesNoToggle label="هل تمت الولادة قبل الأوان (خدج)؟" value={formData.medicalHistory.prematureBirth} onChange={v => updateSection('medicalHistory', 'prematureBirth', v)} />
                      <YesNoToggle label="هل حدث نقص أكسجين عند الولادة؟" value={formData.medicalHistory.oxygenDeprivation} onChange={v => updateSection('medicalHistory', 'oxygenDeprivation', v)} />
                      
                      <h3 className="text-cyan-400 font-bold text-xl mt-8">الطفولة المبكرة</h3>
                      <YesNoToggle label="هل عانى من حرارة مرتفعة طويلة أو غيبوبة؟" value={formData.medicalHistory.highFevers} onChange={v => updateSection('medicalHistory', 'highFevers', v)} />
                      <YesNoToggle label="هل أصيب باصفرار شديد (يرقان) بعد الولادة؟" value={formData.medicalHistory.severeJaundice} onChange={v => updateSection('medicalHistory', 'severeJaundice', v)} />
                      <YesNoToggle label="هل تعرض لتشنجات أو نوبات صرع؟" value={formData.medicalHistory.seizures} onChange={v => updateSection('medicalHistory', 'seizures', v)} />
                      <YesNoToggle label="هل يعاني من مشاكل في الغدد أو الهرمونات؟" value={formData.medicalHistory.glandHormoneIssues} onChange={v => updateSection('medicalHistory', 'glandHormoneIssues', v)} />

                      <h3 className="text-cyan-400 font-bold text-xl mt-8">السمع والبصر والأدوية</h3>
                      <YesNoToggle label="هل يعاني من ضعف سمع؟" value={formData.medicalHistory.hearingLoss} onChange={v => updateSection('medicalHistory', 'hearingLoss', v)} />
                      <YesNoToggle label="هل يعاني من ضعف بصر؟" value={formData.medicalHistory.visionLoss} onChange={v => updateSection('medicalHistory', 'visionLoss', v)} />
                      <YesNoToggle label="هل يتناول أدوية بشكل مستمر؟" value={formData.medicalHistory.chronicMedications} onChange={v => updateSection('medicalHistory', 'chronicMedications', v)} />
                      <YesNoToggle label="هل يتناول أدوية خاصة بفرط الحركة وتشتت الانتباه؟" value={formData.medicalHistory.adhdMedications} onChange={v => updateSection('medicalHistory', 'adhdMedications', v)} />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-700/50">
                        <InputField label="متى بدأ الجلوس؟ (بالأشهر)" value={formData.developmentalHistory.sittingAge} onChange={v => updateSection('developmentalHistory', 'sittingAge', v)} />
                        <InputField label="متى بدأ المشي؟ (بالأشهر)" value={formData.developmentalHistory.walkingAge} onChange={v => updateSection('developmentalHistory', 'walkingAge', v)} />
                        <InputField label="متى نطق أول كلمة؟ (بالأشهر)" value={formData.developmentalHistory.firstWordAge} onChange={v => updateSection('developmentalHistory', 'firstWordAge', v)} />
                      </div>
                      
                      <h3 className="text-emerald-400 font-bold text-xl mt-6">المهارات الحركية الدقيقة</h3>
                      <YesNoToggle label="هل يعاني من ضعف في التوازن؟" value={formData.developmentalHistory.balanceIssues} onChange={v => updateSection('developmentalHistory', 'balanceIssues', v)} />
                      <YesNoToggle label="هل يجد صعوبة في ربط الحذاء أو الإمساك بالقلم؟" value={formData.developmentalHistory.fineMotorIssues} onChange={v => updateSection('developmentalHistory', 'fineMotorIssues', v)} />
                      
                      <h3 className="text-emerald-400 font-bold text-xl mt-8">اللغة والنطق</h3>
                      <YesNoToggle label="هل لاحظت تأخراً في الكلام مقارنة بأقرانه؟" value={formData.developmentalHistory.speechDelay} onChange={v => updateSection('developmentalHistory', 'speechDelay', v)} />
                      <YesNoToggle label="هل لديه مشاكل في نطق وتلفظ بعض الحروف؟" value={formData.developmentalHistory.pronunciationIssues} onChange={v => updateSection('developmentalHistory', 'pronunciationIssues', v)} />

                      <h3 className="text-emerald-400 font-bold text-xl mt-8">المهارات الاجتماعية</h3>
                      <YesNoToggle label="هل يتواصل بصرياً بشكل جيد عند الحديث؟" value={formData.developmentalHistory.eyeContact} onChange={v => updateSection('developmentalHistory', 'eyeContact', v)} />
                      <YesNoToggle label="هل يندمج ويلعب مع الأطفال الآخرين؟" value={formData.developmentalHistory.playsWithKids} onChange={v => updateSection('developmentalHistory', 'playsWithKids', v)} />
                      <YesNoToggle label="هل يخاف بشدة من المواقف أو الأماكن الجديدة؟" value={formData.developmentalHistory.fearsNewSituations} onChange={v => updateSection('developmentalHistory', 'fearsNewSituations', v)} />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-emerald-400 font-bold text-xl mt-4">التاريخ الوراثي</h3>
                      <YesNoToggle label="هل يوجد أحد في العائلة لديه صعوبات تعلم؟" value={formData.familyBackground.historyLearningDisabilities} onChange={v => updateSection('familyBackground', 'historyLearningDisabilities', v)} />
                      <YesNoToggle label="عسر قراءة؟" value={formData.familyBackground.historyDyslexia} onChange={v => updateSection('familyBackground', 'historyDyslexia', v)} />
                      <YesNoToggle label="فرط حركة وتشتت انتباه؟" value={formData.familyBackground.historyAdhd} onChange={v => updateSection('familyBackground', 'historyAdhd', v)} />
                      <YesNoToggle label="توحد؟" value={formData.familyBackground.historyAutism} onChange={v => updateSection('familyBackground', 'historyAutism', v)} />
                      <YesNoToggle label="ذكاء مرتفع جداً (موهبة)؟" value={formData.familyBackground.historyHighIntelligence} onChange={v => updateSection('familyBackground', 'historyHighIntelligence', v)} />
                      
                      <h3 className="text-emerald-400 font-bold text-xl mt-8">الوضع الأسري والدعم</h3>
                      <YesNoToggle label="هل يعيش الطفل مستقراً مع كلا الوالدين؟" value={formData.familyBackground.livesWithBothParents} onChange={v => updateSection('familyBackground', 'livesWithBothParents', v)} />
                      <YesNoToggle label="هل تحدث خلافات أسرية ظاهرة تؤثر عليه؟" value={formData.familyBackground.familyConflicts} onChange={v => updateSection('familyBackground', 'familyConflicts', v)} />
                      <YesNoToggle label="هل ينتقل كثيراً بين المدارس أو المنازل؟" value={formData.familyBackground.frequentSchoolChanges} onChange={v => updateSection('familyBackground', 'frequentSchoolChanges', v)} />
                      <YesNoToggle label="هل يتم متابعة واجباته المدرسية يومياً من الأسرة؟" value={formData.familyBackground.homeworkFollowUp} onChange={v => updateSection('familyBackground', 'homeworkFollowUp', v)} />
                      <InputField label="كم ساعة يدرس يومياً تقريباً؟" placeholder="مثال: ساعتين" value={formData.familyBackground.dailyStudyHours} onChange={v => updateSection('familyBackground', 'dailyStudyHours', v)} />
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-2xl mb-6 text-purple-200">
                        💡 أجب عن هذه الأسئلة بناءً على ملاحظاتك المستمرة لتصرفات الطفل في المنزل والمدرسة.
                      </div>
                      <h3 className="text-purple-400 font-bold text-xl">فرط الحركة والانتباه</h3>
                      <YesNoToggle label="هل يتحرك كثيراً وكأنه يعمل بمحرك؟" value={formData.behaviorAttention.movesA_lot} onChange={v => updateSection('behaviorAttention', 'movesA_lot', v)} />
                      <YesNoToggle label="هل يصعب عليه الجلوس في مكانه لفترة طويلة؟" value={formData.behaviorAttention.cantSitLong} onChange={v => updateSection('behaviorAttention', 'cantSitLong', v)} />
                      <YesNoToggle label="هل يتشتت انتباهه بسهولة لأتفه المؤثرات؟" value={formData.behaviorAttention.easilyDistracted} onChange={v => updateSection('behaviorAttention', 'easilyDistracted', v)} />
                      <YesNoToggle label="هل يقاطع الآخرين أثناء الحديث أو يندفع في الإجابة؟" value={formData.behaviorAttention.interruptsOthers} onChange={v => updateSection('behaviorAttention', 'interruptsOthers', v)} />
                      <YesNoToggle label="هل ينسى التعليمات أو المهام المطلوبة؟" value={formData.behaviorAttention.forgetsInstructions} onChange={v => updateSection('behaviorAttention', 'forgetsInstructions', v)} />
                      <YesNoToggle label="هل يماطل ويتأخر في البدء بالمهام والواجبات؟" value={formData.behaviorAttention.delaysHomework} onChange={v => updateSection('behaviorAttention', 'delaysHomework', v)} />
                      <YesNoToggle label="هل يغضب ويفقد أعصابه بسرعة؟" value={formData.behaviorAttention.getsAngryFast} onChange={v => updateSection('behaviorAttention', 'getsAngryFast', v)} />

                      <h3 className="text-purple-400 font-bold text-xl mt-8">السلوك التنفيذي (Executive Function)</h3>
                      <YesNoToggle label="هل يمكنه تنظيم حقيبته المدرسية وأدواته بنفسه؟" value={formData.executiveFunction.organizesBag} onChange={v => updateSection('executiveFunction', 'organizesBag', v)} />
                      <YesNoToggle label="هل يعرف ترتيب الخطوات لإنجاز مهمة (كالاستعداد للمدرسة)؟" value={formData.executiveFunction.knowsStepsOrder} onChange={v => updateSection('executiveFunction', 'knowsStepsOrder', v)} />
                      <YesNoToggle label="هل يضيع أغراضه المدرسية أو الشخصية باستمرار؟" value={formData.executiveFunction.losesItems} onChange={v => updateSection('executiveFunction', 'losesItems', v)} />
                      <YesNoToggle label="هل ينسى الفروض المطلوبة منه بشكل متكرر؟" value={formData.executiveFunction.forgetsAssignments} onChange={v => updateSection('executiveFunction', 'forgetsAssignments', v)} />
                      <YesNoToggle label="هل يجد صعوبة واضحة في التخطيط لأي مشروع أو مهمة متسلسلة؟" value={formData.executiveFunction.planningDifficulty} onChange={v => updateSection('executiveFunction', 'planningDifficulty', v)} />
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <InputField label="متى بدأت الصعوبة بالتحديد؟ (مثال: الروضة، الصف الأول)" value={formData.academicHistory.difficultyStart} onChange={v => updateSection('academicHistory', 'difficultyStart', v)} />
                      <YesNoToggle label="هل ظهرت المشكلة بوضوح في الصف الأول (أو قبل ذلك)؟" value={formData.academicHistory.startedInFirstGrade} onChange={v => updateSection('academicHistory', 'startedInFirstGrade', v)} />
                      <InputField label="ما هي المادة الأكثر صعوبة بالنسبة له؟" value={formData.academicHistory.hardestSubject} onChange={v => updateSection('academicHistory', 'hardestSubject', v)} />
                      
                      <h3 className="text-amber-400 font-bold text-xl mt-6">الأداء الأكاديمي العام</h3>
                      <YesNoToggle label="هل يعاني أو يتلعثم أثناء القراءة؟" value={formData.academicHistory.readingStruggle} onChange={v => updateSection('academicHistory', 'readingStruggle', v)} />
                      <YesNoToggle label="هل يخلط بين الحروف المتشابهة شكلاً؟" value={formData.academicHistory.mixesLetters} onChange={v => updateSection('academicHistory', 'mixesLetters', v)} />
                      <YesNoToggle label="هل يكتب ببطء شديد مقارنة بزملائه؟" value={formData.academicHistory.writesSlowly} onChange={v => updateSection('academicHistory', 'writesSlowly', v)} />
                      <YesNoToggle label="هل يجد صعوبة في العد أو الحساب الذهني؟" value={formData.academicHistory.countingStruggle} onChange={v => updateSection('academicHistory', 'countingStruggle', v)} />
                      <YesNoToggle label="هل حفظ جدول الضرب بشكل سليم؟" value={formData.academicHistory.memorizedTimesTable} onChange={v => updateSection('academicHistory', 'memorizedTimesTable', v)} />
                      <YesNoToggle label="هل يبدو أنه يفهم السؤال لكن لا يعرف طريقة الحل؟" value={formData.academicHistory.understandsButCantSolve} onChange={v => updateSection('academicHistory', 'understandsButCantSolve', v)} />
                      <YesNoToggle label="هل يواجه مشكلة ملحوظة في الإملاء؟" value={formData.academicHistory.spellingIssues} onChange={v => updateSection('academicHistory', 'spellingIssues', v)} />
                      
                      <h3 className="text-amber-400 font-bold text-xl mt-8">الحالة النفسية تجاه الدراسة</h3>
                      <YesNoToggle label="هل يحتاج وقتاً أطول من زملائه لإنجاز نفس الواجب أو الاختبار؟" value={formData.academicHistory.needsExtraTime} onChange={v => updateSection('academicHistory', 'needsExtraTime', v)} />
                      <YesNoToggle label="هل يشعر بالإحباط أو يصف نفسه بالفشل؟" value={formData.academicHistory.feelsFrustrated} onChange={v => updateSection('academicHistory', 'feelsFrustrated', v)} />
                      <YesNoToggle label="هل يتهرب أو يرفض تماماً القيام بالواجبات المدرسية؟" value={formData.academicHistory.refusesStudying} onChange={v => updateSection('academicHistory', 'refusesStudying', v)} />
                    </div>
                  )}

                  {currentStep === 6 && (
                    <div className="space-y-4">
                      <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-2xl mb-6 text-amber-200">
                        💡 هذا القسم يساعد في تمييز المؤشرات الخاصة (عسر القراءة، عسر الكتابة، عسر الحساب).
                      </div>
                      
                      <h3 className="text-blue-400 font-bold text-xl">أسئلة خاصة بالقراءة (عسر القراءة - Dyslexia)</h3>
                      <YesNoToggle label="هل يخلط بين الحروف المتشابهة صوتاً أو شكلاً؟" value={formData.dyslexiaIndicators.mixesSimilarLetters} onChange={v => updateSection('dyslexiaIndicators', 'mixesSimilarLetters', v)} />
                      <YesNoToggle label="هل يعاني من قلب الحروف (مثال: ب ↔️ د، 6 ↔️ 9)؟" value={formData.dyslexiaIndicators.reversesLetters} onChange={v => updateSection('dyslexiaIndicators', 'reversesLetters', v)} />
                      <YesNoToggle label="هل يقرأ ببطء شديد وبتهجئة متقطعة؟" value={formData.dyslexiaIndicators.readsVerySlowly} onChange={v => updateSection('dyslexiaIndicators', 'readsVerySlowly', v)} />
                      <YesNoToggle label="هل يفقد مكانه أثناء القراءة أو يتخطى السطور؟" value={formData.dyslexiaIndicators.losesPlaceWhileReading} onChange={v => updateSection('dyslexiaIndicators', 'losesPlaceWhileReading', v)} />

                      <h3 className="text-blue-400 font-bold text-xl mt-8">أسئلة خاصة بالكتابة (عسر الكتابة - Dysgraphia)</h3>
                      <YesNoToggle label="هل يكتب بخط غير مفهوم أو سيء جداً؟" value={formData.dysgraphiaIndicators.illegibleHandwriting} onChange={v => updateSection('dysgraphiaIndicators', 'illegibleHandwriting', v)} />
                      <YesNoToggle label="هل تتكرر الأخطاء الإملائية حتى للكلمات المألوفة؟" value={formData.dysgraphiaIndicators.frequentSpellingMistakes} onChange={v => updateSection('dysgraphiaIndicators', 'frequentSpellingMistakes', v)} />
                      <YesNoToggle label="هل يمسك القلم بطريقة غير صحيحة أو متشنجة؟" value={formData.dysgraphiaIndicators.wrongPenGrip} onChange={v => updateSection('dysgraphiaIndicators', 'wrongPenGrip', v)} />
                      <YesNoToggle label="هل يكتب ببطء شديد ويبذل مجهوداً عالياً في الكتابة؟" value={formData.dysgraphiaIndicators.writesSlowly} onChange={v => updateSection('dysgraphiaIndicators', 'writesSlowly', v)} />
                      <YesNoToggle label="هل يعاني بشكل ملحوظ عند نسخ الجمل من السبورة؟" value={formData.dysgraphiaIndicators.strugglesCopyingSentences} onChange={v => updateSection('dysgraphiaIndicators', 'strugglesCopyingSentences', v)} />

                      <h3 className="text-blue-400 font-bold text-xl mt-8">أسئلة خاصة بالرياضيات (عسر الحساب - Dyscalculia)</h3>
                      <YesNoToggle label="هل يواجه صعوبة في العد التسلسلي (تصاعدي، تنازلي)؟" value={formData.dyscalculiaIndicators.countingDifficulty} onChange={v => updateSection('dyscalculiaIndicators', 'countingDifficulty', v)} />
                      <YesNoToggle label="هل يخلط بين الأرقام (٧ و ٨، ٢ و ٦)؟" value={formData.dyscalculiaIndicators.mixesNumbers} onChange={v => updateSection('dyscalculiaIndicators', 'mixesNumbers', v)} />
                      <YesNoToggle label="هل يجد صعوبة في العمليات الأساسية البسيطة جداً؟" value={formData.dyscalculiaIndicators.basicOperationsDifficulty} onChange={v => updateSection('dyscalculiaIndicators', 'basicOperationsDifficulty', v)} />
                      <YesNoToggle label="هل يتوه أو ينسى الخطوات أثناء حل المسائل متعددة الخطوات؟" value={formData.dyscalculiaIndicators.getsLostSolvingMath} onChange={v => updateSection('dyscalculiaIndicators', 'getsLostSolvingMath', v)} />
                      <YesNoToggle label="هل لا يستطيع التفريق أو فهم الرموز (+ - ÷ ×)؟" value={formData.dyscalculiaIndicators.cantUnderstandSymbols} onChange={v => updateSection('dyscalculiaIndicators', 'cantUnderstandSymbols', v)} />
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div className="space-y-4">
                      <h3 className="text-rose-400 font-bold text-xl">المعلومات النفسية والعاطفية</h3>
                      <YesNoToggle label="هل يعاني من التوتر والقلق العام؟" value={formData.psychologicalInfo.anxiety} onChange={v => updateSection('psychologicalInfo', 'anxiety', v)} />
                      <YesNoToggle label="هل يخاف بشكل مفرط من الامتحانات؟" value={formData.psychologicalInfo.examFear} onChange={v => updateSection('psychologicalInfo', 'examFear', v)} />
                      <YesNoToggle label="هل يتهرب أو يرفض الذهاب إلى المدرسة؟" value={formData.psychologicalInfo.schoolEvasion} onChange={v => updateSection('psychologicalInfo', 'schoolEvasion', v)} />
                      <YesNoToggle label="هل صرح أو يشعر بأنه 'أقل ذكاءً' من زملائه؟" value={formData.psychologicalInfo.feelsLessIntelligent} onChange={v => updateSection('psychologicalInfo', 'feelsLessIntelligent', v)} />
                      <YesNoToggle label="هل يتعرض للتنمر من الآخرين بسبب مستواه الدراسي؟" value={formData.psychologicalInfo.bullied} onChange={v => updateSection('psychologicalInfo', 'bullied', v)} />
                      <YesNoToggle label="بشكل عام، هل تروا أن ثقته بنفسه جيدة؟" value={formData.psychologicalInfo.selfConfidence} onChange={v => updateSection('psychologicalInfo', 'selfConfidence', v)} />

                      <div className="mt-12 bg-slate-800 p-6 rounded-3xl border-2 border-rose-500/50 shadow-2xl">
                        <h3 className="text-rose-400 font-black text-2xl mb-4">السؤال النهائي الأهم!</h3>
                        <p className="text-slate-300 font-medium mb-6">ما هي أكثر 3 تحديات يومية ومواقف يواجه فيها الطفل صعوبة واضحة وحقيقية؟ (اختر حتى 3 كحد أقصى)</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {['القراءة', 'الكتابة', 'فهم التعليمات', 'الحفظ', 'الانتباه والتركيز', 'الرياضيات والعد'].map(opt => {
                            const isSelected = formData.finalQuestion?.top3Challenges?.includes(opt);
                            return (
                              <button
                                key={opt}
                                onClick={() => toggleChallenge(opt)}
                                className={`py-4 px-2 rounded-2xl border-2 font-bold transition-all ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Stepper Footer Controls */}
            <div className="flex justify-between items-center mt-12 bg-slate-900/50 p-4 rounded-3xl border border-slate-700/50">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition ${currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
              >
                السابق
              </button>
              
              <button
                onClick={handleNext}
                className="px-12 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 transition transform hover:scale-105 active:scale-95"
              >
                {currentStep === steps.length - 1 ? 'حفظ دراسة الحالة ✔️' : 'التالي'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Sub-components moved outside to maintain stable references
const YesNoToggle = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
      <span className="text-slate-200 font-medium mb-3 md:mb-0 text-lg">{label}</span>
      <div className="flex bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-700">
        <button 
          onClick={() => onChange('yes')}
          className={`px-6 py-2 font-bold transition-colors ${value === 'yes' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          نعم
        </button>
        <button 
          onClick={() => onChange('sometimes')}
          className={`px-6 py-2 font-bold border-x border-slate-700 transition-colors ${value === 'sometimes' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          أحياناً
        </button>
        <button 
          onClick={() => onChange('no')}
          className={`px-6 py-2 font-bold transition-colors ${value === 'no' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          لا
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = 'text', placeholder = '' }: { label: string, value: any, onChange: (v: string) => void, type?: string, placeholder?: string }) => {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-slate-300 font-bold mb-2 text-lg">{label}</label>
      <input 
        type={type} 
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
      />
    </div>
  );
};

export default function CaseStudyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">جاري تحميل المختبر...</div>}>
      <CaseStudyContent />
    </Suspense>
  );
}
