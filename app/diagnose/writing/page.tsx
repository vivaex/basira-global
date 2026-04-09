'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/app/components/LanguageContext';
import SpeakButton from '@/app/components/ui/SpeakButton';

const WRITING_LABS = [
  { id: 'letter-formation', title: 'تشكيل الحروف', desc: 'ارسم الحروف بأفضل شكل — قياس الدقة الحركية', icon: '✍️', color: 'from-fuchsia-500 to-pink-600' },
  { id: 'copy-text', title: 'نسخ النصوص', desc: 'انسخ الجملة بأفضل خط — قياس سرعة ودقة النسخ', icon: '📝', color: 'from-blue-500 to-cyan-600' },
  { id: 'spelling', title: 'الإملاء والتهجئة', desc: 'استمع للكلمة واختر التهجئة الصحيحة', icon: '🔊', color: 'from-emerald-500 to-teal-600' },
];

export default function WritingHub() {
  const { language } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-hidden relative" dir="rtl" style={{ fontFamily: 'var(--font-arabic)' }}>
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[150px] animate-pulse" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/diagnose" className="inline-block mb-12 bg-slate-800 text-white p-3 rounded-2xl hover:bg-slate-700 transition transform hover:scale-105">
          ◀ رجوع للمختبرات
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-6xl inline-block mb-4 animate-bounce">🖋️</span>
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-black mb-4 gap-3 justify-center flex">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500">
                {language === 'ar' ? 'التعبير' : 'Written'}
              </span> 
              <span className="text-white">{language === 'ar' ? 'الكتابي' : 'Expression'}</span>
            </h1>
            <SpeakButton 
              text={language === 'ar' 
                ? 'مختبر التعبير الكتابي. أمسك قلمك الافتراضي أو الحقيقي والعب بأحلى الكلمات.' 
                : 'Written Expression Lab. Grab your virtual or real pen and play with the sweetest words.'} 
              size="sm" 
            />
          </div>
          <p className="text-slate-400 text-xl font-medium">
            {language === 'ar' ? 'أمسك قلمك الافتراضي أو الحقيقي والعب بأحلى الكلمات.' : 'Grab your virtual or real pen and play with the sweetest words.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {WRITING_LABS.map((lab, i) => (
            <Link key={lab.id} href={`/diagnose/writing/${lab.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group hover:border-fuchsia-500/50 transition-all h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center text-4xl bg-gradient-to-br ${lab.color} shadow`}>
                  {lab.icon}
                </div>
                <h2 className="text-3xl font-black text-white mb-3">{lab.title}</h2>
                <p className="text-slate-400 text-lg mb-8">{lab.desc}</p>
                <div className="flex justify-start">
                  <span className="bg-slate-800 px-6 py-3 rounded-full text-md font-bold group-hover:bg-fuchsia-500 transition-colors">تحدي الكتابة 🖋️</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}