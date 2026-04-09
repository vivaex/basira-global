'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCaseStudy, saveCaseStudy, createEmptyCaseStudy, CaseStudy } from '@/lib/studentProfile';
import Link from 'next/link';
import { useLanguage } from '@/app/components/LanguageContext';

export default function CaseStudyPage() {
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
          ...prev[section],
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

  const YesNoToggle = ({ section, field, label }: { section: keyof CaseStudy, field: string, label: string }) => {
    const sectionData = formData[section] as any;
    const val = (sectionData && sectionData[field]) || 'no';
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
        <span className="text-slate-200 font-medium mb-3 md:mb-0 text-lg">{label}</span>
        <div className="flex bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-700">
          <button 
            onClick={() => updateSection(section, field, 'yes')}
            className={`px-6 py-2 font-bold transition-colors ${val === 'yes' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            نعم
          </button>
          <button 
            onClick={() => updateSection(section, field, 'sometimes')}
            className={`px-6 py-2 font-bold border-x border-slate-700 transition-colors ${val === 'sometimes' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            أحياناً
          </button>
          <button 
            onClick={() => updateSection(section, field, 'no')}
            className={`px-6 py-2 font-bold transition-colors ${val === 'no' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            لا
          </button>
        </div>
      </div>
    );
  };

  const InputField = ({ section, field, label, type = 'text', placeholder = '' }: any) => {
    const sectionData = formData[section] as any;
    const val = (sectionData && sectionData[field]) || '';
    return (
      <div className="flex flex-col mb-4">
        <label className="text-slate-300 font-bold mb-2 text-lg">{label}</label>
        <input 
          type={type} 
          value={val}
          placeholder={placeholder}
          onChange={(e) => updateSection(section, field, e.target.value)}
          className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>
    );
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
                      <InputField section="generalInfo" field="fullName" label="اسم الطفل الكامل" placeholder="مثال: أحمد عبد الله" />
                      <InputField section="generalInfo" field="age" label="العمر" type="number" placeholder="بالسنوات" />
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
                      <InputField section="generalInfo" field="grade" label="الصف الدراسي" placeholder="مثال: الصف الثاني" />
                      <InputField section="generalInfo" field="schoolSystem" label="النظام التعليمي / المدرسة" placeholder="مثال: حكومي، أهلي، انترناشونال" />
                      <InputField section="generalInfo" field="homeLanguages" label="اللغات المحكية في المنزل" placeholder="مثال: عربية، إنجليزية" />
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-cyan-400 font-bold text-xl mt-4">الحمل والولادة</h3>
                      <YesNoToggle section="medicalHistory" field="pregnancyComplications" label="هل حدثت مضاعفات أثناء الحمل؟" />
                      <YesNoToggle section="medicalHistory" field="prematureBirth" label="هل تمت الولادة قبل الأوان (خدج)؟" />
                      <YesNoToggle section="medicalHistory" field="oxygenDeprivation" label="هل حدث نقص أكسجين عند الولادة؟" />
                      
                      <h3 className="text-cyan-400 font-bold text-xl mt-8">الطفولة المبكرة</h3>
                      <YesNoToggle section="medicalHistory" field="highFevers" label="هل عانى من حرارة مرتفعة طويلة أو غيبوبة؟" />
                      <YesNoToggle section="medicalHistory" field="severeJaundice" label="هل أصيب باصفرار شديد (يرقان) بعد الولادة؟" />
                      <YesNoToggle section="medicalHistory" field="seizures" label="هل تعرض لتشنجات أو نوبات صرع؟" />
                      <YesNoToggle section="medicalHistory" field="glandHormoneIssues" label="هل يعاني من مشاكل في الغدد أو الهرمونات؟" />

                      <h3 className="text-cyan-400 font-bold text-xl mt-8">السمع والبصر والأدوية</h3>
                      <YesNoToggle section="medicalHistory" field="hearingLoss" label="هل يعاني من ضعف سمع؟" />
                      <YesNoToggle section="medicalHistory" field="visionLoss" label="هل يعاني من ضعف بصر؟" />
                      <YesNoToggle section="medicalHistory" field="chronicMedications" label="هل يتناول أدوية بشكل مستمر؟" />
                      <YesNoToggle section="medicalHistory" field="adhdMedications" label="هل يتناول أدوية خاصة بفرط الحركة وتشتت الانتباه؟" />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-700/50">
                        <InputField section="developmentalHistory" field="sittingAge" label="متى بدأ الجلوس؟ (بالأشهر)" />
                        <InputField section="developmentalHistory" field="walkingAge" label="متى بدأ المشي؟ (بالأشهر)" />
                        <InputField section="developmentalHistory" field="firstWordAge" label="متى نطق أول كلمة؟ (بالأشهر)" />
                      </div>
                      
                      <h3 className="text-emerald-400 font-bold text-xl mt-6">المهارات الحركية الدقيقة</h3>
                      <YesNoToggle section="developmentalHistory" field="balanceIssues" label="هل يعاني من ضعف في التوازن؟" />
                      <YesNoToggle section="developmentalHistory" field="fineMotorIssues" label="هل يجد صعوبة في ربط الحذاء أو الإمساك بالقلم؟" />
                      
                      <h3 className="text-emerald-400 font-bold text-xl mt-8">اللغة والنطق</h3>
                      <YesNoToggle section="developmentalHistory" field="speechDelay" label="هل لاحظت تأخراً في الكلام مقارنة بأقرانه؟" />
                      <YesNoToggle section="developmentalHistory" field="pronunciationIssues" label="هل لديه مشاكل في نطق وتلفظ بعض الحروف؟" />

                      <h3 className="text-emerald-400 font-bold text-xl mt-8">المهارات الاجتماعية</h3>
                      <YesNoToggle section="developmentalHistory" field="eyeContact" label="هل يتواصل بصرياً بشكل جيد عند الحديث؟" />
                      <YesNoToggle section="developmentalHistory" field="playsWithKids" label="هل يندمج ويلعب مع الأطفال الآخرين؟" />
                      <YesNoToggle section="developmentalHistory" field="fearsNewSituations" label="هل يخاف بشدة من المواقف أو الأماكن الجديدة؟" />
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-emerald-400 font-bold text-xl mt-4">التاريخ الوراثي</h3>
                      <YesNoToggle section="familyBackground" field="historyLearningDisabilities" label="هل يوجد أحد في العائلة لديه صعوبات تعلم؟" />
                      <YesNoToggle section="familyBackground" field="historyDyslexia" label="عسر قراءة؟" />
                      <YesNoToggle section="familyBackground" field="historyAdhd" label="فرط حركة وتشتت انتباه؟" />
                      <YesNoToggle section="familyBackground" field="historyAutism" label="توحد؟" />
                      <YesNoToggle section="familyBackground" field="historyHighIntelligence" label="ذكاء مرتفع جداً (موهبة)؟" />
                      
                      <h3 className="text-emerald-400 font-bold text-xl mt-8">الوضع الأسري والدعم</h3>
                      <YesNoToggle section="familyBackground" field="livesWithBothParents" label="هل يعيش الطفل مستقراً مع كلا الوالدين؟" />
                      <YesNoToggle section="familyBackground" field="familyConflicts" label="هل تحدث خلافات أسرية ظاهرة تؤثر عليه؟" />
                      <YesNoToggle section="familyBackground" field="frequentSchoolChanges" label="هل ينتقل كثيراً بين المدارس أو المنازل؟" />
                      <YesNoToggle section="familyBackground" field="homeworkFollowUp" label="هل يتم متابعة واجباته المدرسية يومياً من الأسرة؟" />
                      <InputField section="familyBackground" field="dailyStudyHours" label="كم ساعة يدرس يومياً تقريباً؟" placeholder="مثال: ساعتين" />
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-2xl mb-6 text-purple-200">
                        💡 أجب عن هذه الأسئلة بناءً على ملاحظاتك المستمرة لتصرفات الطفل في المنزل والمدرسة.
                      </div>
                      <h3 className="text-purple-400 font-bold text-xl">فرط الحركة والانتباه</h3>
                      <YesNoToggle section="behaviorAttention" field="movesA_lot" label="هل يتحرك كثيراً وكأنه يعمل بمحرك؟" />
                      <YesNoToggle section="behaviorAttention" field="cantSitLong" label="هل يصعب عليه الجلوس في مكانه لفترة طويلة؟" />
                      <YesNoToggle section="behaviorAttention" field="easilyDistracted" label="هل يتشتت انتباهه بسهولة لأتفه المؤثرات؟" />
                      <YesNoToggle section="behaviorAttention" field="interruptsOthers" label="هل يقاطع الآخرين أثناء الحديث أو يندفع في الإجابة؟" />
                      <YesNoToggle section="behaviorAttention" field="forgetsInstructions" label="هل ينسى التعليمات أو المهام المطلوبة؟" />
                      <YesNoToggle section="behaviorAttention" field="delaysHomework" label="هل يماطل ويتأخر في البدء بالمهام والواجبات؟" />
                      <YesNoToggle section="behaviorAttention" field="getsAngryFast" label="هل يغضب ويفقد أعصابه بسرعة؟" />

                      <h3 className="text-purple-400 font-bold text-xl mt-8">السلوك التنفيذي (Executive Function)</h3>
                      <YesNoToggle section="executiveFunction" field="organizesBag" label="هل يمكنه تنظيم حقيبته المدرسية وأدواته بنفسه؟" />
                      <YesNoToggle section="executiveFunction" field="knowsStepsOrder" label="هل يعرف ترتيب الخطوات لإنجاز مهمة (كالاستعداد للمدرسة)؟" />
                      <YesNoToggle section="executiveFunction" field="losesItems" label="هل يضيع أغراضه المدرسية أو الشخصية باستمرار؟" />
                      <YesNoToggle section="executiveFunction" field="forgetsAssignments" label="هل ينسى الفروض المطلوبة منه بشكل متكرر؟" />
                      <YesNoToggle section="executiveFunction" field="planningDifficulty" label="هل يجد صعوبة واضحة في التخطيط لأي مشروع أو مهمة متسلسلة؟" />
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <InputField section="academicHistory" field="difficultyStart" label="متى بدأت الصعوبة بالتحديد؟ (مثال: الروضة، الصف الأول)" />
                      <YesNoToggle section="academicHistory" field="startedInFirstGrade" label="هل ظهرت المشكلة بوضوح في الصف الأول (أو قبل ذلك)؟" />
                      <InputField section="academicHistory" field="hardestSubject" label="ما هي المادة الأكثر صعوبة بالنسبة له؟" />
                      
                      <h3 className="text-amber-400 font-bold text-xl mt-6">الأداء الأكاديمي العام</h3>
                      <YesNoToggle section="academicHistory" field="readingStruggle" label="هل يعاني أو يتلعثم أثناء القراءة؟" />
                      <YesNoToggle section="academicHistory" field="mixesLetters" label="هل يخلط بين الحروف المتشابهة شكلاً؟" />
                      <YesNoToggle section="academicHistory" field="writesSlowly" label="هل يكتب ببطء شديد مقارنة بزملائه؟" />
                      <YesNoToggle section="academicHistory" field="countingStruggle" label="هل يجد صعوبة في العد أو الحساب الذهني؟" />
                      <YesNoToggle section="academicHistory" field="memorizedTimesTable" label="هل حفظ جدول الضرب بشكل سليم؟" />
                      <YesNoToggle section="academicHistory" field="understandsButCantSolve" label="هل يبدو أنه يفهم السؤال لكن لا يعرف طريقة الحل؟" />
                      <YesNoToggle section="academicHistory" field="spellingIssues" label="هل يواجه مشكلة ملحوظة في الإملاء؟" />
                      
                      <h3 className="text-amber-400 font-bold text-xl mt-8">الحالة النفسية تجاه الدراسة</h3>
                      <YesNoToggle section="academicHistory" field="needsExtraTime" label="هل يحتاج وقتاً أطول من زملائه لإنجاز نفس الواجب أو الاختبار؟" />
                      <YesNoToggle section="academicHistory" field="feelsFrustrated" label="هل يشعر بالإحباط أو يصف نفسه بالفشل؟" />
                      <YesNoToggle section="academicHistory" field="refusesStudying" label="هل يتهرب أو يرفض تماماً القيام بالواجبات المدرسية؟" />
                    </div>
                  )}

                  {currentStep === 6 && (
                    <div className="space-y-4">
                      <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-2xl mb-6 text-amber-200">
                        💡 هذا القسم يساعد في تمييز المؤشرات الخاصة (عسر القراءة، عسر الكتابة، عسر الحساب).
                      </div>
                      
                      <h3 className="text-blue-400 font-bold text-xl">أسئلة خاصة بالقراءة (عسر القراءة - Dyslexia)</h3>
                      <YesNoToggle section="dyslexiaIndicators" field="mixesSimilarLetters" label="هل يخلط بين الحروف المتشابهة صوتاً أو شكلاً؟" />
                      <YesNoToggle section="dyslexiaIndicators" field="reversesLetters" label="هل يعاني من قلب الحروف (مثال: ب ↔️ د، 6 ↔️ 9)؟" />
                      <YesNoToggle section="dyslexiaIndicators" field="readsVerySlowly" label="هل يقرأ ببطء شديد وبتهجئة متقطعة؟" />
                      <YesNoToggle section="dyslexiaIndicators" field="losesPlaceWhileReading" label="هل يفقد مكانه أثناء القراءة أو يتخطى السطور؟" />

                      <h3 className="text-blue-400 font-bold text-xl mt-8">أسئلة خاصة بالكتابة (عسر الكتابة - Dysgraphia)</h3>
                      <YesNoToggle section="dysgraphiaIndicators" field="illegibleHandwriting" label="هل يكتب بخط غير مفهوم أو سيء جداً؟" />
                      <YesNoToggle section="dysgraphiaIndicators" field="frequentSpellingMistakes" label="هل تتكرر الأخطاء الإملائية حتى للكلمات المألوفة؟" />
                      <YesNoToggle section="dysgraphiaIndicators" field="wrongPenGrip" label="هل يمسك القلم بطريقة غير صحيحة أو متشنجة؟" />
                      <YesNoToggle section="dysgraphiaIndicators" field="writesSlowly" label="هل يكتب ببطء شديد ويبذل مجهوداً عالياً في الكتابة؟" />
                      <YesNoToggle section="dysgraphiaIndicators" field="strugglesCopyingSentences" label="هل يعاني بشكل ملحوظ عند نسخ الجمل من السبورة؟" />

                      <h3 className="text-blue-400 font-bold text-xl mt-8">أسئلة خاصة بالرياضيات (عسر الحساب - Dyscalculia)</h3>
                      <YesNoToggle section="dyscalculiaIndicators" field="countingDifficulty" label="هل يواجه صعوبة في العد التسلسلي (تصاعدي، تنازلي)؟" />
                      <YesNoToggle section="dyscalculiaIndicators" field="mixesNumbers" label="هل يخلط بين الأرقام (٧ و ٨، ٢ و ٦)؟" />
                      <YesNoToggle section="dyscalculiaIndicators" field="basicOperationsDifficulty" label="هل يجد صعوبة في العمليات الأساسية البسيطة جداً؟" />
                      <YesNoToggle section="dyscalculiaIndicators" field="getsLostSolvingMath" label="هل يتوه أو ينسى الخطوات أثناء حل المسائل متعددة الخطوات؟" />
                      <YesNoToggle section="dyscalculiaIndicators" field="cantUnderstandSymbols" label="هل لا يستطيع التفريق أو فهم الرموز (+ - ÷ ×)؟" />
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div className="space-y-4">
                      <h3 className="text-rose-400 font-bold text-xl">المعلومات النفسية والعاطفية</h3>
                      <YesNoToggle section="psychologicalInfo" field="anxiety" label="هل يعاني من التوتر والقلق العام؟" />
                      <YesNoToggle section="psychologicalInfo" field="examFear" label="هل يخاف بشكل مفرط من الامتحانات؟" />
                      <YesNoToggle section="psychologicalInfo" field="schoolEvasion" label="هل يتهرب أو يرفض الذهاب إلى المدرسة؟" />
                      <YesNoToggle section="psychologicalInfo" field="feelsLessIntelligent" label="هل صرح أو يشعر بأنه 'أقل ذكاءً' من زملائه؟" />
                      <YesNoToggle section="psychologicalInfo" field="bullied" label="هل يتعرض للتنمر من الآخرين بسبب مستواه الدراسي؟" />
                      <YesNoToggle section="psychologicalInfo" field="selfConfidence" label="بشكل عام، هل تروا أن ثقته بنفسه جيدة؟" />

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
