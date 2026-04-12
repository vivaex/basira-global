'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AliCharacter from '@/app/components/ui/AliCharacter';
import { getStudentProfile, saveStudentProfile } from '@/lib/storage';

// ══════════════════════════════════════════════════════════
// نموذج التاريخ التطوري — Developmental History Form
// المرجع: DSM-5-TR Section: Developmental History
// ASHA (American Speech-Language-Hearing Association)
// CDC Learning Milestones (2023)
// ══════════════════════════════════════════════════════════

interface DevHistoryData {
  // الولادة
  birthType: 'natural' | 'cesarean' | '';
  gestationalWeeks: string;
  birthWeightGrams: string;
  oxygenAtBirth: 'yes' | 'no' | 'unknown';
  nicuStay: 'yes' | 'no' | 'unknown';
  // المراحل الحركية
  sittingAgeMonths: string;
  walkingAgeMonths: string;
  // مراحل اللغة
  firstSoundAgeMonths: string;
  firstWordAgeMonths: string;
  firstSentenceAgeMonths: string;
  // التواصل الاجتماعي
  eyeContactAge: 'normal' | 'delayed' | 'absent';
  respondedToName: 'yes' | 'no' | 'sometimes';
  pointedToThings: 'yes' | 'no' | 'sometimes';
  // التدخل المبكر
  earlyInterventionReceived: 'yes' | 'no';
  earlyInterventionType: string;
  // التاريخ الأسري
  familyDyslexia: 'yes' | 'no' | 'unknown';
  familyADHD: 'yes' | 'no' | 'unknown';
  familyAutism: 'yes' | 'no' | 'unknown';
  familySpeechDelay: 'yes' | 'no' | 'unknown';
  // ملاحظات إضافية
  additionalNotes: string;
}

const EMPTY: DevHistoryData = {
  birthType: '', gestationalWeeks: '', birthWeightGrams: '',
  oxygenAtBirth: 'unknown', nicuStay: 'unknown',
  sittingAgeMonths: '', walkingAgeMonths: '',
  firstSoundAgeMonths: '', firstWordAgeMonths: '', firstSentenceAgeMonths: '',
  eyeContactAge: 'normal', respondedToName: 'yes', pointedToThings: 'yes',
  earlyInterventionReceived: 'no', earlyInterventionType: '',
  familyDyslexia: 'unknown', familyADHD: 'unknown',
  familyAutism: 'unknown', familySpeechDelay: 'unknown',
  additionalNotes: '',
};

type Step = 0 | 1 | 2 | 3 | 4;
const STEPS = ['الولادة', 'حركي', 'اللغة', 'الاجتماعي', 'الأسرة'];

