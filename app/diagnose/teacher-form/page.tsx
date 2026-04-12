'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ══════════════════════════════════════════════════════════
// استبيان المعلم — Conners-3 Teacher Form (Adapted)
// المرجع: Conners, C.K. (2008). Conners 3rd Edition. MHS.
// 10 فقرات تُغطي: الانتباه، فرط النشاط، التعلم، الاجتماعي، السلوك
// ══════════════════════════════════════════════════════════

const TEACHER_QUESTIONS = [
  { id: 1, domain: 'الانتباه',       text: 'يجد صعوبة في الانتباه للمهام الصفية لأكثر من 10 دقائق.' },
  { id: 2, domain: 'فرط النشاط',    text: 'يتحرك أو يتلوى في مقعده بشكل مستمر أثناء الحصة.' },
  { id: 3, domain: 'الاندفاعية',    text: 'يتكلم دون إذن أو يقاطع الشرح.' },
  { id: 4, domain: 'التعلم',         text: 'يجد صعوبة في اتباع تعليمات من خطوتين أو أكثر.' },
  { id: 5, domain: 'الاجتماعي',     text: 'يتفاعل بشكل سلبي مع الزملاء (أذىً، انسحاب، أو تنمر).' },
  { id: 6, domain: 'الانتباه',       text: 'يبدو شارداً الذهن بشكل متكرر عند الشرح.' },
  { id: 7, domain: 'التنظيم',        text: 'يجد صعوبة في تنظيم أعمدة الحساب أو ترتيب المعلومات على الورقة.' },
  { id: 8, domain: 'القراءة',        text: 'يقرأ بصوت متقطع، يتجاهل كلمات أو يُبدّل الحروف (د/ذ أو ب/ت).' },
  { id: 9, domain: 'الكتابة',        text: 'خطه غير مقروء أو يحتاج وقتاً أطول بكثير من أقرانه لإنهاء الكتابة.' },
  { id: 10, domain: 'الاجتماعي',    text: 'يُفضّل اللعب وحيداً أو يجد صعوبة في قراءة تعابير وجه الأقران.' },
];

const TEACHER_SUBJECTS = ['القراءة والكتابة', 'الرياضيات', 'العلوم', 'اللغة الإنجليزية', 'التربية الإسلامية', 'الفنون'];

