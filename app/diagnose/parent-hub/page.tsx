'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AliCharacter from '../../components/ui/AliCharacter';
import { getStudentProfile } from '@/lib/studentProfile';

const questions = [
  { id: 1, category: 'الانتباه', text: 'هل يجد البطل صعوبة في إكمال المهام التي تتطلب تركيزاً طويلاً (مثل الواجبات)؟' },
  { id: 2, category: 'التواصل', text: 'هل يتجنب البطل التواصل البصري المباشر أثناء الحديث مع الآخرين؟' },
  { id: 3, category: 'الانفعال', text: 'هل يظهر البطل ردود فعل عصبية مبالغ فيها عند حدوث تغيير مفاجئ في الروتين؟' },
  { id: 4, category: 'الحس', text: 'هل يبدي انزعاجاً شديداً من الأصوات العالية أو ملامس أقمشة معينة؟' },
  { id: 5, category: 'التنظيم', text: 'هل يجد صعوبة في تنظيم أدواته الخاصة أو تذكر مكان وضعها؟' },
  { id: 6, category: 'التواصل', text: 'هل يجد صعوبة في فهم مشاعر الآخرين أو التفاعل مع أقرانه في اللعب؟' },
  { id: 7, category: 'الانتباه', text: 'هل يتشتت انتباهه بسهولة بسبب أي مؤثر خارجي بسيط (صوت، حركة)؟' },
  { id: 8, category: 'الانفعال', text: 'هل يواجه صعوبة في الانتظار أو أخذ الدور في الأنشطة الجماعية؟' },
  { id: 9, category: 'التنظيم', text: 'هل يحتاج لتكرار التعليمات أكثر من مرة ليبدأ في تنفيذ المهمة؟' },
  { id: 10, category: 'الحس', text: 'هل يظهر حركات تكرارية (مثل هز الجسم أو اليدين) عند الشعور بالحماس أو التوتر؟' }
];

export default function ParentHub() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const router = useRouter();
  const profile = getStudentProfile();

  const handleAnswer = (score: number) => {
    setAnswers({ ...answers, [questions[currentStep].id]: score });
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // حفظ النتائج والانتقال للجواز
      localStorage.setItem('parentAssessment', JSON.stringify(answers));
      router.push('/diagnose/results');
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-20 relative overflow-hidden" dir="rtl">
      
      {/* خلفية تقنية */}
      <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px]"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        <header className="text-center mb-16">
          <div className="flex flex-col items-center gap-6 mb-4">
             <AliCharacter name={profile?.name} state="thinking" variant="compact" />
             <div className="inline-block px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-mono tracking-widest uppercase">
               Parental_Intelligence_Protocol
             </div>
          </div>
          <h1 className="text-5xl font-black italic mb-4">مختبر <span className="text-cyan-400">الرصد الوالدي</span></h1>
          <p className="text-slate-400 text-xl font-light italic">مساهمتكم هي حجر الزاوية في بناء الجواز التعليمي للبطل.</p>
        </header>

        {/* شريط التقدم */}
        <div className="mb-12">
          <div className="flex justify-between mb-2 text-xs font-mono text-slate-500">
            <span>تحليل السلوك: {currentStep + 1} / {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          </div>
        </div>

        {/* السؤال الحالي */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] shadow-2xl mb-12 min-h-[350px] flex flex-col justify-center"
          >
            <span className="text-cyan-500 font-mono text-sm mb-4">[{questions[currentStep].category}]</span>
            <h2 className="text-3xl md:text-4xl font-bold leading-relaxed italic mb-10">
              {questions[currentStep].text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'نادراً جداً', score: 1 },
                { label: 'أحياناً', score: 2 },
                { label: 'غالباً', score: 3 },
                { label: 'دائماً', score: 4 }
              ].map((opt) => (
                <button
                  key={opt.score}
                  onClick={() => handleAnswer(opt.score)}
                  className="py-5 px-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-cyan-600 hover:border-cyan-400 transition-all font-black italic text-lg active:scale-95"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="text-center text-slate-600 italic font-light">
          يتم تشفير هذه البيانات سيادياً ولا تظهر إلا في التقرير النهائي للأهل. 🛡️
        </div>

      </div>
    </main>
  );
}