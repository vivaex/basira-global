'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import {
  getAllTestSessions,
  getStudentProfile,
  buildLearningPassport,
  SKILL_LEVEL_LABELS,
  DIFFICULTY_LEVEL_LABELS,
  getSkillLevelLabel,
  scoreToDifficultyLevel,
  getCaseStudy,
} from '@/lib/studentProfile';
import AliCharacter from '@/app/components/ui/AliCharacter';
import PDFReportButton from '@/app/components/ui/PDFReportButton';
import ParentAIConcierge from '@/app/components/ui/ParentAIConcierge';


const isValid = (n: any): n is number => typeof n === 'number' && !isNaN(n);

// ────────────────────────────────────────────────
// DifficultyBar Component
// ────────────────────────────────────────────────
function DifficultyBar({ score }: { score: number }) {
  const level = scoreToDifficultyLevel(score);
  const colors: Record<string, string> = {
    none: 'from-emerald-500 to-teal-400',
    mild: 'from-amber-400 to-yellow-300',
    moderate: 'from-orange-500 to-amber-400',
    severe: 'from-rose-600 to-red-500',
  };
  const widthMap: Record<string, string> = { none: '100%', mild: '70%', moderate: '45%', severe: '20%' };
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
        <span>{DIFFICULTY_LEVEL_LABELS[level]}</span>
        <span>{score}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: widthMap[level] }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${colors[level]} rounded-full`}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Results Page
// ────────────────────────────────────────────────
export default function RealTimeDiagnosticResults() {
  const { t, language } = useLanguage();
  const [name, setName] = useState('البطل');
  const [childResults, setChildResults] = useState<any[]>([]);
  const [parentStats, setParentStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    // 1. جلب اسم الطفل
    const savedName = localStorage.getItem('studentName');
    const savedParent = localStorage.getItem('parentAssessment');
    if (savedName) setName(savedName);

    // 2. ملف الطالب والجلسات
    const profile = getStudentProfile();
    if (profile) {
      setStudentProfile(profile);
      if (profile.name) setName(profile.name);
    }
    const allSessions = getAllTestSessions();
    setSessions(allSessions);

    // 3. دالة مساعدة: تجلب قيمة رقمية من localStorage أو null
    const getNum = (key: string): number | null => {
      const val = localStorage.getItem(key);
      if (val === null) return null;
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    };

    const avg = (...keys: string[]): number => {
      const vals = keys.map(getNum).filter(isValid);
      if (vals.length === 0) return 0;
      return Math.min(100, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
    };

    // 4. حساب نتيجة كل مختبر
    const mathScore      = avg('mathScore', 'countingScore', 'patternsScore');
    const visualScore    = avg('visualScore', 'spatialScore', 'figureGroundScore', 'trackingScore');
    const attentionScore = avg('selectiveScore', 'sustainedScore');
    const memoryScore    = avg('memoryScore');

    const motorReaction  = getNum('motorReactionScore');
    const motorTapping   = getNum('motorTappingScore');
    const motorPrecision = getNum('motorPrecisionScore');
    const motorParts: number[] = [];
    if (isValid(motorReaction)) motorParts.push(Math.max(0, Math.min(100, Math.round(100 - (motorReaction / 1000) * 100))));
    if (isValid(motorTapping))  motorParts.push(Math.min(100, Math.round((motorTapping / 30) * 100)));
    if (isValid(motorPrecision)) motorParts.push(Math.min(100, motorPrecision));
    const motorScore = motorParts.length
      ? Math.round(motorParts.reduce((a, b) => a + b, 0) / motorParts.length) : 0;

    const langPhonology = getNum('languagePhonologyScore');
    const langFluency   = getNum('languageFluencyScore');
    const langRAN       = getNum('languageRANScore');
    const langParts: number[] = [];
    if (isValid(langPhonology)) langParts.push(Math.min(100, langPhonology));
    if (isValid(langFluency))   langParts.push(Math.min(100, Math.round((langFluency / 20) * 100)));
    if (isValid(langRAN))       langParts.push(Math.max(0, Math.min(100, Math.round(100 - (langRAN / 15) * 100))));
    const languageScore = langParts.length
      ? Math.round(langParts.reduce((a, b) => a + b, 0) / langParts.length) : 0;

    const auditoryScore  = avg('auditoryScore');
    const executiveScore = avg('execFlexScore', 'execInhibScore', 'execLogicScore');
    const cognitiveScore = avg('cognitiveScore');
    const writingScore   = avg('writingScore');

    // New Clinical Hubs (Averaged from multiple sub-tests)
    const ldAlchemyScore           = getNum('ld_alchemyScore');
    const socialRecScore           = getNum('autism_emotionScore'); 
    const empathyScore             = getNum('social_navigatorScore');

    const adhdClinicalScore        = avg('adhd_speed_trapScore', 'adhd_cptScore', 'adhdScore');
    const autismClinicalScore      = avg('autism_emotionScore', 'autism_socialScore', 'autismScore');
    const memoryProbClinicalScore  = avg('memory_prob_sequenceScore', 'memory_prob_digitScore', 'memory_probScore');
    const anxietyClinicalScore     = avg('anxiety_shieldScore', 'anxiety_calmScore', 'anxietyScore');
    const socialCommClinicalScore  = avg('social_navigatorScore', 'social_toneScore', 'social_commScore');
    const attentionProbClinicalScore = avg('attention_prob_searchScore', 'attention_prob_trackingScore', 'attention_probScore');
    const perceptionProbClinicalScore = avg('perception_prob_ghostScore', 'perception_prob_detailScore', 'perception_probScore');
    const simpleLangClinicalScore  = avg('simple_lang_echoScore', 'simple_lang_namingScore', 'simple_langScore');

    const scoreMap: Record<string, number> = {
      math: mathScore, visual: visualScore, attention: attentionScore,
      memory: memoryScore, motor: motorScore, language: languageScore,
      auditory: auditoryScore, executive: executiveScore,
      cognitive: cognitiveScore, writing: writingScore,
      
      // Full Clinical Diagnostics
      'learning_dis/alchemy': ldAlchemyScore || 0,
      'social/social-recognition': socialRecScore || 0,
      'social/empathy-scenarios': empathyScore || 0,
      adhd: adhdClinicalScore,
      attention_prob: attentionProbClinicalScore,
      memory_prob: memoryProbClinicalScore,
      perception_prob: perceptionProbClinicalScore,
      simple_lang: simpleLangClinicalScore,
      autism: autismClinicalScore,
      social_comm: socialCommClinicalScore,
      anxiety: anxietyClinicalScore,
    };

    // Also pull from saved sessions if score is 0
    for (const s of allSessions) {
      const cat = s.testCategory;
      if (scoreMap[cat] === 0 && s.rawScore > 0) {
        scoreMap[cat] = s.rawScore;
      }
    }

    const labsConfig = [
      { id: 'math',      title: 'المنطق الرقمي',   icon: '🔢', color: 'border-blue-500/30',     accent: '#3b82f6' },
      { id: 'visual',    title: 'البصر المكاني',    icon: '👁️', color: 'border-purple-500/30',   accent: '#8b5cf6' },
      { id: 'attention', title: 'التركيز العميق',   icon: '🎯', color: 'border-red-500/30',      accent: '#ef4444' },
      { id: 'memory',    title: 'الذاكرة السيادية', icon: '🧠', color: 'border-emerald-500/30',  accent: '#10b981' },
      { id: 'motor',     title: 'التآزر الحركي',    icon: '✍️', color: 'border-rose-500/30',     accent: '#f43f5e' },
      { id: 'language',  title: 'البناء اللغوي',    icon: '📖', color: 'border-indigo-500/30',   accent: '#6366f1' },
      { id: 'auditory',  title: 'الرصد السمعي',     icon: '👂', color: 'border-cyan-500/30',     accent: '#06b6d4' },
      { id: 'executive', title: 'الوظائف العليا',   icon: '⚙️', color: 'border-fuchsia-500/30',  accent: '#d946ef' },
      { id: 'cognitive', title: 'الإدراك العام',    icon: '💡', color: 'border-amber-500/30',    accent: '#f59e0b' },
      { id: 'writing',   title: 'التعبير الكتابي',  icon: '🖋️', color: 'border-teal-500/30',    accent: '#14b8a6' },
      { id: 'learning_dis/alchemy', title: 'خيمياء الحروف', icon: '🔮', color: 'border-emerald-500/30', accent: '#10b981' },
      { id: 'social/social-recognition', title: 'تمييز المشاعر', icon: '🤖', color: 'border-indigo-500/30', accent: '#6366f1' },
      { id: 'social/empathy-scenarios', title: 'مواقف التعاطف', icon: '🤝', color: 'border-amber-500/30', accent: '#f59e0b' },
      
      // Full Clinical Diagnostics
      { id: 'adhd',         title: 'تحديات التركيز (ADHD)', icon: '⚡', color: 'border-rose-500/30',    accent: '#f43f5e' },
      { id: 'attention_prob', title: 'مشاكل الانتباه',  icon: '🎯', color: 'border-cyan-500/30',    accent: '#06b6d4' },
      { id: 'memory_prob',  title: 'مشاكل الذاكرة',   icon: '🧠', color: 'border-indigo-500/30',  accent: '#6366f1' },
      { id: 'perception_prob', title: 'مشاكل الإدراك',  icon: '👁️', color: 'border-purple-500/30',  accent: '#8b5cf6' },
      { id: 'simple_lang',  title: 'اضطرابات اللغة',   icon: '🗣️', color: 'border-rose-500/30',    accent: '#f43f5e' },
      
      // Preliminary Screening (Applying Rule 7 labels)
      { id: 'autism',       title: 'مستوى الدعم (التوحد)', icon: '🧩', color: 'border-amber-500/30',   accent: '#f59e0b' },
      { id: 'social_comm',  title: 'التواصل الاجتماعي', icon: '🤝', color: 'border-cyan-500/30',    accent: '#06b6d4' },
      { id: 'anxiety',      title: 'الرفاهية الوجدانية', icon: '🌿', color: 'border-fuchsia-500/30', accent: '#d946ef' },
    ];

    const processedGames = labsConfig.map(lab => {
      const score = scoreMap[lab.id] ?? 0;
      let status = 'قيد الفحص';
      if (score > 0) {
        if (score >= 90) status = 'متفوق (سيادي)';
        else if (score >= 75) status = 'أداء ممتاز';
        else if (score >= 50) status = 'مستقر';
        else status = 'تحدي حرج';
      }
      return { ...lab, score, status };
    });
    setChildResults(processedGames);

    // 5. معالجة نتائج الأهل
    if (savedParent) {
      try {
        const raw = JSON.parse(savedParent);
        const getPVal = (indices: number[]) => {
          const vals = indices.map(i => raw[i]).filter(isValid);
          if (vals.length === 0) return 0;
          return Math.round((vals.reduce((a, b) => a + b, 0) / (indices.length * 4)) * 100);
        };

        const pStats = [
          { label: 'الانتباه المنزلي',     val: getPVal([1, 7]) },
          { label: 'الضبط الانفعالي',      val: getPVal([3, 8]) },
          { label: 'التواصل الاجتماعي',    val: getPVal([2, 6]) },
          { label: 'المعالجة الحسية',      val: getPVal([4, 10]) },
          { label: 'التنظيم والاستقلال',   val: getPVal([5, 9]) },
        ];
        setParentStats(pStats);
      } catch (e) {
        console.error("Parent stats parse error", e);
      }
    }
    setLoading(false);
  }, []);

  const [aiReport, setAiReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const generateAIReport = async () => {
    setIsGenerating(true);
    setApiError(null);
    try {
      // Gather all available clinical data
      const teacherFormScore = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('teacherFormScore') || '0') : 0;
      const devHistory = typeof window !== 'undefined'
        ? (() => { try { return JSON.parse(localStorage.getItem('developmentalHistory') || 'null'); } catch { return null; } })()
        : null;
      const digitForwardScore = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('digitForwardScore') || '0') : 0;
      const digitForwardMaxSpan = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('digitForwardMaxSpan') || '0') : 0;
      const digitBackwardScore = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('digitBackwardScore') || '0') : 0;
      const digitBackwardMaxSpan = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('digitBackwardMaxSpan') || '0') : 0;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          childResults,
          parentStats,
          studentProfile,
          sessions,
          caseStudy: getCaseStudy(),
          // New clinical data:
          teacherFormScore,
          developmentalHistory: devHistory,
          workingMemory: {
            digitForwardScore, digitForwardMaxSpan,
            digitBackwardScore, digitBackwardMaxSpan,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي.');
      setAiReport(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiReportGenerated', 'true');
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Compute overall attention score from sessions
  const totalTabSwitches = sessions.reduce((s, sess) => s + (sess.attention?.tabSwitchCount ?? 0), 0);
  const totalInactivity  = sessions.reduce((s, sess) => s + (sess.attention?.inactivityCount ?? 0), 0);
  const totalFrustration = sessions.reduce((s, sess) => s + (sess.emotional?.frustrationEvents ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-16 relative" dir="rtl">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-20 border-b border-white/5 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">
              التقرير <span className="text-cyan-400">الفني الحقيقي</span>
            </h1>
            {studentProfile && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 px-5 py-3 rounded-2xl text-sm">
                <span className="text-indigo-400 font-mono text-[10px] tracking-widest block mb-1">STUDENT_PROFILE</span>
                <span className="text-white font-bold">{studentProfile.name}</span>
                {studentProfile.grade && <span className="text-slate-400 mr-2">| {studentProfile.grade}</span>}
                {studentProfile.age && <span className="text-slate-400">| {studentProfile.age} سنة</span>}
              </div>
            )}
          </div>
          <p className="text-slate-500 text-2xl mt-4">
            تحليل البيانات للبطل: <span className="text-white font-bold">{name}</span>
          </p>

          {/* Profile flags if relevant */}
          {studentProfile && (studentProfile.takesMedication || studentProfile.hasHearingIssues !== 'no' || studentProfile.familyADHDOrAutism) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {studentProfile.takesMedication && (
                <span className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full font-mono">💊 يتناول أدوية</span>
              )}
              {studentProfile.hasHearingIssues !== 'no' && (
                <span className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full font-mono">👂 مشاكل سمعية</span>
              )}
              {studentProfile.familyADHDOrAutism && (
                <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full font-mono">🧬 تاريخ عائلي</span>
              )}
            </div>
          )}
        </header>

        {/* Accuracy Disclaimer Notice */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-12"
        >
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700" />
            <div className="scale-90 flex-shrink-0">
               <AliCharacter name={name} state="idle" variant="compact" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-2 italic">
                {language === 'ar' ? 'تنويه لرفع دقة التشخيص' : 'Diagnostic Accuracy Notice'}
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                {language === 'ar' 
                  ? 'للحصول على أفضل النتائج العيادية وأكثرها دقة، يجب على البطل الدخول في جميع الاختبارات الفرعية المتوفرة في كل قسم. إكمال جميع المهام يساعد محركاتنا في تقديم تحليل شامل ودقيق للحالة المعرفية والسلوكية.' 
                  : 'For the best and most accurate clinical results, the hero should enter all available sub-tests in each section. Completing all tasks helps our engines provide a comprehensive analysis of cognitive and behavioral status.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Live Session Attention Snapshot */}
        {sessions.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-amber-600 rounded-2xl flex items-center justify-center text-xl">📡</span>
              مؤشرات الانتباه الحية (من الجلسات)
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'مغادرة التركيز', val: totalTabSwitches, icon: '👁️', warn: totalTabSwitches > 5, unit: 'مرة' },
                { label: 'فترات التوقف',  val: totalInactivity,  icon: '⏸️', warn: totalInactivity > 8,  unit: 'مرة' },
                { label: 'أحداث إحباط',  val: totalFrustration, icon: '😤', warn: totalFrustration > 3, unit: 'حدث' },
              ].map(({ label, val, icon, warn, unit }) => (
                <div key={label} className={`p-6 rounded-[2rem] border text-center ${
                  warn ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/40 border-slate-700/40'
                }`}>
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className={`text-4xl font-black mb-1 ${warn ? 'text-amber-400' : 'text-white'}`}>{val}</div>
                  <div className="text-xs text-slate-500 font-mono">{unit} — {label}</div>
                  {warn && <div className="text-[10px] text-amber-500 mt-2 font-bold">⚠️ يحتاج متابعة</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* القسم 1: نتائج المختبرات مع خريطة الصعوبة */}
        <section className="mb-24">
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4">
            <span className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl">🤖</span>
            أولاً: أداء البطل في المختبرات الرقمية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {childResults.map((lab) => {
              const diffLevel = scoreToDifficultyLevel(lab.score);
              const skillLevel = getSkillLevelLabel(lab.score);
              return (
                <div key={lab.id} className={`bg-slate-900/40 border-2 ${lab.color} p-6 rounded-[3rem] text-center backdrop-blur-md`}>
                  <span className="text-4xl mb-3 block">{lab.icon}</span>
                  <h3 className="text-xs font-bold text-slate-400 mb-2 italic">
                    {t(lab.id as any) || lab.title}
                  </h3>
                  <div className="text-3xl font-black mb-1">
                    {isValid(lab.score) && lab.score > 0 ? `${lab.score}%` : '—'}
                  </div>
                  <div className="text-[10px] font-black text-cyan-500 uppercase tracking-tighter mb-2">{lab.status}</div>
                  {lab.score > 0 && (
                    <>
                      <div className="text-[9px] text-slate-500 font-mono mb-1">
                        {SKILL_LEVEL_LABELS[skillLevel]}
                      </div>
                      <DifficultyBar score={lab.score} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Difficulty Legend */}
          <div className="flex flex-wrap gap-4 mt-8 justify-center bg-white/5 p-6 rounded-3xl border border-white/10 italic">
            {[
              { level: 'none',     label: 'أداء طبيعي (WNL)', color: 'bg-emerald-500' },
              { level: 'mild',     label: 'تحدي بسيط (Borderline)',   color: 'bg-amber-400' },
              { level: 'moderate', label: 'تحدي متوسط (Low)',  color: 'bg-orange-500' },
              { level: 'severe',   label: 'تحدي شديد (Very Low)',   color: 'bg-rose-600' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* القسم 2: تقييم الأهل */}
        <section className="mb-24">
          <h2 className="text-3xl font-black italic mb-10 flex items-center gap-4">
            <span className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center text-2xl">👨‍👩‍👧</span>
            ثانياً: نتائج الرصد الميداني (الأهل)
          </h2>
          {parentStats.length > 0 ? (
            <div className="grid md:grid-cols-5 gap-6">
              {parentStats.map((p) => (
                <div key={p.label} className="bg-slate-900/60 border border-cyan-500/20 p-10 rounded-[3.5rem] text-center shadow-xl">
                  <h3 className="text-[10px] text-cyan-500 font-bold mb-4 uppercase">{p.label}</h3>
                  <div className="text-4xl font-black text-white mb-4 italic">{p.val}%</div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.val}%` }} className="h-full bg-cyan-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed border-white/5 rounded-[4rem] text-center text-slate-600 italic">
              بيانات الأهل غير مكتملة — يمكن إضافتها من{' '}
              <Link href="/diagnose/parent-hub" className="text-cyan-600 hover:text-cyan-400">مختبر الرصد الوالدي</Link>.
            </div>
          )}
        </section>

        {/* ═══ AI GENERATION — always visible, prominent ═══ */}
        {!aiReport && (
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-indigo-950 to-slate-900 border-2 border-indigo-500/50 rounded-[3rem] p-10 md:p-14 shadow-[0_0_80px_rgba(99,102,241,0.2)] relative overflow-hidden"
            >
              {/* Glow blob */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[80px] -ml-20 -mt-20 pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 scale-90">
                  <AliCharacter name={name} state={isGenerating ? 'thinking' : 'idle'} variant="compact" />
                </div>
                <div className="flex-1 text-center md:text-right">
                  <div className="text-[0.6rem] font-mono tracking-[0.4em] text-indigo-400 mb-3 uppercase">
                    BASIRA AI · Sovereign Analysis Engine
                  </div>
                  <h2 className="text-4xl font-black italic text-white mb-3">
                    🧠 التوليد السري<br />
                    <span className="text-indigo-400">بالذكاء الاصطناعي</span>
                  </h2>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    يُحلل محرك بصيرة <strong className="text-white">جميع النتائج</strong> المجموعة —
                    الاختبارات، استبيان الأهل، تقييم المعلم، التاريخ التطوري — ويُولّد تقريراً سريرياً شاملاً.
                  </p>
                  <button
                    onClick={generateAIReport}
                    disabled={isGenerating}
                    className={`inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 px-12 py-5 rounded-3xl font-black text-2xl shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all ${
                      isGenerating ? 'opacity-70 animate-pulse cursor-wait' : 'hover:scale-105'
                    }`}
                  >
                    {isGenerating ? (
                      <><span className="animate-spin">⚙️</span> جاري التحليل السريري...</>
                    ) : (
                      <><span>🚀</span> ولّد التقرير السريري الآن</>
                    )}
                  </button>
                  {apiError && (
                    <p className="text-rose-400 mt-4 text-sm">⚠️ {apiError}</p>
                  )}
                </div>
              </div>
              {/* Data completeness chips */}
              <div className="flex flex-wrap gap-2 mt-8 border-t border-white/5 pt-6">
                {[
                  { label: 'نتائج الاختبارات', done: childResults.filter(r => r.score > 0).length > 0, icon: '🔬' },
                  { label: 'استبيان الأهل', done: parentStats.length > 0, icon: '👨‍👩‍👧', href: '/diagnose/parent-hub' },
                  { label: 'استبيان المعلم', done: typeof window !== 'undefined' && !!localStorage.getItem('teacherFormScore'), icon: '🏫', href: '/diagnose/teacher-form' },
                  { label: 'التاريخ التطوري', done: typeof window !== 'undefined' && !!localStorage.getItem('developmentalHistory'), icon: '👶', href: '/diagnose/profile/developmental-history' },
                  { label: 'الأرقام الأمامية', done: typeof window !== 'undefined' && !!localStorage.getItem('digitForwardScore'), icon: '🔢', href: '/diagnose/memory-test/digit-forward' },
                  { label: 'الأرقام المعكوسة', done: typeof window !== 'undefined' && !!localStorage.getItem('digitBackwardScore'), icon: '↩️', href: '/diagnose/memory-test/digit-backward' },
                ].map(item => (
                  item.done ? (
                    <span key={item.label} className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full font-mono">
                      {item.icon} {item.label} ✓
                    </span>
                  ) : (
                    <Link key={item.label} href={item.href || '#'}
                      className="text-xs bg-slate-800/80 border border-white/5 text-slate-500 hover:text-white hover:border-indigo-500/40 px-3 py-1.5 rounded-full font-mono transition-all">
                      {item.icon} {item.label} +
                    </Link>
                  )
                ))}
              </div>
            </motion.div>
          </section>
        )}
        {aiReport && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">

            {/* القسم 3: التشخيص الدقيق */}
            <section className="mb-16 bg-slate-900/60 border border-indigo-500/30 p-12 rounded-[4rem] shadow-2xl backdrop-blur-xl">
              <h2 className="text-4xl font-black italic mb-10 text-indigo-400 flex items-center gap-4">
                <span className="text-5xl">🔬</span> ثالثاً: الاستنتاج العيادي والتشخيص (AI)
              </h2>
              <p className="text-xl text-slate-300 leading-loose italic bg-slate-950 p-8 rounded-3xl border border-white/5 mb-10">
                {aiReport.diagnosisSummary}
              </p>

              {/* Difficulty Types */}
              {aiReport.difficultyTypes?.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-rose-400 mb-6">🔎 أنواع الصعوبات المحددة:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {aiReport.difficultyTypes.map((dt: any, i: number) => (
                      <div key={i} className="bg-slate-950/80 border border-rose-500/20 rounded-3xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-black text-lg">{dt.type}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                            dt.confidence === 'عالي' ? 'bg-rose-500/20 text-rose-400' :
                            dt.confidence === 'متوسط' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-slate-700 text-slate-400'
                          }`}>{dt.confidence}</span>
                        </div>
                        <p className="text-slate-400 text-sm">{dt.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attention Profile */}
              {aiReport.attentionProfile && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 mb-10">
                  <h3 className="text-amber-400 font-black mb-3 text-xl">📡 تحليل الانتباه:</h3>
                  <p className="text-slate-300 leading-relaxed">{aiReport.attentionProfile}</p>
                </div>
              )}

              {/* Strengths & Challenges */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-950/80 rounded-3xl border-r-8 border-emerald-500">
                  <h4 className="text-emerald-400 font-black mb-6 text-3xl">نقاط القوة المرصودة:</h4>
                  <ul className="text-xl space-y-4">
                    {aiReport.strengths?.map((s: string, i: number) => <li key={i}>✨ {s}</li>)}
                  </ul>
                </div>
                <div className="p-8 bg-slate-950/80 rounded-3xl border-r-8 border-rose-500">
                  <h4 className="text-rose-400 font-black mb-6 text-3xl">تحديات تستوجب التدخل:</h4>
                  <ul className="text-xl space-y-4">
                    {aiReport.challenges?.map((c: string, i: number) => <li key={i}>⚠️ {c}</li>)}
                  </ul>
                </div>
              </div>

              {/* Professional Review Flag (Rule 9) */}
              {(sessions.some(s => (s.testId.includes('autism') || s.testId.includes('anxiety')) && (s.postAnalysis?.standardScore < 85 || s.rawScore < 50))) && (
                <div className="mt-12 p-8 bg-rose-500/10 border-2 border-rose-500 border-dashed rounded-3xl text-center">
                  <div className="text-4xl mb-4">🩺</div>
                  <h3 className="text-2xl font-black text-white mb-2">تنبيه المراجعة المهنية الإلزامية</h3>
                  <p className="text-rose-400 font-bold">
                    تشير النتائج المبدئية في مقاييس التوحد أو الرفاهية الوجدانية إلى وجود مؤشرات تستوجب مراجعة طبيب نفسي أطفال أو أخصائي تشخيص معتمد للتحقق السريري الشامل.
                  </p>
                </div>
              )}
            </section>

            {/* القسم 4: الاحتياجات الفورية */}
            {aiReport.immediateNeeds?.length > 0 && (
              <section className="mb-16 bg-rose-500/10 border border-rose-500/30 p-10 rounded-[3rem]">
                <h2 className="text-3xl font-black italic mb-6 text-rose-400 flex items-center gap-3">
                  <span>⚡</span> رابعاً: الاحتياجات الفورية هذا الأسبوع
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {aiReport.immediateNeeds.map((need: string, i: number) => (
                    <div key={i} className="bg-slate-950/80 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
                      <span className="text-rose-400 text-xl mt-0.5">🚨</span>
                      <span className="text-slate-200 text-lg">{need}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ═══ الخطوة الثالثة: مركز التنفيذ الذكي ═══ */}
            <section className="mt-20 border-t-4 border-indigo-500/30 pt-16">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                  🚀
                </div>
                <div>
                  <div className="text-sm font-mono tracking-[0.5em] text-indigo-400 mb-2 uppercase">Journey Phase: 03</div>
                  <h2 className="text-5xl font-black italic text-white">الخطوة الثالثة: دليلك العملي للتنفيذ</h2>
                  <p className="text-slate-400 text-xl italic mt-2">تحويل التشخيص إلى خطة عمل واقعية للأسبوع الأول</p>
                </div>
              </div>

              {/* القسم 5: الخطة العلاجية */}
              <div className="mb-16 bg-slate-900/40 border border-indigo-500/20 p-8 md:p-14 rounded-[4rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
                <h2 className="text-3xl font-black italic mb-12 text-indigo-300 flex items-center gap-4">
                  <span>🗺️</span> خارطة الطريق المقترحة (Roadmap)
                </h2>
              <div className="space-y-6">
                {aiReport.treatmentPlan?.map((plan: any, i: number) => (
                  <div key={i} className="bg-black/40 p-8 rounded-3xl border-l-4 border-indigo-400 flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="text-indigo-300 font-mono text-sm tracking-widest mb-2">{plan.phase}</div>
                      <h4 className="text-2xl font-black text-white mb-3">{plan.title}</h4>
                      <p className="text-slate-400 text-lg leading-relaxed">{plan.description}</p>
                    </div>
                    {plan.sessionsPerWeek && (
                      <div className="flex flex-col items-center justify-center bg-indigo-500/10 border border-indigo-500/30 rounded-2xl px-6 py-4 min-w-[100px]">
                        <span className="text-3xl font-black text-indigo-300">{plan.sessionsPerWeek}</span>
                        <span className="text-xs text-slate-500 font-mono mt-1">جلسة/أسبوع</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* بطاقات دليل الأهل والمعلم */}
              <div className="mt-12 grid md:grid-cols-2 gap-8">
                {/* دليل المنزل */}
                {aiReport.parentGuide && (
                  <div className="bg-cyan-500/5 border border-cyan-500/20 p-8 rounded-[3rem]">
                     <h4 className="text-2xl font-black text-cyan-400 mb-6 flex items-center gap-3 text-right">
                       <span>🏠</span> دليل التنفيذ المنزلي
                     </h4>
                     <ul className="space-y-4 text-right">
                       {aiReport.parentGuide.homeActivities?.slice(0, 4).map((a: string, i: number) => (
                         <li key={i} className="flex items-start gap-3 text-slate-300">
                           <span className="text-cyan-500">✔</span>
                           <span>{a}</span>
                         </li>
                       ))}
                     </ul>
                  </div>
                )}
                {/* توصيات المدرسة */}
                {aiReport.teacherRecommendations?.length > 0 && (
                  <div className="bg-violet-500/5 border border-violet-500/20 p-8 rounded-[3rem]">
                     <h4 className="text-2xl font-black text-violet-400 mb-6 flex items-center gap-3 text-right">
                       <span>🏫</span> توصيات البيئة المدرسية
                     </h4>
                     <ul className="space-y-4 text-right">
                       {aiReport.teacherRecommendations.slice(0, 4).map((r: string, i: number) => (
                         <li key={i} className="flex items-start gap-3 text-slate-300">
                           <span className="text-violet-500">💡</span>
                           <span>{r}</span>
                         </li>
                       ))}
                     </ul>
                  </div>
                )}
              </div>

              {/* Consultation Bridge - جسر الاستشارة */}
              <div className="mt-20 p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 rounded-[4rem] text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-6xl mb-6">🤝</div>
                <h3 className="text-4xl font-black text-white mb-4 italic">هل تحتاج إلى مساعدة احترافية في التنفيذ؟</h3>
                <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                  بصيرة توفر لك نخبة من أفضل الأخصائيين (نطق، سلوك، صعوبات تعلم) لمتابعة حالة <span className="text-indigo-400 font-bold">{name}</span> وتطبيق الخطة أعلاه.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-6">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    📅 جدولة استشارة مجانية
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 rounded-3xl font-black text-lg transition-all">
                    💬 تحدث مع منسق الحالة
                  </button>
                </div>
              </div>
            </div>
          </section>

          </div>
        )}

        {/* ═══ PDF EXPORT SECTION ═══ */}
        <section className="mb-8 mt-16 border-t border-white/10 pt-12">
          <h2 className="text-2xl font-black italic mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-rose-700 rounded-2xl flex items-center justify-center text-xl">📄</span>
            تصدير التقرير السريري
          </h2>
          <div className="bg-slate-900/40 border border-rose-500/20 rounded-[2.5rem] p-8">
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              يمكنك تصدير التقرير الكامل كملف <strong className="text-white">PDF احترافي</strong> لمشاركته مع{' '}
              <span className="text-rose-400">الطبيب</span> أو{' '}
              <span className="text-violet-400">المعلم</span> أو{' '}
              <span className="text-cyan-400">الأخصائي</span>.
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <PDFReportButton
                data={{
                  childName: name,
                  childAge: studentProfile?.age,
                  childGrade: studentProfile?.grade,
                  gender: studentProfile?.gender,
                  domainScores: childResults,
                  parentStats,
                  teacherFormScore: typeof window !== 'undefined' ? (localStorage.getItem('teacherFormScore') ? parseInt(localStorage.getItem('teacherFormScore')!) : null) : null,
                  digitBackwardScore: typeof window !== 'undefined' ? (localStorage.getItem('digitBackwardScore') ? parseInt(localStorage.getItem('digitBackwardScore')!) : null) : null,
                  digitBackwardMaxSpan: typeof window !== 'undefined' ? (localStorage.getItem('digitBackwardMaxSpan') ? parseInt(localStorage.getItem('digitBackwardMaxSpan')!) : null) : null,
                  aiReport: aiReport,
                  professionalReviewRequired: sessions.some(s =>
                    (s.testId.includes('autism') || s.testId.includes('anxiety')) &&
                    (s.postAnalysis?.standardScore < 85 || s.rawScore < 50)
                  ),
                }}
              />
              <div className="text-slate-500 text-xs font-mono leading-loose">
                <div>✅ يتضمن: البيانات الشخصية + نتائج المجالات</div>
                <div>✅ تقرير الذكاء الاصطناعي (إن وُجد) + تقييم الأهل</div>
                <div>✅ رقم مرجعي فريد لكل تقرير</div>
              </div>
            </div>
          </div>

          {/* روابط سريعة للأدوات الإضافية */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Link href="/diagnose/memory-test/digit-backward"
              className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 hover:bg-indigo-500/20 transition-all group">
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-bold text-indigo-400 text-sm">الأرقام المعكوسة</div>
              <div className="text-slate-500 text-xs mt-1">WISC-V Digit Span Backward</div>
              <div className="text-indigo-300 text-xs mt-2 group-hover:translate-x-1 transition-transform">→ ابدأ الاختبار</div>
            </Link>
            <Link href="/diagnose/teacher-form"
              className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 hover:bg-violet-500/20 transition-all group">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold text-violet-400 text-sm">استبيان المعلم</div>
              <div className="text-slate-500 text-xs mt-1">Conners-3 Teacher Form</div>
              <div className="text-violet-300 text-xs mt-2 group-hover:translate-x-1 transition-transform">→ للمعلم / المعلمة</div>
            </Link>
            <Link href="/diagnose/profile/developmental-history"
              className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 hover:bg-cyan-500/20 transition-all group">
              <div className="text-2xl mb-2">🧬</div>
              <div className="font-bold text-cyan-400 text-sm">التاريخ التطوري</div>
              <div className="text-slate-500 text-xs mt-1">DSM-5-TR Developmental History</div>
              <div className="text-cyan-300 text-xs mt-2 group-hover:translate-x-1 transition-transform">→ أضف بيانات النمو</div>
            </Link>
          </div>
        </section>

        {/* Global CTA to Passport & Dashboard (Always Visible) */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Link href="/diagnose/parent-dashboard" className="flex-1 flex items-center justify-center gap-4 py-8 bg-cyan-600 text-slate-900 text-3xl font-black rounded-[3rem] hover:scale-105 hover:bg-cyan-500 transition-all shadow-[0_0_40px_rgba(6,182,212,0.5)]">
            لوحة الأهل والخطة العلاجية 📈
          </Link>
          <Link href="/diagnose/passport" className="flex-1 flex items-center justify-center gap-4 py-8 bg-indigo-600/30 border-2 border-indigo-500 text-indigo-300 text-3xl font-black rounded-[3rem] hover:scale-105 hover:bg-indigo-600/50 transition-all shadow-xl">
            الجواز التعليمي 🎫
          </Link>
        </div>

        {/* Clinical Disclaimer Footer (Rule 12) */}
        <footer className="mt-24 mb-12 p-10 bg-slate-950/80 border border-white/5 rounded-[3rem] text-center max-w-5xl mx-auto">
          <div className="text-xs font-mono tracking-[0.3em] text-slate-500 mb-6 uppercase">CLINICAL_DISCLAIMER_NOTICE</div>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-3xl mx-auto">
            تطبيق (بصيرة) هو أداة **مسح مبدئي رقمي** تعتمد على تقنيات الذكاء الاصطناعي والمقاييس النفسية المعربة. 
            النتائج المعروضة هي "مؤشرات احتمالية" وليست تشخيصاً طبياً نهائياً. لا يمكن استخدام هذا التقرير كبديل عن 
            التقييم السريري الشامل الذي يجريه فريق مختص (طبيب أعصاب أطفال، أخصائي نفسي، أخصائي تخاطب). 
            يجب استشارة مختص قبل اتخاذ أي قرارات علاجية أو تربوية بناءً على هذه النتائج.
          </p>
          <div className="flex justify-center gap-8 opacity-40 grayscale pointer-events-none">
            <div className="font-bold text-[8px] border border-white/20 px-2 py-1 rounded">DSM-5 VALIDATED LOGIC</div>
            <div className="font-bold text-[8px] border border-white/20 px-2 py-1 rounded">WISC-V PROXY ENGINE</div>
            <div className="font-bold text-[8px] border border-white/20 px-2 py-1 rounded">CTOPP-2 COMPLIANT</div>
          </div>
        </footer>

      </div>

      {/* مساعد بصيرة الذكي للأهل */}
      <ParentAIConcierge
        childName={name}
        childResults={childResults}
        studentProfile={studentProfile}
        aiReport={aiReport}
      />
    </main>
  );
}