export default function TeacherFormPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'rating' | 'academic' | 'done'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [qIndex, setQIndex] = useState(0);
  const [teacherInfo, setTeacherInfo] = useState({ name: '', subject: '', grade: '', schoolName: '' });
  const [hardestSubjects, setHardestSubjects] = useState<string[]>([]);
  const [academicNotes, setAcademicNotes] = useState('');

  const setAnswer = (qId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
    if (qIndex < TEACHER_QUESTIONS.length - 1) {
      setTimeout(() => setQIndex(i => i + 1), 300);
    } else {
      setPhase('academic');
    }
  };

  const toggleSubject = (s: string) => {
    setHardestSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSave = () => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = TEACHER_QUESTIONS.length * 3;
    const percent = Math.round((total / maxScore) * 100);
    localStorage.setItem('teacherFormScore', percent.toString());
    localStorage.setItem('teacherFormAnswers', JSON.stringify(answers));
    localStorage.setItem('teacherFormInfo', JSON.stringify({ ...teacherInfo, hardestSubjects, academicNotes }));
    setPhase('done');
  };

  const progress = ((qIndex + 1) / TEACHER_QUESTIONS.length) * 100;
  const currentQ = TEACHER_QUESTIONS[qIndex];

  const RATING_OPTIONS = [
    { score: 0, label: 'أبداً', color: 'emerald' },
    { score: 1, label: 'نادراً', color: 'cyan' },
    { score: 2, label: 'أحياناً', color: 'amber' },
    { score: 3, label: 'دائماً', color: 'rose' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 flex items-start justify-center" dir="rtl">
      <div className="w-full max-w-2xl pt-8">

        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-xs font-mono mb-4">
            CONNERS-3 TEACHER FORM · تقييم المعلم
          </div>
          <h1 className="text-4xl font-black mb-2">استبيان <span className="text-violet-400">المعلم</span></h1>
          <p className="text-slate-400">معلومات قيّمة تتكامل مع تقييم التطبيق والتقرير الأسري</p>
        </header>

        <AnimatePresence mode="wait">

          {/* ──── المقدمة ──── */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-slate-900/60 border border-violet-500/20 rounded-[2.5rem] p-8">
              <h2 className="text-xl font-black text-violet-400 mb-6">معلومات المعلم / المعلمة</h2>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'اسم المعلم', placeholder: 'أ. محمد / أ. سارة' },
                  { key: 'subject', label: 'المادة الدراسية', placeholder: 'معلم فصل / معلم عربي / إلخ' },
                  { key: 'grade', label: 'الصف الدراسي', placeholder: 'الثاني الابتدائي' },
                  { key: 'schoolName', label: 'اسم المدرسة', placeholder: 'مدرسة النور' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-slate-400 text-sm mb-1 block">{label}</label>
                    <input
                      value={teacherInfo[key as keyof typeof teacherInfo]}
                      onChange={e => setTeacherInfo(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <button onClick={() => setPhase('rating')}
                className="w-full mt-6 py-4 bg-violet-600 hover:bg-violet-500 rounded-2xl font-black text-xl transition-all hover:scale-[1.02]">
                ابدأ التقييم →
              </button>
              <p className="text-center text-slate-600 text-xs mt-3 font-mono">جميع الحقول اختيارية — المعلومات سرية للتقرير فقط</p>
            </motion.div>
          )}

          {/* ──── التقييم ──── */}
          {phase === 'rating' && (
            <motion.div key={`q-${qIndex}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <div className="flex justify-between text-xs text-slate-500 font-mono mb-2">
                  <span>السؤال {qIndex + 1} / {TEACHER_QUESTIONS.length}</span>
                  <span className="text-violet-400">[{currentQ.domain}]</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ width: `${progress}%` }} className="h-full bg-violet-500" />
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 mb-4 min-h-[200px] flex flex-col justify-center">
                <p className="text-2xl font-bold leading-relaxed text-white">{currentQ.text}</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {RATING_OPTIONS.map(({ score, label, color }) => (
                  <button key={score} onClick={() => setAnswer(currentQ.id, score)}
                    className={`py-5 rounded-2xl border font-black text-lg transition-all hover:scale-105 active:scale-95 ${
                      answers[currentQ.id] === score
                        ? `bg-${color}-600 border-${color}-400 text-white shadow-lg`
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ──── المواد الأكاديمية ──── */}
          {phase === 'academic' && (
            <motion.div key="academic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8">
              <h2 className="text-xl font-black text-violet-400 mb-2">المواد الأصعب للطالب</h2>
              <p className="text-slate-400 text-sm mb-6">اختر كل المواد التي يجد فيها الطالب صعوبة واضحة</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {TEACHER_SUBJECTS.map(s => (
                  <button key={s} onClick={() => toggleSubject(s)}
                    className={`px-5 py-3 rounded-xl border font-bold transition-all ${
                      hardestSubjects.includes(s)
                        ? 'bg-violet-600 border-violet-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}>
                    {hardestSubjects.includes(s) ? '✓ ' : ''}{s}
                  </button>
                ))}
              </div>
              <label className="text-slate-300 font-bold block mb-2">ملاحظات عامة (اختياري)</label>
              <textarea
                value={academicNotes}
                onChange={e => setAcademicNotes(e.target.value)}
                placeholder="مثال: الطالب يحتاج تكرار التعليمات، يُفضّل الجلوس في المقدمة..."
                rows={4}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:border-violet-500 focus:outline-none mb-6"
              />
              <button onClick={handleSave}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl font-black text-xl transition-all hover:scale-[1.02]">
                ✅ إرسال التقييم
              </button>
            </motion.div>
          )}

          {/* ──── اكتمل ──── */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/60 border border-emerald-500/30 rounded-[2.5rem] p-10 text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-3xl font-black text-emerald-400 mb-2">شكراً جزيلاً!</h2>
              <p className="text-slate-400 mb-8 text-lg">تقييمك أضاف بُعداً مهماً للتقرير السريري للطالب.</p>
              <button onClick={() => router.push('/diagnose/results')}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-xl transition-all hover:scale-[1.02]">
                عرض التقرير الكامل 📊
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