export default function DevelopmentalHistoryPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<DevHistoryData>(EMPTY);

  const set = (key: keyof DevHistoryData, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
    else handleSave();
  };

  const handleSave = () => {
    localStorage.setItem('developmentalHistory', JSON.stringify(data));
    // دمج مع ملف الطالب
    const profile = getStudentProfile();
    if (profile) {
      (profile as any).developmentalHistory = data;
      saveStudentProfile(profile);
    }
    router.push('/diagnose/results');
  };

  const progress = ((step + 1) / 5) * 100;

  const RadioGroup = ({ field, options }: { field: keyof DevHistoryData; options: { value: string; label: string }[] }) => (
    <div className="flex flex-wrap gap-3">
      {options.map(o => (
        <button key={o.value} onClick={() => set(field, o.value)}
          className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all ${
            data[field] === o.value
              ? 'bg-cyan-600 border-cyan-400 text-white'
              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  );

  const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <label className="text-slate-300 font-bold text-lg block mb-1">{label}</label>
      {hint && <p className="text-slate-500 text-xs mb-3 font-mono">{hint}</p>}
      {children}
    </div>
  );

  const numericInput = (field: keyof DevHistoryData, placeholder: string) => (
    <input
      type="number"
      inputMode="numeric"
      placeholder={placeholder}
      value={data[field] as string}
      onChange={e => set(field, e.target.value)}
      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-xl font-mono focus:border-cyan-500 focus:outline-none"
    />
  );

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-mono mb-4">
            DSM-5-TR · CDC MILESTONES · التاريخ التطوري
          </div>
          <h1 className="text-4xl font-black mb-2">التاريخ <span className="text-cyan-400">التطوري</span></h1>
          <p className="text-slate-400">هذه المعلومات تساعد في فهم رحلة نمو طفلك — أجب بما تتذكره</p>
        </header>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <span key={i} className={`text-xs font-mono transition-all ${i === step ? 'text-cyan-400 font-bold' : i < step ? 'text-emerald-400' : 'text-slate-600'}`}>
                {i < step ? '✓' : `${i + 1}.`} {s}
              </span>
            ))}
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-full" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 mb-6">

            {/* ──── الخطوة 0: الولادة ──── */}
            {step === 0 && <>
              <h2 className="text-2xl font-black mb-6 text-cyan-400 flex items-center gap-2">🏥 معلومات الولادة</h2>
              <Field label="نوع الولادة">
                <RadioGroup field="birthType" options={[
                  { value: 'natural', label: '🌿 طبيعية' },
                  { value: 'cesarean', label: '🏥 قيصرية' },
                ]} />
              </Field>
              <Field label="عمر الحمل عند الولادة" hint="المعدل الطبيعي: 38-42 أسبوع">
                <div className="flex items-center gap-3">
                  {numericInput('gestationalWeeks', '40')}
                  <span className="text-slate-400 whitespace-nowrap">أسبوع</span>
                </div>
              </Field>
              <Field label="وزن الولادة" hint="المعدل الطبيعي: 2500-4500 غرام">
                <div className="flex items-center gap-3">
                  {numericInput('birthWeightGrams', '3200')}
                  <span className="text-slate-400 whitespace-nowrap">غرام</span>
                </div>
              </Field>
              <Field label="هل كان هناك نقص في الأكسجين عند الولادة؟">
                <RadioGroup field="oxygenAtBirth" options={[
                  { value: 'yes', label: 'نعم' }, { value: 'no', label: 'لا' }, { value: 'unknown', label: 'لا أعرف' },
                ]} />
              </Field>
              <Field label="هل مكث في الحضانة (NICU)؟">
                <RadioGroup field="nicuStay" options={[
                  { value: 'yes', label: 'نعم' }, { value: 'no', label: 'لا' }, { value: 'unknown', label: 'لا أعرف' },
                ]} />
              </Field>
            </>}

            {/* ──── الخطوة 1: المراحل الحركية ──── */}
            {step === 1 && <>
              <h2 className="text-2xl font-black mb-2 text-emerald-400 flex items-center gap-2">🏃 المراحل الحركية</h2>
              <p className="text-slate-500 text-sm mb-6 font-mono">ابحث في ذاكرتك أو في كتاب تطوير الطفل القديم 📔</p>
              <Field label="متى جلس باستقلالية؟" hint="المعدل الطبيعي: 6-8 أشهر">
                <div className="flex items-center gap-3">
                  {numericInput('sittingAgeMonths', '7')}
                  <span className="text-slate-400 whitespace-nowrap">شهر</span>
                </div>
              </Field>
              <Field label="متى مشى أولى خطواته؟" hint="المعدل الطبيعي: 9-15 شهر">
                <div className="flex items-center gap-3">
                  {numericInput('walkingAgeMonths', '12')}
                  <span className="text-slate-400 whitespace-nowrap">شهر</span>
                </div>
              </Field>
            </>}

            {/* ──── الخطوة 2: اللغة ──── */}
            {step === 2 && <>
              <h2 className="text-2xl font-black mb-2 text-indigo-400 flex items-center gap-2">🗣️ مراحل اللغة</h2>
              <p className="text-slate-500 text-sm mb-6 font-mono">التأخر اللغوي هو أحد أهم مؤشرات صعوبات التعلم والتوحد</p>
              <Field label="متى بدأ يُصدر أصوات (مناغاة)؟" hint="المعدل الطبيعي: 3-6 أشهر">
                <div className="flex items-center gap-3">
                  {numericInput('firstSoundAgeMonths', '4')}
                  <span className="text-slate-400 whitespace-nowrap">شهر</span>
                </div>
              </Field>
              <Field label="متى نطق أول كلمة ذات معنى (ماما/بابا)؟" hint="المعدل الطبيعي: 12-18 شهر">
                <div className="flex items-center gap-3">
                  {numericInput('firstWordAgeMonths', '14')}
                  <span className="text-slate-400 whitespace-nowrap">شهر</span>
                </div>
              </Field>
              <Field label="متى كوّن جملة من كلمتين؟" hint="المعدل الطبيعي: 18-24 شهر">
                <div className="flex items-center gap-3">
                  {numericInput('firstSentenceAgeMonths', '22')}
                  <span className="text-slate-400 whitespace-nowrap">شهر</span>
                </div>
              </Field>
              <Field label="هل تلقى تدخلاً مبكراً (علاج نطق أو تخاطب)؟">
                <RadioGroup field="earlyInterventionReceived" options={[
                  { value: 'yes', label: 'نعم' }, { value: 'no', label: 'لا' },
                ]} />
                {data.earlyInterventionReceived === 'yes' && (
                  <input placeholder="نوع التدخل (مثال: علاج نطق منذ عمر 3 سنوات)"
                    value={data.earlyInterventionType}
                    onChange={e => set('earlyInterventionType', e.target.value)}
                    className="w-full mt-3 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none" />
                )}
              </Field>
            </>}

            {/* ──── الخطوة 3: التواصل الاجتماعي ──── */}
            {step === 3 && <>
              <h2 className="text-2xl font-black mb-2 text-fuchsia-400 flex items-center gap-2">🧩 سلوك التواصل الاجتماعي</h2>
              <p className="text-slate-500 text-sm mb-6 font-mono">هذه المؤشرات مرتبطة بطيف التوحد — أجب بصدق</p>
              <Field label="متى بدأ يُحقق اتصالاً بصرياً طبيعياً؟">
                <RadioGroup field="eyeContactAge" options={[
                  { value: 'normal', label: '✅ طبيعي منذ الصغر' },
                  { value: 'delayed', label: '⚠️ تأخر ملحوظ' },
                  { value: 'absent', label: '🔴 غائب أو نادر جداً' },
                ]} />
              </Field>
              <Field label="هل كان يلتفت عند ندائه باسمه (قبل سنة)؟">
                <RadioGroup field="respondedToName" options={[
                  { value: 'yes', label: 'نعم دائماً' },
                  { value: 'sometimes', label: 'أحياناً' },
                  { value: 'no', label: 'نادراً أو لا' },
                ]} />
              </Field>
              <Field label="هل كان يُشير بإصبعه للأشياء ليُشارك اهتمامه؟" hint="المعدل الطبيعي: يبدأ في عمر 12 شهر">
                <RadioGroup field="pointedToThings" options={[
                  { value: 'yes', label: 'نعم بوضوح' },
                  { value: 'sometimes', label: 'أحياناً' },
                  { value: 'no', label: 'لا أتذكر / لا' },
                ]} />
              </Field>
            </>}

            {/* ──── الخطوة 4: التاريخ الأسري ──── */}
            {step === 4 && <>
              <h2 className="text-2xl font-black mb-2 text-amber-400 flex items-center gap-2">🧬 التاريخ الأسري</h2>
              <p className="text-slate-500 text-sm mb-6 font-mono">صعوبات التعلم وADHD والتوحد تنتقل وراثياً بنسب معروفة</p>
              {([
                { field: 'familyDyslexia' as keyof DevHistoryData, label: 'هل يوجد في الأسرة من لديه صعوبات قراءة (عسر قراءة)؟' },
                { field: 'familyADHD' as keyof DevHistoryData, label: 'هل يوجد في الأسرة من تم تشخيصه بـ ADHD؟' },
                { field: 'familyAutism' as keyof DevHistoryData, label: 'هل يوجد في الأسرة من في طيف التوحد؟' },
                { field: 'familySpeechDelay' as keyof DevHistoryData, label: 'هل يوجد في الأسرة من عانى من تأخر لغوي طفولي؟' },
              ]).map(({ field, label }) => (
                <Field key={field} label={label}>
                  <RadioGroup field={field} options={[
                    { value: 'yes', label: 'نعم' }, { value: 'no', label: 'لا' }, { value: 'unknown', label: 'لا أعرف' },
                  ]} />
                </Field>
              ))}
              <Field label="ملاحظات إضافية (اختياري)">
                <textarea
                  value={data.additionalNotes}
                  onChange={e => set('additionalNotes', e.target.value)}
                  placeholder="أي معلومات أخرى تراها مهمة..."
                  rows={3}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:border-cyan-500 focus:outline-none"
                />
              </Field>
            </>}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4">
          {step > 0 && (
            <button onClick={() => setStep(s => (s - 1) as Step)}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all">
              ← السابق
            </button>
          )}
          <button onClick={next}
            className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl font-black text-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            {step === 4 ? '✅ حفظ التاريخ التطوري' : 'التالي →'}
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4 font-mono">
          هذه البيانات محفوظة محلياً وتُرفق بالتقرير السريري فقط
        </p>
      </div>
    </main>
  );
}
